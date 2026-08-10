---
name: component-patterns
description: Patterns from modern component libraries — animated text, wrapper effects, ambient backgrounds, and composed UI, with the accessibility and performance rules they usually omit.
version: "14.7.3"
core-deps:
  - core/component-api.md
---

# Component Patterns

## When to Use
Pulling a pattern from a third-party library — animated text, magnetic/tilt/spotlight effects, ambient canvas backgrounds, carousels, docks, bento grids — or being asked for "something like Aceternity / React Bits / Cult UI". For building a component API from scratch use `react-components`; for motion systems use `animations`.

## Stack
React 19 · TypeScript strict · Tailwind v4 · shadcn CLI for installs · Framer Motion / GSAP

## Core Rules
1. **Take the pattern, not the file.** These libraries ship raw hex, loose typing and no reduced-motion handling. Extract the structure and the timing; rewrite colours to OKLCH tokens and add the a11y layer on arrival.
2. **Install so the source lands in the project** (shadcn CLI / jsrepo), never as an opaque dependency. You will need to edit it.
3. **One showpiece per viewport.** Animated text on the headline *or* a magnetic CTA *or* an ambient background — not all three. Scattered effects are the tell that a page was assembled rather than designed.
4. **Split text must stay one string for assistive tech.** `aria-label` on the wrapper carrying the real sentence, `aria-hidden` on the per-character spans. Otherwise it is announced letter by letter.
5. **Animate wrappers, never text nodes.** Scaling a text node re-rasterizes glyphs and shifts anti-aliasing mid-animation.
6. **Backgrounds are `aria-hidden`, `pointer-events: none`, and contrast-tested.** Content above them still clears 4.5:1, or the effect goes.
7. **Ambient loops stop under `prefers-reduced-motion`** — an always-running background is exactly what that preference exists to disable. Pause off-screen via `IntersectionObserver` too.
8. **Pointer-derived effects are never the only affordance.** Magnetic, tilt and spotlight all die on touch and keyboard; the underlying control must work without them.
9. **A carousel for primary content stays an anti-pattern** no matter how good the animation is.
10. **Scroll-coupled means `scrub`-coupled.** Map scroll progress directly to transform; never fire a time-based animation on a scroll trigger — it fights the user. Under reduced motion a pinned section becomes a normal stacked one.
11. **GPU-composited only** — `transform` and `opacity`. Never `transition: all`.

## Patterns
- **Animated headline** — split → stagger 30–60ms → 300–600ms total, ease-out, `once: true`; wrapper holds the accessible string.
- **Magnetic CTA** — pointer offset → wrapper transform, capped so the target never escapes the cursor; focus ring unchanged.
- **Ambient background** — absolute canvas layer, DPR-capped, off-screen paused, reduced-motion static fallback.
- **Spotlight / tilt card** — pointer-tracked gradient or rotation on the container; content layer untouched.
- **Scroll-coupled reveal** — pinned section ≤3 viewports, one progress source, decoration gated by scroll but never information.
- **Composed set (dock, stack, bento, masonry)** — real buttons, roving tabindex, DOM order equals reading order.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Animated text, wrapper effects, backgrounds, composed sets — full catalogue and rules | `references/react-bits.md` |
| Scroll-coupled components, WebGL hero taxonomy, cursor-physics effects | `references/componentry.md` |
| Community component landscape (Aceternity, MagicUI, Cult UI, Animata, 21st.dev), animation tiers, registries | `../react-components/references/shadcn-ecosystem.md` |
| Component API design — props, forwardRef, CVA, compound structure | `core/component-api.md` |
| Advanced composition, compound components, API anti-patterns | `core/component-api-deep.md` |
| Token values when a pattern needs them | `../design-system/SKILL.md` |
| Motion timing, easing, reduced-motion policy | `../animations/SKILL.md` |
| Canvas/WebGL discipline for background effects | `../threejs-3d/references/threejs-fundamentals.md` |

## Constraints
Animated components respect `prefers-reduced-motion` (`MOTION-01`) · effects are `transform`/`opacity` only, no `transition: all` (`PERF-04`) · OKLCH tokens, no raw hex (`COL-04`) · no placeholder copy in pattern examples · components ≤150 lines, split if larger · every pattern keeps a keyboard path and a visible focus ring.
