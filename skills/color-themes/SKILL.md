---
name: color-themes
description: Algorithmic colour theme generation in OKLCH — harmonic schemes, palettes derived from an image, dark/light/auto architecture, and contrast checked before a token ships rather than after.
version: "14.6.0"
core-deps:
  - core/design-tokens.md
  - core/accessibility-baseline.md
---

# Color Themes

## When to Use
The palette is *computed*, not chosen: generating a full token set from one brand hue, deriving colours from an uploaded image, building a theme switcher, or producing harmonic schemes on demand. Anything where a function returns colours.

If the palette already exists and only needs applying, that is `design-system`. If the question is which hue suits a brand, that is a judgement call and belongs in `design-principles`.

## Core Rules
1. **Generate in OKLCH, always.** It is perceptually uniform: equal lightness steps look equal, and changing hue at fixed lightness does not change apparent brightness. HSL does neither — `hsl(60, 100%, 50%)` yellow and `hsl(240, 100%, 50%)` blue claim the same lightness and differ by roughly 4:1 in fact. Every generated ramp built on HSL is wrong in a way its author cannot see.
2. **Clamp chroma to what the gamut holds.** OKLCH describes colours sRGB cannot display. Past roughly C 0.37 at mid lightness the browser clips, and two different generated colours silently become the same rendered one. Clamp, or verify the result round-trips.
3. **Contrast is computed, not hoped for.** A generated pair must be *measured* before it becomes a token. A theme generator that emits an untested surface/text pair has moved the accessibility failure from design time to runtime, where nobody is looking.
4. **Never average pixels to find a palette.** The mean of a photograph is always the same muddy brown-grey. Cluster — median cut or k-means — and take cluster centroids.
5. **Theme switches are instant.** A 300ms colour transition across a whole document reads as a rendering fault, not as polish. Switch the token values; do not animate them.
6. **Colour is never the only signal.** A generated palette cannot know that red means error. Pair every colour-coded state with a label, an icon, or a shape.
7. **`auto` is a third state, not the absence of a choice.** Store `"light" | "dark" | "auto"`. Storing only a resolved boolean means a user who chose "follow the system" is silently pinned the first time the system flips.

## Patterns
- **Derive the ramp from one anchor.** Take the brand hue, then generate surface/elevated/border/muted/text by moving lightness on a fixed curve and *reducing* chroma as lightness approaches either end. Constant chroma across a ramp produces neon highlights and muddy shadows.
- **Hue wheel for schemes.** Complementary +180°, triadic ±120°, analogous ±30°, split-complementary ±150°. In OKLCH these stay equal-weight, which is exactly what the same rotation in HSL fails to do.
- **Dark mode is not inverted light mode.** Invert lightness, then *lower* chroma — saturated colour on a dark surface glows and vibrates. Roughly 0.75× is a sound starting point.
- **Elevation by lightness, not by shadow, on dark themes.** A raised surface is a lighter surface; drop shadows are close to invisible against near-black.
- **Emit CSS custom properties, not inline styles.** One `:root` block per theme means the switch is one class change rather than a re-render.

## Reference Index
| File | Load when |
|---|---|
| `references/oklch-theme-engine.md` | Generating a token set or a harmonic scheme from an anchor colour |
| `references/image-palette-extraction.md` | Deriving colours from an uploaded image or a photograph |
| `references/accessibility-aware-schemes.md` | Checking a generated pair, APCA vs WCAG, `prefers-contrast` |
| `references/dark-light-auto-architecture.md` | Wiring the switcher, storage, SSR, and avoiding the flash of wrong theme |

## Anti-Patterns
- Raw hex anywhere in generated output. The whole point is a colour space you can reason about.
- A ramp built by changing HSL lightness only — the steps are visually uneven and the mid-tones go grey.
- Averaging an image's pixels for a "dominant colour".
- Transitioning `background-color` on `:root` when the theme changes.
- Persisting a resolved `isDark` boolean instead of the user's actual three-way choice.
- Generating a palette and shipping it without ever measuring a contrast value.
