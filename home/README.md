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

## Why this palette, why particles

The design brief this page was rebuilt from asked for a warm-editorial ground,
a terracotta accent, and a hero headline rendered as canvas particle
typography. All three are checked against this pack's own rules before
shipping, not just against the brief:

- Every token in [`tokens.css`](tokens.css) is measured, not eyed — four pairs
  in the brief's original values failed WCAG AA and were corrected (`text-muted`
  moved from 65% to 50% lightness; the footer's dark section needed its own
  `ink-invert` pair; `border` needed a second, darker `border-strong` for
  control boundaries, since the decorative border alone clears nothing at
  WCAG 1.4.11's 3:1).
- The particle field in [`components/HeroCanvas.tsx`](components/HeroCanvas.tsx)
  scales its particle count from the viewport and `navigator.deviceMemory`,
  never a fixed number. `skills/canvas-typography/SKILL.md` — the pack's own
  rule for this exact pattern — names "a particle count fixed at 5,000
  regardless of viewport" as its own anti-pattern in as many words. It also
  reads the real `<h1>`'s computed font, size and position at build time
  (`sourceRef`, not an independently guessed size), the fix for a real
  alignment bug: the first version sized its own text from a guessed
  `clamp()` formula that did not match the real heading, and rendered as a
  misaligned near-duplicate sitting behind it.

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
