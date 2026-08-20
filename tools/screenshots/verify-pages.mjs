/**
 * Renders the composed Pages site in a real browser and exercises it.
 *
 * Run:  node tools/screenshots/verify-pages.mjs <site-dir>
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 *
 * `CLAUDE.md` states the gap in its own words: no gate in this repository
 * renders anything. Every one of them reads source, and the defects that got
 * through a fully green chain were a stylesheet that silently did nothing, a
 * page that scrolled sideways at 390px, and a chart hidden from screen readers
 * but still in the tab order. `npm run demos:verify` closes that gap for
 * `demo/`. Nothing closed it for the site at the root of the Pages deploy,
 * which is the most public surface this project has.
 *
 * So this is the sibling of `verify.mjs`, pointed at the composed upload rather
 * than at a dev server, and it asks the questions a static check cannot:
 *
 *   · does it throw, or log an error, on load
 *   · does axe find a serious or critical violation at WCAG 2.1 AA
 *   · does anything scroll sideways at 390, 768 or 1920
 *   · do the two interactive panels actually do what the copy claims
 *   · with `prefers-reduced-motion: reduce`, is every revealed section VISIBLE
 *
 * That last one is the failure this harness was written for. Reveal-on-scroll
 * fails silently: the sections are simply never shown, the page looks empty,
 * and nothing in the source or in a screenshot of the top of the page says so.
 */

import { chromium } from "playwright";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AXE_SOURCE = require.resolve("axe-core/axe.min.js");
const axe = await import("node:fs").then((fs) => fs.readFileSync(AXE_SOURCE, "utf8"));

const REPO = join(import.meta.dirname, "..", "..");

/* With no argument, serve the sources directly out of `.github/pages/`.
 *
 * The real upload is composed by `pages.yml`, which also drops in two Next
 * static exports and four screenshots — a long build for a check that never
 * navigates to either export. A harness nobody can run without that is a
 * harness nobody runs, and this one exists because the site had no
 * renderer-level check at all. So the exhibit thumbnails fall back to the
 * demo screenshots they are copied from, and everything else is served as-is.
 *
 * Only the thumbnail names are duplicated from the workflow. If the two ever
 * disagree the image 404s, which this harness already reports as a console
 * error — the drift surfaces as a failure rather than hiding behind one. */
const SITE = process.argv[2] || join(import.meta.dirname, "..", "..", ".github", "pages");
const THUMBS = {
  "/thumb-showcase.png": "demo/showcase/screenshot.png",
  "/thumb-landing-page.png": "demo/landing-page/screenshot.png",
  "/thumb-dashboard.png": "demo/dashboard/screenshot.png",
  "/thumb-auth-form.png": "demo/auth-form/screenshot.png",
};

if (!existsSync(SITE)) {
  console.error("usage: node tools/screenshots/verify-pages.mjs [composed-site-dir]");
  process.exit(2);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

/* Served over http rather than opened as file://, because the page uses
   localStorage and the clipboard API, and file:// is a different origin story
   for both. This is the closest thing to how Pages will actually serve it. */
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let path = join(SITE, normalize(url).replace(/^(\.\.[/\\])+/, ""));
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
  if (!existsSync(path) && THUMBS[url]) path = join(REPO, THUMBS[url]);
  if (!existsSync(path)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((resolve) => server.listen(0, resolve));
const BASE = `http://127.0.0.1:${server.address().port}/`;

let failures = 0;
const ok = (label) => console.log(`  ✓ ${label}`);
const bad = (label, detail) => {
  failures++;
  console.log(`  ✗ ${label}`);
  if (detail) console.log(`      ${String(detail).slice(0, 600)}`);
};

const browser = await chromium.launch();

/* Walk the whole document, then wait for every reveal to stop moving.
 *
 * Two different wrong answers come from skipping this. Reveal-on-scroll leaves
 * sections at opacity 0 until they intersect, and axe skips a fully transparent
 * node — so an audit of a freshly loaded page covers the hero and almost
 * nothing else. A node caught MID-fade gives the opposite error: its text is
 * measured against a partly blended background and reported as a contrast
 * failure that does not exist a moment later. Playwright's own fullPage capture
 * has the same problem, and produced a screenshot with an entire section
 * missing from a page where nothing was wrong.
 *
 * `behavior: "instant"` matters: the stylesheet sets `scroll-behavior: smooth`,
 * so without it each scrollTo starts an animation the next one interrupts, the
 * walk never reaches the bottom, and sections get reported as unrevealed when
 * the harness simply never got to them.
 */
async function settle(page) {
  await page.evaluate(async () => {
    const root = document.documentElement;
    const step = Math.max(200, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y < root.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll(".reveal")].every((el) => {
          const o = Number(getComputedStyle(el).opacity);
          return o < 0.001 || o > 0.999;
        }),
      null,
      { timeout: 5000 },
    )
    .catch(() => {});
}

async function newPage(context) {
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  return { page, errors };
}

// ── Per-viewport: errors, overflow, axe ──────────────────────────────────────

for (const [w, h, label] of [
  [390, 844, "390 (phone)"],
  [768, 1024, "768 (tablet)"],
  [1920, 1080, "1920 (desktop)"],
]) {
  console.log(`\n── ${label} ─────────────────────────────────────────`);
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const { page, errors } = await newPage(context);
  await page.goto(BASE, { waitUntil: "networkidle" });

  errors.length ? bad("no console or page errors", errors.join(" | ")) : ok("no console or page errors");

  const overflow = await page.evaluate(() => {
    const d = document.documentElement;
    const wide = [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > d.clientWidth + 1)
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60));
    return { scroll: d.scrollWidth, client: d.clientWidth, wide };
  });
  overflow.scroll > overflow.client + 1
    ? bad(`no horizontal scroll (${overflow.scroll} > ${overflow.client})`, overflow.wide.join(", "))
    : ok("no horizontal scroll");

  /* Settle the page before asking axe anything.
   *
   * Reveal-on-scroll leaves most sections at opacity 0 until they intersect,
   * and axe skips a fully transparent node — so an axe pass on a freshly
   * loaded page audited the hero and almost nothing else. The same mechanism
   * produced the opposite error at 390, where one section sat exactly at the
   * fold: caught MID-fade, its button was measured against a partly blended
   * background and reported as a contrast failure that does not exist a
   * moment later. One report was a false negative over most of the page and
   * the other a false positive over one element, and both were artifacts of
   * when the sample was taken rather than of anything on the page.
   *
   * So: walk the whole document to trigger every observer, then wait for no
   * reveal to be part-way through a transition, and audit the settled page. */
  await settle(page);

  const stillHidden = await page.evaluate(
    () =>
      [...document.querySelectorAll(".reveal")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 0.999,
      ).length,
  );
  stillHidden
    ? bad("every revealed section became visible after scrolling", `${stillHidden} still hidden`)
    : ok("every revealed section became visible after scrolling");

  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return res.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.html?.slice(0, 90)}`);
  });
  violations.length
    ? bad("no serious/critical axe violations", violations.join(" | "))
    : ok("no serious/critical axe violations");

  await context.close();
}

// ── The interactive panels actually work ─────────────────────────────────────

console.log("\n── behaviour ────────────────────────────────────────");
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const { page, errors } = await newPage(context);
  await page.goto(BASE, { waitUntil: "networkidle" });

  const routeInput = page.locator("[data-route-input]");
  const routeOut = page.locator("[data-route-output]");

  await routeInput.fill("Build a landing page with pricing and testimonials");
  await page.waitForTimeout(120);
  const routed = (await routeOut.locator(".route-id").textContent().catch(() => null)) || "";
  routed.trim() === "landing-pages"
    ? ok("router resolves a landing-page request to landing-pages")
    : bad("router resolves a landing-page request", `got ${routed || "(no skill)"}`);

  const cost = await routeOut.locator(".route-cost").textContent().catch(() => "");
  /\d,\d{3}/.test(cost) ? ok(`router reports a token cost (${cost.trim().split("\n")[0]})`)
    : bad("router reports a token cost", cost);

  // The documented contract: no keyword match asks a question, never guesses.
  await routeInput.fill("rewrite the billing service in Go");
  await page.waitForTimeout(120);
  const asked = await routeOut.locator(".route-ask").count();
  const stillRouted = await routeOut.locator(".route-id").count();
  asked === 1 && stillRouted === 0
    ? ok("an unmatched request asks a question instead of guessing")
    : bad("an unmatched request asks instead of guessing", `ask=${asked} routed=${stillRouted}`);

  // Checker: the shipped bad snippet must fail, the good one must pass.
  const verdict = page.locator("[data-check-verdict]");
  await page.locator("[data-snippet='bad']").click();
  await page.waitForTimeout(250);
  const badState = await verdict.getAttribute("data-state");
  const badCount = Number((await verdict.locator(".verdict-count").textContent()) || 0);
  badState === "fail" && badCount > 0
    ? ok(`the "what agents write" snippet fails ${badCount} checks`)
    : bad("bad snippet fails", `state=${badState} count=${badCount}`);

  await page.locator("[data-snippet='good']").click();
  await page.waitForTimeout(250);
  const goodState = await verdict.getAttribute("data-state");
  goodState === "pass"
    ? ok("the corrected snippet passes every check running in the browser")
    : bad("good snippet passes", `state=${goodState}`);

  // Editing re-runs the checks — the panel claims it does.
  await page.locator("[data-check-input]").fill('<div className="min-h-screen" />');
  await page.waitForTimeout(400);
  const editedIds = await page.locator(".finding-id").allTextContents();
  editedIds.includes("RES-03")
    ? ok("editing the textarea re-runs the checks (RES-03 fires)")
    : bad("editing re-runs the checks", editedIds.join(","));

  // Catalogue feeds the router.
  await page.locator("details.skill").first().click();
  await page.locator("[data-route-with]").first().click();
  await page.waitForTimeout(200);
  const handed = await routeInput.inputValue();
  handed.length > 10
    ? ok("a skill row can hand its sentence to the router")
    : bad("skill row feeds the router", handed);

  // Tabs: selection, panel visibility, and keyboard.
  const tabs = page.locator("[data-tab]");
  await tabs.nth(1).click();
  const panelVisible = await page.locator("[data-panel='archive']").isVisible();
  const quickHidden = !(await page.locator("[data-panel='quick']").isVisible());
  panelVisible && quickHidden ? ok("install tabs switch panels") : bad("install tabs switch panels");

  await tabs.nth(1).press("ArrowRight");
  const afterArrow = await tabs.nth(2).getAttribute("aria-selected");
  afterArrow === "true" ? ok("install tabs respond to arrow keys") : bad("tabs arrow keys", afterArrow);

  const roving = await page.evaluate(() =>
    [...document.querySelectorAll("[data-tab]")].map((t) => t.tabIndex).join(","),
  );
  roving.split(",").filter((v) => v === "0").length === 1
    ? ok("exactly one tab is in the tab order")
    : bad("roving tabindex", roving);

  // Theme toggle cycles auto → light → dark.
  const toggle = page.locator("[data-theme-toggle]");
  await toggle.click();
  const t1 = await page.evaluate(() => document.documentElement.dataset.theme || "auto");
  await toggle.click();
  const t2 = await page.evaluate(() => document.documentElement.dataset.theme || "auto");
  await toggle.click();
  const t3 = await page.evaluate(() => document.documentElement.dataset.theme || "auto");
  `${t1}/${t2}/${t3}` === "light/dark/auto"
    ? ok("theme toggle cycles light → dark → auto")
    : bad("theme toggle cycles", `${t1}/${t2}/${t3}`);

  // The figures strip must agree with the generated payload, not just look busy.
  const figures = await page.evaluate(() =>
    [...document.querySelectorAll("[data-figure]")].map((n) => [
      n.getAttribute("data-figure"),
      n.textContent.trim(),
      String(window.FDP.figures[n.getAttribute("data-figure")]),
    ]),
  );
  const wrong = figures.filter(([, shown, truth]) => shown.replace(/,/g, "") !== truth);
  wrong.length === 0
    ? ok(`all ${figures.length} figures match the generated data`)
    : bad("figures match generated data", JSON.stringify(wrong));

  errors.length ? bad("no errors during interaction", errors.join(" | ")) : ok("no errors during interaction");

  await settle(page);
  await page.screenshot({ path: join(REPO, "site-check-home.png"), fullPage: false });
  await context.close();
}

// ── Reduced motion: the failure that is invisible in source ──────────────────

console.log("\n── prefers-reduced-motion: reduce ───────────────────");
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const { page, errors } = await newPage(context);
  await page.goto(BASE, { waitUntil: "networkidle" });

  const hidden = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll(".reveal")];
    return {
      total: nodes.length,
      invisible: nodes.filter((n) => Number(getComputedStyle(n).opacity) < 0.99).length,
      flagged: nodes.filter((n) => n.classList.contains("is-hidden")).length,
    };
  });
  hidden.invisible === 0 && hidden.flagged === 0
    ? ok(`all ${hidden.total} revealed sections are visible immediately`)
    : bad("revealed sections visible under reduced motion", JSON.stringify(hidden));

  errors.length ? bad("no errors under reduced motion", errors.join(" | ")) : ok("no errors");
  await context.close();
}

// ── Dark and light both render ───────────────────────────────────────────────

for (const scheme of ["dark", "light"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const { page } = await newPage(context);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await settle(page);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`\n  ${scheme}: body background ${bg}`);
  await page.screenshot({ path: join(REPO, `site-check-home-${scheme}.png`), fullPage: false });
  await page.screenshot({ path: join(REPO, `site-check-full-${scheme}.png`), fullPage: true });
  await context.close();
}

await browser.close();
server.close();

console.log(`\n${failures ? `${failures} FAILURE(S)` : "PASS — every check green"}`);
process.exit(failures ? 1 : 0);
