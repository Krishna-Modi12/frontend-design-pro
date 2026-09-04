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
import { scanElementOverflow, scanWrappedLabels } from "./lib/overflow.mjs";

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

    // Page-level scrollWidth can read 0 while a single element still
    // overflows its own box, or a nav/button label wraps mid-word onto two
    // lines (a different shape scrollWidth can't see at all) — see
    // lib/overflow.mjs for why both checks are needed.
    for (const { selector, overflowPx } of await page.evaluate(scanElementOverflow)) {
      overflow.push(`${vp.label} (${vp.width}px): <${selector}> overflows its box by ${overflowPx}px`);
    }
    for (const { selector, lines } of await page.evaluate(scanWrappedLabels)) {
      overflow.push(`${vp.label} (${vp.width}px): <${selector}> wraps onto ${lines} lines`);
    }
  }
  report("no horizontal overflow at 390 / 768 / 1920", overflow);

  await ctx.close();
}

/**
 * Elements holding real text at `opacity: 0` — the shape a reveal that never
 * fired leaves behind. Leaf nodes only, so a parent caught mid-tween does not
 * report its entire subtree as stuck.
 *
 * Declared once and handed to `page.evaluate` by both callers rather than
 * inlined twice: the two checks assert the same property about two different
 * paths (the reduced-motion skip and the 4s timeout fallback), and a predicate
 * that drifts between them would let one of the paths quietly stop being
 * checked.
 */
const collectStuckAtZero = () => {
  const stuck = [];
  for (const el of document.querySelectorAll("main *")) {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) === 0 && el.children.length === 0 && (el.textContent ?? "").trim()) {
      stuck.push(el.tagName + "." + Array.from(el.classList).slice(0, 2).join("."));
    }
  }
  return stuck;
};

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

  const hidden = await page.evaluate(collectStuckAtZero);
  report("every revealed section is visible under prefers-reduced-motion", hidden);

  await ctx.close();
}

/**
 * The `useStaggerReveal`/`useFadeUp` fallback (`window.setTimeout(reveal,
 * 4000)`) exists so a reveal that never sees its ScrollTrigger fire (motion
 * library failure, no real scroll, a scroll-position calculation that
 * doesn't line up in some environment) still ends up visible rather than
 * stuck at `opacity: 0` forever. `checkReducedMotion` above proves the
 * *reduced-motion* skip path; nothing before this proved the fallback
 * itself actually fires under normal motion — it was only ever confirmed by
 * hand, by waiting past 4s in an ad hoc script.
 *
 * Playwright's `page.clock` (installed before navigation, so it intercepts
 * `setTimeout`/`requestAnimationFrame`/`performance` together from the
 * start) jumps straight past the 4s mark instead of waiting for it in real
 * time — and, critically, this never scrolls. A real scroll would let the
 * ScrollTrigger path fire first, which would make this check pass for the
 * wrong reason.
 */
async function checkTimeoutFallback(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2], reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("main, h1", { state: "attached", timeout: 90_000 });

  await page.clock.fastForward(4100);
  // Switch back to real time so the reveal's own 0.6s GSAP tween can finish
  // normally rather than needing the fake clock to simulate every frame.
  await page.clock.resume();

  // Poll rather than wait a fixed 800ms. The fixed wait was a race, and CI
  // caught it the first time this harness ran on a hosted runner: a headline
  // word span reported stuck at opacity 0 on the dev pass while the production
  // pass in the same run was clean. Nothing about the page was wrong. The
  // hero's load sequence is a `gsap.from({ opacity: 0 })` whose last staggered
  // word settles ~0.86s after the tween starts, and on a cold dev server
  // hydration can land AFTER `clock.resume()` — so the whole animation ran
  // inside a window sized only for its tail, and the check sampled it midway.
  //
  // Polling leaves the assertion exactly as strong: a reveal that genuinely
  // never fires is still stuck when the deadline passes, and still reported
  // with the element that failed. What it removes is the dependency on how
  // fast the machine happened to hydrate, which is not something this check
  // has any business measuring.
  let hidden = [];
  const deadline = Date.now() + 5_000;
  for (;;) {
    hidden = await page.evaluate(collectStuckAtZero);
    if (hidden.length === 0 || Date.now() >= deadline) break;
    await page.waitForTimeout(100);
  }
  report("the 4s reveal fallback fires when scroll never triggers it", hidden);

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

    for (const { selector, overflowPx } of await page.evaluate(scanElementOverflow)) {
      overflow.push(`${vp.label} (${vp.width}px): <${selector}> overflows its box by ${overflowPx}px under dir="rtl"`);
    }
    for (const { selector, lines } of await page.evaluate(scanWrappedLabels)) {
      overflow.push(`${vp.label} (${vp.width}px): <${selector}> wraps onto ${lines} lines under dir="rtl"`);
    }
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
  // Hero: one mark per reference file, drawn from `data.generated.json`.
  // This is the assertion the previous hero could not have: its 119 strata
  // were vertices inside a WebGL buffer, so nothing outside the shader could
  // count them and a scene that silently dropped half the corpus rendered
  // as a slightly shorter brick. They are DOM nodes now, so the drawing is
  // checkable against the same figure the sentence beside it prints. The
  // count comes from the generated data rather than a literal, so a corpus
  // that grows moves both together or fails here.
  const expectedMarks = JSON.parse(
    readFileSync(join(HOME, "lib", "data.generated.json"), "utf8"),
  ).references.length;
  const markCount = await page.locator("[data-corpus-mark]").count();
  if (markCount !== expectedMarks) {
    problems.push(`hero corpus drew ${markCount} marks, expected ${expectedMarks}`);
  }

  // Exactly one mark is lit at rest. Two would mean the default and a
  // stuck hover state are both applied; none would mean the named reference
  // no longer resolves, which is silent — the caption would still name a
  // file that is no longer in the corpus.
  const litCount = await page.locator("[data-corpus-mark][data-lit]").count();
  if (litCount !== 1) problems.push(`hero corpus lit ${litCount} marks at rest, expected 1`);

  // ...AND IT IS ACTUALLY ON SCREEN. This is the assertion the three above
  // could not make, and the one that mattered: the marks were present,
  // counted correctly and exactly one was lit while ALL 119 SAT AT OPACITY 0
  // AND NEVER MOVED. `Hero.tsx` ran a `gsap.from()` over them while
  // `HeroCorpus` set the same property from React and transitioned it in CSS;
  // the tween wrote its start state and stalled. Measured on the shipped
  // production build: 0 of 119 visible at 500ms, still 0 at 8s. Every reader
  // with motion enabled met an empty half-hero.
  //
  // Three things hid it. The checks above count nodes, not pixels. Axe has no
  // opinion about a decorative figure being invisible. And the reveal-fallback
  // sweep only looks at elements holding TEXT, which a `<line>` never does.
  //
  // Default motion specifically: under `prefers-reduced-motion` the hero's
  // effect returns before it touches the corpus, so the broken path was the
  // one nothing ran. A tolerance rather than `> 0` because a tick mid-
  // transition is fine and a tick that never arrives is not; 1.2s is well past
  // the 200ms the marks transition over and the 1.6s head sweep does not touch
  // opacity.
  const motionCtx = await browser.newContext({
    viewport: VIEWPORTS[2],
    reducedMotion: "no-preference",
  });
  const motionPage = await motionCtx.newPage();
  await motionPage.goto(base, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await motionPage.waitForSelector("[data-corpus-mark]", { state: "attached", timeout: 90_000 });
  await motionPage.waitForTimeout(1200);
  const invisibleMarks = await motionPage.evaluate(() => {
    let hidden = 0;
    for (const el of document.querySelectorAll("[data-corpus-mark]")) {
      const cs = getComputedStyle(el);
      const alpha = parseFloat(cs.opacity) * parseFloat(cs.strokeOpacity || "1");
      if (!(alpha > 0.02)) hidden += 1;
    }
    return hidden;
  });
  await motionCtx.close();
  if (invisibleMarks > 0) {
    problems.push(
      `hero corpus invisible: ${invisibleMarks} mark(s) at opacity 0 under default motion`,
    );
  }

  // The corpus is server-rendered: it is the paint before any JS runs, and
  // what a reader with JavaScript disabled sees. `next/dynamic` with
  // `ssr: false` used to hold the old hero out of this HTML entirely.
  const ssrMarks = (await page.content()).split("data-corpus-mark").length - 1;
  if (ssrMarks !== expectedMarks) {
    problems.push(`hero corpus server-rendered ${ssrMarks} marks, expected ${expectedMarks}`);
  }

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

  // Router: real keystrokes into [data-route-input] resolve a request too,
  // not just the canned example chips every check above this one exercises
  // (the default mount state, and one pre-set example button click). Typing
  // is the router's actual, primary interaction — a live user never clicks
  // an example chip on a real visit — and nothing before this session typed
  // into the field at all.
  await page.locator("[data-route-input]").fill("build a landing page for my SaaS");
  await page.waitForTimeout(300);
  const typedKind = await page.locator("[data-route-output]").getAttribute("data-route-kind");
  if (typedKind !== "hit") problems.push(`typed request did not resolve to a skill (kind=${typedKind})`);
  const typedRouteId = await page.locator("[data-route-id]").textContent().catch(() => "");
  if (!typedRouteId) problems.push("typed request produced no [data-route-id]");

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

  // These two filters must quote the problem strings pushed above verbatim.
  // They previously matched "hero shader canvas" and "hero particle canvas"
  // against messages that had been reworded, so both lines printed a tick no
  // matter what the page did — a green line that proved nothing, which is a
  // worse failure than a red one.
  report("hero corpus draws one mark per reference", problems.filter((p) => p.includes("hero corpus drew")));
  report("hero corpus lights exactly one at rest", problems.filter((p) => p.includes("hero corpus lit")));
  report("hero corpus is visible under default motion", problems.filter((p) => p.includes("hero corpus invisible")));
  report("hero corpus is server-rendered", problems.filter((p) => p.includes("hero corpus server-rendered")));
  report("showcase renders all 4 project cards", problems.filter((p) => p.includes("showcase rendered")));
  report(
    "router resolves the real registry and refuses to guess",
    problems.filter((p) => (p.includes("route") || p.includes("skill")) && !p.includes("typed request")),
  );
  report("router resolves a typed request, not just canned examples", problems.filter((p) => p.includes("typed request")));
  report("token countdown settles", problems.filter((p) => p.includes("token countdown")));
  report("checker fails the bad snippet and clears the good one", problems.filter((p) => p.includes("snippet")));
  report("install command actually copies", problems.filter((p) => p.includes("clipboard")));

  await ctx.close();
}

async function verifyMode(mode, browser) {
  // 3311/3312/3313/3314 are demos/showcase/landing-page/home (capture.mjs),
  // 3317/3318 are verify-showcase.mjs's, 3319/3320/3323 are
  // visual-regression.mjs's, 3321/3322 are verify.mjs's own dev/prod pair —
  // 3315/3316 are this file's.
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

  const server = await startNextServer({ cwd: HOME, port, mode: mode === "dev" ? "dev" : "start" });
  try {
    await waitForServer(base);
    await checkRender(browser, url);
    await checkReducedMotion(browser, url);
    await checkTimeoutFallback(browser, url);
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
