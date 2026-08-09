---
name: design-research
description: Live web research protocol — browse component libraries, design galleries and motion sites, extract palettes, spacing, easing and interaction models, and convert them into typed constraints before any code is written.
version: "14.5.0"
core-deps:
  - core/design-tokens.md
  - core/component-api.md
---

# Design Research

## When to Use
The user points *outward*: "inspired by", "like this site", "mood board", "here's a reference", a pasted URL, or a named source (Dribbble, Mobbin, Aceternity, Cult UI, React Bits, 21st). This skill turns that reference into constraints. To *build* the pattern once constraints exist, hand off to `component-patterns`; for the token system itself, `design-system`.

## Core Rules
1. **Research before build.** Extract, state the constraints, get agreement. Never browse and code in the same breath.
2. **Extract constraints, not screenshots.** Colour, spacing ratio, hierarchy, easing, duration. A pasted screenshot is not a specification.
3. **Every reference becomes a typed value** — an OKLCH token, a grid, a cubic-bezier, a gap on the spacing scale. A finding that cannot be written as one was decoration, not a constraint.
4. **Never lift assets.** No images, icon sets or licensed fonts. Recreate with CSS/SVG and the system font stack.
5. **Galleries are inspiration, not specification.** A Dribbble artboard has no breakpoints; a Mobbin capture is a native app. Both need translation, and the translation is where the judgement lives.
6. **Attribute every finding, and say what you rejected.** "Split ratio from *[ref 1]*, easing from *[ref 2]*; dropped its particle field" — a wrong reading is cheap to correct before it is built.
7. **One borrowed showpiece per page.** Three references are not three hero effects.

## Source Registry

| Source | Best for | Extract | Do not take |
|---|---|---|---|
| skiper-ui.com | Component structure | Layout grids, card ratios, gap values | Exact styling — ratios only |
| motion.dev/examples | Motion timing | Easing curves, durations, stagger | One-for-one animation copies |
| mobbin.com | Interaction models | Gesture→web equivalents, nav patterns | Native chrome and iOS-only gestures |
| dribbble.com | Composition, colour | Palette (→OKLCH), hierarchy, negative space | Pixel-perfect layout; artboards never reflow |
| ui.aceternity.com | Wrapper and ambient effects | Border/glow maths, backdrop layers | More than one effect per page |
| 21st.dev | Registry patterns | Naming, prop surface, composition | Installing blind — take the pattern |
| componentry.dev | Scroll-coupled, WebGL heroes | Scroll-trigger architecture, LCP protection | LCP behind a shader compile |
| cult-ui.com | Dark mode, brutalist tone | Contrast ratios, radius logic | "Edgy" that misfits the brand |
| reactbits.dev | Entrance and text animation | Stagger maths, variants structure | `whileInView` on everything |

## Protocol
1. **Classify the reference** — structure, mood, or interaction? Starting point or strict match? Ask if unclear; the answer changes everything downstream.
2. **Extract** per source type, using the template in `references/source-extraction-protocol.md`.
3. **Convert** to the constraint language: `Surface: oklch(15% 0.02 260)`, `Grid: asymmetric 60/40, gap 1.5rem`, `Entrance: cubic-bezier(0.16, 1, 0.3, 1), 0.4s, stagger 0.08s`, `Type: system-ui`.
4. **Inject** into the build pipeline — tokens and grid into the structure pass, easing and stagger into the animation pass.
5. **Re-run intake.** Extraction answers *how it looks*, never *what it is for*; `core/user-intake.md` still applies.

**No browsing tool?** Emit a `## Research Prompt` block naming the URLs and the exact values you need, and wait for the paste. Never invent a palette and attribute it to a site you could not open.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Per-source extraction rules, extraction template | `references/source-extraction-protocol.md` |
| Dribbble shot → responsive layout | `references/dribbble-adaptation.md` |
| Native app patterns → web | `references/mobbin-web-mapping.md` |
| Easing, duration, stagger catalogue | `references/motion-easing-catalog.md` |
| MCP/browser tooling and fallbacks | `references/mcp-integration.md` |
| Tokens the palette must become | `core/design-tokens.md` |
| Building it once constraints exist | `../component-patterns/SKILL.md` |

## Constraints
Extracted colours land as OKLCH tokens, never raw hex (`COL-04`) · borrowed motion respects `prefers-reduced-motion` (`MOTION-01`) · no lifted raster assets or licensed fonts · every source named in the output · contrast re-verified after a palette import — passing on its own background does not mean passing on yours.
