# Lenis — Smooth Scroll (animations)

Route: a brief asking for "smooth scrolling", momentum/inertia scroll, or a scroll-driven
sequence that must stay synchronised with GSAP.
Source: `darkroomengineering/lenis` (`react-lenis` is archived — it is now `lenis/react` inside
the monorepo; import from there).

`scroll-experience.md` covers scroll-*driven* animation (ScrollTrigger, viewport reveals,
parallax). This file covers replacing the browser's native scroll behaviour itself, which is a
different and riskier decision.

## Decide before installing

Hijacking scroll is a **user-hostile default**. It breaks scroll-snap, fights trackpad inertia,
adds input latency, and is the single most common cause of "this site feels broken on my
machine". Install it only when the brief genuinely calls for a cinematic, scroll-scrubbed
experience — never as a global polish pass on an ordinary product UI.

If you cannot name what the smoothing communicates, do not add it. That is rule 1 of the
animations skill applied to the scroll container.

## Options and real defaults

| Option | Default | Notes |
|---|---|---|
| `lerp` | `0.1` | interpolation factor; lower = heavier/laggier. Prefer this over `duration` |
| `duration` | `1.2` | seconds; used when `lerp` is not driving |
| `easing` | `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | exponential ease-out |
| `orientation` | `'vertical'` | or `'horizontal'` |
| `smoothWheel` | `true` | the actual smoothing switch |
| `syncTouch` | `false` | **leave false.** `true` overrides native touch and misbehaves on iOS < 16 |
| `syncTouchLerp` | `0.075` | only relevant with `syncTouch` |
| `wheelMultiplier` / `touchMultiplier` | `1` | changing these breaks scroll-distance expectations |
| `autoRaf` | `false` | you must drive the frame loop yourself unless you set this |
| `anchors` | `false` | set `true` (or pass `{ offset, onComplete }`) or in-page `#` links stop working |
| `allowNestedScroll` | `false` | set `true`, or nested scrollers (modals, code blocks) will not scroll |
| `stopInertiaOnNavigate` | `false` | set `true` in any SPA — otherwise momentum from the last flick carries into the next route and scrolls the new page |

## The RAF requirement

`raf(time)` must run every frame or nothing scrolls at all. Either `autoRaf: true`, or drive it:

```js
function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

## React usage

```tsx
'use client'
import { ReactLenis, useLenis } from 'lenis/react'
```

`<ReactLenis root>` makes the instance globally reachable through `useLenis()` anywhere in the
tree. `useLenis((lenis) => { … })` subscribes to scroll. The instance is reachable off the ref
as `lenisRef.current?.lenis`.

Client component only — it touches `window` on mount, so it needs `'use client'` and must not
be imported into a server component.

## GSAP ScrollTrigger integration

Two frame loops fighting each other is the classic Lenis bug. Hand the loop to GSAP's ticker
and let ScrollTrigger update from Lenis' scroll event — never both:

```tsx
const lenisRef = useRef<LenisRef>(null)

useEffect(() => {
  function update(time: number) {
    lenisRef.current?.lenis?.raf(time * 1000)   // GSAP ticker is seconds, Lenis is ms
  }
  gsap.ticker.add(update)
  gsap.ticker.lagSmoothing(0)
  return () => { gsap.ticker.remove(update) }
}, [])

return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
```

Three non-negotiables: `autoRaf: false`, `time * 1000`, and `gsap.ticker.lagSmoothing(0)`.
Omit the last and ScrollTrigger jumps after any frame drop. For a non-React setup the
equivalent first step is `lenis.on('scroll', ScrollTrigger.update)`.

## Reduced motion — you must add this yourself

**Lenis ships no `prefers-reduced-motion` handling.** The library will smooth-scroll a user who
has explicitly asked the OS for less motion, which violates the animations skill's mandatory
rule 7. Gate it at the mount site:

```tsx
const reduced = useReducedMotion()
return reduced ? <>{children}</> : <ReactLenis root>{children}</ReactLenis>
```

Destroying or never mounting the instance restores native scroll. Do not merely set
`duration: 0` — the wheel handler stays attached and latency remains.

## Escaping the smoothing

Nested scrollers must opt out or they will not scroll:

- `data-lenis-prevent` on the element, or
- `prevent: (node) => node.classList.contains('modal')`, or
- `allowNestedScroll: true` to detect them automatically.

## Known limits

- `position: fixed` lags on pre-M1 macOS Safari.
- Capped to 60fps on Safari; 30fps in low-power mode.
- CSS `scroll-snap` does not work — requires the separate `lenis/snap` plugin.
- `syncTouch: true` behaves unpredictably on iOS < 16.
