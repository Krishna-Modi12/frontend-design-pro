/**
 * Ad hoc: serve `home/`'s production build and capture full-page and
 * above-the-fold screenshots at a ladder of real device widths, so a human
 * (or a model) can LOOK at the page rather than reason about its source.
 *
 * `verify-home.mjs` proves the page is correct. It cannot tell you the page is
 * ugly, cramped, or unfinished at 390px — nothing in this repository can, and
 * that gap is the reason this file exists. Not wired into CI: it produces
 * images for judgement, and judgement is not a gate.
 *
 * Run:  node audit-home.mjs [--world signature] [--out ../../.audit]
 */
import { chromium, devices } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { startNextServer, waitForServer } from "./lib/next-server.mjs";

const HOME = join(import.meta.dirname, "..", "..", "home");
const argOf = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};
const world = argOf("--world", "signature");
const OUT = join(import.meta.dirname, "..", "..", argOf("--out", ".audit"));

// A real ladder, not three round numbers. 360 is the floor Android still
// ships in volume; 390 and 430 are the two iPhone widths that dominate; 768
// and 834 straddle the `md`/`lg` boundary where this page's grid collapses;
// 1024 is the exact `lg` breakpoint, which is where a two-column layout is
// tightest and therefore most likely to be broken.
const SHOTS = [
  { label: "360-android", width: 360, height: 800, dsf: 3, mobile: true },
  { label: "390-iphone", width: 390, height: 844, dsf: 3, mobile: true },
  { label: "430-iphone-max", width: 430, height: 932, dsf: 3, mobile: true },
  { label: "768-tablet", width: 768, height: 1024, dsf: 2, mobile: true },
  { label: "834-ipad-air", width: 834, height: 1112, dsf: 2, mobile: true },
  { label: "1024-lg-edge", width: 1024, height: 768, dsf: 2, mobile: false },
  { label: "1280-laptop", width: 1280, height: 800, dsf: 2, mobile: false },
  { label: "1920-desktop", width: 1920, height: 1080, dsf: 1, mobile: false },
];

const port = 3324;
const base = `http://localhost:${port}`;
const url = `${base}/?world=${world}`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = await startNextServer({ cwd: HOME, port, mode: "start" });
const browser = await chromium.launch();
try {
  await waitForServer(base);

  for (const shot of SHOTS) {
    const ctx = await browser.newContext({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: shot.dsf,
      isMobile: shot.mobile,
      hasTouch: shot.mobile,
      reducedMotion: "no-preference",
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
    // Past the 1.6s head sweep and the 0.7s type stagger, so what is captured
    // is the resting composition rather than a frame mid-entrance.
    await page.waitForTimeout(2600);

    await page.screenshot({ path: join(OUT, `${shot.label}-fold.png`) });

    // Report what a reader actually has to scroll through, and whether
    // anything pokes out sideways — the two numbers that tell you a layout is
    // wrong before you have even looked at it.
    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > de.clientWidth + 1 || r.left < -1) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: Array.from(el.classList).slice(0, 3).join("."),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
        }
      }
      return {
        scrollHeight: de.scrollHeight,
        clientWidth: de.clientWidth,
        scrollWidth: de.scrollWidth,
        offenders: offenders.slice(0, 8),
      };
    });

    const screens = (metrics.scrollHeight / shot.height).toFixed(1);
    const overflow = metrics.scrollWidth - metrics.clientWidth;
    console.log(
      `${shot.label.padEnd(16)} ${String(shot.width).padStart(4)}px  ` +
        `page ${String(metrics.scrollHeight).padStart(6)}px = ${screens.padStart(4)} screens  ` +
        `h-overflow ${overflow > 0 ? `+${overflow}px  <-- ` : "0px"}`,
    );
    for (const o of metrics.offenders) {
      console.log(`                   overflowing: ${o.tag}.${o.cls} [${o.left} … ${o.right}]`);
    }

    await page.screenshot({ path: join(OUT, `${shot.label}-full.png`), fullPage: true });
    await ctx.close();
  }
} finally {
  await browser.close();
  await server.stop();
}
console.log(`\nimages in ${OUT}`);
