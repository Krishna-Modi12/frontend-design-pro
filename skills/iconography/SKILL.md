---
name: iconography
description: Icon systems — sizing, weight matching, colour inheritance, hit areas, SVG accessibility, and avatar patterns.
version: "14.4.0"
core-deps:
  - core/design-tokens.md
  - core/accessibility-baseline.md
---

# Iconography

## When to Use
Selecting, sizing, colouring or aligning icons; building icon-only controls; choosing an icon family or weight; avatar and initials patterns; empty-state illustration. Anything where an SVG sits next to or instead of text.

## Stack
React 19 · TypeScript strict · Tailwind v4 · Lucide (default) · Phosphor where weight variants are needed

## Core Rules
1. **Icons are typographic.** Size in `em` so they scale with their text: `1em` inline, `1.25em` beside a button label, `1.5em` standalone. Fixed px inside a paragraph breaks at every other type scale.
2. **The hit area is not the icon.** An 18px glyph belongs inside a 44×44px target. Icon size and touch target are independent decisions.
3. **Match icon weight to text weight.** Bold label with a thin icon reads as a rendering bug. One weight per surface.
4. **`fill`/`duotone` are state, not default** — filled for the active nav item, regular for the rest. A shape change survives WCAG 1.4.1 where a colour change does not.
5. **Inherit colour via `currentColor`** unless the icon carries independent meaning; then pair it with text or shape.
6. **Label the control, hide the glyph.** Icon-only button: `aria-label` on the `<button>`, `aria-hidden="true"` on the SVG. Never label both — screen readers announce both.
7. **Decorative icons are `aria-hidden`**, always. An unlabelled decorative SVG is noise in the accessibility tree.
8. **Import individually**, never a namespace import — namespace imports pull thousands of glyphs and defeat tree-shaking (`PERF-01`).
9. **Give icons explicit dimensions** (or an `em` size) so they can't shift layout (`A11Y-03`).
10. **Optical alignment beats box alignment.** If an icon reads high, check the label's `line-height` before resizing the icon.

## Patterns
- **Icon + label button** — flex, `gap-2`, icon `1.25em` `aria-hidden`, label carries the name.
- **Icon-only control** — `size-11` target, `aria-label` on the button, tooltip for sighted users.
- **Active-state nav** — same glyph, `fill` weight when current, plus `aria-current="page"`.
- **Initials avatar** — deterministic gradient from the name hash; never an egg placeholder.
- **Empty-state icon** — one glyph at 1.5–2em above the headline, `aria-hidden`; the text does the work.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Sizing/weight/colour/a11y/optical-alignment rules across families | `references/icon-systems.md` |
| Lucide usage, avatar patterns, gradient initials, AvatarGroup, empty states | `references/icons-avatars.md` |
| Touch-target and contrast floors | `core/accessibility-baseline.md` |

## Constraints
Icon-only controls carry `aria-label` on the control and `aria-hidden` on the glyph · targets ≥44×44px (`RES-02`) · explicit dimensions, no layout shift (`A11Y-03`) · individual imports only (`PERF-01`) · colour never the sole carrier of meaning · OKLCH tokens · TypeScript strict.
