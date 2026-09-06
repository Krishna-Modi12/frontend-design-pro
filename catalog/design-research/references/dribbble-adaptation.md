# Dribbble → Code Adaptation

## The Problem

A Dribbble shot is a fixed-size image. It has no breakpoints, no scroll, no focus states, no loading state, no real content, and no browser chrome. Translating one directly produces a layout that looks correct at exactly one width and is broken everywhere else. The work is not transcription — it is deciding which properties of the image are the *design* and which are artefacts of it being an image.

What survives translation: ratios, hierarchy, palette relationships, density, tone.
What does not: absolute pixel values, fixed compositions, text-as-image, decorative render work.

## Composition

| Shot pattern | Web equivalent | Constraint |
|---|---|---|
| Centred hero card | `mx-auto max-w-2xl` | Do not let it go full-bleed on wide desktop |
| Floating offset elements | Absolute positioning with `clamp()` offsets | Must reflow to stacked below `md` |
| Overlapping layers | `z-index` plus negative margin | Two layers maximum; verify tab order still reads correctly |
| Decorative circles / blobs | `border-radius: 50%` with a low-chroma gradient | Three per page, `aria-hidden`, `pointer-events: none` |
| Edge-bleeding imagery | Container with `overflow-x: hidden` on an ancestor | Never on `body` — it breaks position: sticky |
| Diagonal section dividers | `clip-path` on the section | Check the clipped area is not holding text |

The most transferable thing in a good shot is usually the **split ratio** — a 60/40 or 70/30 asymmetry where a beginner would have used 50/50. Extract that as a grid definition and most of the character comes with it.

## Colour

- Sample with a picker, convert to OKLCH immediately.
- **Reduce chroma 10–15% from the sampled value.** Dribbble palettes are tuned for a thumbnail on a grey feed, not for a full-viewport surface where the same saturation reads as loud.
- Dark-mode shots: use a near-black with a hint of hue (`oklch(15% 0.02 260)`) rather than pure black. Pure black plus a bright accent is one of the AI-design defaults and the anti-slop wall rejects it unless the brief asks.
- Cap the palette at one accent plus a neutral ramp. A shot with five accents is showing off; a product with five accents has no hierarchy.
- Re-verify contrast after import. The shot's text passed against the shot's background. Yours is a different background.

## Typography

- Display faces in shots are usually licensed and usually the whole reason it looks expensive. Map to the system stack or a face the project already has, and preserve the *contrast* — if the shot pairs a heavy display with light body, keep that relationship even with different faces.
- Large display type: `text-wrap: balance`, `line-height: 0.9–0.95`, negative tracking.
- Minimum body size 16px; captions no smaller than 14px / `0.875rem` regardless of what the shot does. Shots routinely use 10px labels because nobody has to read them.
- If the shot's text is baked into the image, you have no font information at all — say so rather than guessing.

## Spacing

- Shots use generous whitespace. Reproduce it as `clamp()`, not fixed padding: `padding: clamp(1rem, 5vw, 4rem)`.
- Tight card grids in a shot ignore touch targets. Minimum `gap: 1rem`, and every interactive element clears 44×44px.
- Vertical rhythm in a shot is often one arbitrary number. Snap to the project's spacing scale and the result is usually better than the source.

## What the Shot Does Not Show You

Every one of these has to be invented, and each is an opportunity to get it wrong silently:

- Loading state — build a skeleton matching the real layout, never a spinner over a blank page, never a fake `setTimeout` delay
- Empty state — what the component looks like with zero items
- Error state — with a real recovery action, not just a message
- Focus states — visible rings on every interactive element
- Hover states on touch — where hover does not exist
- Long content — names that wrap, prices with more digits, translated strings 40% longer
- Scroll behaviour — sticky headers, and what happens past the fold the shot never showed

## Red Flags — Skip the Shot

- Heavily textured or photographic backgrounds that cannot be recreated in CSS
- 3D renders with no web equivalent inside the performance budget
- Mobile-only compositions presented with no desktop consideration
- More than five colours in the palette
- Text as image throughout — no extractable type information
- A layout whose entire appeal is the absence of real content

When a shot hits these, say which ones and offer to take only the palette or only the type hierarchy. That is a better outcome than a faithful reproduction of something that cannot ship.
