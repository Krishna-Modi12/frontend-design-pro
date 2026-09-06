# Motion Easing Catalogue (Live Sources)

Values worth reusing, harvested from Motion.dev examples, GSAP demos, React Bits and Codrops. Load this when a reference has motion you want and you need to name what you saw.

## Standard Easings

| Name | Value | Use for |
|---|---|---|
| ease-out-expo | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary entrances — fast start, long settle. The default choice |
| ease-out-quart | `cubic-bezier(0.25, 1, 0.5, 1)` | Secondary entrances, slightly less dramatic |
| ease-out-soft | `cubic-bezier(0.23, 1, 0.32, 1)` | Hero reveals where the settle should be visible |
| ease-in-out-circ | `cubic-bezier(0.85, 0, 0.15, 1)` | Layout transitions where both ends are on screen |
| ease-out-back | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot on small playful elements. One per interface, at most |
| spring | `{ type: "spring", stiffness: 100, damping: 15 }` | Interactive elements that follow a pointer |

**Direction is not a preference.** Entrances use ease-out: the element arrives fast and settles. Exits use ease-in: the element gathers speed and leaves. An ease-in entrance reads as lag and it is one of the clearest tells of unconsidered motion.

## Duration Scale

| Context | Duration | Why |
|---|---|---|
| Hover, focus, active | 150–200ms | Below ~100ms it is not perceived as motion; above ~250ms it feels unresponsive |
| Element entrance | 300–500ms | The band where motion reads as intentional |
| Section / page transition | 400–600ms | Long enough to orient, short enough not to block |
| Stagger delay per item | 80ms (40ms per word) | The canonical value — see `../../animations/references/animation-framework.md`. Below 50ms it reads as simultaneous, above 100ms it drags |
| Scroll-coupled | 1:1 with scroll | Physics-linked, no duration of its own |
| Exit | 60–80% of the matching entrance | Leaving should be quicker than arriving |

Total stagger time is the number that matters: eight items at 80ms is 640ms of cascade before the last one lands. Past roughly 800ms total the user has started reading and the animation is now in the way. Cap the stagger, or cap the count.

## Stagger Patterns

| Pattern | Implementation | Seen in |
|---|---|---|
| Linear cascade | `delay: i * 0.08` | React Bits, most list reveals |
| Container variants | `transition: { staggerChildren: 0.08 }` on the parent | Motion.dev — preferable, the parent owns the timing |
| Radial reveal | Distance from an origin → delay | Aceternity grids |
| Per-character text | `delay: i * 0.05` on character spans | React Bits. Wrapper needs `aria-label`, spans need `aria-hidden` |
| Scroll-triggered | `whileInView` with `viewport={{ once: true }}` | Motion.dev |

## Scroll Coupling

- Scrubbed, not triggered: map scroll progress to transform directly. A time-based animation fired by a scroll position fights the user the moment they scroll back.
- Pinned sections: three viewports maximum. Longer and the user believes the page is broken.
- One progress source per section. Two scroll listeners on overlapping ranges is how jitter gets shipped.
- Under `prefers-reduced-motion`, a pinned scroll section becomes a normal stacked section. Not a faster version of itself.

## Anti-Patterns

- `duration: 1.2` on an entrance — reads as a bug, not as elegance
- `ease: "easeIn"` on an entrance — wrong direction, always
- `whileInView` on every element on the page — the whole document twitching as you scroll
- Staggering more than ten items without `content-visibility: auto` — layout cost on every frame
- `transition: all` — animates properties you did not intend, off the compositor
- Animating anything but `transform` and `opacity` in a loop — `width`, `top`, `filter` all force layout or paint
- Motion with no reduced-motion path — this is a correctness failure (`MOTION-01`), not a polish item

## Reading Motion Off a Live Site

1. DevTools → Animations panel → record the interaction.
2. Read the actual easing and duration off the recorded timeline. Do not estimate from watching.
3. For Framer Motion sites, the `transition` object is often visible in the React component props via the React DevTools panel.
4. Check the same interaction with `prefers-reduced-motion: reduce` forced on, and note whether the source handles it — if not, you are designing that path yourself.
5. Convert to the values above and write them into the extraction note. Never paste the source's animation code directly; it will carry raw hex, its own token names and no reduced-motion handling.
