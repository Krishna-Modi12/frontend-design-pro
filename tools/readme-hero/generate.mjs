/**
 * Generates `.github/assets/hero.svg` — the animated banner at the top of README.md.
 *
 * Run:  node tools/readme-hero/generate.mjs
 *
 * ── What the banner shows ────────────────────────────────────────────────────
 *
 * A component on an audit bench. A scan beam sweeps it top to bottom, and as it
 * crosses each element that element resolves from dim to lit and its constraint
 * ticks green — type scale, contrast, focus ring, colour space — ending on a
 * PASS. That is the product, not a metaphor for it: this pack is constraints a
 * machine checks, and the banner is the checking.
 *
 * The previous banner was an isometric field, and it was replaced rather than
 * tuned. Its columns were #1C2739 on a #0A0E17 ground — about 1.3:1 — so the
 * "3D" read as faint texture, the type scrim erased the left 40% of it, and the
 * accent crest was a shimmer at 2% of the frame. It had no focal point and it
 * said nothing about what the pack does. Contrast was the surface defect;
 * having no subject was the real one.
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
 * which is why this file emits exactly that. SVG filters are fine — they are
 * computed in-document, not fetched — so the bloom and shadow here are real
 * feGaussianBlur rather than faked with stacked translucent shapes.
 *
 * The same restriction is why the type sits on system font stacks rather than
 * the faces the demo page uses: a webfont cannot be fetched, and embedding one
 * as base64 would add hundreds of kilobytes to a banner.
 *
 * It is also why the banner paints its own dark ground instead of adapting to
 * the reader's theme. GitHub's <picture> + prefers-color-scheme trick works, but
 * it needs two files that must be kept in step by hand — a second thing to go
 * stale, for a banner that reads correctly on both themes as it is.
 *
 * ── Everything degrades to the finished audit ────────────────────────────────
 *
 * Fills are presentation ATTRIBUTES and every animated element's *resting*
 * attribute value is its LIT state. The stylesheet only ever animates away from
 * that and back. So if any proxy or renderer drops the CSS, the banner shows a
 * completed audit — every row lit, every check green, no beam — which is a
 * correct still frame rather than a broken one. Had the lit state lived only in
 * CSS, the same event would have rendered a dim grey panel on the project's most
 * prominent surface.
 *
 * `prefers-reduced-motion` resolves to that same finished state, deliberately:
 * the beam is the only thing lost, and the beam is the decoration.
 *
 * ── Why a generator instead of a hand-written SVG ────────────────────────────
 *
 * The per-row reveal timings, the perspective floor and the drift field are all
 * arithmetic. More to the point, an infinitely-repeating CSS animation applies
 * `animation-delay` to the FIRST iteration only — so staggering the rows with
 * delays would desynchronise them from the beam on every loop after the first.
 * Each row instead gets its own @keyframes with the transition at its own
 * percentage, computed from where the beam actually is. That is not something to
 * maintain by hand.
 *
 * ── No figures about this pack appear on the banner ──────────────────────────
 *
 * Deliberate, and the reasoning held up under test. Gate 11 does not read SVG,
 * so any count drawn here would be a number no gate can see, on the most
 * prominent surface the project has. The constraint labels are named, never
 * counted.
 *
 * Adding `.github/assets/*.svg` to Gate 11's SCAN was tried and reverted, and
 * the reason is worth knowing before trying it again: the patterns DO match
 * inside SVG, and the gate still passes a banner corrupted to a wrong number,
 * because each figure's forbid window reads the preceding ~50 characters and in
 * SVG those are always attribute soup. `scripts/check_figures.py` carries the
 * detail at the point where the entry would have gone.
 *
 * `tools/readme-router/generate.mjs` is the banner that does make a
 * quantitative claim. It reads every figure from `check_figures.py --truth` and
 * supports `--check` to re-render and diff, which is byte-exact rather than
 * pattern-based — the guard this file would want if it ever grew a number.
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
   engine. Values were picked in OKLCH and converted.

   The one hard requirement the last banner failed: the panel must sit clearly
   above the ground, and the beam must be genuinely bright. Panel face to ground
   is ~2.0:1 here against the old field's 1.3:1, and the beam is a light source
   rather than a tint. */
const C = {
  ground: "#070A12",
  bloom: "#16294D",
  floor: "#1B2740",
  face: "#111A2B",
  faceTop: "#17223A",
  edge: "#080C16",
  border: "#26334D",
  rim: "#3D5580",
  dim: "#2E3B54",
  lit: "#7A93C4",
  ink: "#F2F6FF",
  muted: "#93A4C4",
  faint: "#61728F",
  accent: "#5AA9FF",
  accentDeep: "#2B6FD4",
  ok: "#3DDC97",
};

/* ── The bench ──────────────────────────────────────────────────────────────── */
const CARD = { x: 684, y: 66, w: 452, h: 252 };
const CARD_R = 14;
const PAD = 26;
const CX0 = CARD.x + PAD; // content left rail
const LABEL_X = CARD.x + CARD.w - PAD - 22; // constraint labels, right-aligned
const CHECK_X = CARD.x + CARD.w - PAD - 5; // check discs, fixed column

/* Beam travel. Starts below the panel header rule and stops above its lower
   edge — a beam that runs off the panel reads as a scanline artifact rather
   than as something inspecting the thing it is inside. */
const BEAM_TOP = 124;
const BEAM_BOT = 306;
const DUR = 4.6; // seconds, one full audit

/* The beam is only travelling for part of the cycle: it fades in, sweeps, fades
   out, and the panel holds its finished state for a beat before resetting. That
   hold is what makes the PASS readable — without it the payoff is on screen for
   a tenth of a second. */
const SWEEP_FROM = 6; // % of cycle where travel begins
const SWEEP_TO = 76; // % where travel ends
const HOLD_TO = 93; // % where the finished state starts fading back

/**
 * The audit rows. Each is one wireframe element plus the constraint that
 * governs it — the four are named, not numbered, and every one of them is a
 * rule this pack actually enforces on `skills/*​/examples/good-*.tsx`.
 */
const ROWS = [
  { y: 148, kind: "heading", label: "type scale" },
  { y: 192, kind: "lines", label: "contrast" },
  { y: 238, kind: "button", label: "focus ring" },
  { y: 282, kind: "swatches", label: "oklch()" },
];

const n = (v) => Math.round(v * 10) / 10;

/** Where in the cycle the beam crosses a given y, as a percentage. */
const pctAt = (y) =>
  n(SWEEP_FROM + ((y - BEAM_TOP) / (BEAM_BOT - BEAM_TOP)) * (SWEEP_TO - SWEEP_FROM));

const rows = ROWS.map((row, i) => ({ ...row, i, pct: pctAt(row.y) }));
const passPct = n(SWEEP_TO + 2);

/* ── Perspective floor ────────────────────────────────────────────────────────
   A vanishing point under the panel, so the bench sits in a space rather than
   floating on a flat rectangle. Radiating lines plus horizontals bunched toward
   the horizon; a radial mask fades the whole thing out at the edges so it never
   reaches the frame and turns into a visible boundary. */
const VP = { x: CARD.x + CARD.w / 2, y: 334 };

const floorRays = [];
for (let x = -900; x <= 2200; x += 118) {
  floorRays.push(`<line x1="${VP.x}" y1="${VP.y}" x2="${x}" y2="${H}"/>`);
}
const floorBands = [];
for (let i = 1; i <= 9; i++) {
  const y = VP.y + (H - VP.y) * (i / 9) ** 2.1;
  floorBands.push(`<line x1="0" y1="${n(y)}" x2="${W}" y2="${n(y)}"/>`);
}

/* ── Drift field ──────────────────────────────────────────────────────────────
   Fourteen motes on slow upward drift. Atmosphere only, and the first thing to
   cut if this ever needs to get smaller. Positions are from a fixed sequence
   rather than Math.random() so the committed file is byte-stable across runs —
   a generator that emits a different artifact every invocation makes its own
   diffs unreviewable. */
const motes = [];
for (let i = 0; i < 14; i++) {
  const x = 620 + ((i * 137) % 560);
  const y = 70 + ((i * 211) % 280);
  const r = 0.9 + ((i * 7) % 3) * 0.45;
  const delay = -(i * 1.37) % 9;
  motes.push(
    `<circle cx="${x}" cy="${y}" r="${n(r)}" fill="${C.accent}" opacity="0.5" style="--m:${n(delay)}s"/>`,
  );
}

/* ── Row geometry ─────────────────────────────────────────────────────────────
   Each returns the wireframe for one audited element. Everything rests LIT; the
   stylesheet dims it and brings it back. */
const wireframe = {
  heading: (y) => `
    <rect x="${CX0}" y="${y - 15}" width="188" height="17" rx="4" fill="${C.lit}"/>
    <rect x="${CX0}" y="${y + 8}" width="112" height="7" rx="3.5" fill="${C.dim}"/>`,
  lines: (y) => `
    <rect x="${CX0}" y="${y - 13}" width="242" height="8" rx="4" fill="${C.lit}"/>
    <rect x="${CX0}" y="${y + 2}" width="186" height="8" rx="4" fill="${C.lit}" opacity="0.7"/>`,
  button: (y) => `
    <rect x="${CX0 - 5}" y="${y - 21}" width="118" height="42" rx="12" fill="none"
          stroke="${C.accent}" stroke-width="2" opacity="0.85"/>
    <rect x="${CX0}" y="${y - 16}" width="108" height="32" rx="9" fill="${C.accentDeep}"/>
    <rect x="${CX0 + 18}" y="${y - 4}" width="72" height="8" rx="4" fill="${C.ink}" opacity="0.85"/>`,
  swatches: (y) =>
    [0, 1, 2, 3, 4]
      .map(
        (k) =>
          `<rect x="${CX0 + k * 30}" y="${y - 11}" width="23" height="23" rx="6" fill="${C.lit}" opacity="${n(1 - k * 0.155)}"/>`,
      )
      .join("\n    "),
};

const rowMarkup = rows
  .map(
    (row) => `  <g class="r r${row.i}">
    ${wireframe[row.kind](row.y).trim()}
    <text x="${LABEL_X}" y="${row.y + 4}" text-anchor="end" fill="${C.muted}" font-size="12.5"
          letter-spacing="0.4" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">${row.label}</text>
    <circle cx="${CHECK_X}" cy="${row.y}" r="8" fill="${C.ok}" opacity="0.16"/>
    <path d="M${CHECK_X - 3.6} ${row.y} l2.6 2.7 l4.6 -5.4" fill="none" stroke="${C.ok}"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`,
  )
  .join("\n");

/* Per-row keyframes. See the header: animation-delay would only stagger the
   first iteration, so the stagger has to live in the percentages. */
const rowKeyframes = rows
  .map(
    (row) => `  @keyframes row${row.i} {
    0%, ${row.pct}%      { opacity: 0.22; }
    ${n(row.pct + 2.5)}%, ${HOLD_TO}% { opacity: 1; }
    100%                 { opacity: 0.22; }
  }`,
  )
  .join("\n");

const rowRules = rows
  .map((row) => `  .r${row.i} { animation-name: row${row.i}; }`)
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="frontend-design-pro — a skill pack for AI coding agents. A component on an audit bench: a scan beam sweeps it while constraints for type scale, contrast, focus ring and colour space resolve to green checks, ending on a pass.">
<title>frontend-design-pro — machine-enforced frontend design</title>
<defs>
  <radialGradient id="bloom" cx="0.62" cy="0.42" r="0.72">
    <stop offset="0" stop-color="${C.bloom}"/>
    <stop offset="1" stop-color="${C.ground}"/>
  </radialGradient>
  <linearGradient id="faceFill" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="${C.faceTop}"/>
    <stop offset="1" stop-color="${C.face}"/>
  </linearGradient>
  <linearGradient id="rimLight" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.rim}" stop-opacity="0"/>
    <stop offset="0.45" stop-color="${C.rim}" stop-opacity="0.9"/>
    <stop offset="1" stop-color="${C.rim}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="accentRule" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.accent}"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="beamFill" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${C.accent}" stop-opacity="0.95"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </linearGradient>
  <!-- The trail sits ABOVE the core because the beam travels downward, so the
       haze is what it has already passed. Kept faint: at 0.30 the three stacked
       beam layers merged into a solid bar and the whole thing read as a progress
       indicator rather than a light moving over a surface. -->
  <linearGradient id="beamHaze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
    <stop offset="0.8" stop-color="${C.accent}" stop-opacity="0.14"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </linearGradient>

  <radialGradient id="floorFade" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#fff" stop-opacity="0.85"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="floorMask">
    <ellipse cx="${VP.x}" cy="${VP.y + 20}" rx="620" ry="150" fill="url(#floorFade)"/>
  </mask>

  <!-- Generous explicit filter regions. The default region is the bounding box
       plus 10%, which clips a blur this wide and leaves a visible square edge
       around the shadow. -->
  <filter id="drop" x="-40%" y="-40%" width="180%" height="200%">
    <feGaussianBlur stdDeviation="20"/>
  </filter>
  <filter id="glow" x="-120%" y="-900%" width="340%" height="1900%">
    <feGaussianBlur stdDeviation="4"/>
  </filter>
</defs>

<style>
  /* Every animated element RESTS in its finished state and the stylesheet moves
     it away and back, so losing this block leaves a completed audit rather than
     a dim panel. See the header note. */
  .r    { animation: 0s linear infinite; animation-duration: ${DUR}s; }
${rowRules}
${rowKeyframes}

  .pass { animation: pass ${DUR}s infinite; }
  @keyframes pass {
    0%, ${passPct}%      { opacity: 0; transform: translateY(3px); }
    ${n(passPct + 3)}%, ${HOLD_TO}% { opacity: 1; transform: translateY(0); }
    100%                 { opacity: 0; transform: translateY(3px); }
  }

  /* The beam. Travels only between ${SWEEP_FROM}% and ${SWEEP_TO}%, then fades —
     the remainder of the cycle is the hold that makes the result legible. */
  .beam { animation: sweep ${DUR}s infinite; }
  @keyframes sweep {
    0%              { transform: translateY(0); opacity: 0; }
    ${SWEEP_FROM}%  { transform: translateY(0); opacity: 1; }
    ${SWEEP_TO}%    { transform: translateY(${BEAM_BOT - BEAM_TOP}px); opacity: 1; }
    ${n(SWEEP_TO + 6)}% { transform: translateY(${BEAM_BOT - BEAM_TOP}px); opacity: 0; }
    100%            { transform: translateY(${BEAM_BOT - BEAM_TOP}px); opacity: 0; }
  }

  /* A slow lift on the whole bench. Three pixels — enough to stop the panel
     reading as pasted onto the background, small enough not to compete with the
     beam for attention. */
  .bench { animation: lift 7s infinite ease-in-out; }
  @keyframes lift {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-3px); }
  }

  .mote { animation: drift 9s var(--m) infinite ease-in-out; }
  @keyframes drift {
    0%, 100% { transform: translateY(6px); opacity: 0.15; }
    50%      { transform: translateY(-14px); opacity: 0.55; }
  }

  /* Resolves to the same finished state the stylesheet-dropped case does: rows
     lit, checks green, PASS shown, beam gone. The beam is the decoration, and
     it is the only thing this costs. */
  @media (prefers-reduced-motion: reduce) {
    .r, .pass, .beam, .bench, .mote { animation: none; }
    .beam { opacity: 0; }
  }

</style>

<rect width="${W}" height="${H}" fill="url(#bloom)"/>

<g mask="url(#floorMask)" stroke="${C.floor}" stroke-width="1" fill="none">
${floorRays.join("\n")}
${floorBands.join("\n")}
</g>

<g class="mote-field">
${motes.map((m) => m.replace('opacity="0.5"', 'opacity="0.5" class="mote"')).join("\n")}
</g>

<g class="bench">
  <!-- Cast shadow, then the slab edge, then the face. The edge is a second
       rounded rect offset down and right: enough to read as thickness without
       the false perspective a skewed face would introduce at this size. -->
  <rect x="${CARD.x + 6}" y="${CARD.y + 26}" width="${CARD.w}" height="${CARD.h}" rx="${CARD_R}"
        fill="#000" opacity="0.55" filter="url(#drop)"/>
  <rect x="${CARD.x + 9}" y="${CARD.y + 9}" width="${CARD.w}" height="${CARD.h}" rx="${CARD_R}" fill="${C.edge}"/>
  <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="${CARD_R}"
        fill="url(#faceFill)" stroke="${C.border}" stroke-width="1"/>
  <rect x="${CARD.x + 40}" y="${CARD.y}" width="${CARD.w - 80}" height="1" fill="url(#rimLight)"/>

  <text x="${CX0}" y="${CARD.y + 36}" fill="${C.faint}" font-size="11" letter-spacing="2.2"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">COMPONENT AUDIT</text>

  <g class="pass">
    <rect x="${CARD.x + CARD.w - PAD - 62}" y="${CARD.y + 22}" width="62" height="20" rx="10"
          fill="${C.ok}" opacity="0.14"/>
    <text x="${CARD.x + CARD.w - PAD - 31}" y="${CARD.y + 36}" text-anchor="middle" fill="${C.ok}"
          font-size="11" letter-spacing="1.6"
          font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">PASS</text>
  </g>

  <rect x="${CX0}" y="${CARD.y + 50}" width="${CARD.w - PAD * 2}" height="1" fill="${C.border}"/>

${rowMarkup}

  <!-- Three layers, and the order matters: a wide faint trail, a blurred core
       for the bloom, then a hairline core on top so the beam still has a crisp
       edge. Without the hairline the blur alone reads as a smudge.

       The group RESTS at opacity 0 and the keyframes bring it in, so a dropped
       stylesheet leaves no beam rather than a bright line parked across the
       panel header. That was the one way the degraded frame differed from the
       reduced-motion frame, and it is the kind of thing only a render catches. -->
  <g class="beam" opacity="0">
    <rect x="${CARD.x + 10}" y="${BEAM_TOP - 30}" width="${CARD.w - 20}" height="30" fill="url(#beamHaze)"/>
    <rect x="${CARD.x + 10}" y="${BEAM_TOP - 0.5}" width="${CARD.w - 20}" height="1.6" fill="url(#beamFill)"
          filter="url(#glow)"/>
    <rect x="${CARD.x + 10}" y="${BEAM_TOP}" width="${CARD.w - 20}" height="1" fill="url(#beamFill)"/>
  </g>
</g>

<!-- Type is styled with presentation attributes for the same reason the panel
     is: no webfont can be fetched here, so these are system stacks, and nothing
     about how the words look depends on the stylesheet surviving. Two stacks
     only — a serif for the wordmark, mono for everything technical. The previous
     banner used four, which is how a 1200px image ends up with no voice. -->
<g>
  <rect x="72" y="112" width="64" height="2" fill="url(#accentRule)"/>
  <text x="72" y="148" fill="${C.accent}" letter-spacing="3.2"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13">SKILL PACK FOR AI CODING AGENTS</text>
  <text x="70" y="212" fill="${C.ink}" letter-spacing="-1.4"
        font-family="Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif" font-size="52">frontend-design-pro</text>
  <text x="72" y="250" fill="${C.muted}" letter-spacing="0.2"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="14.5">Taste you can put in CI.</text>
  <text x="72" y="286" fill="${C.faint}" letter-spacing="0.5"
        font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="12.5">every rule machine-checked · every figure recomputed by a gate</text>
</g>
</svg>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, svg, "utf8");
console.log(
  `hero.svg — ${rows.length} audit rows, ${motes.length} motes, ${(svg.length / 1024).toFixed(1)} KB → ${OUT}`,
);
