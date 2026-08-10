---
name: animations
description: Motion — easing and timing rules, Framer Motion, GSAP, scroll-driven experiences, view transitions, reduced motion.
version: "14.5.1"
core-deps:
  - core/design-tokens.md
  - core/accessibility-baseline.md
---

# Animations

## When to Use
Any motion work: entrance/exit transitions, micro-interactions, hover states, scroll-driven sequences, parallax, page/route transitions, shared-element morphs, stagger, marquees, physics-based movement.

## Stack
React 19 · Framer Motion (component motion) · GSAP + ScrollTrigger (scroll/timeline) · React View Transitions (route) · CSS (simple states)

## Core Rules
1. **Motion is feedback, not decoration.** If removing it doesn't harm understanding, cut it. Name what a transition communicates before adding it — arrival, departure, relationship, state change, progress, consequence.
2. **Pick one motion personality and hold it.** Precise (120–200ms, sharp ease-out) · Calm (300–450ms, gentle ease-in-out) · Playful (250–400ms, spring) · Cinematic (500–800ms, heroes only). Mixed personalities read as incoherent even when nobody can say why.
3. **Easing.** Enter `ease-out` `cubic-bezier(0.23,1,0.32,1)`; `ease-in` only for exits ≤200ms; `ease-in-out` for movement. **Never `ease-in` for entrances.**
4. **Duration.** Button 100–160ms · dropdown 150–250ms · modal 200–500ms · page transition ≤800ms. Never exceed 600ms for standard UI.
5. **Animate `transform` and `opacity` only** — they're compositor-driven. Never `width`, `height`, `top`, `left`. **Never `transition: all`** — list properties explicitly.
6. **Never scale from 0.** Start at `scale(0.95)` minimum; 0 reads as a glitch.
7. **`prefers-reduced-motion` is mandatory** wherever motion exists — `useReducedMotion()`, a `@media` block, or Tailwind's `motion-reduce:`. Reduce to opacity or nothing; never ship motion a user has opted out of.
8. **Animations are interruptible.** New input takes over mid-flight rather than queueing behind the current tween — springs do this naturally.
9. **Don't animate high-frequency actions** (100+ per day: toggles, shortcuts) — delay compounds into annoyance.
10. **One system per element.** Framer for component state, GSAP for scroll timelines. Never both on the same node.
11. **Set an intentional `transform-origin`**; SVG transforms go on a `<g>` with `transform-box: fill-box`.

## Patterns
- **Stagger reveal** — container variants with `staggerChildren`, 40–60ms apart.
- **Shared-element morph** — `layoutId` (Framer) or `<ViewTransition name>` (React VT).
- **Scroll sequence** — GSAP ScrollTrigger with `scrub`, pinned sections, `invalidateOnRefresh`.
- **Magnetic / hover lift** — small transform on pointer proximity, disabled under reduced motion.
- **Skeleton shimmer** — `animate-pulse` on a real loading state, never a fake delay.

## Examples
`examples/good-anim-recipes.tsx` (stagger, counter, magnetic, reduced-motion) · `examples/good-scroll.tsx` (GSAP ScrollTrigger, SplitText, pinning) · `examples/good-view-transitions.tsx` · `examples/good-vt-shared-element.tsx` · `examples/bad-animated.tsx` (anti-example).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| **Motion direction — what a motion communicates, personality archetypes, choreography, Disney principles, animation smells** | **`references/motion-direction.md`** |
| Timing/easing decisions, which library to reach for | `references/animation-framework.md` |
| 17 copy-paste recipes (stagger, counter, toast, marquee…) | `references/animation-recipes.md` |
| motion.*, AnimatePresence, variants, layoutId, springs | `references/framer-motion.md` |
| All 12 GSAP plugins, useGSAP, timelines | `references/gsap.md` |
| Scroll-driven patterns, parallax, pinning | `references/scroll-experience.md` |
| Smooth/momentum scroll — Lenis options, RAF loop, GSAP ticker handoff, reduced-motion gating | `references/lenis-smooth-scroll.md` |
| React View Transition API, CSS recipes, Next.js integration | `references/view-transitions.md` |

## Constraints
`MOTION-01` reduced-motion is functional, not a string mention · `MOTION-02` no bare `ease-in` in entrance context · `PERF-04` no `transition: all` · duration 80–600ms (800ms page transitions) · no infinite animation without user control · transform/opacity only · OKLCH tokens · TypeScript strict.
