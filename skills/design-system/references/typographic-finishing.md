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
- [Scene defaults — where the scale starts](#scene-defaults--where-the-scale-starts)
- [Fallback matching — the real fix for font-swap shift](#fallback-matching--the-real-fix-for-font-swap-shift)
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
Cross-platform scale roles cross-checked against `react-native-typography` (MIT,
Hector Garcia). The scene-defaults baselines are adapted from
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
