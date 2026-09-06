# Native Motion Physics — springs, velocity, momentum

Route: motion that has to feel like a physical object under the user's finger —
drags, sheets, swipe-to-dismiss, pull-to-refresh, carousels that snap, anything
reversible mid-flight. Shortcode `[native-motion]`.

`animation-framework.md` answers *which easing and how long* for motion that
plays start to finish. This file is for the other kind: motion a hand is holding.
The test it has to pass is not "is the curve right" but "if I let go halfway,
grab it again and throw it back, does it track me the whole time".

## Contents

- [The one principle](#the-one-principle)
- [Springs, parameterised by feel](#springs-parameterised-by-feel)
- [Velocity handoff](#velocity-handoff)
- [Momentum projection](#momentum-projection)
- [Rubber-banding at boundaries](#rubber-banding-at-boundaries)
- [Gesture details that decide whether it feels native](#gesture-details-that-decide-whether-it-feels-native)
- [Materials and depth](#materials-and-depth)
- [Reduced motion, transparency, contrast](#reduced-motion-transparency-contrast)
- [Checklist](#checklist)
- [Sources](#sources)
- [What was corrected on the way in](#what-was-corrected-on-the-way-in)

## The one principle

An element feels alive when its motion **starts from the value currently on
screen**, **inherits the velocity the user gave it**, **projects that velocity
forward** to decide where it lands, and **can be grabbed and reversed at any
frame**. Every rule below is a consequence of that sentence.

The opposite — animating from one logical target to another over a fixed
duration — is what makes a drawer feel like a slideshow. It is correct for a
modal that only ever opens on a click (`animation-framework.md`), and wrong for
anything a finger touches.

## Springs, parameterised by feel

For finger-driven motion, drop fixed durations. A spring has no single duration —
it settles when the physics settle — and that is the point: interrupt it and it
carries its state forward instead of restarting from zero.

Parameterise a spring by two numbers you can feel, not four you have to tune:

| Parameter | Means | Range |
|---|---|---|
| **response** | how long one oscillation would take — the perceived speed | 0.2s snappy · 0.4s standard · 0.6s heavy |
| **damping fraction** | how much bounce, 0–1 | `1.0` none · `0.8` a trace · below `0.7` visible overshoot |

Defaults that match platform convention:

| Interaction | response | damping | Motion (`motion/react`) | Reanimated |
|---|---|---|---|---|
| Move / reposition | 0.4s | 1.0 | `{ type: "spring", duration: 0.4, bounce: 0 }` | `{ dampingRatio: 1, duration: 400 }` |
| Rotation, small pop | 0.4s | 0.8 | `{ type: "spring", duration: 0.4, bounce: 0.2 }` | `{ dampingRatio: 0.8, duration: 400 }` |
| Drawer / sheet | 0.3s | 0.8 | `{ type: "spring", duration: 0.3, bounce: 0.2 }` | `{ dampingRatio: 0.8, duration: 300 }` |

`bounce` in Motion is roughly `1 − damping fraction`. Keep it at `0.2` or below
for any control; the values that visibly overshoot read as dated and `MOTION-02R`
fails a spring `bounce` over `0.4`. Overshoot is a decoration you spend once on a
first-run celebration, never on a thing the user operates daily.

The `{ stiffness, damping }` scale in `animation-framework.md` § *Spring
Configuration* is the same physics in the other common spelling — use whichever
your library takes, and never define both for one element.

## Velocity handoff

The seam to eliminate: a user flicks a card, lets go, the card **stops dead**,
and then a fresh animation starts it moving again. The release velocity has to
flow into the settle.

```ts
// Motion — drag does this for you; for a custom gesture, pass velocity in:
import { animate, type MotionValue } from "motion/react"

function onRelease(x: MotionValue<number>, velocityX: number) {
  animate(x, 0, { type: "spring", velocity: velocityX, duration: 0.4, bounce: 0.2 })
}
```

```ts
// Reanimated — withSpring takes the gesture's own velocity
const fling = Gesture.Pan().onEnd((e) => {
  offset.value = withSpring(0, { velocity: e.velocityX, dampingRatio: 0.8, duration: 400 })
})
```

A spring given the incoming velocity continues the gesture. A spring given none
restarts it, and the eye reads the restart as a stutter.

## Momentum projection

When a flick should *travel* — dismiss, snap to the next page, land on a detent —
do not animate to the nearest target from the release point. Project where the
finger's velocity would carry it, *then* pick the target nearest that projection.

```ts
// Where an exponential-decay scroll would come to rest.
// deceleration: 0.998 normal, 0.99 for a faster stop (iOS UIScrollView values).
function projectedEndpoint(position: number, velocity: number, deceleration = 0.998) {
  return position + (velocity / 1000) * (deceleration / (1 - deceleration))
}

const rest = projectedEndpoint(currentX, velocityX)
const target = snapPoints.reduce((a, b) =>
  Math.abs(b - rest) < Math.abs(a - rest) ? b : a,
)
// then spring to `target` with the velocity handoff above
```

This is why a fast swipe on a carousel skips two cards and a slow drag moves one:
the projection, not the drop position, chooses the target. Motion's
`dragTransition={{ power, timeConstant }}` and Reanimated's `withDecay({
deceleration })` implement the same decay when you only need a resting point and
no snap.

## Rubber-banding at boundaries

Past the first and last item, do not hard-stop and do not let the content follow
the finger 1:1. Apply resistance that grows with distance, so the edge is felt
rather than hit:

```ts
// c ≈ 0.55; dimension is the axis length (viewport or container).
function rubberBand(offset: number, dimension: number, c = 0.55) {
  return (offset * dimension * c) / (dimension + c * Math.abs(offset))
}
```

At small overshoot it is nearly linear; as overshoot grows the output asymptotes,
so the content can never be dragged fully off. Release springs it back with the
standard `response 0.4s, damping 1.0`. Motion's `dragElastic={0.5}` is a cruder
version of this, and is fine when the axis has no meaningful "past the edge"
content to reveal.

## Gesture details that decide whether it feels native

- **Respond on press-in, commit on press-out.** The highlight or `scale(0.97)`
  fires on `pointerdown` / `onBegin`, not on click. The interface acknowledging
  the touch immediately is most of what "responsive" means.
- **A few pixels of hysteresis before the drag commits.** `Gesture.Pan()
  .activeOffsetX([-10, 10])` on native; on web, ignore pointer moves under ~8px
  so a tap with a tremor is not read as a drag.
- **Respect the grab offset.** If the user grabbed a sheet 40px below its top
  edge, the sheet tracks so that point stays under the finger — never jump the
  top edge to the cursor.
- **Mirror reversible transitions.** A sheet that entered from the bottom exits
  to the bottom; a popover that grew from its trigger shrinks back into it
  (`transform-origin` at the trigger — `animation-framework.md` § *Popover Origin
  Awareness*). Entering one way and leaving another breaks the object's identity.
- **One gesture owns the frame.** Detect pan / pinch / long-press in parallel,
  but once one activates, cancel the others (`Gesture.Race` / `Gesture.Exclusive`
  in RNGH; an explicit state machine on web).

## Materials and depth

Translucency communicates layering: a surface you can partly see through reads as
*above* the thing behind it. Use `backdrop-filter` on overlays and sheets rather
than a flat scrim when the hierarchy is the message.

```css
.sheet {
  background: oklch(from var(--color-surface) l c h / 0.82);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
}
```

Set the blur once when the sheet mounts — never transition it. Animated
`backdrop-filter` repaints the whole region every frame;
`react-performance/SKILL.md` covers the paint cost.
`component-patterns/SKILL.md` Core Rule 6 carries the contrast check for
content sitting on a translucent layer.

## Reduced motion, transparency, contrast

Three OS preferences change this file's output, and only the first is usually
handled:

- **`prefers-reduced-motion: reduce`** — for motion the system plays *at* the
  user, replace the translate / scale / spring with an opacity crossfade under
  ~180ms. A dismissed sheet still closes; it fades rather than slides.
  `motion-budget.md` § *Reduced motion is not tier zero* is the rule.
  **This file's subject is the exception worth stating.** While a finger is down,
  keep the 1:1 position transform — a sheet that stops tracking the drag is
  broken, not calmed, and direct manipulation is not the vestibular trigger the
  preference exists for. What you drop is everything the *system* adds on top:
  overshoot, the settle spring, momentum projection and rubber-band travel.
  Under reduced motion a released drag lands on its resolved snap point
  immediately (or with a short linear fade), rather than flying there.
- **`prefers-reduced-transparency: reduce`** — drop the `backdrop-filter` for a
  solid `var(--color-surface)`. The blur is a render cost and a legibility
  burden for the users who set this.
- **`prefers-contrast: more`** — the translucent edge that separated two layers
  is now invisible; add a `1px solid var(--color-border)` so the boundary
  survives.

```css
@media (prefers-reduced-transparency: reduce) {
  .sheet {
    background: var(--color-surface);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
@media (prefers-contrast: more) {
  .sheet { border: 1px solid var(--color-border); }
}
```

Haptics, where the surface is native: fire the tap **on the same frame** as the
visual change, never after — a delayed haptic reads as a second, unrelated event.
`platform/references/react-native.md` § 10 has the `expo-haptics` mapping;
the web `navigator.vibrate` equivalent is unsupported on iOS Safari and must
never be the only feedback channel.

## Checklist

- [ ] Finger-driven motion uses springs, not fixed durations
- [ ] Release velocity is passed into the settling spring
- [ ] Travel distance comes from projecting velocity then snapping — not from the drop point
- [ ] Boundaries rubber-band; nothing hard-stops or drags fully off
- [ ] Press-in feedback fires on pointer-down
- [ ] Grab offset respected; content tracks the held point
- [ ] Enter and exit are mirror images
- [ ] `bounce` ≤ 0.2 on every control; overshoot reserved for first-run moments
- [ ] Reduced-motion, reduced-transparency and increased-contrast paths all defined
- [ ] Any haptic fires on the same frame as the visual, and is not the only feedback

## Sources

Adapted from `emilkowalski/skills` (the `apple-design` skill — MIT,
Copyright © Emil Kowalski), which states Apple's Human Interface Guidelines
motion model for the web. The spring-by-feel parameterisation, the
momentum-projection and rubber-banding formulae, the velocity-handoff rule and
the press-in / grab-offset / hysteresis details come from that source.

Converted to this pack's rules: OKLCH via `oklch(from …)` relative colour rather
than raw values; the `bounce ≤ 0.2` ceiling tied to `MOTION-02R`; the
`prefers-reduced-transparency` and `prefers-contrast` paths; and the
cross-references to `animation-framework.md`, `motion-budget.md`,
`react-performance` and `react-native.md`.

## What was corrected on the way in

| From the source | Change | Why |
|---|---|---|
| `scale` / `x` / `y` "are not hardware-accelerated in Motion" | Dropped the claim | `motion.md` § 10 and Motion 12's compositor-driven transforms make it stale — a verification note that aged |
| Momentum-gesture `bounce: 0.8` | Not carried into example code | `MOTION-02R` fails a spring `bounce` over `0.4`; the pack's position is that UI overshoot reads dated |
| Raw colour values on materials | `oklch(from var(--color-surface) …)` | `COL-04` / `TOK-01` — one source of truth for the surface hue |
| Reduced-motion as the only accessibility branch | Added transparency and contrast media queries | `backdrop-filter` carries its own two OS preferences |
