# Typographic Finishing

The scale in `SKILL.md` rule 7 gets the sizes right. This file is about
everything after that — the levers that separate type that is *correct* from
type that looks *set*. Load it when the layout is built and the text still looks
subtly wrong, when a heading wraps badly, when a webfont swap shifts the page,
or when long-form copy needs to read for more than ten seconds.

For CJK and mixed-script text, `references/cjk-typography.md` owns the
fallback-chain order, kinsoku rules and font budget. This file is script-neutral
and stops where that one starts.

## Contents

- [Measure — the number that matters most](#measure--the-number-that-matters-most)
- [Trim the box, align the ink](#trim-the-box-align-the-ink)
- [Wrapping — `balance` and `pretty` are not interchangeable](#wrapping--balance-and-pretty-are-not-interchangeable)
- [Scale ratios, and pairing leading to size](#scale-ratios-and-pairing-leading-to-size)
- [Baseline rhythm — snapping the scale to a grid](#baseline-rhythm--snapping-the-scale-to-a-grid)
- [Scene defaults — where the scale starts](#scene-defaults--where-the-scale-starts)
- [Fallback matching — the real fix for font-swap shift](#fallback-matching--the-real-fix-for-font-swap-shift)
- [The font payload — format, subsetting, self-hosting](#the-font-payload--format-subsetting-self-hosting)
- [Optical sizing](#optical-sizing)
- [OpenType features, via the high-level properties](#opentype-features-via-the-high-level-properties)
- [Long-form copy and the `prose` plugin](#long-form-copy-and-the-prose-plugin)
- [Decoration — gradient, glow and shadow on type](#decoration--gradient-glow-and-shadow-on-type)
- [Details worth knowing but not shipping blind](#details-worth-knowing-but-not-shipping-blind)
- [Check before you ship](#check-before-you-ship)
- [Sources](#sources)

---

## Measure — the number that matters most

**65 characters is the working default**, expressed in `ch` so it tracks the font
rather than the viewport:

```css
.prose { max-inline-size: 65ch; }
```

The readable band is **45–75 characters**. Below 45 the eye returns too often and
rhythm breaks; above 75 it loses the line on the return sweep. `ch` is the width
of the `0` glyph, so a wider face automatically gets a narrower column — which is
the behaviour you want and the reason not to write `max-width: 680px`.

Two things to know before reaching for a utility class:

- **Measure applies to running text, not to layout.** A hero headline, a nav, a
  table and a card grid all have their own logic. Clamping a whole page to 65ch
  is the most common misapplication.
- **Set it on the text container, not an ancestor.** A `max-inline-size` on a
  wrapper that also holds full-bleed images crops the images to the measure.

## Trim the box, align the ink

Every line of text sits in a box taller than the letters. The font's ascent and
descent metrics, plus half-leading split above and below, mean a heading centred
by its box is *not* centred by its letterforms. This is why a button label looks
1px high, why an icon beside text never quite lines up, and why designers add
`margin-top: -2px` and cannot explain it.

`text-box` removes the difference by trimming to real typographic edges:

```css
h1 {
  /* shorthand: trim both edges, from cap height to alphabetic baseline */
  text-box: trim-both cap alphabetic;
}

.button-label {
  text-box-trim: trim-both;      /* longhand equivalent */
  text-box-edge: cap alphabetic;
}
```

`cap alphabetic` is the right pair for most UI: the box now runs from the top of
a capital to the baseline, so vertical padding you set is the padding you see.
Use `ex alphabetic` when aligning to lowercase x-height instead — a lockup beside
body copy rather than beside a heading.

Chrome and Safari have shipped this; Firefox had not at the time of writing, so
treat it as an enhancement and keep the untrimmed layout usable:

```css
@supports (text-box: trim-both cap alphabetic) {
  h1 { text-box: trim-both cap alphabetic; margin-block: 0.5rem; }
}
```

The reason to care: no gate and no bounding-box audit can see optical
misalignment, because the box is exactly what the audit measures. Trimming makes
the box agree with the ink, which turns a judgement call into a declaration.

## Wrapping — `balance` and `pretty` are not interchangeable

| Value | Use on | What it does | Cost |
|---|---|---|---|
| `text-wrap: balance` | Headings, blockquotes, card titles, anything ≤ 4 lines | Evens line lengths so the last line is not a single word | Browsers cap how many lines they will balance (Chrome around six) — beyond that it silently does nothing |
| `text-wrap: pretty` | Body copy, paragraphs, long descriptions | Avoids orphans and rivers, improves the last line | Cheap enough for running text; implementations differ in ambition |

```css
h1, h2, h3, blockquote { text-wrap: balance; }
p, li                  { text-wrap: pretty; }
```

The failure to avoid is `balance` on body copy. It is specified for short blocks,
so on a long paragraph you get either no effect or a reflow cost for nothing.
Reach for `pretty` there instead.

Both are progressive enhancements — they change line breaks, never content, so
no fallback is needed. What *does* need care is combining them with a manual
`<br>`: a hard break plus balancing produces line lengths neither you nor the
browser intended. Pick one.

## Scale ratios, and pairing leading to size

A scale is a base size and a ratio. The ratio is the whole decision:

| Ratio | Name | Reads as | Fits |
|---|---|---|---|
| 1.125 | Major second | Tight, dense | Dashboards, data-heavy UI |
| 1.2 | Minor third | Calm, workmanlike | Product UI, documentation |
| 1.25 | Major third | Confident, standard | Marketing pages, most sites |
| 1.333 | Perfect fourth | Editorial, dramatic | Long-form, magazine layouts |
| 1.5 | Perfect fifth | Loud | Posters, single-message pages |
| 1.618 | Golden ratio | Very loud | Display only — collapses on mobile |

Two rules make a ratio survive contact with a real page:

1. **Leading moves inversely to size.** Body copy wants 1.5–1.7; a display
   heading wants 1.05–1.2. A single `line-height` across the scale gives airy
   headings and cramped paragraphs. This is why `SKILL.md` rule 7 pairs the two.
2. **Steep ratios need fluid sizing, not breakpoints.** At 1.333 and up, the
   desktop top end is unusable on a phone. `clamp()` interpolates continuously:

```css
h1 { font-size: clamp(2rem, 1.2rem + 4vw, 4.5rem); line-height: 1.1; }
```

Keep the `rem` term first inside `clamp()` so the value still responds to a
user's browser font-size setting. A pure `vw` middle term ignores it, which is an
accessibility regression that looks fine in every screenshot.

The scale itself is one line — `size = base × ratio^step`, with `step` counting
levels away from body copy, negative for anything smaller:

```ts
const ms = (step: number, base = 16, ratio = 1.25) => base * ratio ** step;
// ms(0) → 16   ms(1) → 20   ms(2) → 25   ms(3) → 31.25   ms(-1) → 12.8
```

**A "ratio" quoted by a tool may not be the per-level ratio**, and reading one as
the other is how a scale ends up absurd. `typography.js` themes advertise ratios
of 2, 2.25, even 2.45, which under the formula above would put `h3` above 90px.
They are not per-level: it assigns each heading a *fractional* exponent —
`h1 = r^1`, `h2 = r^0.6`, `h3 = r^0.4`, `h4 = r^0`, `h5 = r^-0.2`, `h6 = r^-0.3`
— so the number is the span from body to `h1`, spread across six levels. At
`r = 2` that is a sane 32px `h1` and an `h4` identical to body. Check which
convention a ratio belongs to before porting it into a table like the one above.

## Baseline rhythm — snapping the scale to a grid

A ratio picks sizes. It says nothing about where the lines *land*, and that is
the part a reader notices without being able to name it: two columns of text
side by side, one with a heading in it, and the body lines no longer agree
across the gutter.

The fix is to stop treating leading as a property of the element and treat it as
a multiple of one number for the whole page. Pick a rhythm unit — body size
times body leading, so 16px at 1.5 gives 24px — and round every element's line
box **up to the nearest half of it**:

```ts
const RHYTHM = 24;  // 16px body × 1.5

function leadingFor(fontSize: number, minPadding = 2): number {
  let lines = Math.ceil((2 * fontSize) / RHYTHM) / 2;   // nearest half-line, up
  // A cramped line — ascenders nearly touching the box — gets one more half.
  if (lines * RHYTHM - fontSize < minPadding * 2) lines += 0.5;
  return lines * RHYTHM;
}
// 16 → 24    25 → 36    31.25 → 36    48 → 60
```

Half-lines rather than whole ones are what makes this usable: whole-line
rounding forces a 25px heading to 48px of leading, which is why strict baseline
grids got a reputation for looking gappy. The `minPadding` guard is the other
half — without it a size landing just under a boundary (a 34px heading against a
36px box) gets a line box with almost no room above the ascenders, technically
on-grid and visibly wrong.

Two caveats before you reach for it. It is a **fixed-size** technique: the
moment a heading uses `clamp()`, its computed size is a viewport function and
cannot be snapped ahead of time, so grid-align the body and the small headings
and let fluid display type sit outside the grid. And it constrains margins too —
vertical space between blocks has to be a multiple of the same unit, or the
snapping buys you nothing past the first heading.

Worth it for long-form editorial and anything multi-column. Not worth it for
dashboards, where content is boxed and nothing is meant to align across a
gutter.

## Scene defaults — where the scale starts

A ratio does not tell you the base size. That comes from the scene: how far the
reader is sitting, how long they intend to stay, and how much has to be legible
at once. These are starting points to argue with, not a specification.

| Scene | Largest type | Section / card title | Body | Body leading | Density |
|---|---|---|---|---|---|
| Marketing / landing | 3.5–5rem | 2–2.5rem | 1–1.125rem | 1.5–1.6 | Low — copy alternates with whitespace |
| Portfolio / showcase | 4–6rem | 1.5–2rem | 0.95–1rem | 1.5–1.6 | Very low — images carry the page |
| Blog / docs / long-form | 2–2.5rem | 1.25–1.5rem | 1–1.0625rem | 1.7–1.8 | High — leading and paragraph gaps do the breathing |
| App UI / admin | 1.25–1.5rem | 1–1.125rem | 0.875rem | 1.5 | Medium — function first, whitespace second |
| Dashboard / analytics | 1.5rem | 0.875–1rem | 0.8125–0.875rem | 1.4–1.5 | High — borders and grid lines separate, not space |
| Presentation / courseware | 3–3.5rem | 1.5rem | 0.82–0.9rem | 1.5 | Medium-high — card edges do the organising |

The scene is a property of a *region*, not of a site. A pricing table inside a
marketing page is App UI density; a long explainer inside a dashboard is
long-form. Read the table per block, not once per project.

Four things it does not say on its face:

1. **Leading below 1.6 is a scene exemption, not a general licence.** `SKILL.md`
   rule 7 governs *running* copy — paragraphs a reader moves through. A table
   cell, a KPI label, a form label is a fragment read in a single fixation, and
   1.4 there is correct where 1.7 spends vertical space the scene needs. The
   moment a dense surface grows an actual paragraph — an empty state, an
   explainer, a tooltip body — that paragraph goes back above 1.6.
2. **Fluid sizing belongs to the top three rows.** `clamp()` earns its place when
   the same text has to work at 375px and at 1920px. A dashboard is read at a
   desk at a fixed distance, so viewport-scaled type there renders the same table
   at two sizes on two monitors for no reason a user can name. Fix the sizes and
   let the grid reflow instead.
3. **In dense scenes the number outranks the body.** A metric runs 1.5–2.5rem at
   weight 700–800 while its label sits near 0.75rem uppercase with positive
   tracking. The density comes from that *gap*, not from shrinking everything
   uniformly — a dashboard set at one size reads as a spreadsheet. Every figure
   that updates in place needs `tabular-nums`.
4. **Email is deliberately absent.** It is a different rendering model — `px`
   units, inline styles, table layout, and a system stack in which Arial is
   correct rather than lazy. `../../platform/references/email-templates.md` owns
   it, including the dark-mode and client-support caveats.

## Fallback matching — the real fix for font-swap shift

`font-display` chooses *when* the swap happens. It cannot stop the page moving,
because the fallback and the webfont have different metrics. Overriding those
metrics is what stops the movement:

```css
@font-face {
  font-family: "Manrope Fallback";
  src: local("Arial");
  size-adjust: 103%;          /* scale the fallback's glyphs to match */
  ascent-override: 95%;
  descent-override: 25%;
  line-gap-override: 0%;
}

:root { --font-sans: "Manrope", "Manrope Fallback", system-ui, sans-serif; }
```

Now the fallback occupies the same space as the real face and the swap is
invisible. The percentages come from comparing the two fonts' metrics, not from
guessing — Next.js computes them for you when you use `next/font`, which is the
main practical reason to use it.

Pick the strategy to match the role:

- **`font-display: swap`** with metric overrides — body text. Content is readable
  immediately and nothing shifts.
- **`font-display: optional`** — a display face you can live without on a cold
  load. The browser uses the fallback for this visit and caches the webfont for
  the next, so there is no shift at all.
- **Avoid `font-display: block`** for anything above the fold. It hides text
  while the font loads, which is a blank hero on a slow connection.

If the type is drawn to a canvas or measured with `measureText`, the swap also
invalidates your measurements — `skills/canvas-typography/references/canvas-2d-typography.md`
covers awaiting `document.fonts.ready` before sampling.

## The font payload — format, subsetting, self-hosting

The previous section is about how the swap *looks*. This is about how many
bytes cross the wire, which is the other half of a webfont's cost.

**Format is settled: `woff2` only.** Every browser in use supports it and it
compresses roughly 30% better than `woff`. Shipping `ttf`, `otf`, `eot` or a
`woff` fallback to the web is dead weight — one `src` entry, one file per face.

**Variable versus static is a measurement, not a default.** One variable file
with a `wght` axis replaces four to seven static weights and is usually the
smaller download once you use three or more:

```css
@font-face {
  font-family: "Sohne";
  src: url("/fonts/sohne-var.woff2") format("woff2");
  font-weight: 100 900;         /* the whole axis, in one file */
  font-display: swap;
}
```

The catch is that the entire axis range ships even if the design uses two
weights. A site that genuinely only needs Regular and Bold can come out lighter
with two subsetted static files. Weigh the actual two options; do not assume
the variable font wins.

**Subset to the scripts you render.** A face covering Latin, Cyrillic, Greek
and Vietnamese is 100–300 KB of `woff2`; the Latin-only subset is often under
50 KB. Subset with `glyphhanger` or `fonttools`, or take the CDN's subset
parameters. `next/font` subsets to `latin` by default — widen it deliberately,
not reflexively.

**`unicode-range` makes subsets lazy.** Split one family into per-script
`@font-face` blocks, each with a `unicode-range` descriptor; the browser
fetches a subset only when the page actually contains a glyph in its range.
This is how Google Fonts' served CSS is structured, and it is worth
reproducing when self-hosting a multi-script family.

```css
@font-face {
  font-family: "Sohne";
  src: url("/fonts/sohne-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+2000-206F;
}
@font-face {
  font-family: "Sohne";
  src: url("/fonts/sohne-cyrillic.woff2") format("woff2");
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1;
}
```

**Self-host rather than link Google Fonts.** The hosted route costs a
render-blocking stylesheet request and a second connection to
`fonts.gstatic.com`, and in some jurisdictions the client-IP transfer to
Google is a compliance question — a 2022 German court ruling made that
concrete. `next/font/google` avoids both: it downloads the files at build time,
serves them from your origin, and computes the metric overrides from the
previous section for you. Self-host directly if you are not on Next.js;
`preconnect` to a font host only when you truly cannot self-host.

**Preload the one face above the fold, and no more.**

```html
<link rel="preload" href="/fonts/sohne-latin.woff2" as="font"
      type="font/woff2" crossorigin>
```

`crossorigin` is mandatory even for a same-origin font — fonts are always
fetched in CORS mode, and a preload without the attribute fetches the file a
second time. Every preload competes with the LCP image for early bandwidth, so
one or two critical faces, never the whole family.

**Count the weights you actually render.** Loading Light, Regular, Medium,
SemiBold, Bold and Black and using three of them ships half the payload for
nothing. The audit is: list every `font-weight` and `font-style` the CSS
produces, and delete the `@font-face` rules nothing hits.

## Optical sizing

Variable fonts with an `opsz` axis carry different letterform designs for
different sizes: more contrast and tighter spacing when large, sturdier strokes
and looser spacing when small. Browsers apply it automatically from the computed
`font-size`:

```css
body { font-optical-sizing: auto; }                  /* default, keep it */
.caption { font-variation-settings: "opsz" 8; }      /* force, only with reason */
```

Leave it on `auto`. Forcing `opsz` away from the rendered size is a deliberate
choice — a small label drawn with a display optical size, for instance — and it
needs a reason, because the default is already correct.

## OpenType features, via the high-level properties

Prefer `font-variant-*` over raw `font-feature-settings`. The high-level
properties inherit and compose; `font-feature-settings` is all-or-nothing and
silently drops any feature you did not restate.

| Want | Write |
|---|---|
| Digits that align in columns | `font-variant-numeric: tabular-nums` |
| Fractions in a recipe or spec | `font-variant-numeric: diagonal-fractions` |
| Small caps that are really small caps | `font-variant-caps: all-small-caps` |
| No ligatures in code | `font-variant-ligatures: none` |
| A stylistic set the face documents | `font-feature-settings: "ss01"` (no high-level equivalent) |

**Tabular figures are the one that is a correctness issue, not taste.** Any
number that changes in place — a timer, a live total, a table column, a chart
axis — jitters with proportional digits, because `1` is narrower than `8`. Set
`tabular-nums` on the element and the jitter stops.

## Long-form copy and the `prose` plugin

For article, docs and blog bodies rendered from markdown or a CMS, the
`@tailwindcss/typography` plugin is the fastest correct answer: it styles raw
HTML you do not control. In Tailwind v4 it is installed from CSS, not from a
JavaScript config:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

What you get, and the four things worth knowing:

- **Sizes** are `prose-sm` · `prose-base` · `prose-lg` · `prose-xl` ·
  `prose-2xl`. Each redeclares `font-size` and an `em`-based vertical rhythm, but
  **the measure is not one of them** — `max-width: 65ch` is declared once, on the
  base `prose` class, and no size variant overrides it. The column holds at 65
  characters at every size; only its pixel width moves, as a side effect of `ch`
  being font-size-relative.
  The rhythm is where they genuinely differ, and not by a constant. Body leading
  is authored in absolute terms on a 4px grid — 14/24, 16/28, 18/32, 20/36,
  24/40 — so the *ratio* drifts across the ramp (1.714, 1.75, 1.778, 1.8, then
  back to 1.667 at the top, where large type wants less). That is why a raw
  `text-lg` on `prose-base` is not `prose-lg`: `em` spacing rescales
  proportionally, giving 31.5px leading and 22.5px paragraph gaps where
  `prose-lg` intends 32 and 24. Close enough to look almost right, off-grid
  enough to look wrong next to anything aligned. Change the variant, not the
  font size.
- **`prose-invert`** is the dark-mode variant. Pair it with your theme strategy
  (`dark:prose-invert`), not with a hand-written colour override.
- **`not-prose`** opts a subtree out. Any component you render *inside* an
  article — a chart, a pricing table, an embedded demo — needs it, or the plugin
  restyles its internals from the outside.
- **`prose-<element>:` modifiers** target one element (`prose-headings:font-display`,
  `prose-a:text-brand`). Use these to reconcile the plugin with your tokens.

The honest caveat: the plugin ships its own opinionated scale, so it *competes*
with the token system in `core/design-tokens.md`. Either drive it from your
tokens through element modifiers, or do not use it — running both unreconciled is
how a site ends up with two type systems.

## Decoration — gradient, glow and shadow on type

`TYP-03` settles the easy half: `bg-clip-text` on body-sized text is a defect,
because clipping sets the computed colour to `transparent` and that both destroys
contrast and defeats every contrast checker, which then measures a ratio against
a colour no reader sees. The rule calls the same effect legitimate on a display
heading — but "display-only" is a floor, not a reason. This section is the rest
of the decision.

**Gradient text needs all four to be true**, not just the size one:

1. The element is the largest type on the page — a hero `h1`, or the display
   heading that opens a section. One per screen.
2. It renders at roughly 60px or more. Below about 40px the gradient's own
   lightness range starts eating the contrast the flat colour had.
3. The aesthetic direction already carries luminous or high-energy signals. On a
   restrained direction — gallery-white, editorial, Swiss — a gradient heading is
   the one element arguing with everything else, and it reads as a mistake rather
   than a choice.
4. There is a real colour underneath it.

That last one is the part that gets skipped:

```css
.display-gradient {
  color: var(--color-brand);          /* paints if the clip never lands */
  background-image: linear-gradient(135deg, var(--color-brand), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
}
@supports (background-clip: text) or (-webkit-background-clip: text) {
  .display-gradient { -webkit-text-fill-color: transparent; }
}
```

Declaring `color` first and moving `-webkit-text-fill-color: transparent` behind
`@supports` means a failed or unsupported paint leaves readable brand-coloured
text instead of an invisible heading. Writing the `transparent` unconditionally —
which is how the snippet is usually copied — makes the failure mode a blank page.

The pack's own wall still applies on top: the purple → pink → blue ramp is banned
regardless of size, because it is the default every generator reaches for. Derive
the stops from the theme's own hues.

**Text-shadow has three shapes that are defensible** and one arrangement that is
not:

| Situation | Move | Why it works |
|---|---|---|
| Display type on a dark surface | `text-shadow: 0 0 40px oklch(from var(--color-brand) l c h / 0.4)` | Reads as the letterform emitting light, not as a drop shadow. Needs a genuinely dark surface — on mid-grey it is just fog. |
| A flat, graphic, high-energy direction | Layered hard offsets, no blur: `3px 3px 0 var(--color-accent), 6px 6px 0 oklch(0% 0 0 / 0.15)` | The zero blur is what keeps it a deliberate print device rather than a bevel. |
| Serif display on a light warm surface | `0 2px 8px oklch(0% 0 0 / 0.12)` | Lifts the heading off the page by about a millimetre. Any stronger and it becomes 2010. |

Never stack a shadow onto gradient text. Both are ways of saying *this line is
the important one*, and running them together reads as neither — it reads as
effects. And never put either on body copy: a shadow at 16px does not emphasise
text, it defocuses it, which is indistinguishable from a rendering bug.

**Smaller decoration, briefly.** A section eyebrow — the 11–13px uppercase label
with open tracking — takes a `border-bottom` rule or a background highlight,
never a gradient or a shadow; at that size both only blur it. Links move on
`color` and `text-underline-offset` (`0.15em` clears most descenders) with
`text-decoration-thickness: from-font`, never on shadow.

| | Restrained | Luminous / tech | Warm professional | High-energy |
|---|---|---|---|---|
| Hero `h1` gradient | no | yes | no | yes |
| Hero `h1` shadow | no | glow | soft | layered |
| Section display gradient | no | optional | no | yes |
| Section display shadow | no | no | soft | optional |
| Anything on body copy | no | no | no | no |

## Details worth knowing but not shipping blind

- **`hanging-punctuation: first last`** pulls opening quotes into the margin so
  the text edge stays optically straight. Safari supports it; other engines had
  not at the time of writing. Pure enhancement, safe to set.
- **`initial-letter: 3 3`** makes a real drop cap that sinks into the paragraph
  rather than a float hack. Support is uneven — gate it behind `@supports`.
- **`font-palette`** recolours COLRv1 colour fonts. Genuinely niche; mentioned so
  it is not mistaken for the way to colour ordinary text.

## Check before you ship

- Body size and leading match the scene the *region* is in, not the scene the
  site is in — dense surfaces are not just the marketing page shrunk.
- Measure lands between 45 and 75 characters for every block of running text.
- Headings use `balance`, paragraphs use `pretty`, and neither is on the other.
- Any number that updates in place has `tabular-nums`.
- Every gradient heading declares a `color` before the clip, so switching
  `background-clip` off in devtools leaves readable text rather than a gap.
- No element carries both a gradient fill and a text-shadow.
- The webfont has a metric-matched fallback, so switching it off in devtools does
  not move the layout.
- `clamp()` middle terms include a `rem` component, so browser font-size settings
  still work.
- Every `text-box`, `hanging-punctuation` and `initial-letter` rule is an
  enhancement the layout survives without.

## Sources

Measure and the `prose` system from `@tailwindcss/typography` (MIT, Tailwind
Labs) — `65ch` is that plugin's own default. Scale-ratio naming and the
size/leading inverse from `typography.js` (MIT, Kyle Mathews); note that project
was last released in 2023, so its *math* is durable and its tooling is not.
The modular-scale formula and the ratio names are `modularscale-js`'s (MIT); the
fractional per-heading exponents that make a ratio of 2 survivable are
`typography.js`'s own `createStyles.js`, read directly rather than taken on
trust. The half-line rounding and cramped-line guard in *Baseline rhythm* are
the algorithm from `compass-vertical-rhythm` (MIT, Kyle Mathews) — that is
`typography.js`'s own rhythm dependency — reimplemented here in a few lines
rather than vendored, since the technique is the useful part and the package is
frozen at the same 2023 release. The two caveats on it, `clamp()` and margins,
are ours. Cross-platform scale roles cross-checked against
`react-native-typography` (MIT, Hector Garcia). The scene-defaults baselines are adapted from
`xiaopu-ai/web-design` (MIT), translated from the Chinese original and
reconciled with rule 7 rather than copied — the exemption note in that section
is ours, because the upstream table states the low leading without saying which
text it applies to. The gradient/shadow decision table is adapted from the
same repository's text-decoration rules; the `@supports` fallback, the
relative-colour syntax and the no-stacking rule are ours — upstream ships the
unconditional `-webkit-text-fill-color: transparent` whose failure mode is an
invisible heading. Variable-axis and experimental-type technique surveyed from
`typexperiments` (Pablo Stanley) and `awesome-typography` (CC0) — the former
publishes no licence, so it informed *what* to cover and no code was taken from
it. Everything above is written for this pack.
