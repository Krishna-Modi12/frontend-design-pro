# DESIGN.md Template

The authoring side of the DESIGN.md convention. `design-md-parser.md` covers the
other half — reading a supplied DESIGN.md and turning it into `@theme` tokens.
Use this file when you are the one *producing* the document: a design brief that
a later agent, or a later you, has to build from without guessing.

The value of the format is that it is a contract. Nine sections, none of them
optional, each holding runnable CSS rather than description — so "make it feel
premium" becomes a set of values something can check.

## Contents

- [The template](#the-template)
- [Rules for filling it in](#rules-for-filling-it-in)
- [Where this pack's rules override the template](#where-this-packs-rules-override-the-template)
- [Sources](#sources)

---

## The template

````markdown
# DESIGN.md

> {{one-sentence design statement}}

## 1. Visual Theme & Atmosphere

**Style**: {{style name}}
**Keywords**: {{5–8 design keywords}}
**Tone**: {{tonal description}} — NOT {{the opposite keywords}}
**Feel**: {{one sensory line, a comparison}}

**Interaction tier**: {{L1 refined static / L2 fluid interaction / L3 immersive}}
**Dependencies**: {{CSS only / GSAP + ScrollTrigger / GSAP + ScrollTrigger + Lenis}}

## 2. Color Palette & Roles

```css
:root {
  /* Surfaces */
  --color-background:      {{page background}};
  --color-surface:         {{cards and containers}};
  --color-surface-alt:     {{alternating sections}};
  --color-surface-hover:   {{hover surface}};

  /* Borders */
  --color-border:          {{default}};
  --color-border-hover:    {{hover}};

  /* Text */
  --color-text:            {{headings and emphasis}};
  --color-text-secondary:  {{body copy}};
  --color-text-tertiary:   {{labels and metadata}};

  /* Accent */
  --color-brand:           {{calls to action, links, active states}};
  --color-brand-hover:     {{hover}};

  /* Semantic */
  --color-success:         {{success}};
  --color-error:           {{error}};
  --color-warning:         {{warning}};
}
```

**Colour rules:**
- Every colour is referenced through a custom property; no literal values in components.
- One accent per section.
- {{project-specific rule}}

## 3. Typography Rules

**Font stack:**
```css
@import url('{{Google Fonts URL}}');
```

| Role | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Hero H1 | | | | | |
| Section H2 | | | | | |
| H3 | | | | | — |
| Body | | | | | — |
| Label | | | | | |
| Mono / code | | | | | — |

**Typography rules:**
- {{e.g. heading weight ≥ 700}}
- **Never use**: {{banned faces for this project}}

**Text decoration:** {{the outcome of the gradient/shadow decision — e.g. "Hero
h1: no gradient, no shadow (restrained direction)"}}

## 4. Component Stylings

### Buttons
```css
{{complete CSS: default / hover / active / focus-visible / disabled}}
```

### Cards
```css
{{complete CSS: default / hover / focus-within}}
```

### Navigation
```css
{{complete CSS, including the scrolled state if there is one}}
```

### Links
```css
{{complete CSS including the hover transition}}
```

### Tags and badges
```css
{{complete CSS}}
```

## 5. Layout Principles

**Container:** max width, padding, and the narrow variant for text-heavy pages.

**Spacing scale:** section padding, component gap, card padding.

**Grid:**
```css
{{grid CSS}}
```

## 6. Depth & Elevation

| Level | Treatment | Used for |
|---|---|---|
| Flat | | |
| Subtle | | |
| Elevated | | |

## 7. Animation & Interaction

**Motion philosophy:** {{one line}}
**Tier:** {{L1 / L2 / L3}}

### Dependencies
```
{{packages, with versions}}
```

### Base setup
```ts
{{GSAP / Lenis initialisation, if any}}
```

### Entrance
```css
{{keyframes and classes}}
```

### Scroll behaviour
```ts
{{reveal / parallax / pin}}
```

### Hover and focus
```css
{{every interactive element}}
```

### Special effects
{{cursor, page transitions, text reveal, parallax — as applicable}}

### Reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  {{what renders instead — the destination state, not nothing}}
}
```

## 8. Do's and Don'ts

### Do
- {{at least five}}

### Don't
- {{at least eight}}

## 9. Responsive Behavior

| Name | Width | Key changes |
|---|---|---|
| Desktop | | |
| Tablet | | |
| Mobile | | |

**Touch targets:** minimum {{size}}
**Collapsing strategy:** {{how navigation and grids fold}}

```css
{{responsive CSS}}
```
````

---

## Rules for filling it in

These are what separate a DESIGN.md that constrains a build from one that reads
well and constrains nothing.

1. **Every section carries real content.** A heading with a placeholder under it
   is worse than an absent section, because it looks answered.
2. **All CSS runs.** Not pseudocode, not `{{value}}` left in place.
3. **Components document every state** — default, hover, active, focus-visible,
   disabled. A button specified only at rest is a button someone will invent
   three states for.
4. **The animation section is never empty.** At minimum an entrance and a hover.
5. **Do's and Don'ts is the load-bearing section.** Prohibitions constrain a
   generating model far more reliably than positive advice: "no equal-height card
   grid, no gradient on body text, OKLCH only" produces better output than
   "modern and clean" ever will.
6. **Anything above L1 states its reduced-motion behaviour.**
7. **Colours live in custom properties**, never inline in a component.
8. **Fonts ship with an `@import` and a fallback stack**, so the first paint is
   not unstyled.
9. **Responsive covers desktop and mobile at minimum.**
10. **Save it at the project root as `DESIGN.md`** — the parser and every later
    agent look there.

## Where this pack's rules override the template

The template is a container; this pack's constraints still apply to what goes in
it. Four places where upstream's version and our gates disagree:

**Colour values are OKLCH.** `COL-04` bans raw hex in component code. Write
`oklch(62% 0.19 264)`, not `#4f46e5`.

**There is no `--*-rgb` variable.** Upstream's template includes `--bg-rgb` and
`--accent-rgb` so that `rgba()` can build translucent variants. That is a second
copy of every colour, and it drifts from the first the moment one is edited. Use
relative colour syntax instead — `oklch(from var(--color-brand) l c h / 0.15)` —
which derives the translucent form from the token rather than duplicating it.

**Token names are semantic.** `--color-surface-raised`, not `--color-gray-50`.
The name should say the role so the value can change per theme without a rename.
Upstream's `--bg` / `--surface` shorthand is fine as far as it goes; the naming
rule in `SKILL.md` is what to follow where they differ.

**Dependencies are packages, not CDN tags.** Upstream's section 7 asks for CDN
`<script>` links. Record npm packages with versions instead: a CDN tag cannot be
tree-shaken, adds a third-party origin to your content security policy, and pins
the build to whatever that URL happens to serve.

Two sections also connect to files elsewhere in this pack. The **text decoration**
line in section 3 is the output of the gradient-and-shadow decision table in
`typographic-finishing.md`. The per-role sizes in section 3's table should come
from the scene defaults in that same file rather than being invented per project —
a dashboard and a landing page do not share a base size.

## Sources

Translated from the Chinese original in `xiaopu-ai/web-design`
(MIT, Copyright © 2026 KAOPU-XiaoPu). The nine-section structure and the
generation rules are upstream's. The OKLCH requirement, the removal of the RGB
channel variables, the semantic-naming note, the dependency change and the
cross-references are this pack's.
