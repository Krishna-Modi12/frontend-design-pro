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
It is a marine blue now. The hero has been through five shapes: a canvas
particle-typography hero, a Three.js shader-mesh background, a single WebGL
object extruded from the pack's own reference tree, that same corpus drawn flat
as a block of set type, and now that block closed into a ring. All of it is
checked against this pack's own rules before shipping, not just against a
brief:

- Every token in [`tokens.css`](tokens.css) is measured, not eyed — four pairs
  in the original brief's values failed WCAG AA and were corrected (`text-muted`
  moved from 65% to 50% lightness; the footer's dark section needed its own
  `ink-invert` pair; `border` needed a second, darker `border-strong` for
  control boundaries, since the decorative border alone clears nothing at
  WCAG 1.4.11's 3:1).
- **The hero is the reference corpus, drawn to scale, closed into a ring.**
  [`components/HeroCorpusRing.tsx`](components/HeroCorpusRing.tsx) draws one
  tick per real file under a skill's `references/` directory, tick length
  scaled by that file's real token count, with a wider angular gap at each of
  the 19 skill boundaries so the groups read as groups. The data comes from
  `lib/data.generated.json`, whose generator asserts both the reference count
  and their token sum against `scripts/check_figures.py --truth` before
  writing — so the drawing cannot disagree with the figures printed beside it.
  One tick is lit and breaks the ring's outer edge: the single reference this
  pack would load to build a page like this one. Point at any other and the
  read head travels to it and prices it — which is the architecture
  demonstrated rather than asserted.

  **Why a ring rather than the block it replaces.** The sentence beside it
  states a *ratio* — one skill loads, the rest stay on disk — and a ratio is a
  part against a whole. A closed loop shows a whole without printing a scale
  under it; a flush-left block has a beginning and an end and shows neither.
  The ticks hang inward from a fixed outer edge rather than growing outward
  from an inner one, which is the difference between a defined body and a
  sunburst: grown outward, 119 files ranging from 614 to 16,369 tokens draw a
  spiky asterisk with no boundary.

  **The loop is traversed once, not spun.** A read head circles the ring on
  load and comes to rest on the lit tick, which is what a request does to this
  corpus. It is one CSS transition on one `stroke-dashoffset`, so the page
  schedules no work of its own once it lands — this app has already measured
  what a perpetual idle rotation costs, and nothing here animates at rest.

  **Past that, the reader drives it.** Bound to scroll, the head completes one
  further turn across the hero's exit and the ring closes as the section does.
  The mechanic is Skiper UI's `Skiper19` — a stroke scrubbed against scroll
  progress — and it cost no dependency, because this ring and `RouteStroke`
  were already built on the same normalised `pathLength={1}` primitive. Its
  own arrival is `framer-motion`, `scrollYProgress: any` and four hex literals,
  measured here as `MOTION-01`, `TS-01-AST` and `COL-04`; none of that was
  needed to take the idea. The driver is rAF-coalesced (`ANI-04`), quantised
  to 200 steps so a scroll cannot re-render 119 ticks per frame, and not
  attached at all under `prefers-reduced-motion`.

  **The hero has a light now, and it is CSS.** The brief was React Bits'
  `<Beams />`; the shipped answer is
  [`components/backgrounds/HeroBeams.tsx`](components/backgrounds/HeroBeams.tsx)
  — two crossed `repeating-linear-gradient` rakes and one soft source, every
  stop a `color-mix()` off `--color-accent`, so all four worlds tint it and no
  hex appears. The original wants `three`, `@react-three/fiber` and
  `@react-three/drei`, which this app removed for the reason recorded below,
  and fails the parser gate as a BLOCKER on `3D-03` twice. It is masked clear
  of the type column and does not render below `lg:` — both structural, both
  the reason the radial `bg-page` scrim that used to cover the old hero
  gradient did not have to come back.

  **The bug this rebuild exists to fix, recorded because the gates all passed
  through it.** `Hero.tsx` ran `gsap.from(marks, { opacity: 0, ... })` over all
  119 marks while the component set the same property from React and
  transitioned it in CSS. Two systems owned one property and the tween lost:
  measured on the shipped production build, **0 of 119 marks were visible at
  500ms and still 0 at 8s**. Every reader with motion enabled met an empty
  half-hero beside a caption describing marks that were not there. Under
  `prefers-reduced-motion` the hero's effect returns before it reaches the
  corpus, so the path that worked was the one nothing exercised. The rule now
  is **one owner per property**: no animation library touches a tick, and
  `pages:verify` asserts the marks are on screen rather than merely present.
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
                         # axe, overflow, reduced motion, the router, the checker,
                         # and the hero's five corpus assertions
```

It is a repo-root script, not a `home/` one — the `cd home` under "Run it" above
does not apply here, and running it from inside `home/` fails with a missing
script.

**It runs in CI now**, in the blocking `home-renderer` job. Until that job
existed this harness had no caller at all: `home/`'s entire CI footprint was the
vitest router suite and the informational screenshot diff, so everything this
checks — hydration, axe on the rendered DOM, overflow at three widths in LTR and
RTL — was green by never being asked. Run it locally anyway before pushing
anything that touches this app; it is a good deal faster than waiting for the
runner.

## Recapture

```bash
npm run screenshots -- home
```

## The showcase thumbnails

`public/showcase/*.png` (the four `SectionShowcase` cards, two of them with a
`-full` companion the static cards link to) are not captured from this app —
they are resized/compressed copies of the four screenshots `demo/*/` already
ships and README already links, sized for a carousel slide instead of a
full above-the-fold hero. They are the first raster images this app has ever
shipped, so they follow the same rule as every other screenshot in this repo:
regenerated by a committed script, never hand-edited or resized ad hoc.

```bash
npm run showcase-thumbs
```

Recapture whichever `demo/*/screenshot*.png` changed first
(`.github/SCREENSHOT_CONTRIBUTION.md`), then run this — it reads those files,
it does not capture them itself.
