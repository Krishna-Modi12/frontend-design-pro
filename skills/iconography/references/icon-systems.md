# Icon Systems — Sizing, Weight, Colour, Accessibility

Cross-library rules. Library-specific usage (Lucide, avatars, empty-state icons) lives in `icons-avatars.md`.

## Sizing — icons are typographic, not decorative

| Context | Size | Why |
|---|---|---|
| Inline with text | `1em` | Scales with the text it accompanies; never a fixed px inside a paragraph |
| Inside a button beside a label | `1.25em` | Slightly dominant so it reads as an affordance, not punctuation |
| Standalone / icon-only control | `1.5em` (24px at 16px root) | Legible alone |
| Decorative / ambient | any | It's `aria-hidden`, so only optical balance matters |

**The hit area is not the icon.** An 18px icon inside a 44×44px button is correct; an 18px icon in an 18px button is a WCAG 2.5.8 failure.

## Weight — match the text it sits with

Icon families offering weights (Phosphor: thin/light/regular/bold/fill/duotone) must **match the surrounding text weight**. A bold label with a thin icon reads as a rendering bug. Pick one weight per surface and hold it; mixing weights inside a nav is the icon equivalent of mixing typefaces.

`fill` and `duotone` are state indicators, not defaults — use `fill` for the active nav item against `regular` for the rest. That single swap communicates selection better than colour alone (and survives WCAG 1.4.1, which colour alone does not).

## Colour

Inherit from text (`currentColor`) by default — an icon that doesn't follow its label into dark mode or a hover state is a bug waiting to be filed. Set an explicit colour only when the icon carries independent meaning (a red destructive icon, a green success check), and then pair it with text or shape so meaning never rests on colour alone.

## Accessibility

| Case | Markup |
|---|---|
| Icon **with** a visible text label | `aria-hidden="true"` on the icon — the label already names the control; two names is worse than one |
| **Icon-only** control | `aria-label` on the *button*, `aria-hidden="true"` on the SVG |
| Purely decorative | `aria-hidden="true"`, and ideally no accessible name anywhere near it |
| Icon conveying status | `aria-hidden` on the SVG **plus** visually-hidden text, or `role="img"` with `aria-label` |

Never put an `aria-label` on an SVG inside an already-labelled button — screen readers announce both.

## Optical alignment

Icons are drawn on a square grid; text sits on a baseline. Centring by box rarely centres by eye. Use flexbox alignment plus a small optical nudge where needed, and never `vertical-align: middle` on an inline SVG and call it done.

Line-height affects perceived alignment more than the icon size does — if an icon looks high, check the label's `line-height` before resizing the icon.

## Performance

Import icons individually (`import { ArrowRight } from "lucide-react"`) — never a namespace import, which defeats tree-shaking and pulls thousands of glyphs (`PERF-01`). For icons used across many components, an SVG sprite beats per-component inlining. Set explicit `width`/`height` (or an `em` size) so icons don't cause layout shift (`A11Y-03`).
