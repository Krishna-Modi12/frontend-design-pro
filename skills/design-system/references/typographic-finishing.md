# Typographic Finishing

The scale in `SKILL.md` rule 7 gets the sizes right. This file is about
everything after that — the levers that separate type that is *correct* from
type that looks *set*. Load it when the layout is built and the text still looks
subtly wrong, when a heading wraps badly, when a webfont swap shifts the page,
or when long-form copy needs to read for more than ten seconds.

For CJK and mixed-script text, `references/cjk-typography.md` owns the
fallback-chain order, kinsoku rules and font budget. This file is script-neutral
and stops where that one starts.

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
  `prose-2xl`. They change more than `font-size` — the whole vertical rhythm and
  the measure scale together, which is why a raw `text-lg` on `prose` looks off.
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

## Details worth knowing but not shipping blind

- **`hanging-punctuation: first last`** pulls opening quotes into the margin so
  the text edge stays optically straight. Safari supports it; other engines had
  not at the time of writing. Pure enhancement, safe to set.
- **`initial-letter: 3 3`** makes a real drop cap that sinks into the paragraph
  rather than a float hack. Support is uneven — gate it behind `@supports`.
- **`font-palette`** recolours COLRv1 colour fonts. Genuinely niche; mentioned so
  it is not mistaken for the way to colour ordinary text.

## Check before you ship

- Measure lands between 45 and 75 characters for every block of running text.
- Headings use `balance`, paragraphs use `pretty`, and neither is on the other.
- Any number that updates in place has `tabular-nums`.
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
Hector Garcia). Variable-axis and experimental-type technique surveyed from
`typexperiments` (Pablo Stanley) and `awesome-typography` (CC0) — the former
publishes no licence, so it informed *what* to cover and no code was taken from
it. Everything above is written for this pack.
