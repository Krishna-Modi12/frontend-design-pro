/**
 * Generates `.github/assets/hero.svg` — the animated banner at the top of README.md.
 *
 * Run:  node tools/readme-hero/generate.mjs
 *
 * ── What a GitHub README can actually render ─────────────────────────────────
 *
 * GitHub proxies every README image through camo and renders it as an image
 * document, which rules out most of the ways you would normally animate
 * something:
 *
 *   - no <script>, ever;
 *   - no external stylesheet, and no @import or <link> for a web font;
 *   - no external anything — one request, or it does not render.
 *
 * What DOES survive is a fully self-contained SVG with inline CSS @keyframes,
 * which is why this file emits exactly that. The same restriction is why the
 * type here sits on system font stacks rather than the faces the demo page
 * uses: a webfont cannot be fetched, and embedding one as base64 would add
 * hundreds of kilobytes to a banner.
 *
 * It is also why the banner paints its own dark ground instead of adapting to
 * the reader's theme. GitHub's <picture> + prefers-color-scheme trick works, but
 * it needs two files that must be kept in step by hand — a second thing to go
 * stale, for a banner that reads correctly on both themes as it is.
 *
 * ── Why a generator instead of a hand-written SVG ────────────────────────────
 *
 * The field is a few hundred isometric columns, each needing its own position
 * and its own animation phase. Hand-writing that is not reviewable and not
 * tunable; a generator makes the geometry the source and the SVG the artifact.
 *
 * ── No figures about this pack appear on the banner ──────────────────────────
 *
 * Deliberate, and the same reasoning as `demo/landing-page`: Gate 11 does not
 * read SVG, so any count drawn here would be a number no gate can see, on the
 * most prominent surface the project has. The field is a field — it is not
 * nineteen of anything, and it is not meant to be counted.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "..", ".github", "assets", "hero.svg");

const W = 1200;
const H = 420;

/* ── Palette ──────────────────────────────────────────────────────────────────
   Hex rather than OKLCH, and that is not the repo's usual rule being ignored:
   this is an image asset served to arbitrary browsers through a proxy, where a
   colour space some renderer does not implement degrades to *nothing drawn*.
   The OKLCH-only constraint governs component code, which ships to a known
   engine. Values were picked in OKLCH and converted. */
const C = {
  ground: "#0A0E17",
  glow: "#12213D",
  ink: "#E9EEF8",
  muted: "#8494B0",
  faint: "#5A6883",
  accent: "#4C8DFF",
  top: "#1C2739",
  topLit: "#3C6FC9",
  left: "#0E1626",
  right: "#141D30",
};

/* ── Isometric geometry ─────────────────────────────────────────────────────── */
const TW = 56; // tile width
const TH = 28; // tile height — 2:1, the standard isometric ratio
const HW = TW / 2;
const HH = TH / 2;
const DEPTH = 520; // column body, long enough to always run off the bottom edge
const AMP = 30; // wave amplitude in px
const DUR = 3.6; // seconds

/* The grid is a diamond and the frame is a rectangle, so the grid has to be
   generously larger than the frame in both axes or its lower-left edge cuts a
   visible diagonal across the bottom of the banner. Overshooting costs nothing:
   the visibility filter below drops everything that falls outside. */
const COLS = 34;
const ROWS = 28;
const OX = 560;
const OY = -160;

const cells = [];
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const x = OX + (c - r) * HW;
    const y = OY + (c + r) * HH;
    // Only emit what can be seen. The field is a diamond and the frame is a
    // rectangle, so most of the grid falls outside it — generating all of it
    // would triple the file for pixels nobody receives.
    if (x < -80 || x > W + 90 || y < -70 || y > H + 60) continue;
    // Negative delay starts each column mid-cycle, so the wave is already
    // formed in frame one. A positive stagger would make the banner spend its
    // first three seconds visibly filling in.
    const phase = (c * 0.055 + r * 0.03) % DUR;
    // Where this column sits at t=0, for the reduced-motion freeze. Matches the
    // keyframe's shape: 0 at both ends, -AMP at the midpoint.
    const p = phase / DUR;
    const rest = -AMP * ((1 - Math.cos(2 * Math.PI * p)) / 2);
    cells.push({ c, r, x, y, delay: -phase, rest });
  }
}
// Painter's algorithm: larger (c + r) is nearer the viewer, so draw it later.
cells.sort((a, b) => a.c + a.r - (b.c + b.r));

const n = (v) => Math.round(v * 10) / 10;

/**
 * One <use> per column, against a single <g> in <defs>.
 *
 * Emitting the three polygons per column instead cost 126 KB for a banner —
 * more than the whole landing-page screenshot. A reference is ~58 bytes.
 *
 * Two details make this work. Custom properties inherit *into* a <use> shadow
 * tree, which is the only per-instance channel available: `--d` set here reaches
 * the `.t` rule inside the copy, so every column animates on its own phase from
 * one shared stylesheet. And `x`/`y` on <use> are not the transform property —
 * they translate the generated content independently — so the CSS transform
 * carrying the bob composes with them rather than overwriting the position, the
 * way a `transform` attribute would.
 */
const column = ({ x, y, delay, rest }) =>
  `<use href="#c" x="${n(x)}" y="${n(y)}" style="--d:${n(delay)}s;--y:${n(rest)}px"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="frontend-design-pro — a skill pack for AI coding agents. Machine-enforced frontend design, verified rather than asserted.">
<title>frontend-design-pro</title>
<defs>
  <!-- Fills are presentation ATTRIBUTES, not CSS, and that is the whole
       defensive design of this file: the stylesheet carries nothing but
       animation. If any proxy or renderer along the way drops it, the banner
       degrades to a correctly-coloured static isometric field. Had the fills
       lived in CSS, the same event would have rendered a rectangle of black
       polygons on the project's most prominent surface.

       No literal style tag appears in this comment, on purpose. One did, and a
       regex that strips the stylesheet matched the mention inside the comment
       instead of the real element — swallowing this entire defs block and
       leaving a truncated, invalid comment behind. The file was fine; the tool
       reading it was not. Naming a tag inside a comment in a file that other
       tools regex is a trap worth not setting. -->
  <g id="c">
    <polygon class="t" fill="${C.top}" points="0,0 ${HW},${HH} 0,${TH} -${HW},${HH}"/>
    <polygon fill="${C.left}" points="-${HW},${HH} 0,${TH} 0,${TH + DEPTH} -${HW},${HH + DEPTH}"/>
    <polygon fill="${C.right}" points="${HW},${HH} 0,${TH} 0,${TH + DEPTH} ${HW},${HH + DEPTH}"/>
  </g>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0.06" stop-color="#000"/>
    <stop offset="0.44" stop-color="#8A8A8A"/>
    <stop offset="0.74" stop-color="#fff"/>
  </linearGradient>
  <mask id="fieldMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <radialGradient id="glow" cx="0.74" cy="0.30" r="0.66">
    <stop offset="0" stop-color="${C.glow}"/>
    <stop offset="1" stop-color="${C.ground}"/>
  </radialGradient>
  <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.accent}"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </linearGradient>
  <!-- The type scrim. This was an opaque rect and it left a hard vertical seam
       straight down the banner at the edge of the text column — the one thing
       on the image that looked like a mistake rather than a decision. A
       gradient does the same protective job with no visible boundary. -->
  <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.ground}" stop-opacity="0.97"/>
    <stop offset="0.40" stop-color="${C.ground}" stop-opacity="0.90"/>
    <stop offset="1" stop-color="${C.ground}" stop-opacity="0"/>
  </linearGradient>
</defs>

<style>
  /* One animation, staggered per column by a custom property. Custom properties
     are the only per-instance channel available here, since every column shares
     one stylesheet and inline style attributes are all a generator can vary. */
  use { animation: bob ${DUR}s var(--d) infinite ease-in-out; }
  .t { animation: lit ${DUR}s var(--d) infinite ease-in-out; }

  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-${AMP}px); }
  }
  /* The crest carries the accent. Colour is doing the same job as height, half a
     beat apart, which is what stops the field reading as a flat grid sliding. */
  @keyframes lit {
    0%, 100% { fill: ${C.top}; }
    50%      { fill: ${C.topLit}; }
  }

  /* Motion is decoration here, and the banner has to survive without it. Rather
     than flattening the field — which would leave a plain grid and lose the
     shape entirely — each column freezes at the height it would have held at
     t=0, so the wave is still there, just still. */
  @media (prefers-reduced-motion: reduce) {
    use { animation: none; transform: translateY(var(--y)); }
    .t { animation: none; }
  }

</style>

<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g mask="url(#fieldMask)">
${cells.map(column).join("\n")}
</g>

<rect width="${W}" height="${H}" fill="url(#scrim)"/>

<!-- Type is styled with presentation attributes for the same reason the field
     is: no webfont can be fetched here, so these are system stacks, and nothing
     about how the words look depends on the stylesheet surviving. -->
<g>
  <rect x="72" y="118" width="86" height="2" fill="url(#rule)"/>
  <text x="72" y="160" fill="${C.accent}" letter-spacing="3.4"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="14">SKILL PACK FOR AI CODING AGENTS</text>
  <text x="70" y="232" fill="${C.ink}" letter-spacing="-1.2"
        font-family="Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif" font-size="58">frontend-design-pro</text>
  <text x="72" y="276" fill="${C.muted}"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="20">Machine-enforced frontend design.</text>
  <text x="72" y="318" fill="${C.faint}" letter-spacing="0.6"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13">verified, not asserted — every figure recomputed by a gate</text>
</g>
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg, "utf8");
console.log(`hero.svg — ${cells.length} columns, ${(svg.length / 1024).toFixed(1)} KB → ${OUT}`);
