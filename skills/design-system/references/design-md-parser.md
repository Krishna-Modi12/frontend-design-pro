# DESIGN.md Parser Reference

Auto-loaded when a `DESIGN.md` file is present in the project root. No explicit shortcode is required — the skill detects the file and activates this parsing pipeline automatically.

---

## Purpose

This reference tells the skill HOW to parse a user-provided `DESIGN.md` file and inject its design tokens into the generated component. The `DESIGN.md` format follows Google Stitch's semantic design language — a mix of descriptive natural-language intent and precise numeric values. See `references/stitch-design.md` for the full Stitch format specification.

When a `DESIGN.md` is present, every token it defines takes precedence over the skill's built-in defaults. The parser is responsible for:

1. Detecting and normalising section headings (case-insensitive, synonym-aware)
2. Extracting typed values (colors, fonts, sizes, durations, easings, dials)
3. Converting all color representations to OKLCH before injection
4. Writing extracted tokens into the component's `@theme` block (Tailwind v4) or equivalent CSS custom-property block
5. Skipping any section that is absent rather than erroring

---

## Accepted Heading Variants

The parser matches headings case-insensitively and trims surrounding whitespace. Any of the synonyms below is treated as equivalent to the canonical section name.

| Canonical Name | Accepted Heading Variants |
|---|---|
| **Color** | `Color Palette`, `Colors`, `Palette`, `Brand Colors`, `Color System` |
| **Typography** | `Typography`, `Fonts`, `Type Scale`, `Typeface`, `Font Stack` |
| **Spacing** | `Spacing`, `Layout`, `Grid`, `Space Scale`, `Spacing Scale` |
| **Motion** | `Motion`, `Animation`, `Transitions`, `Timing`, `Motion Design` |
| **Rules** | `Do's and Don'ts`, `Rules`, `Guidelines`, `Constraints`, `Design Rules` |
| **Atmosphere** | `Atmosphere`, `Tone`, `Mood`, `Aesthetic`, `Dials` |

Matching logic: strip leading `#` characters (any Markdown heading level), lowercase, strip punctuation, compare against the synonym list. First match wins.

---

## Extraction Rules

### Color Palette

**OKLCH values** — detect the pattern `oklch(L% C H)` or `oklch(L C H)` (with or without `%` on the lightness channel). Capture L, C, H as the canonical representation. No conversion needed.

**Hex values** — detect `#RGB`, `#RRGGBB`, or `#RRGGBBAA`. Convert to an OKLCH approximation using the standard sRGB → Linear sRGB → XYZ D65 → Oklab → OKLCH pipeline. Round L to two decimal places, C to three, H to one. Never emit a raw hex value into the `@theme` block.

**Role mapping** — after extraction, map each color to one of these semantic roles based on the label or descriptive text accompanying the value in DESIGN.md:

| Semantic Role | Token Name | Matching Keywords |
|---|---|---|
| Primary action / brand | `--color-primary` | primary, brand, accent CTA, key |
| Secondary action | `--color-secondary` | secondary, supporting |
| Page surface / background | `--color-surface` | surface, background, base, bg |
| Elevated surface | `--color-surface-raised` | raised, card, elevated, panel |
| Body text | `--color-text` | text, foreground, body, copy |
| Muted / subdued text | `--color-text-muted` | muted, subtle, meta, dim, secondary text |
| Border / divider | `--color-border` | border, divider, separator, stroke |
| Accent / highlight | `--color-accent` | accent, highlight, pop |

If a color's label does not match any keyword list, infer the role from positional order: first extracted color → `primary`, second → `secondary`, third → `surface`, fourth → `text`, and so on.

**Override rule** — DESIGN.md color values overwrite the corresponding token in the `@theme` block. Skill defaults for any role not mentioned in DESIGN.md are kept intact.

---

### Typography

Detect font names from any of these patterns (case-insensitive):

- `font-family: 'Font Name', fallback;`
- `font-family: Font Name;`
- `Font: Font Name`
- `Display font: Font Name`
- `Body font: Font Name`
- `Heading font: Font Name`

Extract the primary font name (strip quotes). If two distinct fonts are detected (display + body), map the first to `--font-display` and the second to `--font-sans`. If only one font is present, apply it to `--font-sans` and derive `--font-display` from the same family.

Replace the skill's default `@import` URL and `font-family` declarations with the extracted font. If the DESIGN.md includes a full `@import` or Google Fonts URL, use it verbatim.

**Weight and size scale** — if explicit weight values (`font-weight: 500`) or a size scale (`hero: clamp(3rem, 8vw, 6rem)`) are present, extract and apply them. If absent, keep the skill's default scale.

---

### Spacing

Detect a base unit declaration such as:

- `4px base unit`
- `base: 4px`
- `spacing base: 8px`
- `--spacing-base: 4px`

Compute the full scale as multiples of the base unit (×1, ×2, ×3, ×4, ×6, ×8, ×12, ×16) and apply to padding, gap, and margin utility classes.

If a complete Tailwind spacing scale is provided (e.g. a table or list of `xs: 4px`, `sm: 8px`, …), use those values directly without computing from a base.

If neither a base unit nor a full scale is found, keep the skill's default spacing.

---

### Motion

Detect duration values from patterns such as:

- `duration: 200ms`
- `transition: 200ms`
- `fast: 120ms / standard: 250ms / slow: 400ms`
- `--duration-fast: 120ms`

Map to `--duration-fast`, `--duration-base`, `--duration-slow` tokens.

Detect easing values from:

- `ease: cubic-bezier(0.4, 0, 0.2, 1)`
- `easing: ease-in-out`
- Named easing tokens: `--ease-spring`, `--ease-smooth`

Map to `transition-timing-function` values.

**Non-negotiable constraint** — regardless of what DESIGN.md specifies, never remove or override `prefers-reduced-motion` media query guards. Motion tokens set by DESIGN.md apply only inside contexts where reduced motion is not requested.

---

### Dials / Atmosphere

Detect the following dial declarations anywhere in the Atmosphere / Dials section or the Visual Theme section:

| Dial | Aliases | Token |
|---|---|---|
| Design Variance | `DESIGN_VARIANCE`, `DV`, `Variance` | `--dial-variance` |
| Motion Intensity | `MOTION_INTENSITY`, `MI`, `Motion` | `--dial-motion` |
| Visual Density | `VISUAL_DENSITY`, `VD`, `Density` | `--dial-density` |

Accepted formats: `DV: 7`, `Variance: 7/10`, `DESIGN_VARIANCE=7`. Normalise to an integer 1–10. If a value falls outside that range, clamp it.

Extracted dial values override the classify-stage dial defaults set by the shortcode or skill configuration.

---

## Injection Contract

After all extraction is complete, inject resolved tokens into the component's `@theme` block. Tokens derived from DESIGN.md are annotated with a `/* from DESIGN.md */` comment so downstream maintainers can trace the origin.

```css
@theme {
  /* Colors — from DESIGN.md */
  --color-primary:       oklch(55% 0.18 264);   /* from DESIGN.md */
  --color-secondary:     oklch(62% 0.12 220);   /* from DESIGN.md */
  --color-surface:       oklch(99% 0.004 255);  /* from DESIGN.md */
  --color-surface-raised: oklch(97% 0.006 255); /* from DESIGN.md */
  --color-text:          oklch(18% 0.02 260);   /* from DESIGN.md */
  --color-text-muted:    oklch(48% 0.02 260);   /* from DESIGN.md */
  --color-border:        oklch(88% 0.01 260);   /* from DESIGN.md */
  --color-accent:        oklch(68% 0.22 340);   /* from DESIGN.md */

  /* Typography — from DESIGN.md */
  --font-sans:           'Geist', sans-serif;   /* from DESIGN.md */
  --font-display:        'Geist', sans-serif;   /* from DESIGN.md */

  /* Spacing — from DESIGN.md */
  --spacing-base:        4px;                   /* from DESIGN.md */

  /* Motion — from DESIGN.md */
  --duration-fast:       120ms;                 /* from DESIGN.md */
  --duration-base:       240ms;                 /* from DESIGN.md */
  --duration-slow:       400ms;                 /* from DESIGN.md */
}
```

Tokens NOT mentioned in DESIGN.md retain the skill's defaults and receive no comment annotation. Do not duplicate default tokens inside the `@theme` block — only write the overrides.

For projects not using Tailwind v4, inject the same tokens as standard CSS custom properties on `:root` instead of inside an `@theme` block. The token names and values are identical.

---

## Override Priority

Token values are resolved in this order (highest priority wins):

1. **DESIGN.md values** — explicit tokens extracted from the user's file
2. **Shortcode dial overrides** — any `DV=`, `MI=`, `VD=` flags passed directly in the shortcode invocation
3. **Skill defaults** — the built-in token set defined in the skill package

This means a user can always be confident their `DESIGN.md` controls the final output, while shortcode flags let them make one-off adjustments on top of that, and the skill's defaults fill any remaining gaps.

---

## Example: DESIGN.md Snippet → @theme Injection

### Input DESIGN.md (excerpt)

```markdown
## Color Palette

- Midnight Navy (#0F172A) — primary surface and deep background
- Electric Indigo (#6366F1) — primary brand and CTA color
- Soft Slate (#F8FAFC) — page background
- Ink (#1E293B) — all body text

## Typography

Font: Manrope
Body font: Inter

## Spacing

4px base unit

## Motion

fast: 100ms / standard: 220ms / slow: 380ms
easing: cubic-bezier(0.4, 0, 0.2, 1)

## Dials

Variance: 6/10
Motion: 5/10
Density: 7/10
```

### Resulting @theme Injection

```css
@theme {
  /* Colors — from DESIGN.md */
  --color-surface:       oklch(14% 0.026 264);  /* from DESIGN.md: Midnight Navy */
  --color-primary:       oklch(60% 0.21 277);   /* from DESIGN.md: Electric Indigo */
  --color-surface-raised: oklch(98% 0.003 255); /* from DESIGN.md: Soft Slate */
  --color-text:          oklch(18% 0.03 255);   /* from DESIGN.md: Ink */

  /* Typography — from DESIGN.md */
  --font-display:        'Manrope', sans-serif; /* from DESIGN.md */
  --font-sans:           'Inter', sans-serif;   /* from DESIGN.md */

  /* Spacing — from DESIGN.md */
  --spacing-base:        4px;                   /* from DESIGN.md */

  /* Motion — from DESIGN.md */
  --duration-fast:       100ms;                 /* from DESIGN.md */
  --duration-base:       220ms;                 /* from DESIGN.md */
  --duration-slow:       380ms;                 /* from DESIGN.md */
  --ease-default:        cubic-bezier(0.4, 0, 0.2, 1); /* from DESIGN.md */
}
```

The hex values `#0F172A`, `#6366F1`, `#F8FAFC`, and `#1E293B` were converted to OKLCH at parse time and are never emitted raw.

---

## Anti-Patterns

**Do not crash on missing sections.** If a DESIGN.md omits the Motion section entirely, skip motion extraction and keep the skill defaults. Log a debug note (e.g. `[design-md-parser] Motion section not found — using skill defaults`) but never throw.

**Do not emit hex values in @theme.** The CSS `@theme` block must contain only OKLCH (preferred), `hsl`, `rgb`, or named values. Hex strings must be converted before injection. This is a hard rule: hex in `@theme` breaks the skill's color-manipulation pipeline.

**Do not remove prefers-reduced-motion guards.** Even if DESIGN.md specifies `Motion: 10/10` or `duration: 800ms`, the generated component must always wrap motion-producing CSS inside:

```css
@media (prefers-reduced-motion: no-preference) {
  /* motion styles here */
}
```

Removing this guard to "honor" the DESIGN.md is incorrect behavior.

**Do not over-infer role mappings.** If a color label is ambiguous and does not match any keyword in the role-mapping table, use the positional fallback rather than guessing. Incorrect role assignment (e.g. mapping a background color to `--color-primary`) produces visible regressions.

**Do not duplicate tokens.** If a token appears multiple times in DESIGN.md (e.g. two entries both claiming to be `primary`), use the first occurrence and ignore subsequent duplicates. Emit a debug note for each skipped duplicate.

**Do not strip the user's descriptive text.** The Rules / Guidelines section in DESIGN.md contains natural-language design constraints (e.g. "no purple gradients", "all icons must be outline style"). These are passed through to the component generation prompt verbatim — the parser does not discard them just because they are not numeric tokens.
