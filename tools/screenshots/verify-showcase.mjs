/**
 * Renders `demo/showcase` (Wavelet) in a real browser and asserts the things
 * no gate can see. The sibling of `verify.mjs` and `verify-home.mjs`,
 * pointed at showcase's own dev/prod servers rather than the stub-typed
 * multi-route harness `verify.mjs` uses: showcase is a real, standalone
 * Next app (own `package.json`, own install, deployed separately) — the
 * same reason `verify-home.mjs` exists instead of folding `home/` into
 * `verify.mjs`'s `ROUTES`.
 *
 * Before this file: Gate 9 (`gate_showcase()` in `scripts/build_release.py`)
 * covers showcase's *build* against real vendor typings, but nothing ran it
 * in a real browser. `demos:verify` never touches it — its `ROUTES` array
 * hardcodes `landing-page`/`dashboard`/`auth-form` only, by design, since
 * those three are the stub-typed harness's own routes and showcase isn't
 * mounted inside it.
 *
 * Also asserts the one real interactive flow the page has end to end:
 * `Pricing.tsx`'s "Choose {tier}" button pre-filling `ContactForm.tsx`'s
 * message field, previously only confirmed by hand.
 *
 * Run:  node verify-showcase.mjs
 *       node verify-showcase.mjs --prod    # production only (faster)
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { NPX, run, startNextServer, waitForServer } from "./lib/next-server.mjs";
import { scanElementOverflow, scanWrappedLabels } from "./lib/overflow.mjs";

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const SHOWCASE = join(import.meta.dirname, "..", "..", "demo", "showcase");

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

async function checkRoute(browser, base) {
  // Single-scheme by design, matching `verify.mjs`'s own `landing-page`
  // entry and `capture.mjs`'s showcase shot: showcase pins a dark
  // presentation and ships no light variant, so a second pass would just
  // re-check identical pixels under a different label.
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[2],
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
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

  // `?particleSeed=1` freezes the hero's WebGL particle field (positions
  // and rotation) — see demo/showcase/components/Hero3D.tsx. Without it,
  // this check would still be valid (particle randomness doesn't affect
  // console/hydration/axe/overflow), but every other automated pass against
  // showcase now standardizes on the deterministic route so a future
  // recapture/diff against this same check describes the same visual state.
  await page.goto(`${base}/?particleSeed=1`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("main, [role='main'], h1", { state: "attached", timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);

  report("no uncaught page errors", pageErrors);
  report("no console errors", consoleErrors);
  report("no hydration mismatch", hydration);

  // Accessibility. Serious/critical only, same bar as verify.mjs/verify-home.mjs.
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

  // Horizontal overflow: page-level and per-element (lib/overflow.mjs) —
  // the per-element pass is what would have caught this session's 768px
  // navbar mid-word wrap, which produced zero page-level overflow.
  const overflow = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(350);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (over > 1) overflow.push(`${vp.label} (${vp.width}px): body scrolls ${over}px sideways`);
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
 * Pricing → contact flow: `Pricing.tsx`'s "Choose {tier}" button has no
 * checkout to link to for a demo product, so it dispatches a
 * `PRICING_SELECT_EVENT` instead — `ContactForm.tsx` listens for it,
 * pre-fills the message field with the chosen tier, and focuses it. Nothing
 * before this session's live-browser review asserted that end-to-end; it
 * was only confirmed by hand via a real click + `inputValue()` read.
 */
async function checkPricingContactFlow(browser, base) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2] });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("main, [role='main'], h1", { state: "attached", timeout: 90_000 });
  // In dev mode Next compiles this route's chunk on first request, which can
  // leave the button attached but its React event handlers not yet wired —
  // clicking too early silently misses the CustomEvent dispatch entirely
  // rather than throwing. Same class of race checkRoute already waits out
  // (see its own 3000ms comment); the button click below needs the same
  // margin, not a shorter one.
  await page.getByRole("button", { name: "Choose Growth" }).waitFor({ state: "visible", timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const problems = [];
  await page.getByRole("button", { name: "Choose Growth" }).click();
  await page.waitForTimeout(300);
  const message = await page.locator("#contact-message").inputValue().catch(() => "");
  if (!message.includes("Growth")) {
    problems.push(`"Choose Growth" did not pre-fill the contact message (read "${message}")`);
  }

  report("pricing tier selection pre-fills the contact form", problems);
  await ctx.close();
}

async function verifyMode(mode, browser) {
  // 3311/3312/3313/3314 are demos/showcase/landing-page/home (capture.mjs),
  // 3315/3316 are verify-home.mjs's, 3319/3320/3323 are
  // visual-regression.mjs's, 3321/3322 are verify.mjs's own dev/prod pair —
  // 3317/3318 are this file's.
  const port = mode === "dev" ? 3317 : 3318;
  const base = `http://localhost:${port}`;
  console.log(`\n── ${mode} server ─────────────────────────────────────`);

  if (mode === "dev") rmSync(join(SHOWCASE, ".next"), { recursive: true, force: true });

  const server = await startNextServer({ cwd: SHOWCASE, port, mode: mode === "dev" ? "dev" : "start" });
  try {
    await waitForServer(base);
    await checkRoute(browser, base);
    await checkPricingContactFlow(browser, base);
  } finally {
    await server.stop();
  }
}

const browser = await chromium.launch();
try {
  if (!prodOnly) await verifyMode("dev", browser);
  console.log("\nbuilding for the production pass…");
  await run(NPX, ["next", "build"], SHOWCASE);
  await verifyMode("prod", browser);
} finally {
  await browser.close();
}

console.log(failures === 0 ? "\nshowcase renders clean in both modes" : `\n${failures} problem(s) found — see above`);
process.exit(failures === 0 ? 0 : 1);
