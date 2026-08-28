---
name: design-system
description: Design tokens, OKLCH palettes, typography scales, spacing, theming, dark mode, brand systems, Figma handoff. Use when the token system itself is the work — palettes, type and spacing scales, theming and dark mode, brand-inspired aesthetics, font pairing, Figma-to-code translation. Not for applying tokens inside one component (react-components).
metadata:
  version: "14.12.0"
  core-deps:
    - core/design-tokens.md
    - core/accessibility-baseline.md
---

# Design System

## When to Use
Token systems, colour palettes, typography scales, spacing scales, theming and dark mode, brand-inspired aesthetics, font pairing, style presets, and Figma-to-code translation. For applying tokens inside one component use `react-components`.

## Stack
Tailwind v4 `@theme` · CSS custom properties · OKLCH colour · next-themes

## Core Rules
1. **OKLCH everywhere.** Perceptually uniform, so a fixed lightness step looks even across hues. Keep H constant and move L/C for a family. Never raw hex in component code.
2. **Semantic names, not literal ones.** `--color-surface-raised`, not `--color-gray-50`. The name says the role; the value can change per theme without a rename.
3. **Never pure black or white as a surface.** `oklch(14% 0.012 240)` and `oklch(98% 0.005 240)` — tinted neutrals read as designed, pure ones read as unfinished.
4. **Dark mode is a first-class theme, not an inversion.** Invert L, keep H, reduce C slightly. Elevated surfaces get *lighter* in dark mode, not darker.
5. **`color-scheme: dark` on `<html>`** so native scrollbars, inputs and `<select>` follow. `<meta name="theme-color">` per scheme so browser chrome matches.
6. **4pt spacing scale**, no exceptions: 4·8·12·16·24·32·48·64·96.
7. **Type scale is mathematical** with line-height paired to size: ≥1.6 body, ≥1.2 headings. Fluid sizing via `clamp()` beats breakpoint jumps.
8. **Banned display faces:** Inter, Roboto, Arial, Poppins, DM Sans, Space Grotesk — allowed only as fallbacks in a stack.
9. **Contrast is a gate, not a preference.** 4.5:1 normal text, 3:1 large and non-text. Interaction states must increase contrast over rest.
10. **Nested radii are concentric** (`child = parent − padding`); shadows are layered (ambient + direct), never one blurry drop.

## Patterns
- **Dual-layer tokens** — primitives (`--blue-500`) feed semantics (`--color-brand`); components only ever consume semantics.
- **Theme swap** — `.dark` class strategy via next-themes with `suppressHydrationWarning` and `disableTransitionOnChange`.
- **Brand archetypes** — Dark Precision, Luminous Minimal, Neon Developer, Fintech Trust, and so on; pick one and execute it fully.
- **Style presets** — soft, minimalist, brutalist, glassmorphism, neo-brutalism.
- **Figma handoff** — Auto Layout → Flex/Grid, variants → CVA, variables → tokens.

## Examples
`examples/good-dark-mode.tsx` (token architecture, next-themes, themed charts).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| 161 industry-mapped OKLCH palettes | `references/color-palettes.md` |
| Dark mode architecture, next-themes, inversion rules | `references/dark-mode.md` |
| 57 font pairings, reflex-font ban list, selection process | `references/font-pairings.md` |
| CJK text — fallback-chain order, no-italic substitutes, kinsoku and punctuation, inverted letter-spacing, 5–15 MB font budget | `references/cjk-typography.md` |
| Type that is correct but looks unset — measure in `ch`, `text-box` ink trimming, `balance` vs `pretty`, scale ratios, per-scene size and leading baselines, when a heading may be gradient or shadowed, metric-matched fallbacks, tabular figures, the `prose` plugin | `references/typographic-finishing.md` |
| Top brand profiles + implementation templates | `references/brand-core.md` |
| 30+ additional brand profiles | `references/brand-extended.md` |
| 83 public design systems, 9 archetypes — replicate a brand's feeling, not its IP | `references/brand-design-systems.md` |
| Matching a real brand — official-source extraction protocol, never from memory | `references/brand-extraction.md` |
| Tone vocabulary, background effects, Design Thinking protocol | `references/aesthetic-direction.md` |
| Auto Layout → code, variable extraction | `references/figma-to-code.md` |
| Tokens leaving the browser — DTCG, Style Dictionary, Tokens Studio, and where hex is legitimate | `references/token-interop.md` |
| Ten mood-keyed starting token sets — palettes in OKLCH, type pairing, radius, motion tier, and how to mix two | `references/style-seeds.md` |
| Parsing a supplied DESIGN.md into `@theme` | `references/design-md-parser.md` |
| Authoring a DESIGN.md — the nine-section template and the rules that make it binding | `references/design-md-template.md` |
| Checking a build against the DESIGN.md it was made from | `references/design-md-checklist.md` |
| Style presets (soft/minimal/brutalist/glass/neo) | `references/styles/*.md` |

## Constraints
OKLCH only, no raw hex · no pure black/white surfaces · 4pt spacing · no banned display fonts · WCAG 2.2 AA contrast · `color-scheme` and `theme-color` set for dark themes · tokens semantic, never literal.
