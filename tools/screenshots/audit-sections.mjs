/**
 * Ad hoc companion to `audit-home.mjs`: one screenshot per section, at one
 * width, so each block can be judged on its own instead of as a 30,000px
 * thumbnail. Sections taller than two viewports are captured in slices.
 *
 * Run:  node audit-sections.mjs [--width 390] [--world signature]
 */
import { chromium } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { startNextServer, waitForServer } from "./lib/next-server.mjs";

const HOME = join(import.meta.dirname, "..", "..", "home");
const argOf = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};
const width = Number(argOf("--width", "390"));
const world = argOf("--world", "signature");
const OUT = join(import.meta.dirname, "..", "..", ".audit", `sections-${width}`);

const SECTIONS = ["top", "problem", "catalog", "checks", "how-it-works", "showcase", "install"];

const port = 3325;
const base = `http://localhost:${port}`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = await startNextServer({ cwd: HOME, port, mode: "start" });
const browser = await chromium.launch();
try {
  await waitForServer(base);
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
    isMobile: width < 900,
    hasTouch: width < 900,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/?world=${world}`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(2600);
  // Scroll the whole page once so every reveal has fired, then come back —
  // otherwise a section captured on first approach is caught mid-stagger.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);

  for (const id of SECTIONS) {
    const el = page.locator(`#${id}`);
    if ((await el.count()) === 0) {
      console.log(`#${id}  MISSING`);
      continue;
    }
    const box = await el.boundingBox();
    if (box === null) continue;
    console.log(`#${id.padEnd(13)} ${Math.round(box.height).toString().padStart(5)}px tall`);
    const slices = Math.max(1, Math.ceil(box.height / 1800));
    for (let i = 0; i < slices; i += 1) {
      const y = box.y + i * 1800;
      const h = Math.min(1800, box.y + box.height - y);
      if (h < 40) continue;
      await page.screenshot({
        path: join(OUT, `${id}${slices > 1 ? `-${i + 1}` : ""}.png`),
        // Page coordinates, so the clip has to be taken against the full page
        // rather than the current viewport.
        fullPage: true,
        clip: { x: 0, y, width, height: h },
      });
    }
  }
  await ctx.close();
} finally {
  await browser.close();
  await server.stop();
}
console.log(`\nimages in ${OUT}`);
