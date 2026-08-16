/**
 * Generates `.github/assets/router.svg` — the routing diagram in README.md.
 *
 * Run:  node tools/readme-router/generate.mjs
 *
 * ── What it shows, and why this and not something prettier ───────────────────
 *
 * The single least-believed claim this project makes is the architecture one:
 * that a pack holding hundreds of thousands of tokens of material costs a few
 * thousand per request, because it is a registry that routes rather than a
 * document that loads. README states it in a table. A table is the wrong shape
 * for it — the whole point is a ratio, and a ratio wants a picture.
 *
 * So: a request arrives, its keywords match, the scan runs the registry, ONE of
 * nineteen skills locks, its declared core files attach, and the cost meter
 * fills — against a depth bar drawn at true scale, where the loaded sliver is
 * about a fifty-sixth of the whole. Nothing here is a metaphor for the product.
 * It is the product's control flow.
 *
 * ── The figures are read, not typed ──────────────────────────────────────────
 *
 * Every number on this banner comes from `scripts/check_figures.py --truth`,
 * which computes them from the filesystem. Hardcoding them here would put the
 * pack's headline figures on its most prominent surface with a hand-maintained
 * copy behind them, which is the exact defect Gate 11 exists to prevent and has
 * caught three times.
 *
 * Python is required rather than optional, and the generator fails loudly
 * without it. A fallback to committed constants would be a silent path to a
 * stale banner, and "the numbers were right when someone last had python
 * installed" is not a claim this project gets to make.
 *
 * ── Gate 11 cannot protect this file, so `--check` does ──────────────────────
 *
 *   node tools/readme-router/generate.mjs            # write the banner
 *   node tools/readme-router/generate.mjs --check    # fail if it is stale
 *
 * The obvious guard was to add `.github/assets/*.svg` to Gate 11's SCAN. It was
 * tried, and it does not work. The figure patterns match inside SVG exactly as
 * they do in prose — and the gate still passed a banner whose skill count had
 * been deliberately decremented, because every match is dropped by the forbid
 * look-back window, which in SVG is always full of attribute soup rather than
 * sentence. Widening those windows to accommodate markup would weaken them
 * everywhere they currently work. `scripts/check_figures.py` records the finding
 * where the entry would have gone.
 *
 * (Writing that sentence with the wrong count spelled out failed Gate 11 from
 * this very docstring, because every generator under `tools/` is a scanned
 * surface. Which is the gate working, and the fourth time this repo has tripped
 * over a comment that explained a defect by reproducing it. The glob itself
 * cannot be written here either — it ends in the two characters that close a
 * block comment.)
 *
 * `--check` is what replaced it, and it is strictly stronger than the regex
 * would have been: it re-runs the whole generator against the current truth
 * table and byte-compares the result with the committed file. Not "does a
 * pattern find a wrong number" but "is this artifact exactly what the source of
 * truth produces right now". A figure moving anywhere in the pack fails it.
 *
 * ── What a GitHub README can actually render ─────────────────────────────────
 *
 * Same envelope as the hero banner, for the same reason — camo proxies README
 * images and serves them as image documents. No script, no external stylesheet,
 * no webfont, no second request of any kind. A self-contained SVG with inline
 * CSS @keyframes is what survives, so that is what this emits, on system font
 * stacks.
 *
 * ── Everything degrades to the completed route ───────────────────────────────
 *
 * Every animated element's RESTING attribute value is its resolved state: the
 * keywords highlighted, one skill lit, the deps attached, the meter full. CSS
 * only animates away from that and back. A renderer that drops the stylesheet
 * therefore shows a finished route — correct, readable, and still making the
 * argument — rather than an empty frame. `prefers-reduced-motion` resolves to
 * the same place; the scan is the only thing lost, and the scan is decoration.
 *
 * ── Why a generator ──────────────────────────────────────────────────────────
 *
 * Nineteen rows, each needing its own @keyframes. An infinitely-repeating CSS
 * animation applies `animation-delay` to the FIRST iteration only, so a stagger
 * built from delays desynchronises from the scan on every loop after the first —
 * the same trap the hero banner documents. Each row's flash is instead written
 * at its own percentage, computed from where the scan actually is when it
 * arrives. That is arithmetic, not authoring.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..");
const OUT = join(REPO, ".github", "assets", "router.svg");

// ── Truth ────────────────────────────────────────────────────────────────────

/**
 * `--truth` prints the JSON object first and a per-skill budget table after it,
 * so the object is everything up to the closing brace sitting alone at column
 * zero. Parsing to that point rather than JSON.parse-ing the whole stream is
 * what lets the human-readable half of that flag stay human-readable.
 */
function truth() {
  let raw;
  try {
    raw = execFileSync("python", [join("scripts", "check_figures.py"), "--truth"], {
      cwd: REPO,
      encoding: "utf8",
    });
  } catch (err) {
    throw new Error(
      "could not run `python scripts/check_figures.py --truth`, which is where every " +
        "number on this banner comes from. Install python or run this from the repo root. " +
        `Underlying error: ${err.message}`,
    );
  }

  const start = raw.indexOf("{");
  const end = raw.indexOf("\n}");
  if (start === -1 || end === -1) {
    throw new Error("`--truth` did not print a JSON object; its output format changed.");
  }
  return JSON.parse(raw.slice(start, end + 2));
}

const T = truth();

/** Thousands separators, matching how every document in this repo writes figures. */
const n = (v) => v.toLocaleString("en-US");

// ── The route being drawn ────────────────────────────────────────────────────

const SKILLS = [
  "agent-ops",
  "ai-ui-generation",
  "animations",
  "canvas-typography",
  "color-themes",
  "component-patterns",
  "data-tables",
  "design-principles",
  "design-research",
  "design-system",
  "forms",
  "iconography",
  "landing-pages",
  "platform",
  "react-components",
  "react-performance",
  "testing",
  "threejs-3d",
  "web-interface",
];

if (SKILLS.length !== T.skills) {
  throw new Error(
    `this file lists ${SKILLS.length} skills and the filesystem has ${T.skills}. ` +
      "Update the list — a registry diagram that draws the wrong number of rows is worse " +
      "than no diagram.",
  );
}

/** The one that wins. Its declared core-deps are in skills/landing-pages/SKILL.md. */
const CHOSEN = "landing-pages";
const CHOSEN_INDEX = SKILLS.indexOf(CHOSEN);

/**
 * What actually loads: the two every skill inherits when it produces code, plus
 * the one `landing-pages` declares. Named, never counted — the count that
 * matters is the token figure, and that comes from the truth table.
 */
const DEPS = ["core/design-tokens.md", "core/accessibility-baseline.md", "core/validate-checklist.md"];

const REQUEST = "build a pricing page with a comparison table";
/** The substrings the registry matches on. Indexes into REQUEST, found not guessed. */
const KEYWORDS = ["pricing", "comparison table"];

// ── Geometry ─────────────────────────────────────────────────────────────────

const W = 1200;
const H = 470;

const ROW_PITCH = 17;
const ROW_H = 14;
const REG_X = 404;
const REG_W = 300;
const REG_TOP = 116;
const REG_RUN = (SKILLS.length - 1) * ROW_PITCH + ROW_H;

const METER_X = 774;
const METER_W = 386;
const METER_Y = 308;
const METER_H = 22;

/** Dep chips: three of them, and the last one has to clear the cost label. */
const DEP_TOP = 190;
const DEP_PITCH = 26;

/** True scale, and the point of the picture. */
const LOADED_FRAC = T.band_high / T.reference_depth_tokens;
const LOADED_W = Math.max(METER_W * LOADED_FRAC, 3);

// ── Timeline, in percentages of one loop ─────────────────────────────────────

const DUR = 9;
const KW_IN = 9;
const SCAN_FROM = 16;
const SCAN_TO = 34;
const LOCK_AT = 38;
const DEP_FROM = 46;
const METER_FROM = 58;
const METER_TO = 72;

const round = (v) => Math.round(v * 100) / 100;

// ── Palette, shared with the hero banner so the two read as one family ───────

const C = {
  ground: "#070A12",
  panel: "#111A2B",
  panelLit: "#16294D",
  edge: "#26334D",
  edgeLit: "#3D5580",
  ink: "#F2F6FF",
  inkDim: "#93A4C4",
  inkFaint: "#61728F",
  accent: "#5AA9FF",
  green: "#3DDC97",
};

// ── Emit ─────────────────────────────────────────────────────────────────────

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

const keyframes = [];
const rows = [];

SKILLS.forEach((id, i) => {
  const y = REG_TOP + i * ROW_PITCH;
  const chosen = i === CHOSEN_INDEX;

  // Where the scan is when it reaches this row.
  const at = SCAN_FROM + ((SCAN_TO - SCAN_FROM) * i) / (SKILLS.length - 1);
  keyframes.push(
    `@keyframes rf${i}{0%,${round(Math.max(at - 1.4, 0))}%{opacity:0}` +
      `${round(at)}%{opacity:1}${round(at + 2.6)}%,100%{opacity:0}}`,
  );

  // The pass highlight. Resting opacity 0 — in the resolved state only the
  // chosen row is lit, and that is a separate element with its own resting fill.
  rows.push(
    `<rect class="rf${i}" x="${REG_X}" y="${y}" width="${REG_W}" height="${ROW_H}" rx="2" ` +
      `fill="${C.accent}" opacity="0"/>`,
  );

  if (chosen) {
    rows.push(
      `<rect class="lock" x="${REG_X}" y="${y}" width="${REG_W}" height="${ROW_H}" rx="2" ` +
        `fill="${C.panelLit}" stroke="${C.edgeLit}" stroke-width="1"/>`,
      `<rect class="lock" x="${REG_X}" y="${y}" width="2" height="${ROW_H}" fill="${C.accent}"/>`,
    );
  }

  rows.push(
    `<text x="${REG_X + 10}" y="${y + 10.5}" font-family="${MONO}" font-size="10.5" ` +
      `fill="${chosen ? C.ink : C.inkFaint}"${chosen ? ' class="lock-t"' : ""}>${esc(id)}</text>`,
  );

  if (chosen) {
    // `lock`, not `lock-t`. The fill animation resolves to ink, and this label's
    // resting fill is the accent — sharing the class would make the animated
    // state and the stylesheet-dropped state render it two different colours.
    rows.push(
      `<text class="lock" x="${REG_X + REG_W - 10}" y="${y + 10.5}" text-anchor="end" ` +
        `font-family="${MONO}" font-size="9" fill="${C.accent}">matched</text>`,
    );
  }
});

keyframes.push(
  // Ends at the resting attribute value, not at 1. Animating a highlight to full
  // opacity paints the accent over the words it is supposed to be marking — the
  // text draws on top, but bright accent under dim ink is unreadable either way.
  // Every keyframe here has to land on the value the attribute already carries,
  // or the animated state and the degraded state disagree.
  `@keyframes kw{0%,${KW_IN - 3}%{opacity:0}${KW_IN}%,100%{opacity:.16}}`,
  `@keyframes scan{0%,${SCAN_FROM - 1}%{opacity:0;transform:translateY(0)}` +
    `${SCAN_FROM}%{opacity:.9;transform:translateY(0)}` +
    `${SCAN_TO}%{opacity:.9;transform:translateY(${REG_RUN - 3}px)}` +
    `${SCAN_TO + 1.5}%,100%{opacity:0;transform:translateY(${REG_RUN - 3}px)}}`,
  `@keyframes lock{0%,${LOCK_AT - 3}%{opacity:0}${LOCK_AT}%,100%{opacity:1}}`,
  `@keyframes lockt{0%,${LOCK_AT - 3}%{fill:${C.inkFaint}}${LOCK_AT}%,100%{fill:${C.ink}}}`,
  `@keyframes fill{0%,${METER_FROM}%{transform:scaleX(0)}${METER_TO}%,100%{transform:scaleX(1)}}`,
  `@keyframes late{0%,${METER_TO - 4}%{opacity:0}${METER_TO}%,100%{opacity:1}}`,
);

DEPS.forEach((_, j) => {
  const s = DEP_FROM + j * 3;
  keyframes.push(
    `@keyframes dep${j}{0%,${s}%{opacity:0;transform:translateX(-6px)}` +
      `${s + 4}%,100%{opacity:1;transform:translateX(0)}}`,
  );
});

const depChips = DEPS.map((d, j) => {
  const y = DEP_TOP + j * DEP_PITCH;
  return (
    `<g class="dep${j}">` +
    `<rect x="${METER_X}" y="${y}" width="${METER_W}" height="20" rx="3" fill="${C.panel}" ` +
    `stroke="${C.edge}"/>` +
    `<rect x="${METER_X}" y="${y}" width="2" height="20" fill="${C.green}"/>` +
    `<text x="${METER_X + 11}" y="${y + 14}" font-family="${MONO}" font-size="10" ` +
    `fill="${C.inkDim}">${esc(d)}</text>` +
    `</g>`
  );
}).join("");

/**
 * The keyword highlights are positioned by measuring the prefix in the same
 * monospace advance the text is drawn at, so they land on the words rather than
 * near them. 6.02 is the advance ratio for the stack at this size; it is one
 * constant rather than three hand-nudged x values, and it stays correct if the
 * request copy changes.
 */
const REQ_X = 56;
const REQ_Y = 152;
const ADV = 6.02;
const REQ_SIZE = 10;

const kwMarks = KEYWORDS.map((kw) => {
  const i = REQUEST.indexOf(kw);
  if (i === -1) throw new Error(`keyword "${kw}" is not in the request copy`);
  return (
    `<rect class="kw" x="${round(REQ_X + i * ADV - 2)}" y="${REQ_Y - 10}" ` +
    `width="${round(kw.length * ADV + 4)}" height="14" rx="2" fill="${C.accent}" opacity="0.16"/>`
  );
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="How the pack routes one request: a prompt asking for a pricing page with a comparison table is matched against a registry of ${T.skills} skills, exactly one of them — landing-pages — is selected, its three core dependency files attach, and a cost meter shows ${n(T.band_low)} to ${n(T.band_high)} tokens loaded against ${n(T.reference_depth_tokens)} tokens of available depth, drawn to scale.">
<title>Registry + lazy loading — one request, one route</title>
<style>
${keyframes.join("\n")}
.kw{animation:kw ${DUR}s linear infinite}
.scan{animation:scan ${DUR}s linear infinite}
.lock{animation:lock ${DUR}s linear infinite}
.lock-t{animation:lockt ${DUR}s linear infinite}
.fill{animation:fill ${DUR}s cubic-bezier(.2,.7,.3,1) infinite;transform-origin:${METER_X}px ${METER_Y}px}
.late{animation:late ${DUR}s linear infinite}
${SKILLS.map((_, i) => `.rf${i}{animation:rf${i} ${DUR}s linear infinite}`).join("\n")}
${DEPS.map((_, j) => `.dep${j}{animation:dep${j} ${DUR}s ease-out infinite}`).join("\n")}
@media (prefers-reduced-motion:reduce){
.kw,.scan,.lock,.lock-t,.fill,.late,${SKILLS.map((_, i) => `.rf${i}`).join(",")},${DEPS.map((_, j) => `.dep${j}`).join(",")}{animation:none}
.scan{opacity:0}
}
</style>

<rect width="${W}" height="${H}" fill="${C.ground}"/>

<text x="56" y="46" font-family="${SANS}" font-size="15" font-weight="600" fill="${C.ink}">One request, one route.</text>
<text x="56" y="68" font-family="${SANS}" font-size="11.5" fill="${C.inkFaint}">The pack is a registry that routes — not a document that loads.</text>

<!-- Request -->
<text x="56" y="112" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">REQUEST</text>
<rect x="42" y="126" width="320" height="42" rx="4" fill="${C.panel}" stroke="${C.edge}"/>
${kwMarks}
<text x="${REQ_X}" y="${REQ_Y}" font-family="${MONO}" font-size="${REQ_SIZE}" fill="${C.inkDim}">${esc(REQUEST)}</text>

<text x="56" y="212" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">ALWAYS LOADED</text>
<rect x="42" y="226" width="320" height="46" rx="4" fill="${C.panel}" stroke="${C.edge}"/>
<text x="56" y="246" font-family="${MONO}" font-size="10.5" fill="${C.inkDim}">SKILL.md — the registry</text>
<text x="56" y="262" font-family="${MONO}" font-size="10.5" fill="${C.accent}">${n(T.registry_tokens)} tokens</text>

<text x="56" y="316" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">NEVER LOADED UNTIL ASKED FOR</text>
<rect x="42" y="330" width="320" height="46" rx="4" fill="${C.panel}" stroke="${C.edge}"/>
<text x="56" y="350" font-family="${MONO}" font-size="10.5" fill="${C.inkDim}">${n(T.reference_files)} reference files</text>
<text x="56" y="366" font-family="${MONO}" font-size="10.5" fill="${C.inkFaint}">${n(T.reference_depth_tokens)} tokens of depth</text>

<!-- Registry -->
<text x="${REG_X}" y="106" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">REGISTRY</text>
<text x="${REG_X + REG_W}" y="106" text-anchor="end" font-family="${MONO}" font-size="9.5" fill="${C.inkFaint}">${T.skills} skills, one matches</text>
<g class="scan" opacity="0"><rect x="${REG_X - 6}" y="${REG_TOP - 3}" width="${REG_W + 12}" height="3" rx="1.5" fill="${C.accent}"/></g>
${rows.join("\n")}

<!-- Loaded -->
<text x="${METER_X}" y="106" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">LOADED FOR THIS REQUEST</text>
<rect class="lock" x="${METER_X}" y="126" width="${METER_W}" height="20" rx="3" fill="${C.panelLit}" stroke="${C.edgeLit}"/>
<rect class="lock" x="${METER_X}" y="126" width="2" height="20" fill="${C.accent}"/>
<text class="lock-t" x="${METER_X + 11}" y="140" font-family="${MONO}" font-size="10" fill="${C.ink}">skills/${CHOSEN}/SKILL.md</text>

<text x="${METER_X}" y="176" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">ITS DECLARED CORE FILES</text>
${depChips}

<text x="${METER_X}" y="${METER_Y - 12}" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="1.4" fill="${C.inkFaint}">COST, DRAWN TO SCALE</text>
<rect x="${METER_X}" y="${METER_Y}" width="${METER_W}" height="${METER_H}" rx="3" fill="${C.panel}" stroke="${C.edge}"/>
<rect class="fill" x="${METER_X}" y="${METER_Y}" width="${round(LOADED_W)}" height="${METER_H}" rx="1.5" fill="${C.accent}"/>
<line class="late" x1="${round(METER_X + LOADED_W)}" y1="${METER_Y + METER_H}" x2="${round(METER_X + LOADED_W)}" y2="${METER_Y + METER_H + 14}" stroke="${C.edgeLit}"/>
<text class="late" x="${round(METER_X + LOADED_W + 6)}" y="${METER_Y + METER_H + 18}" font-family="${MONO}" font-size="10" fill="${C.accent}">${n(T.band_low)}–${n(T.band_high)} tokens loaded</text>
<text x="${METER_X + METER_W}" y="${METER_Y - 12}" text-anchor="end" font-family="${MONO}" font-size="10" fill="${C.inkFaint}">${n(T.reference_depth_tokens)} available</text>

<text class="late" x="${METER_X}" y="${METER_Y + 74}" font-family="${SANS}" font-size="11" fill="${C.inkDim}">Every gate recomputes these figures. This banner reads them.</text>

<rect x="0" y="${H - 1}" width="${W}" height="1" fill="${C.edge}"/>
</svg>
`;

const kb = (Buffer.byteLength(svg, "utf8") / 1024).toFixed(1);

if (process.argv.includes("--check")) {
  let committed;
  try {
    committed = readFileSync(OUT, "utf8");
  } catch {
    console.error("router.svg is missing. Run: node tools/readme-router/generate.mjs");
    process.exit(1);
  }
  // Normalised, because git may check this out with CRLF on Windows and the
  // difference that matters is content, not line endings.
  if (committed.replace(/\r\n/g, "\n") !== svg.replace(/\r\n/g, "\n")) {
    console.error(
      "router.svg is stale — it does not match what the generator produces from the " +
        "current truth table. A figure it draws has moved.\n" +
        "  Fix: node tools/readme-router/generate.mjs",
    );
    process.exit(1);
  }
  console.log("router.svg is current against `check_figures.py --truth`");
  process.exit(0);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg, "utf8");

console.log(`wrote .github/assets/router.svg — ${kb} KB`);
console.log(
  `  registry ${n(T.registry_tokens)} · band ${n(T.band_low)}–${n(T.band_high)} · ` +
    `depth ${n(T.reference_depth_tokens)} · ${T.skills} skills · ${n(T.reference_files)} references`,
);
console.log(`  loaded sliver is ${round(LOADED_FRAC * 100)}% of the depth bar, drawn at true scale`);
