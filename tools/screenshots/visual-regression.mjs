/**
 * Visual regression: screenshots `home/` and `demo/landing-page` against
 * committed baselines and reports pixel drift beyond a small budget.
 *
 *   node tools/screenshots/visual-regression.mjs                 # check
 *   node tools/screenshots/visual-regression.mjs --update-baselines
 *
 * Three targets, all rendering deterministically. `demo/showcase`'s hero is
 * a WebGL particle field seeded at random by default — `capture.mjs`
 * documents why its own showcase shot stays opt-in: "every capture differs
 * from the last." That's still true for a real visitor. What changed:
 * `Hero3D.tsx` now accepts an optional `seed` (read from `?particleSeed=`
 * when not passed explicitly) that swaps `Math.random()` for a seeded PRNG
 * and freezes the field's rotation the same way `prefers-reduced-motion`
 * already does — the same shape of override `home/`'s `?world=signature`
 * uses for its own seeded "world" pick, applied here. This was logged as a
 * follow-up in docs/CAPABILITY_MATRIX.md and is now built, not worked around.
 *
 * One color scheme per target, matching how each is already exercised by
 * the rest of this toolset rather than inventing new coverage: `verify.mjs`
 * documents that `landing-page` "pins color-scheme: dark and ships no light
 * variant," `verify-home.mjs` never exercises `home/` in dark, and
 * `verify-showcase.mjs`/`capture.mjs` both already treat showcase as dark
 * only. Testing a scheme a page doesn't actually render under would just
 * re-screenshot identical pixels under a second label.
 *
 * A live glyph-rendering artifact was investigated near the homepage navbar
 * this same session — not a pixel-diff finding, a directly-observed one —
 * and ruled out as a layout defect (the real DOM gap was doubled via
 * `getBoundingClientRect` and the artifact's appearance didn't change,
 * which a genuine spacing bug cannot do; reproduced identically in Firefox,
 * ruling out a Chromium-specific cause). It's believed to be the same
 * font/anti-aliasing rendering-engine class the paragraph below already
 * names for baseline provenance, just visible in a live render instead of a
 * diff. Documented here rather than chased further; a Docker-pinned capture
 * environment (the standard fix research turned up for this exact class of
 * cross-platform font drift) would likely resolve both at once, but is a
 * real infra change and stays a logged follow-up, not built this pass.
 *
 * Baseline provenance matters here: screenshot diffing is font/OS-sensitive,
 * and a baseline captured on a Windows or macOS dev machine will produce
 * false diffs against the Linux GitHub Actions runner this also runs on —
 * from font rendering alone, independent of any real visual change. The
 * baseline that ships should be the one the `visual-regression` CI job
 * itself produces; `--update-baselines` exists for local iteration, and any
 * diff it reports should be read before the result is committed, the same
 * way a `GRANDFATHERED` waiver in test_constraints.py has to state its
 * reason rather than silently pass.
 *
 * Ships informational-only in CI (continue-on-error) until it has run clean
 * — or caught a real regression — across enough commits to trust the
 * threshold. Not a numbered gate yet; see docs/CAPABILITY_MATRIX.md.
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { NPX, run, startNextServer, waitForServer } from "./lib/next-server.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const BASELINES = join(HERE, "baselines");
const DIFFS = join(HERE, ".diff-output");

const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1920, height: 1080 },
];

const TARGETS = [
  {
    id: "home",
    cwd: join(REPO, "home"),
    port: 3319,
    // The homepage seeds one of 4 curated "worlds" per session
    // (`home/lib/worlds.ts`) — accent hue, background treatment and
    // headline weight all vary. Without the deterministic override this
    // target wouldn't render deterministically at all, defeating the whole
    // point of a pixel-diff baseline: every run (and every baseline
    // regeneration) would land on a different random world and diff against
    // whichever one got frozen last, regardless of any real change.
    route: "/?world=signature",
    scheme: "light",
    waitFor: "main, h1",
  },
  {
    id: "landing-page",
    cwd: join(REPO, "demo", "landing-page"),
    port: 3320,
    route: "/",
    scheme: "dark",
    waitFor: "main, h1",
  },
  {
    id: "showcase",
    cwd: join(REPO, "demo", "showcase"),
    // 3311-3314 are capture.mjs's own ports, 3315-3318 are the verify*.mjs
    // dev/prod pairs, 3319-3320 are this file's home/landing-page targets
    // above — 3321-3322 are verify.mjs's dev/prod pair, so 3323 is next free.
    port: 3323,
    // Freezes Hero3D's particle field — see this file's own doc comment and
    // demo/showcase/components/Hero3D.tsx. Without it this target wouldn't
    // render deterministically at all.
    route: "/?particleSeed=1",
    scheme: "dark",
    waitFor: "main, h1",
  },
];

const DIFF_THRESHOLD = 0.1; // pixelmatch's own perceptual sensitivity, not the pass/fail budget
const MISMATCH_BUDGET = 0.005; // fail above 0.5% of a screenshot's pixels differing — conservative starting point, tighten once proven stable

const updateBaselines = process.argv.includes("--update-baselines");
let failures = 0;
const summary = [];

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

async function captureOne(browser, target, viewport) {
  const base = `http://localhost:${target.port}`;
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: target.scheme,
    reducedMotion: "no-preference",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${base}${target.route}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector(target.waitFor, { state: "attached", timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  // Long enough for scroll/fade reveals above the fold to settle across every
  // page this runs against — matches the wait already proven out in verify.mjs.
  await page.waitForTimeout(1500);
  const buf = await page.screenshot();
  await ctx.close();
  return PNG.sync.read(buf);
}

function compare(name, actual) {
  const baselinePath = join(BASELINES, `${name}.png`);
  mkdirSync(dirname(baselinePath), { recursive: true });

  if (!existsSync(baselinePath)) {
    if (updateBaselines) {
      writeFileSync(baselinePath, PNG.sync.write(actual));
      console.log(`  + ${name} (new baseline)`);
      summary.push({ name, status: "new-baseline" });
      return;
    }
    failures += 1;
    console.log(`  ✗ ${name} — no baseline committed. Run with --update-baselines to create one.`);
    summary.push({ name, status: "missing-baseline" });
    return;
  }

  const baseline = readPng(baselinePath);
  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    if (updateBaselines) {
      writeFileSync(baselinePath, PNG.sync.write(actual));
      console.log(
        `  + ${name} (baseline resized ${baseline.width}x${baseline.height} -> ${actual.width}x${actual.height})`,
      );
      summary.push({ name, status: "new-baseline-resized" });
      return;
    }
    failures += 1;
    console.log(
      `  ✗ ${name} — dimensions changed (${baseline.width}x${baseline.height} -> ${actual.width}x${actual.height})`,
    );
    summary.push({ name, status: "dimension-mismatch" });
    return;
  }

  const { width, height } = actual;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(baseline.data, actual.data, diff.data, width, height, {
    threshold: DIFF_THRESHOLD,
  });
  const ratio = mismatched / (width * height);

  if (updateBaselines) {
    writeFileSync(baselinePath, PNG.sync.write(actual));
    const note = ratio > 0 ? ` (moved ${(ratio * 100).toFixed(2)}% of pixels — review before committing)` : "";
    console.log(`  ~ ${name}${note}`);
    summary.push({ name, status: "updated", mismatchRatio: ratio });
    return;
  }

  if (ratio > MISMATCH_BUDGET) {
    failures += 1;
    mkdirSync(DIFFS, { recursive: true });
    const diffPath = join(DIFFS, `${name.replaceAll("/", "--")}.diff.png`);
    writeFileSync(diffPath, PNG.sync.write(diff));
    console.log(
      `  ✗ ${name} — ${(ratio * 100).toFixed(2)}% of pixels differ ` +
        `(budget ${(MISMATCH_BUDGET * 100).toFixed(1)}%), diff written to ${diffPath}`,
    );
    summary.push({ name, status: "fail", mismatchRatio: ratio, diffPath });
  } else {
    console.log(`  ✓ ${name}${ratio > 0 ? ` (${(ratio * 100).toFixed(3)}% — within budget)` : ""}`);
    summary.push({ name, status: "pass", mismatchRatio: ratio });
  }
}

async function runTarget(browser, target) {
  console.log(`\n${target.id}:`);
  if (!existsSync(join(target.cwd, "node_modules"))) {
    console.log(`  skipped — run \`npm install\` in ${target.cwd} to include it`);
    return;
  }
  await run(NPX, ["next", "build"], target.cwd);
  const server = await startNextServer({ cwd: target.cwd, port: target.port, mode: "start" });
  try {
    await waitForServer(`http://localhost:${target.port}${target.route}`);
    for (const vp of VIEWPORTS) {
      const png = await captureOne(browser, target, vp);
      compare(`${target.id}/${target.id}--${vp.label}--${target.scheme}`, png);
    }
  } finally {
    await server.stop();
  }
}

rmSync(DIFFS, { recursive: true, force: true });
const browser = await chromium.launch();
try {
  for (const target of TARGETS) await runTarget(browser, target);
} finally {
  await browser.close();
}

writeFileSync(
  join(HERE, "visual-regression-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), updateBaselines, summary }, null, 2),
);

console.log(
  updateBaselines
    ? "\nbaselines updated — review any moved-pixel notes above before committing"
    : failures === 0
      ? "\nno visual regressions"
      : `\n${failures} visual regression(s) found — see above`,
);
process.exit(updateBaselines ? 0 : failures === 0 ? 0 : 1);
