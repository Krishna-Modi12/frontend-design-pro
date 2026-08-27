# `home/` — the pack's own homepage

Served at the root of the Pages site. Unlike everything under `demo/`, this is
not sample output — it is the product's own front door, and every figure on it
is read from `home/lib/data.generated.json`, which `tools/pages-data/generate.mjs`
computes from the same sources the release gates read. Nothing here is typed
twice.

It replaces a hand-written `.github/pages/index.html` that carried the same two
interactive panels — a live registry router and a live constraint checker — as
static HTML with a `<script>` reading a generated `data.js`. This is a real
Next 15 app instead, for the same reason `demo/landing-page` and `demo/showcase`
are: the panels are React state now, not DOM queries, and the page can use the
same component conventions the rest of this repo's examples are held to.

## Why this palette, why a shader mesh

The design brief this page was rebuilt from asked for a warm-editorial ground
and a terracotta accent; the v2.1 polish pass replaced the original canvas
particle-typography hero with a Three.js shader-mesh background. Both are
checked against this pack's own rules before shipping, not just against a
brief:

- Every token in [`tokens.css`](tokens.css) is measured, not eyed — four pairs
  in the original brief's values failed WCAG AA and were corrected (`text-muted`
  moved from 65% to 50% lightness; the footer's dark section needed its own
  `ink-invert` pair; `border` needed a second, darker `border-strong` for
  control boundaries, since the decorative border alone clears nothing at
  WCAG 1.4.11's 3:1).
- The gradient plane in
  [`components/HeroShaderCanvas.tsx`](components/HeroShaderCanvas.tsx) is
  raw `three`, a deliberate, measured exception to
  `skills/threejs-3d/SKILL.md`'s default ("write R3F, not raw Three.js"): an
  React Three Fiber build of this exact one-mesh scene shipped a lazy chunk
  that gzipped to ~174KB (R3F's reconciler needs a generic catalog covering
  most of THREE's export surface to support arbitrary JSX tags, which
  defeats tree-shaking even here) — more than 3x this pass's own ">50KB, find
  a lighter alternative" ceiling. The manual scene touches only the eight
  THREE classes it needs and still follows that skill's constraint ids by
  hand: dpr capped at 2 (3D-01), geometry/material built once and disposed on
  unmount (3D-03), an OKLCH token read into `THREE.Color` rather than a raw
  hex literal (3D-05), a delta from `THREE.Clock` rather than a frame counter
  (3D-06). [`components/HeroBackground.tsx`](components/HeroBackground.tsx)
  owns the policy around it: the canvas is still behind a dynamic import
  (`ssr: false`) so `three` never blocks the server-rendered headline, never
  mounts at all below 640px per
  `skills/animations/references/motion-budget.md`'s heavy-background rule,
  and freezes (one static frame, no further `requestAnimationFrame`) rather
  than unmounting under `prefers-reduced-motion` — the scene still renders,
  it just never moves on its own.

## Run it

```bash
cd home
npm install
npm run dev             # http://localhost:3000
```

```bash
npm run typecheck       # tsc --noEmit, strict
npm run build           # server build — what `next start` and the harnesses need
npm start
```

The parent repo installs none of these dependencies. This app has its own
`package.json` and its own lockfile.

## Things that will bite you

**The static export is opt-in, and must stay that way.**

```bash
NEXT_OUTPUT_EXPORT=1 npm run build     # static export in out/
```

`tools/screenshots/lib/next-server.mjs` starts this app with `next start`,
which refuses to run at all against an exported build — same reason
`demo/landing-page` keeps the same opt-in.

**This is a project Pages site, not a domain-root one, and this app is not
exempt.** It fills the *top* of `/frontend-design-pro/`, one level above
`/frontend-design-pro/showcase` and `/frontend-design-pro/landing-page`, and
that is still one level below the true domain root — so it still needs
`NEXT_BASE_PATH` set to `/frontend-design-pro` in CI (`pages.yml` sets it to
`$BASE_PATH` with nothing appended). "No further subpath" is not the same
claim as "no prefix at all"; the first draft of this app's `next.config.ts`
conflated the two and would have shipped every asset URL as `/_next/...`
instead of `/frontend-design-pro/_next/...` — a 200 that renders as unstyled
HTML, not a build failure, and nothing short of `verify_pages_site.py` reading
the composed upload would have caught it.

**`tokens.css` is separate from `lib/tokens.ts`, and the split is
load-bearing**, same as `demo/landing-page`. `@theme` is a Tailwind compiler
directive and has to live in a stylesheet the build reads; `lib/tokens.ts`
carries plain CSS valid at runtime and reads the palette back as `var(--color-*)`
rather than restating it.

**PostCSS names `@tailwindcss/postcss`, not `tailwindcss`.** The v3 key fails
the build outright in Tailwind v4.

**Lenis owns scroll; nothing else may set `scroll-behavior: smooth`.**
[`components/SmoothScroll.tsx`](components/SmoothScroll.tsx) syncs Lenis to
GSAP's own ticker and is skipped entirely under `prefers-reduced-motion` —
native instant scroll is the reduced-motion fallback, not a slower Lenis. A
CSS `scroll-behavior: smooth` alongside it would fight every scripted
`scrollTo` the same way it once did on the page this replaced.

## Where the page's data comes from

```bash
node tools/pages-data/generate.mjs          # writes lib/data.generated.json
node tools/pages-data/generate.mjs --check  # fails if it's stale
```

Registry rows, trigger keywords, per-skill token budgets, the adapter list and
every figure come from the filesystem — `SKILL.md`, each skill's frontmatter,
`install/`'s own directories, `metadata.json`, and `scripts/check_figures.py
--truth`. `scripts/check_figures.py`'s own `SCAN` list covers
`home/components/*.tsx`, `home/lib/*.ts` and `home/*.json`, so a figure
written into this app's prose is held to the same filesystem the generated
JSON is.

## Verification

```bash
npm run pages:verify     # from the repo root — home/'s own dev AND prod servers,
                         # axe, overflow, reduced motion, the router, the checker
```

## Recapture

```bash
npm run screenshots -- home
```

## The showcase thumbnails

`public/showcase/*.png` (the four `SectionShowcase` cards, two of them with a
`-full` companion the static cards link to) are not captured from this app —
they are resized/compressed copies of the four screenshots `demo/*/` already
ships and README already links, sized for a card grid instead of a full
above-the-fold hero. They are the first raster images this app has ever
shipped, so they follow the same rule as every other screenshot in this repo:
regenerated by a committed script, never hand-edited or resized ad hoc.

```bash
npm run showcase-thumbs
```

Recapture whichever `demo/*/screenshot*.png` changed first
(`.github/SCREENSHOT_CONTRIBUTION.md`), then run this — it reads those files,
it does not capture them itself.
