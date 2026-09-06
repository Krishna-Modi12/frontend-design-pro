# Componentry — Scroll-Coupled & WebGL Pattern Catalog

Source: `componentry.dev` / `harshjdhv/componentry` — React + TypeScript + Tailwind + Framer Motion, copy-paste delivery, **also exposed over MCP** (`componentry.dev/docs/mcp`) so an agent can pull a component directly.

Complements `react-bits.md`: React Bits is strongest on text animation and ambient backgrounds; Componentry's distinct contribution is **scroll-coupled components** and a **WebGL hero taxonomy**. Patterns only — never copy implementations.

## Five categories

| Category | Examples | Cost |
|---|---|---|
| Text animations | velocity scroll, letter cascade, text repel, kinetic reveal, particle typography | Medium — spring physics per glyph |
| Components | sticky scroll cards, scroll split card, scroll choreography, scroll tilted grid, magnetic dock, orbit card stack, layered stack, split-flap display | Medium–high |
| Hero backgrounds | dither prism, WebGL liquid, silk aurora, closing plasma, animated/prism gradient, liquid chrome | **Highest — WebGL shaders** |
| Visual effects | dithered logo, image trail, image ripple, infinite image field, magnet lines, pixel canvas, matrix rain | High — canvas/WebGL + pointer |
| ASCII effects | image → responsive ASCII with flow and glitch variants | Medium |

## Scroll-coupled components (the distinctive pattern)

- **Use when** the scroll itself carries meaning — a process unfolding, a product revealing, a stack deepening. Not for decorating a page that reads fine statically.
- **Structure:** a tall pinned section → progress value derived from scroll position → transforms mapped from that progress. One source of truth (`useScroll` progress or ScrollTrigger `scrub`), never two systems driving the same element.
- **Animation:** always `scrub`-coupled, never time-based — a time-based animation triggered by scroll fights the user's scrolling. Map progress to `transform`/`opacity` only.
- **Accessibility:** scroll-jacking breaks keyboard and assistive navigation. The content must remain reachable and readable with motion disabled — under `prefers-reduced-motion` the pinned section becomes a normal stacked section, not a frozen one.
- **Anti-pattern:** pinning a section taller than ~3 viewports · hiding *information* behind scroll progress (decoration may be scroll-gated, content may not) · nested pinned sections.
- **Tokens:** derive card/panel surfaces from OKLCH tokens; scroll effects change position and opacity, never colour semantics.

## WebGL hero backgrounds

- **Use when** the hero needs atmosphere a gradient can't produce, and you have the performance budget. This is the most expensive thing on the page.
- **Structure:** fixed/absolute canvas layer, `aria-hidden="true"`, `pointer-events: none`, content in a sibling above.
- **Performance (non-negotiable):** cap DPR (`[1, 2]`), pause via `IntersectionObserver` when off-screen, and **never place the LCP element on top of a shader that must compile first**. Provide a static poster image as the pre-compile and reduced-motion fallback.
- **Accessibility:** stop the loop entirely under `prefers-reduced-motion`; verify content contrast against the *animated* range, not a single frame.
- **Anti-pattern:** WebGL behind long-form reading · shipping without a static fallback · two shader canvases on one page.

## Cursor-physics effects

Text repel, particle typography, eye tracking, magnet lines, image trail, infinite image field.

- **Use when** one element should feel alive. One per page.
- **Structure:** pointer position → spring → transform on a wrapper. Springs (not tweens) so the effect interrupts cleanly as the pointer keeps moving.
- **Accessibility:** pointer-only by definition — dead on touch and keyboard. Never attach meaning or an action to the effect itself; the underlying control must work without it.
- **Anti-pattern:** cursor physics on a `pointer: coarse` device · effects that move a target out from under the cursor (breaks Fitts's-law acquisition).

## Delivery notes

Copy-paste and MCP delivery both drop source into the project — **rewrite colours to OKLCH tokens on arrival** (raw hex violates `COL-04` on contact) and add the reduced-motion guard, which none of these ship with. Framer Motion for component motion, GSAP for scroll timelines; never both on one element.
