/**
 * Renders every stub-typed demo and asserts the things no gate can see.
 *
 *   npm run demos:verify              # dev + production
 *   npm run demos:verify -- --prod    # production only (faster)
 *
 * The repo's gates check that the demos compile and that their source obeys 53
 * constraints. None of them renders a demo, which is how a stylesheet that
 * silently did nothing and a resolver typed as `any` both shipped. This closes
 * that gap: real browser, real libraries, both server modes.
 *
 * Checks per route: uncaught page errors, console errors, React hydration
 * mismatches, axe accessibility violations, and horizontal overflow at three
 * viewports. Demos that ship a dark variant are additionally rendered dark.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const HERE = fileURLToPath(new URL(".", import.meta.url));
const IS_WIN = process.platform === "win32";

const ROUTES = [
  { name: "landing-page", route: "/landing-page", schemes: ["dark"] },
  // Both ship a prefers-color-scheme: dark variant, so both surfaces are checked.
  { name: "dashboard", route: "/dashboard", schemes: ["light", "dark"] },
  { name: "auth-form", route: "/auth-form", schemes: ["light", "dark"] },
];

const VIEWPORTS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1920, height: 1080 },
];

/** Noise that says nothing about the demo under test. */
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /React Router Future Flag/i,
  /\[Fast Refresh\]/i,
  // The demos deliberately import Google Fonts; a blocked font request in a
  // sandboxed run is not a defect in the demo.
  /fonts\.googleapis\.com/i,
  /favicon\.ico/i,
];

const HYDRATION = /hydrat|did not match|server rendered|server HTML/i;

const prodOnly = process.argv.includes("--prod");
let failures = 0;

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const c = spawn(cmd, args, { cwd, stdio: "inherit", shell: IS_WIN });
    c.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    c.on("error", reject);
  });
}

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(4000) })).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server never became ready at ${url}`);
}

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

async function checkRoute(browser, base, spec, scheme) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[2],
    colorScheme: scheme,
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

  await page.goto(`${base}${spec.route}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  // `attached`, not the default `visible`. The question here is whether the page
  // rendered at all; a dev server compiling recharts on demand can leave the
  // landmark attached but not yet laid out, and waiting on visibility turned
  // that into a spurious 60s timeout.
  await page.waitForSelector("main, [role='main'], h1", { state: "attached", timeout: 90_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);

  console.log(`  ${spec.name} [${scheme}]`);
  report("no uncaught page errors", pageErrors);
  report("no console errors", consoleErrors);
  report("no hydration mismatch", hydration);

  // Accessibility. Serious/critical only — the demos are held to WCAG AA, and
  // axe's "minor" bucket is mostly advisory.
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

  // Horizontal overflow: the page body must never scroll sideways.
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

async function verifyMode(mode, browser) {
  const port = mode === "dev" ? 3321 : 3322;
  const base = `http://localhost:${port}`;
  console.log(`\n── ${mode} server ─────────────────────────────────────`);

  const server = spawn(
    IS_WIN ? "npx.cmd" : "npx",
    ["next", mode === "dev" ? "dev" : "start", "-p", String(port)],
    { cwd: HERE, stdio: "ignore", shell: IS_WIN },
  );
  try {
    await waitForServer(`${base}${ROUTES[0].route}`);
    for (const spec of ROUTES) {
      for (const scheme of spec.schemes) await checkRoute(browser, base, spec, scheme);
    }
  } finally {
    server.kill();
  }
}

const browser = await chromium.launch();
try {
  // Dev first, then build, then prod. `next dev` writes development artifacts
  // into the same .next directory, so building up front and running dev
  // afterwards leaves `next start` with nothing to serve.
  if (!prodOnly) await verifyMode("dev", browser);
  console.log("\nbuilding for the production pass…");
  await run(IS_WIN ? "npx.cmd" : "npx", ["next", "build"], HERE);
  await verifyMode("prod", browser);
} finally {
  await browser.close();
}

console.log(
  failures === 0
    ? "\nall demos render clean in both modes"
    : `\n${failures} problem(s) found — see above`,
);
process.exit(failures === 0 ? 0 : 1);
