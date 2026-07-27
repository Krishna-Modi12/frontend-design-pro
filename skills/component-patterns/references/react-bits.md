# React Bits — Animated Component Pattern Catalog

Source: `DavidHDev/react-bits` — 110+ animated React components. **License: MIT + Commons Clause** (free for personal and commercial use; the Commons Clause restricts *selling the library itself*, not shipping products with it). Ports exist for Vue (`vue-bits.dev`) and Svelte (`sveltebits.xyz`).

Patterns and rules only — do not copy implementations. Each component ships in four variants (JS-CSS, JS-TW, TS-CSS, TS-TW); **always take the TS-TW variant** for this stack, then rewrite colours to OKLCH tokens.

## Four categories

| Category | What it is | Where it belongs on a page |
|---|---|---|
| **Text animations** | Per-character/word/line reveals — blur, split, scramble, decrypt, shiny, gradient, count-up | Hero headline, section entrance, a single stat. **One per viewport** |
| **Animations** | Wrapper effects — magnetic, tilt, spotlight, click-spark, pixel-transition, star-border | Interactive affordances: cards, buttons, CTAs |
| **Components** | Composed UI — carousels, docks, stacks, masonry, stepper, bento, infinite scroll | Structural sections |
| **Backgrounds** | Ambient canvas/WebGL — aurora, particles, waves, dither, grid, orb, threads | Behind content, at low contrast |

## Pattern rules

### Animated text
- **Use when** a single line must carry weight — hero headline, one key stat. Never on body copy: per-character animation destroys readability and screen-reader coherence.
- **Structure:** wrapper splits text into spans → staggered transform/opacity per span → wrapper carries the accessible string.
- **Accessibility (mandatory):** the split text must remain one readable string for assistive tech. Put the real sentence on the wrapper via `aria-label` and mark the split spans `aria-hidden="true"`. Otherwise a screen reader announces it letter by letter.
- **Animation:** stagger 30–60ms per unit, 300–600ms total, ease-out. Longer reads as slow, not cinematic.
- **Anti-pattern:** animating a paragraph · re-triggering on every scroll into view (use `once: true`) · animating layout properties instead of `transform`/`opacity`.

### Wrapper effects (magnetic, tilt, spotlight)
- **Use when** an element must invite a click. One magnetic CTA is a signature; five is noise.
- **Structure:** pointer position → normalized offset → transform on a wrapper, never on the text node (scaling text re-rasterizes glyphs and shifts anti-aliasing).
- **Accessibility:** the effect is pointer-only — it must never be the *only* affordance. Keyboard users need the same target with a visible focus ring, and the effect must not move the element out from under the cursor.
- **Anti-pattern:** `pointer: coarse` devices getting a hover-derived effect that can never fire; magnetic offsets large enough to break Fitts's-law targeting.

### Background effects
- **Use when** a hero or section needs atmosphere. **Contrast is the constraint, not taste** — content over the effect must still clear 4.5:1.
- **Structure:** absolutely-positioned canvas/WebGL layer, `aria-hidden="true"`, `pointer-events: none`, content in a sibling above it.
- **Performance:** these are the heaviest items in the catalogue. Cap DPR, pause when off-screen (`IntersectionObserver`), and stop the loop entirely under `prefers-reduced-motion` — an ambient loop is precisely the animation a motion-sensitive user opted out of.
- **Anti-pattern:** a WebGL background on a page whose LCP element sits on top of it · animated backgrounds behind long-form reading · shipping one without a static fallback.

### Composed components (carousel, dock, stack, masonry)
- **Use when** the structure genuinely is a set. A carousel for primary content is an anti-pattern regardless of how well it animates (see `../landing-pages/references/design-patterns.md` AP-04).
- **Accessibility:** carousels need pause control and no auto-advance; docks and stacks need real buttons with arrow-key roving tabindex; masonry must keep DOM order equal to reading order.

## Integration with this stack

- Install via the shadcn CLI (`npx shadcn@latest add @react-bits/<Component>-TS-TW`) so the source lands in the project and is editable — never as an opaque dependency.
- **Rewrite every colour to OKLCH tokens on arrival.** These components ship raw hex; that violates `COL-04` and the anti-slop wall on contact.
- Framer Motion for component-level effects, GSAP for scroll timelines — never both on one element (see `../animations/SKILL.md`).
- Anything with a canvas or WebGL layer routes to `../threejs-3d/` for DPR capping and disposal discipline.

## Creative tools (workflow, not code)

Background Studio (customize/export animated backgrounds), Shape Magic (inner rounded corners between shapes → SVG/clip-path), Texture Lab (noise, dithering, ASCII over images/video). Useful for producing an *asset* rather than shipping a runtime effect — usually the better trade when the effect is decorative and static.
