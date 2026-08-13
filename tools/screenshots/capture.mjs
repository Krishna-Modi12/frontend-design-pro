/**
 * Regenerates every screenshot README.md links, from the committed demo sources.
 *
 *   npm run screenshots                # all four demos
 *   npm run screenshots -- landing-page dashboard
 *   npm run screenshots -- --skip-build
 *
 * Each image is captured against a production build in headless Chromium at
 * 1920x1080 above the fold, reduced motion off, in the demo's own colour scheme,
 * then palette-quantised to fit the 500 KB cap. The spec and the reasoning behind
 * each of those choices are in .github/SCREENSHOT_CONTRIBUTION.md.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { IS_WIN, NPX, run, startNextServer, waitForServer } from "./lib/next-server.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));

const VIEWPORT = { width: 1920, height: 1080 };
const SIZE_CAP = 500 * 1024;
/** Full pages are linked rather than inline, so they scale down to hold the cap. */
const FULL_PAGE_WIDTH = 1440;

/**
 * `demos` serves the two stub-typed projects, which ship no runtime of their own.
 * `landing-page` and `showcase` are real installed apps and are served from their
 * own directories — capturing either any other way would not be capturing the
 * thing README describes.
 */
const SITES = [
  {
    id: "demos",
    cwd: HERE,
    port: 3311,
    shots: [
      { name: "dashboard", route: "/dashboard", scheme: "light", out: "demo/dashboard" },
      { name: "auth-form", route: "/auth-form", scheme: "light", out: "demo/auth-form" },
    ],
  },
  {
    id: "landing-page",
    cwd: join(REPO, "demo", "landing-page"),
    port: 3313,
    needsInstall: true, // its own package.json; skipped with a notice if absent
    // Not opt-in, unlike showcase: this page renders deterministically from a
    // committed fixture, so a recapture only moves pixels when the UI actually
    // changed.
    shots: [{ name: "landing-page", route: "/", scheme: "light", out: "demo/landing-page" }],
  },
  {
    id: "showcase",
    cwd: join(REPO, "demo", "showcase"),
    port: 3312,
    needsInstall: true, // its own package.json; skipped with a notice if absent
    // Opt-in, because its hero is a WebGL particle field seeded at random: every
    // capture differs from the last, so including it by default would dirty
    // demo/showcase/screenshot.png on every run and bury real changes in noise.
    // Recapture it deliberately when the showcase UI actually changes:
    //   npm run screenshots -- showcase
    optIn: true,
    shots: [{ name: "showcase", route: "/", scheme: "dark", out: "demo/showcase", noFull: true }],
  },
];

const argv = process.argv.slice(2);
const skipBuild = argv.includes("--skip-build");
const only = argv.filter((a) => !a.startsWith("--"));

/**
 * Palette-quantise down to whatever colour count fits the cap. Dithering keeps the
 * dark OKLCH gradients from banding; 256 colours has been enough for every image so
 * far, and the loop only bites if one grows.
 */
async function encodeUnderCap(input, width) {
  let last;
  for (const colors of [256, 200, 160, 128, 96, 64]) {
    const buf = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .png({ palette: true, colors, dither: 0.5, effort: 10, compressionLevel: 9 })
      .toBuffer();
    last = { buf, colors };
    if (buf.length <= SIZE_CAP) break;
  }
  return last;
}

async function captureSite(site, browser, scratch) {
  const base = `http://localhost:${site.port}`;
  const server = startNextServer({ cwd: site.cwd, port: site.port, mode: "start" });

  try {
    await waitForServer(`${base}${site.shots[0].route}`);

    for (const shot of site.shots) {
      const ctx = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
        colorScheme: shot.scheme,
        reducedMotion: "no-preference",
      });
      const page = await ctx.newPage();
      const pageErrors = [];
      page.on("pageerror", (e) => pageErrors.push(String(e)));

      // Next keeps a socket open, so `networkidle` never fires and the navigation
      // would time out rather than settle. Wait for real content instead.
      await page.goto(`${base}${shot.route}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await page.waitForSelector("h1, h2, main, [role='main']", { timeout: 60_000 });
      await page.evaluate(() => document.fonts.ready);
      // The demos resolve a simulated fetch into their `ready` phase; without this
      // the capture catches the loading skeleton.
      await page.waitForTimeout(3000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);

      const raw = join(scratch, `${shot.name}.png`);
      const rawFull = join(scratch, `${shot.name}-full.png`);
      await page.screenshot({ path: raw });
      if (!shot.noFull) await page.screenshot({ path: rawFull, fullPage: true });

      const targets = [{ src: raw, dest: `${shot.out}/screenshot.png`, width: VIEWPORT.width }];
      if (!shot.noFull) {
        targets.push({ src: rawFull, dest: `${shot.out}/screenshot-full.png`, width: FULL_PAGE_WIDTH });
      }

      for (const { src, dest, width } of targets) {
        const { buf, colors } = await encodeUnderCap(src, width);

        // Refuse to write an image that breaks the cap. Even the lowest colour
        // count can come back too large, and logging "OVER CAP" while writing the
        // file anyway still exits 0 — a size limit nothing enforces is a comment,
        // not a limit.
        if (buf.length > SIZE_CAP) {
          throw new Error(
            `${dest} encodes to ${(buf.length / 1024).toFixed(0)} KB at ${colors} colours, over ` +
              `the ${SIZE_CAP / 1024} KB cap. Crop it, narrow it, or change the cap on purpose — ` +
              `see .github/SCREENSHOT_CONTRIBUTION.md.`,
          );
        }

        // Write the encoded buffer straight out. Passing it back through sharp()
        // re-encodes at defaults and throws the palette away — which silently
        // undoes the compression and puts the file back over the cap.
        writeFileSync(join(REPO, dest), buf);
        const kb = (statSync(join(REPO, dest)).size / 1024).toFixed(0);
        console.log(`  ${dest.padEnd(40)} ${kb.padStart(4)} KB  ${colors}c`);
      }

      if (pageErrors.length) {
        console.error(`  ✗ ${shot.name} raised ${pageErrors.length} page error(s):`);
        for (const e of pageErrors.slice(0, 3)) console.error(`      ${e.slice(0, 160)}`);
        process.exitCode = 1;
      }
      await ctx.close();
    }
  } finally {
    await server.stop();
  }
}

const scratch = mkdtempSync(join(tmpdir(), "fdp-shots-"));
const browser = await chromium.launch();
try {
  for (const site of SITES) {
    const shots = only.length ? site.shots.filter((s) => only.includes(s.name)) : site.shots;
    if (!shots.length) continue;
    if (site.optIn && !only.length) continue;

    if (site.needsInstall) {
      try {
        statSync(join(site.cwd, "node_modules"));
      } catch {
        console.log(`\n${site.id}: skipped — run \`npm install\` in ${site.cwd} to include it`);
        continue;
      }
    }

    console.log(`\n${site.id}:`);
    if (!skipBuild) await run(NPX, ["next", "build"], site.cwd);
    await captureSite({ ...site, shots }, browser, scratch);
  }
} finally {
  await browser.close();
  rmSync(scratch, { recursive: true, force: true });
}

console.log(
  process.exitCode ? "\nfinished with page errors — see above" : "\nall screenshots regenerated",
);
