/**
 * Ad hoc: print the geometry behind a spacing question, so a gap gets fixed
 * from a measurement rather than from a guess at a screenshot.
 *
 * Run:  node audit-probe.mjs [--width 390]
 */
import { chromium } from "playwright";
import { join } from "node:path";
import { startNextServer, waitForServer } from "./lib/next-server.mjs";

const HOME = join(import.meta.dirname, "..", "..", "home");
const i = process.argv.indexOf("--width");
const width = i === -1 ? 390 : Number(process.argv[i + 1]);

const port = 3326;
const base = `http://localhost:${port}`;
const server = await startNextServer({ cwd: HOME, port, mode: "start" });
const browser = await chromium.launch();
try {
  await waitForServer(base);
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    isMobile: width < 900,
    hasTouch: width < 900,
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/?world=signature`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(2600);

  const out = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (el === null) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        sel,
        top: Math.round(r.top + window.scrollY),
        bottom: Math.round(r.bottom + window.scrollY),
        h: Math.round(r.height),
        pt: cs.paddingTop,
        pb: cs.paddingBottom,
        mt: cs.marginTop,
        pos: cs.position,
        minH: cs.minHeight,
      };
    };
    return [
      rect("header"),
      rect("#top"),
      rect("#top > div:nth-of-type(2)"),
      rect("[data-hero-headline]"),
      rect("[data-hero-caption]"),
      rect("#top svg[role='img']"),
      rect("#problem"),
    ].filter(Boolean);
  });

  for (const r of out) {
    console.log(
      `${r.sel.padEnd(28)} top=${String(r.top).padStart(5)} bot=${String(r.bottom).padStart(5)} ` +
        `h=${String(r.h).padStart(5)} pos=${r.pos.padEnd(8)} minH=${r.minH.padEnd(9)} ` +
        `pt=${r.pt} pb=${r.pb} mt=${r.mt}`,
    );
  }
  await ctx.close();
} finally {
  await browser.close();
  await server.stop();
}
