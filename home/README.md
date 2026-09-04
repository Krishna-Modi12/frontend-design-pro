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

## Why this palette, why one lit object

The design brief this page was rebuilt from asked for a warm-editorial ground
and a terracotta accent. The ground stayed; the accent did not, and
[`tokens.css`](tokens.css) carries the three measurements that retired it — it
was out of the sRGB gamut, it was ΔE 0.085 from the page's own danger colour,
and it was most of a palette this pack's wall tells agents not to reach for.
It is a marine blue now. The hero has been through four shapes: a canvas
particle-typography hero, a Three.js shader-mesh background, a single WebGL
object extruded from the pack's own reference tree, and now that same corpus
drawn flat. All of it is checked against this pack's own rules before shipping,
not just against a brief:

- Every token in [`tokens.css`](tokens.css) is measured, not eyed — four pairs
  in the original brief's values failed WCAG AA and were corrected (`text-muted`
  moved from 65% to 50% lightness; the footer's dark section needed its own
  `ink-invert` pair; `border` needed a second, darker `border-strong` for
  control boundaries, since the decorative border alone clears nothing at
  WCAG 1.4.11's 3:1).
- **The hero is the reference corpus, drawn to scale.**
  [`components/HeroCorpus.tsx`](components/HeroCorpus.tsx) draws one mark per
  `skills/*/references/*.md`, width proportional to that file's real token
  count, flowing and wrapping like a page of set type with a wider gap between
  skills so the 19 groups read as paragraphs. The data comes from
  `lib/data.generated.json`, whose generator asserts both the reference count
  and their token sum against `scripts/check_figures.py --truth` before
  writing — so the drawing cannot disagree with the figures printed beside it.
  One mark is lit: the single reference this pack would load to build a page
  like this one. Point at any other and it lights instead, and the caption
  prices it — which is the architecture demonstrated rather than asserted.
- **The WebGL object it replaced is gone, and so is `three`.** That object had
  the same data and the same idea, and it did not survive contact with a
  reader: it rendered as an anonymous grey brick with no material and no
  ground, its 1px strata were sub-pixel at most sizes and shimmered, and
  nothing about it was legible *as* the corpus — you could not tell it was 119
  files, tell one from another, or read the claim the sentence beside it was
  making. The concept was never the problem; the medium was. Removing it took
  three components and ~730 lines with it, dropped `three` and `@types/three`
  from this app's dependencies entirely, and cost the page nothing it was
  actually communicating.
- **It is one image to a screen reader, not 119 tab stops.** A hero that
  inserts 119 focusable nodes ahead of the primary action is hostile whatever
  its intentions, so the figure carries a text alternative stating the real
  numbers and the hover is a pointer-only enhancement. It is also entirely
  server-rendered, which the old one could not be: `next/dynamic` with
  `ssr: false` held it out of the HTML by construction.
- **The routing path in `#how-it-works` draws itself as you scroll.**
  [`components/RouteStroke.tsx`](components/RouteStroke.tsx) — three plateaus
  stepping down through the three cards, because narrowing is what that
  section describes. It replaced a 1px `div` whose width was scrubbed
  0→100%: the mechanic was already right, it just had no shape. Same
  ScrollTrigger, no second animation runtime.

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
