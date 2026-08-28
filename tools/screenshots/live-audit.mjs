/**
 * live-audit.mjs — the deterministic half of `web-interface`'s Layer B.
 *
 * `skills/web-interface/references/live-verification.md` describes an
 * MCP-driven, interactive rendered-DOM audit. This script is its headless
 * regression counterpart: it implements the measurement primitives that
 * workflow relies on (viewport sweep, real horizontal overflow, computed text
 * contrast, console + network failures, dead scroll-reveals, heading font
 * resolution, and one focus-restoration interaction) against the vendored
 * Playwright Chromium already in this package, and emits findings in the same
 * schema.
 *
 * It is NOT shipped in the .skill archive and NOT in CI — same status as the
 * rest of `tools/screenshots/`.
 *
 *   node live-audit.mjs fixtures            # run the golden fixtures, assert expectations
 *   node live-audit.mjs fixreverify        # e-contrast fixture: FOUND -> FIXED -> VERIFIED transcript
 *   node live-audit.mjs url <URL> [--json]  # audit a live URL, print the findings report
 *   node live-audit.mjs url <URL> --out report.json
 *
 * Fixtures live in ../../skills/web-interface/examples/live-audit/; override the
 * directory with LV_FIXTURE_DIR (used when running from another checkout).
 */
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const { PNG } = require("pngjs");

const srgbLum = ({ r, g, b }) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const wcag = (fg, bg) => {
  const L1 = srgbLum(fg), L2 = srgbLum(bg);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};

/* Resolve a text node's real background from rendered pixels: crop its box from
   the full-page screenshot, drop pixels close to the text colour, average the
   rest. This is what makes text-over-gradient / image contrast checkable — the
   solid-colour DOM walk cannot. Returns null if the box is off-screen or the
   sample is dominated by the text itself. */
function sampledBg(png, rect, fg) {
  const x0 = Math.max(0, Math.round(rect.x));
  const y0 = Math.max(0, Math.round(rect.y));
  const x1 = Math.min(png.width, Math.round(rect.x + rect.w));
  const y1 = Math.min(png.height, Math.round(rect.y + rect.h));
  if (x1 - x0 < 3 || y1 - y0 < 3) return null;
  let rs = 0, gs = 0, bs = 0, n = 0, total = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (png.width * y + x) << 2;
      const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
      total++;
      const dist = Math.abs(r - fg[0]) + Math.abs(g - fg[1]) + Math.abs(b - fg[2]);
      if (dist < 90) continue; // near the glyph colour — skip
      rs += r; gs += g; bs += b; n++;
    }
  }
  if (n < total * 0.15) return null; // box is almost all text — unreliable
  return { r: rs / n, g: gs / n, b: bs / n };
}
const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR =
  process.env.LV_FIXTURE_DIR ||
  resolve(HERE, "..", "..", "skills", "web-interface", "examples", "live-audit");

const VIEWPORTS = [
  { label: "390x844", width: 390, height: 844 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "1920x1080", width: 1920, height: 1080 },
];

const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /React Router Future Flag/i,
  /\[Fast Refresh\]/i,
  /favicon\.ico/i,
];
const HYDRATION = /hydrat|did not match|server rendered|server HTML/i;
const DISPLAY_FONT_BAN = /^\s*["']?(Inter|Roboto|Poppins|DM Sans|Space Grotesk|Montserrat)["']?/i;

// ── finding builder ─────────────────────────────────────────────────────────

let seq = 0;
function finding(f) {
  seq += 1;
  return {
    id: `LV-${String(seq).padStart(3, "0")}`,
    class: f.class ?? "engineering",
    category: f.category,
    severity: f.severity,
    location: { rendered: f.rendered ?? null, source: f.source ?? null },
    observation: f.observation,
    why_it_matters: f.why ?? null,
    evidence: f.evidence,
    recommended_fix: f.fix ?? null,
    validation_state: f.state ?? "FOUND",
    related_constraint: f.related ?? null,
  };
}

// ── in-page measurement (serialised into page.evaluate) ─────────────────────

/* Returns { color, ratio, size, weight, snippet, selector } for every visible
   text-bearing leaf whose computed contrast against its effective (alpha-
   composited) background is below the WCAG AA threshold for its size. */
const CONTRAST_PROBE = `() => {
  // Resolve ANY CSS colour the browser understands — rgb/rgba, hsl, hex,
  // named, and crucially oklch()/color(), which is what getComputedStyle
  // returns on a Tailwind v4 page — down to sRGB + alpha, via a 1px canvas.
  const _cv = document.createElement("canvas");
  _cv.width = _cv.height = 1;
  const _cx = _cv.getContext("2d", { willReadFrequently: true });
  const parse = (s) => {
    if (!s) return null;
    _cx.clearRect(0, 0, 1, 1);
    _cx.fillStyle = "#000";
    _cx.fillStyle = s;
    _cx.fillRect(0, 0, 1, 1);
    const d = _cx.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  };
  const over = (top, bot) => {
    const a = top.a + bot.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (top.r * top.a + bot.r * bot.a * (1 - top.a)) / a,
      g: (top.g * top.a + bot.g * bot.a * (1 - top.a)) / a,
      b: (top.b * top.a + bot.b * bot.a * (1 - top.a)) / a,
      a,
    };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (fg, bg) => {
    const L1 = lum(fg), L2 = lum(bg);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };
  // Effective background from the ancestor chain. Also reports whether the
  // chain contains a gradient / image / translucent layer — in which case a
  // solid-colour walk cannot be trusted and the finding needs the
  // screenshot-pixel step (see live-verification.md §4/§8).
  const bgOf = (el) => {
    const layers = [];
    let uncertain = false;
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none") uncertain = true;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        if (c.a < 0.95) uncertain = true;
        layers.push(c);
        if (c.a >= 0.999) break;
      }
      n = n.parentElement;
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return { ...base, uncertain };
  };
  const sel = (el) => {
    if (el.id) return el.tagName.toLowerCase() + "#" + el.id;
    const cls = Array.from(el.classList).slice(0, 2).join(".");
    return el.tagName.toLowerCase() + (cls ? "." + cls : "");
  };
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TITLE", "svg", "SVG"]);
  const hasOwnText = (el) =>
    Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);

  const inAriaHidden = (el) => !!el.closest('[aria-hidden="true"]');

  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (SKIP.has(el.tagName) || el.closest("svg")) continue;
    if (!hasOwnText(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    let fg = parse(cs.color);
    if (!fg) continue;
    const bg = bgOf(el);
    if (fg.a < 1) fg = over(fg, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const floor = large ? 3.0 : 4.5;
    const r = ratio(fg, bg);
    if (r < floor - 0.05) {
      const rc = el.getBoundingClientRect();
      out.push({
        selector: sel(el),
        ratio: Math.round(r * 100) / 100,
        floor,
        size,
        weight,
        uncertain: bg.uncertain,
        ariaHidden: inAriaHidden(el),
        fg: [Math.round(fg.r), Math.round(fg.g), Math.round(fg.b)],
        rect: { x: rc.x + scrollX, y: rc.y + scrollY, w: rc.width, h: rc.height },
        snippet: (el.textContent || "").trim().slice(0, 60),
      });
    }
  }
  // de-dup by selector+ratio, keep the worst offenders first
  const seen = new Set();
  return out
    .sort((a, b) => a.ratio - b.ratio)
    .filter((x) => { const k = x.selector + x.ratio; if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 25);
}`;

const HEADING_FONT_PROBE = `() => {
  const out = [];
  for (const h of document.querySelectorAll("h1, h2, h3")) {
    const ff = getComputedStyle(h).fontFamily;
    out.push({ tag: h.tagName.toLowerCase(), fontFamily: ff, text: (h.textContent || "").trim().slice(0, 40) });
  }
  return out;
}`;

const OVERFLOW_PROBE = `() => {
  const de = document.documentElement;
  return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, over: de.scrollWidth - de.clientWidth };
}`;

const DEAD_REVEAL_PROBE = `() => {
  const stuck = [];
  for (const el of document.querySelectorAll("main *, body > *")) {
    const cs = getComputedStyle(el);
    const invisible = parseFloat(cs.opacity) === 0 || cs.visibility === "hidden";
    if (invisible && el.children.length === 0 && (el.textContent || "").trim()) {
      stuck.push(el.tagName.toLowerCase() + "." + Array.from(el.classList).slice(0, 2).join("."));
    }
  }
  return stuck.slice(0, 15);
}`;

// probes above are source strings for `() => {…}`; run them as IIFEs so
// page.evaluate calls the function rather than returning it unserialised.
const evalProbe = (page, src) => page.evaluate(`(${src})()`);

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

// ── the audit ──────────────────────────────────────────────────────────────

async function auditPage(browser, url, opts = {}) {
  const findings = [];
  const ctx = await browser.newContext({ viewport: VIEWPORTS[2] });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const hydration = [];
  const netFail = [];

  page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 200)));
  page.on("console", (m) => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    const t = m.text();
    if (IGNORED_CONSOLE.some((re) => re.test(t))) return;
    if (HYDRATION.test(t)) hydration.push(t.slice(0, 200));
    else if (m.type() === "error") consoleErrors.push(t.slice(0, 200));
  });
  page.on("requestfailed", (req) => {
    const f = req.failure();
    netFail.push({ url: req.url(), reason: f ? f.errorText : "failed", status: null });
  });
  page.on("response", (res) => {
    if (res.status() >= 400) netFail.push({ url: res.url(), reason: null, status: res.status() });
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("main, h1, body", { state: "attached", timeout: 30_000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page.waitForTimeout(400);

  // 1 — overflow sweep
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);
    const o = await evalProbe(page, OVERFLOW_PROBE);
    if (o.over > 1) {
      findings.push(finding({
        category: "responsive-overflow",
        severity: vp.width <= 768 ? "HIGH" : "MEDIUM",
        rendered: { url, viewport: vp.label, selector: "documentElement" },
        observation: `document scrolls ${o.over}px sideways at ${vp.label}`,
        why: "horizontal scroll clips content and is a mobile-usability failure",
        evidence: { kind: "measurement", value: `scrollWidth ${o.scrollWidth} vs clientWidth ${o.clientWidth}`, artifact: null },
        fix: "find the element wider than the viewport; add min-width:0 to the flex/grid child or a wrap/overflow rule to the content",
        related: "RES-01",
      }));
    }
  }
  await page.setViewportSize({ width: VIEWPORTS[2].width, height: VIEWPORTS[2].height });
  await page.waitForTimeout(200);

  // 2 — settle reveals, then contrast + dead-reveal + heading fonts
  await settle(page);
  await page.waitForTimeout(300);

  const lowContrast = await evalProbe(page, CONTRAST_PROBE);
  // For candidates whose background the DOM walk could not resolve (gradient /
  // image / translucent), re-check against the actual rendered pixels.
  const uncertain = lowContrast.filter((c) => c.uncertain);
  let png = null;
  if (uncertain.length) {
    try {
      png = PNG.sync.read(await page.screenshot({ fullPage: true, timeout: 15_000 }));
    } catch { /* screenshot failed — uncertain items stay NEEDS_REVIEW */ }
  }
  for (const c of lowContrast) {
    let ratio = c.ratio;
    let state = "FOUND";
    let note = "";
    if (c.uncertain) {
      const bg = png && sampledBg(png, c.rect, c.fg);
      if (bg) {
        ratio = Math.round(wcag({ r: c.fg[0], g: c.fg[1], b: c.fg[2] }, bg) * 100) / 100;
        if (ratio >= c.floor - 0.05) continue; // rendered pixels clear the floor — drop it
        note = " (verified against rendered pixels)";
      } else {
        state = "NEEDS_REVIEW";
        note = " (background is a gradient/image — pixel sample inconclusive)";
      }
    }
    // aria-hidden text is still seen by sighted users, so it is a real
    // measurement — but a decorative/illustrative element (an anti-example
    // mock, a background flourish) is a triage call, not an automatic failure.
    if (c.ariaHidden) {
      state = "NEEDS_REVIEW";
      note += " · inside an aria-hidden subtree — if decorative/illustrative, waive it";
    }
    findings.push(finding({
      class: c.ariaHidden ? "critique" : "engineering",
      category: "contrast",
      severity: c.ariaHidden ? "LOW" : ratio < c.floor - 1 ? "HIGH" : "MEDIUM",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: c.selector },
      observation: `text contrast ${ratio}:1 — below WCAG AA (${c.floor}:1 for ${c.size}px${c.weight >= 700 ? " bold" : ""}) near "${c.snippet}"`,
      why: "text under the AA floor is hard to read for low-vision users; source contrast checks cannot resolve the computed cascade",
      evidence: { kind: "measurement", value: `${ratio}:1 on "${c.snippet}"${note}`, artifact: null },
      fix: "raise the text lightness or darken the background until the computed ratio clears the floor",
      state,
      related: null,
    }));
  }

  const stuck = await evalProbe(page, DEAD_REVEAL_PROBE);
  if (stuck.length) {
    findings.push(finding({
      category: "reveal-dead",
      severity: "HIGH",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: stuck[0] },
      observation: `${stuck.length} text node(s) still at opacity:0 / visibility:hidden after a full scroll pass`,
      why: "a scroll-reveal whose observer never fired leaves real content invisible with a green source chain",
      evidence: { kind: "measurement", value: stuck.join(", "), artifact: null },
      fix: "ensure the reveal has a no-JS / reduced-motion fallback that leaves content visible",
      related: "MOTION-01",
    }));
  }

  const headings = await evalProbe(page, HEADING_FONT_PROBE);
  for (const h of headings) {
    if (DISPLAY_FONT_BAN.test(h.fontFamily)) {
      findings.push(finding({
        category: "font-load",
        severity: "MEDIUM",
        rendered: { url, viewport: VIEWPORTS[2].label, selector: h.tag },
        observation: `${h.tag} computed font-family resolves to a banned display face: ${h.fontFamily}`,
        why: "the anti-slop wall bans Inter/Roboto/Poppins as the display face; a declared face that 404s falls back to one silently",
        evidence: { kind: "measurement", value: `${h.tag} "${h.text}" → ${h.fontFamily}`, artifact: null },
        fix: "confirm the intended display face loads (check the network log for the font file) or change the stack",
        related: "TYP-02",
      }));
    }
  }

  // 3 — console / page errors
  for (const e of pageErrors) {
    findings.push(finding({
      category: "console-error",
      severity: "BLOCKER",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: null },
      observation: `uncaught exception: ${e}`,
      why: "an uncaught error at module/render scope stops everything after it",
      evidence: { kind: "console", value: e, artifact: null },
      fix: "trace the stack; guard or fix the throwing call",
      related: null,
    }));
  }
  for (const e of consoleErrors) {
    findings.push(finding({
      category: "console-error",
      severity: "HIGH",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: null },
      observation: `console error: ${e}`,
      why: "console errors on load signal a broken code path",
      evidence: { kind: "console", value: e, artifact: null },
      fix: "resolve the logged error",
      related: null,
    }));
  }
  for (const h of hydration) {
    findings.push(finding({
      category: "hydration",
      severity: "HIGH",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: null },
      observation: `hydration mismatch: ${h}`,
      why: "server/client markup divergence causes a flash and can break interactivity",
      evidence: { kind: "console", value: h, artifact: null },
      fix: "make the server and first client render deterministic (no Date.now/random/window in render)",
      related: null,
    }));
  }

  // 4 — network failures (dedup by url)
  const seenNet = new Set();
  for (const n of netFail) {
    if (seenNet.has(n.url)) continue;
    seenNet.add(n.url);
    if (/favicon\.ico|analytics|gtag|beacon/i.test(n.url)) continue;
    findings.push(finding({
      category: "network-error",
      severity: n.status && n.status >= 500 ? "HIGH" : "MEDIUM",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: null },
      observation: `request failed: ${n.url}${n.status ? ` (${n.status})` : ` (${n.reason})`}`,
      why: "a failed asset request means something the page needs did not arrive",
      evidence: { kind: "network", value: n.status ? `HTTP ${n.status}` : n.reason, artifact: null },
      fix: "ship the asset, fix the path, or drop the reference",
      related: null,
    }));
  }

  // 5 — axe (serious/critical only)
  await page.addScriptTag({ content: AXE_SOURCE }).catch(() => {});
  const axe = await page.evaluate(async () => {
    if (!window.axe) return [];
    const res = await window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    return res.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help }));
  }).catch(() => []);
  for (const v of axe) {
    findings.push(finding({
      category: "a11y-axe",
      severity: v.impact === "critical" ? "HIGH" : "MEDIUM",
      rendered: { url, viewport: VIEWPORTS[2].label, selector: null },
      observation: `axe ${v.id} (${v.impact}, ${v.n}x): ${v.help}`,
      why: "axe serious/critical failures are concrete WCAG violations",
      evidence: { kind: "measurement", value: `${v.id} · ${v.n} node(s)`, artifact: null },
      fix: `resolve the ${v.id} violation`,
      related: null,
    }));
  }

  // 6 — one interaction: modal / dialog focus restoration
  if (opts.focusProbe) {
    const fr = await checkFocusReturn(page, opts.focusProbe);
    if (fr) findings.push(finding(fr));
  }

  await ctx.close();
  return findings;
}

/* Open a trigger, close the resulting overlay, read document.activeElement.
   `probe` is { open, close } selectors (fixtures) or "auto" (best-effort). */
async function checkFocusReturn(page, probe) {
  let openSel = probe.open;
  let closeSel = probe.close;
  if (probe === "auto") {
    const trigger = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button, [role=button]"));
      const el = btns.find((b) => /delete|open|show|menu|settings|edit/i.test(b.textContent || ""));
      if (!el) return null;
      el.setAttribute("data-lv-trigger", "");
      return true;
    });
    if (!trigger) return null;
    openSel = "[data-lv-trigger]";
  }
  const trig = page.locator(openSel).first();
  if (!(await trig.count())) return null;
  await trig.focus().catch(() => {});
  await trig.click().catch(() => {});
  await page.waitForTimeout(300);
  const opened = await page.evaluate(
    () => !!document.querySelector("[role=dialog]:not([hidden]), [aria-modal=true], dialog[open]"),
  );
  if (!opened) return null;
  if (probe === "auto") {
    closeSel = await page.evaluate(() => {
      const dlg = document.querySelector("[role=dialog], [aria-modal=true], dialog[open]");
      const c = dlg && Array.from(dlg.querySelectorAll("button")).find((b) => /cancel|close|dismiss|done/i.test(b.textContent || ""));
      if (!c) return null;
      c.setAttribute("data-lv-close", "");
      return "[data-lv-close]";
    });
    if (!closeSel) return null;
  }
  await page.locator(closeSel).first().click().catch(() => {});
  await page.waitForTimeout(300);
  const active = await page.evaluate(() => {
    const a = document.activeElement;
    return a ? (a.id ? "#" + a.id : a.tagName) : "null";
  });
  const triggerId = await trig.evaluate((el) => (el.id ? "#" + el.id : el.tagName)).catch(() => null);
  if (active === "BODY" || active === "HTML" || (triggerId && active !== triggerId && active === "BODY")) {
    return {
      category: "focus-order",
      severity: "HIGH",
      rendered: { url: page.url(), viewport: VIEWPORTS[2].label, selector: closeSel },
      observation: `overlay does not restore focus on close — document.activeElement is ${active}`,
      why: "a keyboard user is dropped at the top of the document with no context",
      evidence: { kind: "measurement", value: `activeElement ${active}, expected ${triggerId || "the trigger"}`, artifact: null },
      fix: "on close, return focus to the element that opened the overlay",
      state: "FOUND",
      related: null,
    };
  }
  return null;
}

// ── fixtures mode ──────────────────────────────────────────────────────────

const EXPECT = {
  "a-overflow.html": (f) => {
    const o = f.filter((x) => x.category === "responsive-overflow");
    return [
      [o.length >= 1, "responsive-overflow finding present"],
      [o.some((x) => x.location.rendered.viewport === "390x844"), "flagged at 390x844"],
      [!o.some((x) => x.location.rendered.viewport === "1920x1080"), "not flagged at 1920x1080"],
      [o[0] && o[0].severity === "HIGH", "severity HIGH"],
    ];
  },
  "b-hierarchy.html": (f) => [
    // the type-ramp collapse is critique — this harness does not emit critique,
    // so the assertion is that it produces NO engineering failure
    [f.filter((x) => x.class === "engineering").length === 0, "no engineering finding (hierarchy is critique-only)"],
  ],
  "c-modal.html": (f) => {
    const fo = f.filter((x) => x.category === "focus-order");
    return [
      [fo.length === 1, "one focus-order finding"],
      [fo[0] && fo[0].severity === "HIGH", "severity HIGH"],
      [fo[0] && /activeElement (BODY|HTML)/.test(fo[0].evidence.value), "activeElement fell to body"],
    ];
  },
  "d-console.html": (f) => {
    const ce = f.filter((x) => x.category === "console-error");
    const ne = f.filter((x) => x.category === "network-error");
    return [
      [ce.length >= 1, "console-error finding present"],
      [ce.some((x) => /analytics/.test(x.evidence.value)), "names the undefined global"],
      [ce.some((x) => x.severity === "BLOCKER"), "console error is BLOCKER"],
      [ne.length >= 1, "network-error finding present"],
      [ne.some((x) => /hero-illustration/.test(x.observation)), "names the 404 asset"],
    ];
  },
  "e-contrast.html": (f) => {
    const c = f.filter((x) => x.category === "contrast");
    return [
      [c.length >= 1, "contrast finding present"],
      [c.some((x) => x.severity === "HIGH"), "severity HIGH"],
      [c.some((x) => /[0-3]\.\d+:1/.test(x.observation)), "measured ratio below 4.5"],
    ];
  },
  "e-contrast.fixed.html": (f) => [
    [f.filter((x) => x.category === "contrast").length === 0, "no contrast finding after the fix"],
  ],
};

const FOCUS_PROBES = { "c-modal.html": { open: "#open", close: "#close" } };

async function runFixtures(browser) {
  let pass = 0;
  let fail = 0;
  for (const name of Object.keys(EXPECT)) {
    seq = 0;
    const url = pathToFileURL(join(FIXTURE_DIR, name)).href;
    const findings = await auditPage(browser, url, { focusProbe: FOCUS_PROBES[name] });
    const checks = EXPECT[name](findings);
    const bad = checks.filter(([ok]) => !ok);
    if (bad.length === 0) {
      pass += checks.length;
      console.log(`  ok   ${name}  (${checks.length} assertions)`);
    } else {
      fail += bad.length;
      console.log(`  FAIL ${name}`);
      for (const [, label] of bad) console.log(`         ✗ ${label}`);
      console.log(`         findings: ${JSON.stringify(findings.map((x) => [x.category, x.severity, x.observation.slice(0, 60)]))}`);
    }
  }
  console.log(`\n[live-audit fixtures] ${pass} passed · ${fail} failed`);
  return fail === 0;
}

// ── url mode ───────────────────────────────────────────────────────────────

function printReport(url, findings) {
  const eng = findings.filter((f) => f.class === "engineering");
  const crit = findings.filter((f) => f.class === "critique");
  console.log(`\n=== live audit: ${url} ===\n`);
  if (!eng.length) console.log("  (no engineering findings)\n");
  for (const f of eng) {
    console.log(`  ✗ [${f.id}] ${f.observation}   (${f.severity} · ${f.category})`);
    const loc = f.location.rendered;
    if (loc) console.log(`      → ${loc.viewport}${loc.selector ? " · " + loc.selector : ""} — ${f.evidence.value}`);
    if (f.recommended_fix) console.log(`      → fix: ${f.recommended_fix}   [${f.validation_state}]`);
  }
  if (crit.length) {
    console.log(`\n  — design critique (never a failure) —`);
    for (const f of crit) console.log(`  ~ [${f.id}] ${f.observation}   (${f.severity} · ${f.category})`);
  }
  const blockers = eng.filter((f) => f.severity === "BLOCKER").length;
  const high = eng.filter((f) => f.severity === "HIGH").length;
  console.log(`\n[live-audit] ${eng.length} engineering (${blockers} BLOCKER, ${high} HIGH) · ${crit.length} critique`);
}

// ── fix-and-reverify transcript ────────────────────────────────────────────

/* Take the e-contrast fixture from FOUND (below AA) through the one-line fix in
   e-contrast.fixed.html to VERIFIED (clears AA), printing the transcript the
   workflow's step 10 produces. */
async function runFixReverify(browser) {
  const found = await auditPage(browser, pathToFileURL(join(FIXTURE_DIR, "e-contrast.html")).href, {});
  const c = found.find((f) => f.category === "contrast");
  const verified = await auditPage(browser, pathToFileURL(join(FIXTURE_DIR, "e-contrast.fixed.html")).href, {});
  const stillBad = verified.find((f) => f.category === "contrast");
  console.log("\n=== fix-and-reverify: e-contrast ===\n");
  console.log(`  FOUND    ${c ? c.observation : "(no finding — unexpected)"}`);
  console.log(`           ${c ? c.evidence.value : ""}`);
  console.log(`  FIXED    e-contrast.fixed.html — p { color: #68686b -> #8f8f92 } (same hue, lifted lightness)`);
  console.log(`  VERIFIED ${stillBad ? "STILL FAILING: " + stillBad.observation : "re-audit of the same selector reports no contrast finding — clears WCAG AA"}`);
  const ok = Boolean(c) && !stillBad;
  console.log(`\n[fix-reverify] ${ok ? "PASS — FOUND -> VERIFIED" : "FAIL"}`);
  return ok;
}

// ── entry ──────────────────────────────────────────────────────────────────

const [mode, ...rest] = process.argv.slice(2);
const browser = await chromium.launch();
try {
  if (mode === "fixtures") {
    const ok = await runFixtures(browser);
    process.exit(ok ? 0 : 1);
  } else if (mode === "fixreverify") {
    const ok = await runFixReverify(browser);
    process.exit(ok ? 0 : 1);
  } else if (mode === "url") {
    const url = rest.find((a) => !a.startsWith("--"));
    if (!url) { console.error("usage: node live-audit.mjs url <URL> [--json] [--out file]"); process.exit(2); }
    seq = 0;
    const findings = await auditPage(browser, url, { focusProbe: "auto" });
    const outIdx = rest.indexOf("--out");
    if (outIdx !== -1 && rest[outIdx + 1]) {
      writeFileSync(rest[outIdx + 1], JSON.stringify({ url, findings }, null, 2));
      console.log(`wrote ${rest[outIdx + 1]}`);
    }
    if (rest.includes("--json")) console.log(JSON.stringify({ url, findings }, null, 2));
    else printReport(url, findings);
    process.exit(0);
  } else {
    console.error("usage: node live-audit.mjs <fixtures | fixreverify | url <URL>>");
    process.exit(2);
  }
} finally {
  await browser.close();
}
