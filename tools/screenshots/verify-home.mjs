/**
 * Renders `home/` — the pack's own homepage, served at the root of the Pages
 * site — in a real browser and exercises it. The sibling of `verify.mjs`,
 * pointed at `home/`'s own dev and production servers rather than at the
 * mounted-in-place harness `verify.mjs` uses for the stub-typed demos:
 * `home/` has its own `package.json` (GSAP, Lenis, Geist) and is checked the
 * same way `demo/landing-page` and `demo/showcase` are — its own install, its
 * own server — rather than folded into this package's dependency list.
 *
 * `CLAUDE.md` states the gap this closes in its own words: no gate in this
 * repository renders anything. This used to be `verify-pages.mjs`, serving
 * `.github/pages/*.html` directly with no build step; `home/` replaced that
 * static page with a real Next app, so this script now starts a server
 * instead of a static file host, and adds the one thing a static page never
 * needed: a dev pass AND a production pass, since a bug that exists only
 * under one server mode is exactly the shape of defect a single-mode check
 * would miss.
 *
 * Run:  node verify-home.mjs
 *       node verify-home.mjs --prod    # production only (faster)
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { NPX, run, startNextServer, waitForServer } from "./lib/next-server.mjs";

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const HOME = join(import.meta.dirname, "..", "..", "home");

const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1920, height: 1080 },
];

const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /React Router Future Flag/i,
  /\[Fast Refresh\]/i,
  /fonts\.googleapis\.com/i,
  /favicon\.ico/i,
];
const HYDRATION = /hydrat|did not match|server rendered|server HTML/i;

const prodOnly = process.argv.includes("--prod");
let failures = 0;

function report(label, problems) {
  if (problems.length === 0) {
    console.log(`    ✓ ${label}`);
    return;
  }
  failures += problems.length;
  console.log(`    ✗ ${label}`);
  for (const p of problems.slice(0, 6)) console.log(`        ${p}`);
  if (problems.length > 6) console.log(`        …and ${problems.length - 6} more`);
}

/**
 * Walk the whole document so every scroll-triggered GSAP/`useFadeUp` reveal
 * fires, then wait for the ones that animate opacity to settle. Ported from
 * the `settle()` helper `verify-pages.mjs` used against the previous
 * hand-written page — that page's reveal-on-scroll bug (sections stuck at
 * `opacity: 0` under `scroll-behavior: smooth` fighting a scripted
 * `window.scrollTo`) is exactly the class of defect this exists to catch, and
 * `home/`'s Lenis-driven scroll is a new way to reintroduce it.
 */
async function settle(page) {
  await page.evaluate(async () => {
    const root = document.documentElement;
    const step = Math.max(200, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y < root.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 200));
  });
}

async function checkRender(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2], reducedMotion: "no-preference" });
  const page = await ctx.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  const hydration = [];
  page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 200)));
  page.on("console", (m) => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    const text = m.text();
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return;
    if (HYDRATION.test(text)) hydration.push(text.slice(0, 200));
    else if (m.type() === "error") consoleErrors.push(text.slice(0, 200));
  });

  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("main, h1", { state: "attached", timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  await page.waitForTimeout(500);

  report("no uncaught page errors", pageErrors);
  report("no console errors", consoleErrors);
  report("no hydration mismatch", hydration);

  await page.addScriptTag({ content: AXE_SOURCE });
  const violations = await page.evaluate(async () => {
    const res = await window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return res.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id} (${v.impact}, ${v.nodes.length}x): ${v.help}`);
  });
  report("no serious/critical axe violations", violations);

  const overflow = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(350);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (over > 1) overflow.push(`${vp.label} (${vp.width}px): body scrolls ${over}px sideways`);
  }
  report("no horizontal overflow at 390 / 768 / 1920", overflow);

  await ctx.close();
}

/** Every `[data-fade]`-equivalent (GSAP `.opacity-0` targets, `.reveal`
    sections) must be visible immediately under reduced motion. */
async function checkReducedMotion(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2], reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("main, h1", { state: "attached", timeout: 90_000 });
  await page.waitForTimeout(500);
  await settle(page);
  await page.waitForTimeout(300);

  const hidden = await page.evaluate(() => {
    const stuck = [];
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) === 0 && el.children.length === 0 && (el.textContent ?? "").trim()) {
        stuck.push(el.tagName + "." + Array.from(el.classList).slice(0, 2).join("."));
      }
    }
    return stuck;
  });
  report("every revealed section is visible under prefers-reduced-motion", hidden);

  await ctx.close();
}

/**
 * RTL resilience: force `dir="rtl"` on the document (no locale switch needed
 * — Tailwind's `rtl:`-aware/logical-property layout is a `dir` concern, not
 * a translation concern) and re-run the same horizontal-overflow check every
 * other viewport pass already uses. `skills/platform/references/i18n.md`
 * documents the logical-property/`dir` guidance this page is supposed to
 * follow; nothing before this checked that it actually does. Layout
 * mirroring correctness (is the right element on the right side) is a human-
 * review call — this checks the narrower, unambiguous claim: the page does
 * not break sideways when the writing direction flips.
 */
async function checkRTL(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2] });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("main, h1", { state: "attached", timeout: 90_000 });
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
  await page.waitForTimeout(300);
  await settle(page);
  await page.waitForTimeout(300);

  const overflow = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(350);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (over > 1) overflow.push(`${vp.label} (${vp.width}px): body scrolls ${over}px sideways under dir="rtl"`);
  }
  report("no horizontal overflow at 390 / 768 / 1920 under dir=\"rtl\"", overflow);

  await ctx.close();
}

/** The router and checker are the two things on this page that demonstrate a
    claim rather than assert one — this is the part `verify-pages.mjs` wrote
    for the old static page, ported to React state instead of DOM queries. */
async function checkInteractivity(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2] });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle", timeout: 90_000 });

  const problems = [];

  // Hero: the WebGL shader background actually mounted (desktop viewport is
  // >=640px, so `HeroBackground` should have enabled the Canvas chunk). This
  // is the one thing nothing else here would catch — a silent shader-compile
  // failure that resolves without throwing still leaves the layer empty.
  //
  // The layer is a dynamically-imported chunk (`next/dynamic`, `ssr: false`)
  // that mounts after a `matchMedia` check in a `useEffect`. In production
  // the chunk is pre-built and this resolves almost immediately; in dev it
  // compiles on first request, which can take several seconds — `networkidle`
  // fires well before that compile finishes. Poll for the element instead of
  // a fixed sleep, so dev and prod are both correctly handled by the same
  // wait rather than a duration tuned to whichever one was running when it
  // was picked.
  const heroCanvasCount = await page
    .waitForSelector("[data-hero-scene] canvas", { timeout: 15_000 })
    .then(() => 1)
    .catch(() => 0);
  if (heroCanvasCount === 0) problems.push("hero shader canvas did not mount at desktop width");

  // Hero: the particle-typography layer (samples the real headline, waits on
  // document.fonts.ready before drawing) also mounted — a second, independent
  // canvas the shader check above does not cover. Not a dynamic import, but
  // polled the same way for consistency and to tolerate font-load timing.
  const particleCanvasCount = await page
    .waitForSelector("[data-particle-canvas]", { timeout: 15_000 })
    .then(() => 1)
    .catch(() => 0);
  if (particleCanvasCount === 0) problems.push("hero particle canvas did not mount at desktop width");

  // Showcase: all four project cards render (v2.2 — replaced the mock UI
  // gallery this same assertion used to check; see home/README.md's showcase
  // thumbnails section for where the images come from).
  const showcaseCardCount = await page.locator("[data-showcase-grid] > *").count();
  if (showcaseCardCount !== 4) problems.push(`showcase rendered ${showcaseCardCount} cards, expected 4`);

  // Router: the default request resolves to a real skill.
  const defaultKind = await page.locator("[data-route-output]").getAttribute("data-route-kind");
  if (defaultKind !== "hit") problems.push(`default request did not resolve to a skill (kind=${defaultKind})`);
  const routeId = await page.locator("[data-route-id]").textContent().catch(() => "");
  if (!routeId) problems.push("router hit produced no [data-route-id]");

  // Router: the "narrowing the cost" token countdown settles rather than
  // looping. Its GSAP timeline finishes well under 2.5s after mount
  // (two 0.9s tweens plus short gaps between them); wait it out, then read
  // the displayed text twice, 300ms apart, and require it to have stopped
  // changing.
  await page.waitForTimeout(2500);
  const countdownFirst = await page.locator("[data-route-output] [data-metric].font-mono").last().textContent().catch(() => "");
  await page.waitForTimeout(300);
  const countdownSecond = await page.locator("[data-route-output] [data-metric].font-mono").last().textContent().catch(() => "");
  if (!countdownFirst || countdownFirst !== countdownSecond) {
    problems.push(`token countdown did not settle (read "${countdownFirst}" then "${countdownSecond}")`);
  }

  // Router: an out-of-scope request asks rather than guesses.
  await page.locator('[data-example="rewrite the billing service in Go"]').click();
  await page.waitForTimeout(200);
  const noneKind = await page.locator("[data-route-output]").getAttribute("data-route-kind");
  if (noneKind !== "none") problems.push(`out-of-scope request should refuse to guess (kind=${noneKind})`);

  // Checker: the "what agents write" snippet (default) fails several checks.
  const badCount = await page.locator("[data-check-verdict] .verdict-count").textContent().catch(() => "0");
  if (!(Number(badCount) > 0)) problems.push(`bad snippet reported ${badCount} failures, expected > 0`);

  // Checker: switching to the "good" snippet clears every ported check.
  await page.locator('[data-snippet="good"]').click();
  await page.waitForTimeout(250);
  const goodCount = await page.locator("[data-check-verdict] .verdict-count").textContent().catch(() => "?");
  if (goodCount !== "0") problems.push(`good snippet reported ${goodCount} failures, expected 0`);

  // Install: copy button actually writes the command to the clipboard.
  await page.locator("#install").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Copy" }).click();
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  if (!clip.includes("npx skills add")) problems.push("install copy button did not write the command to the clipboard");

  report("hero shader canvas mounted", problems.filter((p) => p.includes("hero shader canvas")));
  report("hero particle canvas mounted", problems.filter((p) => p.includes("hero particle canvas")));
  report("showcase renders all 4 project cards", problems.filter((p) => p.includes("showcase rendered")));
  report("router resolves the real registry and refuses to guess", problems.filter((p) => p.includes("route") || p.includes("skill")));
  report("token countdown settles", problems.filter((p) => p.includes("token countdown")));
  report("checker fails the bad snippet and clears the good one", problems.filter((p) => p.includes("snippet")));
  report("install command actually copies", problems.filter((p) => p.includes("clipboard")));

  await ctx.close();
}

async function verifyMode(mode, browser) {
  // 3311/3312/3313 are demos/showcase/landing-page (capture.mjs), 3321/3322 are
  // verify.mjs's own dev/prod pair — 3315/3316 are the next free pair.
  const port = mode === "dev" ? 3315 : 3316;
  const base = `http://localhost:${port}`;
  // Every check below navigates to the deterministic `signature` world, not
  // whatever a fresh session would randomly pick — `home/lib/worlds.ts`
  // documents this as the one world full `pages:verify` coverage runs
  // against; `mesh` gets a manual spot-check instead (see that file's own
  // comment for the stated gap). `waitForServer` below stays on the bare
  // `base` — it's just a health check, not a page load.
  const url = `${base}/?world=signature`;
  console.log(`\n── ${mode} server ─────────────────────────────────────`);

  if (mode === "dev") rmSync(join(HOME, ".next"), { recursive: true, force: true });

  const server = startNextServer({ cwd: HOME, port, mode: mode === "dev" ? "dev" : "start" });
  try {
    await waitForServer(base);
    await checkRender(browser, url);
    await checkReducedMotion(browser, url);
    await checkRTL(browser, url);
    await checkInteractivity(browser, url);
  } finally {
    await server.stop();
  }
}

const browser = await chromium.launch();
try {
  if (!prodOnly) await verifyMode("dev", browser);
  console.log("\nbuilding for the production pass…");
  await run(NPX, ["next", "build"], HOME);
  await verifyMode("prod", browser);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nhome/ renders clean in both modes" : `\n${failures} problem(s) found — see above`);
process.exit(failures === 0 ? 0 : 1);
