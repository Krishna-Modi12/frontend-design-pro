# `demo/landing-page` — Bellwether

A light editorial landing page for **Bellwether**, a fictional tool that rehearses
a pending database schema change against a mirror of production traffic and
reports what it would lock before it reaches the primary. It is sample output:
the page the pack produces from the prompt recorded in
[`docs/DEMO_PROMPTS.md`](../../docs/DEMO_PROMPTS.md), built under the pack's own
rules, with nothing on it hand-waved.

Bellwether does not exist. The quotes on the page are invented, the operating
figures are demo content, and the page says so on itself.

## Why this page is dark

The anti-slop wall bans three AI-design defaults **unless the brief asks for
them**, and one of them is near-black with a single bright acid accent. This
page has now been all three things: near-black with an acid accent, then light
porcelain, now near-black with a deep cobalt. That history is the point rather
than an embarrassment — it separates two things that look identical in a diff
and are not the same act.

The first version's brief asked for "near-black background, acid-green
accent," so the wall permitted it, no rule was broken, and the result still
looked like every generated developer-tool page on the internet — the
exemption was used as somewhere to arrive at without deciding anything. The
version that replaced it declined the exemption outright and went light
instead, which was a real decision, just not the one that shipped: the current
palette is near-black again, but for the opposite reason — a deep cobalt at
L=55% rather than an acid neon (which lives high in lightness *and* high in
chroma), every pair measured on three surfaces rather than eyed, one hue for
every neutral, and density and motion carrying the page instead of a bright
colour doing it alone. The other two defaults stay declined outright: no
cream, no serif, no terracotta anywhere.

**Taking a documented exemption is not the same as making a decision.** That
is the whole lesson of this demo. Reasoning and every measured contrast ratio
are in [`tokens.css`](tokens.css) — that file, not this section, is the
source of truth if the two ever disagree again.

## Run it

```bash
cd demo/landing-page
npm install
npm run dev            # http://localhost:3000
```

```bash
npm run typecheck      # tsc --noEmit, strict, with noUncheckedIndexedAccess
npm run build          # server build — what `next start` and the harnesses need
npm start
```

The parent repo installs none of these dependencies. This app has its own
`package.json` and its own lockfile, and `demo/tsconfig.json` excludes it from
the stub-typed regime the other demos use, so it type-checks against real
vendor typings.

## Five things that will bite you

**The static export is opt-in, and must stay that way.**

```bash
NEXT_OUTPUT_EXPORT=1 npm run build     # static export in out/
```

`tools/screenshots/lib/next-server.mjs` starts every demo with `next start`, and
`next start` refuses to run at all against an exported build. An unconditional
export takes down `npm run screenshots` and `npm run demos:verify` together —
the only two checks in this repo that render anything. Everything else reads
source.

The other half of that problem is solved rather than avoided: an export drops
*dynamic* route handlers, so `/api/site/overview` would 404 and leave the page in
its error state permanently. The handler is `force-static`, so Next evaluates it
at build time and writes the response into the output. `next dev` still re-reads
`screenshot-fixture.json` per request — verified, not assumed — so editing the
fixture still shows up on reload.

**A deployed build serves from a sub-path, and `fetch` does not know that.**
Next rewrites its own asset URLs from `basePath` but not the URLs you hand to
`fetch`. `app/page.tsx` reads `NEXT_PUBLIC_BASE_PATH` for exactly this reason; a
root-anchored `/api/site/overview` would 404 under a sub-path deploy and render
as a convincing imitation of a broken endpoint. `next.config.ts` takes the
private `NEXT_BASE_PATH` — a client component can only read the public one.

**PostCSS names `@tailwindcss/postcss`, not `tailwindcss`.** The plugin moved out
of the main package in Tailwind v4; the v3 key fails the build outright. There is
no `autoprefixer` either — v4 prefixes through Lightning CSS.

**`tokens.css` is separate from `lib/tokens.ts`, and the split is load-bearing.**
`@theme` is a Tailwind compiler directive, not CSS. It has to live in a stylesheet
the build reads, or every utility built from it — `bg-surface-page`,
`text-ink-muted`, `ring-accent` — silently resolves to nothing, with no error
anywhere. `lib/tokens.ts` carries only plain CSS that is valid at runtime, and
reads the palette back as `var(--color-*)` rather than restating it.

Lifting the palette into another project means taking `tokens.css` and importing
it **after** Tailwind. Import order in `app/globals.css` is deliberate and
commented.

**Fraunces is imported as `full.css`, and that is not interchangeable with
`index.css`.** The display face is chosen for its axes — `opsz` left on automatic
so optical sizing tracks the rendered size, `SOFT` and `WONK` pinned to 0 so it
reads as an editorial serif rather than a novelty one. Only the "full" build
carries those axes; `index.css` ships weight alone, and the
`font-variation-settings` in `lib/tokens.ts` would silently do nothing. The
italic file is imported too, because the headline uses a real italic rather than
a sheared roman — a synthesised italic on a high-contrast serif at display size
is obvious, and invisible to every gate in this repo.

## Where the page's own rules come from

Every constraint the page holds itself to is one the pack enforces on its
examples, and the suite runs on this directory too:

```bash
python scripts/test_constraints.py --dir demo --recursive --project
node scripts/parser_constraints.js demo/landing-page/components/*.tsx
```

The visible ones: no equal-height card grid — the bento runs 3+3 over 3, then
2+4, then 6, so no two rows share a shape, and the metric strip sits on a
`2fr 1fr 1fr 1fr` track; OKLCH only, no hex; an editorial serif and a grotesque
rather than Inter; the dynamic viewport unit rather than the static one; ease-out
on every transition; `tabular-nums` on every figure; a real fetch with four real
states rather than a `setTimeout` skeleton; `forwardRef` on the one interactive
control that needs it rather than on every wrapper.

One of those checks caught a real violation during this rebuild, and it is worth
knowing about before you write a comment here: **RES-03 is a regex over source,
so naming a banned utility in prose reads as using it.** A comment in `Hero.tsx`
explaining why the static viewport height is banned contained the class name, and
failed the suite — and because Tailwind scans comments for class names too, it
had also emitted a real, unused `min-height: 100vh` rule into the stylesheet.

The figures come from [`screenshot-fixture.json`](screenshot-fixture.json), served
by the demo's own `/api/site/overview`, so the capture is deterministic and a
recapture only moves pixels when the UI actually changed.

**No figure on this page describes `frontend-design-pro`.** A version before this
one quoted the pack's own counts and two of them drifted — it rendered "Six of 53"
against a real count of 59, and a gate count that was one behind, on a screenshot
linked from the repo README. A page about a fictional product has nothing to keep
in step.

That does cost something. Gate 11 reads this directory for `<number> <noun>`
pairs, and the nouns it watches are ordinary vocabulary for a database tool — a
foreign-key *constraint* is the obvious thing this product would talk about, and
writing a count next to that word here would be read as a claim about the pack
and fail the build. The copy says "checks", "rules" and "relations" instead.

## Recapture

```bash
npm run screenshots -- landing-page
```

1920×1080 above the fold plus a full-page pass, quantised under a 500 KB cap.
Details in [`.github/SCREENSHOT_CONTRIBUTION.md`](../../.github/SCREENSHOT_CONTRIBUTION.md).
