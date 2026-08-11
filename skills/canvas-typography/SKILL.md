---
name: canvas-typography
description: Generative and kinetic typography — particle text, scramble and decode effects, text on a path, and variable-font axis animation. Canvas 2D and CSS, with the accessible text always in the DOM.
version: "14.8.0"
core-deps:
  - core/design-tokens.md
  - core/component-api.md
---

# Canvas Typography

## When to Use
The type itself is the effect: letters assembling from particles, a headline decoding character by character, words following a curve, a weight axis moving with scroll. This skill covers type that is *rendered or animated as a system* rather than set as static copy.

It is not the skill for choosing a typeface, a scale, or pairings — that is `design-system`. It is not general motion either; `animations` owns entrances, scroll orchestration and page transitions. If the letterforms are only being styled, route elsewhere.

## Core Rules
1. **A canvas is decoration; the text lives in the DOM.** Pixels are invisible to a screen reader, to search, to translation and to select-and-copy. Render the real string in the DOM and mark the canvas `aria-hidden="true"`. A visual-only effect must never be the only copy of the words.
2. **Null-guard every context.** `getContext("2d")` returns `null` — on a server render, under a headless test runner, when the GPU process has died, and when too many contexts are already live. Bail to the DOM text; never assert non-null.
3. **`requestAnimationFrame`, never `setInterval`.** A timer keeps firing in a background tab, drifts against the display, and cannot be cancelled at a frame boundary. Store the handle and `cancelAnimationFrame` in the effect's cleanup.
4. **Drive motion by elapsed time, not by frame count.** `delta` from the RAF timestamp makes a 144Hz monitor and a throttled tab agree. Frame-counted animation runs at whatever speed the hardware happens to allow.
5. **`prefers-reduced-motion` freezes the axis, it does not hide the words.** Reduced motion means render the final state immediately — assembled particles, decoded text, resting weight. It never means an empty canvas or missing copy.
6. **Scale the backing store by DPR, then scale the context back.** A canvas sized only in CSS pixels renders type blurry on every retina display. Set `width = cssWidth * dpr`, then `ctx.scale(dpr, dpr)` so your drawing coordinates stay in CSS pixels.
7. **Wait for the font before you measure it.** `measureText` and `fillText` silently use a fallback face until the webfont has loaded, so glyph positions computed too early are wrong. `await document.fonts.ready` — or `document.fonts.load(...)` for one face — before sampling.

## Patterns
- **Sample, don't trace.** To convert a string into particles, draw it once to an offscreen canvas and read `getImageData`; every pixel over an alpha threshold becomes a target position. Glyph outlines are not worth parsing.
- **Pool the particles.** Allocate the array once at the largest size and reuse it. Allocating per frame is what makes particle text stutter after a few seconds.
- **Stagger reveals by index.** Characters that decode simultaneously read as a flicker; a per-character delay reads as intent.
- **One axis at a time.** Animating `wght` communicates emphasis. Animating `wght`, `wdth` and `slnt` at once communicates nothing.
- **Cap the work, not the quality.** Particle count should fall out of the sampled area and a device ceiling, not a number typed once and never revisited.

## Reference Index
| File | Load when |
|---|---|
| `references/canvas-2d-typography.md` | Setting up a canvas for text at all — DPR, font loading, `measureText`, offscreen caching |
| `references/particle-text-systems.md` | Text made of particles: sampling, forces, pooling, mouse interaction |
| `references/variable-font-animation.md` | Animating `font-variation-settings` axes, on scroll or on state |
| `references/text-on-path-scramble.md` | Text along an SVG path, and scramble/decode reveals |

## Anti-Patterns
- Canvas with no DOM text behind it — the headline does not exist for anyone not looking at it.
- `setInterval` driving a render loop.
- A particle count fixed at 5,000 regardless of viewport, so a phone renders a smear.
- Animating a variable axis through a range the font does not define; the browser clamps silently and the motion stalls at the limit.
- Rebuilding the offscreen sample every frame instead of once per text change.
