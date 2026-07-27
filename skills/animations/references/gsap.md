# GSAP Reference — Frontend Design Pro
> Sourced from greensock/GSAP + greensock/gsap-skills (official AI skill repo)
> All plugins now 100% FREE including SplitText, MorphSVG, DrawSVG for commercial use.

---

## INSTALLATION

```bash
npm install gsap @gsap/react
```

**CDN (artifact/HTML mode):**
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/ScrollTrigger.min.js"></script>
```

---

## CORE METHODS

```js
gsap.to(".box", { x: 100, opacity: 1, duration: 0.6, ease: "power3.out" })
gsap.from(".box", { y: 40, opacity: 0, duration: 0.5 })
gsap.fromTo(".box", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 })
gsap.set(".box", { x: 0, opacity: 0 })        // instant, no animation

// Timeline — preferred for sequences
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } })
tl.to(".a", { x: 100 })
  .to(".b", { y: 50 }, "-=0.2")               // 0.2s overlap
  .from(".c", { opacity: 0 }, "+=0.1")         // 0.1s gap
  .to(".d", { x: 50 }, "<")                   // same time as previous

// Position parameter shortcuts
// "+=0.2"   → 0.2s after previous ends
// "-=0.2"   → 0.2s before previous ends
// "<"       → same start time as previous
// "<0.2"    → 0.2s after previous STARTS
// "label"   → at a named label

// Responsive animations
gsap.matchMedia().add("(min-width: 768px)", () => {
  gsap.to(".box", { x: 200 })
})
```

**Key tween properties:**
```js
{
  x, y, z,                    // transform (px)
  xPercent, yPercent,         // transform (%)
  scale, scaleX, scaleY,
  rotation, rotationX, rotationY,
  skewX, skewY,
  autoAlpha,                  // opacity + visibility:hidden at 0 (prefer over opacity alone)
  backgroundColor, color,     // color animation
  duration, delay, ease,
  repeat, repeatDelay, yoyo,
  stagger: 0.05,              // or stagger: { each: 0.05, from: "center" }
  onComplete, onStart, onUpdate, onRepeat,
  overwrite: "auto",          // kill conflicting tweens automatically
}
```

---

## PLUGIN REGISTRATION — REQUIRED BEFORE USE

```js
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { Flip } from "gsap/Flip"
import { SplitText } from "gsap/SplitText"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { Observer } from "gsap/Observer"
import { Draggable } from "gsap/Draggable"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
import { CustomEase } from "gsap/CustomEase"

// Register ALL plugins at app top-level (NOT inside re-rendering components)
gsap.registerPlugin(
  ScrollTrigger, ScrollSmoother, Flip, SplitText,
  MorphSVGPlugin, DrawSVGPlugin, MotionPathPlugin,
  Observer, Draggable, InertiaPlugin, ScrambleTextPlugin,
  CustomEase
)
```

---

## SCROLLTRIGGER — COMPLETE API

```js
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

// Full config
gsap.to(".box", {
  x: 500,
  scrollTrigger: {
    trigger: ".section",        // element that controls firing
    start: "top 80%",           // "triggerEdge scrollerEdge"
    end: "bottom 20%",
    scrub: true,                // link to scroll (true = direct, number = lag seconds)
    pin: true,                  // pin trigger element during animation
    pin: ".hero",               // pin a different element
    pinSpacing: true,           // add space below pin (default: true)
    anticipatePin: 1,           // pre-pin to prevent jump
    markers: true,              // debug markers (DEV ONLY — remove in prod)
    toggleActions: "play none none reverse",
    // 4 values: onEnter onLeave onEnterBack onLeaveBack
    // values: play | pause | resume | reverse | complete | restart | reset | none
    toggleClass: { targets: ".nav", className: "active" },
    horizontal: false,          // true for horizontal scroll containers
    containerAnimation: tl,     // link to horizontal container tween
    scroller: "#scroll-container",
    invalidateOnRefresh: true,  // recalc start/end on resize
    refreshPriority: 1,

    // Callbacks
    onEnter: ({ progress, direction, isActive }) => {},
    onLeave: (self) => {},
    onEnterBack: (self) => {},
    onLeaveBack: (self) => {},
    onUpdate: (self) => { console.log(self.progress.toFixed(3)) },
    onToggle: (self) => {},
    onRefresh: (self) => {},
  }
})
```

**start/end string format:** `"triggerEdge scrollerEdge"`
- Trigger edges: `top` `center` `bottom` `Npx` `N%`
- Examples: `"top 80%"` `"center center"` `"bottom top"` `"top+=100 center-=50"`

**toggleActions presets:**
```
"play none none none"       // default — play once, never reverse
"play none none reverse"    // reverse when scrolling back up
"play pause resume reverse" // pause when leaving
"restart none none reverse" // restart on re-enter
```

**ScrollTrigger.create() — standalone (no tween):**
```js
ScrollTrigger.create({
  trigger: ".section",
  start: "top 50%",
  onEnter: () => document.body.classList.add("dark"),
  onLeaveBack: () => document.body.classList.remove("dark"),
})
```

**ScrollTrigger.batch() — stagger group reveals:**
```js
ScrollTrigger.batch(".card", {
  onEnter: batch => gsap.from(batch, {
    opacity: 0, y: 40, stagger: 0.07, duration: 0.6
  }),
  start: "top 85%",
  once: true,
})
```

**Horizontal scroll (pinned container):**
```js
const sections = gsap.utils.toArray(".panel")
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".container", pin: true, scrub: 1,
    start: "top top",
    end: () => "+=" + sections.length * window.innerWidth,
  }
})
sections.forEach(panel => tl.to(panel, { xPercent: -100, ease: "none" }))
```

**Utility methods:**
```js
ScrollTrigger.refresh()           // recalculate all (call after DOM changes)
ScrollTrigger.kill()              // kill all instances
ScrollTrigger.getAll()            // get array of all instances
ScrollTrigger.normalizeScroll(true) // fix mobile scroll jank
```

---

## REACT — useGSAP HOOK

```bash
npm install @gsap/react
```

```jsx
import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ONCE at app root (e.g. main.tsx or _app.tsx) — NOT in components
gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Hero() {
  const container = useRef()

  useGSAP(() => {
    // All animations auto-cleaned on unmount — no manual cleanup needed
    gsap.from(".hero-text", { opacity: 0, y: 30, duration: 0.6 })

    gsap.to(".box", {
      x: 200,
      scrollTrigger: {
        trigger: ".box",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    })
  }, { scope: container })  // scope = selectors relative to container ref

  return <div ref={container}>...</div>
}
```

**contextSafe — event handlers that create animations:**
```jsx
const { contextSafe } = useGSAP({ scope: container })

// MUST wrap any function that creates GSAP animations in click/hover handlers
const handleClick = contextSafe(() => {
  gsap.to(".box", { x: 100, duration: 0.3 })
})
return <button onClick={handleClick}>Animate</button>
```

**revertOnUpdate — re-animate on dependency change:**
```jsx
useGSAP(() => {
  gsap.to(".item", { opacity: isVisible ? 1 : 0 })
}, { scope: container, dependencies: [isVisible], revertOnUpdate: true })
```

---

## FLIP — LAYOUT ANIMATIONS

```js
import { Flip } from "gsap/Flip"
gsap.registerPlugin(Flip)

// 3 steps: getState → modify DOM → Flip.from()
const state = Flip.getState(".items")   // capture positions
container.appendChild(item)            // or reorder, toggle class...
Flip.from(state, {
  duration: 0.6, ease: "power2.inOut",
  absolute: true,    // position:absolute during transition
  nested: true,      // include nested children
  scale: true,       // scale instead of animate width/height
  stagger: 0.05,
})

// Capture extra properties
const state = Flip.getState(".box", { props: "background-color,borderRadius" })
```

---

## SPLITTEXT — TEXT ANIMATIONS

```js
import { SplitText } from "gsap/SplitText"
gsap.registerPlugin(SplitText)

// With autoSplit (responsive — required for production)
SplitText.create(".headline", {
  type: "lines",
  mask: "lines",          // overflow:clip wrapper for slide reveals
  aria: "auto",           // adds aria-label/aria-hidden for accessibility
  autoSplit: true,        // re-split on font load and resize
  onSplit(self) {         // define animations HERE when using autoSplit
    return gsap.from(self.lines, {
      y: "100%", stagger: 0.1, duration: 0.7, ease: "power3.out",
      scrollTrigger: {
        trigger: self.elements[0], start: "top 85%",
        toggleActions: "play none none reverse"
      }
    })
  }
})

// Per-character animation
SplitText.create(".title", {
  type: "chars, words",
  autoSplit: true,
  onSplit(self) {
    return gsap.from(self.chars, { opacity: 0, y: 20, stagger: 0.02, duration: 0.4 })
  }
})

// Cleanup
split.revert()
```

**SplitText gotchas:**
- `text-wrap: balance` + SplitText = broken lines. Never combine.
- Custom fonts: use `autoSplit: true` OR split after `document.fonts.ready`
- Chars-only: add `smartWrap: true` to prevent odd mid-word breaks
- SVG `<text>` elements: NOT supported

---

## OBSERVER — GESTURE DETECTION

```js
import { Observer } from "gsap/Observer"
gsap.registerPlugin(Observer)

Observer.create({
  target: "#container",
  type: "touch, pointer, wheel",
  tolerance: 10,
  onUp: () => goToNextSection(),
  onDown: () => goToPrevSection(),
  onLeft: () => {},
  onRight: () => {},
  preventDefault: true,
})
```

---

## DRAGGABLE + INERTIA

```js
import { Draggable } from "gsap/Draggable"
import { InertiaPlugin } from "gsap/InertiaPlugin"
gsap.registerPlugin(Draggable, InertiaPlugin)

Draggable.create(".card", {
  type: "x,y",               // "x" | "y" | "x,y" | "rotation"
  bounds: "#container",
  inertia: true,             // throw/momentum (requires InertiaPlugin)
  edgeResistance: 0.65,
  cursor: "grab",
  activeCursor: "grabbing",
  snap: { x: gsap.utils.snap(50) },
  onDrag() { console.log(this.x, this.y) },
  onDragEnd() {},
  onThrowComplete() {},
})
```

---

## SCROLLSMOOTHER — SMOOTH SCROLL

```js
// Required DOM:
// <div id="smooth-wrapper">
//   <div id="smooth-content"> ALL content here </div>
// </div>

import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
gsap.registerPlugin(ScrollTrigger, ScrollSmoother)  // ScrollTrigger FIRST

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,
  effects: true,            // enable data-speed / data-lag attributes
  normalizeScroll: true,
})

// HTML data attributes for parallax
// <div data-speed="0.5">slow parallax</div>
// <div data-lag="0.3">lagging</div>
```

---

## MORPHSVG + DRAWSVG

```js
// MorphSVG
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
gsap.registerPlugin(MorphSVGPlugin)
MorphSVGPlugin.convertToPath("circle, rect, ellipse")  // convert primitives first
gsap.to("#shape-a", { duration: 1, morphSVG: "#shape-b", ease: "power2.inOut" })

// DrawSVG — reveal stroke
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
gsap.registerPlugin(DrawSVGPlugin)
gsap.from("#path", { duration: 1.5, drawSVG: 0, ease: "power2.inOut" })
// "0% 0%" → "0% 100%" = reveal left to right
// "50% 50%" → "0% 100%" = reveal from center
```

---

## SCRAMBLETEXT + MOTIIONPATH

```js
// ScrambleText
gsap.to(".label", {
  duration: 1,
  scrambleText: { text: "CONNECTED", chars: "01", revealDelay: 0.3 }
})

// MotionPath — animate along SVG path
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
gsap.registerPlugin(MotionPathPlugin)
gsap.to(".car", {
  motionPath: { path: "#road", align: "#road", autoRotate: true, alignOrigin: [0.5, 0.5] },
  duration: 3, ease: "none", repeat: -1,
})
```

---

## CUSTOM EASE

```js
import { CustomEase } from "gsap/CustomEase"
gsap.registerPlugin(CustomEase)
CustomEase.create("hop", "M0,0 C0.29,0 0.577,0.234 0.632,0.5 0.718,0.902 0.988,1 1,1")
gsap.to(".box", { y: -100, duration: 0.8, ease: "hop" })
```

---

## STAGGER PATTERNS

```js
// Simple
gsap.from(".item", { opacity: 0, y: 20, stagger: 0.07 })

// Advanced stagger
gsap.from(".item", {
  opacity: 0, y: 20,
  stagger: {
    each: 0.07,
    from: "center",       // "start" | "center" | "end" | "random" | index number
    grid: [3, 4],         // treat as grid
    axis: "x",
    ease: "power1.in",
  }
})
```

---

## COMMON PRODUCTION PATTERNS

**Fade in on scroll (batch — best for lists/grids):**
```js
ScrollTrigger.batch(".card", {
  onEnter: batch => gsap.from(batch, { opacity: 0, y: 40, stagger: 0.07, duration: 0.6 }),
  start: "top 85%", once: true,
})
```

**Parallax background:**
```js
gsap.to(".bg", {
  yPercent: -30, ease: "none",
  scrollTrigger: { trigger: ".section", scrub: true }
})
```

**Pin + scrub hero:**
```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: ".hero", pin: true, scrub: 1, start: "top top", end: "+=100%" }
})
tl.to(".hero-title", { scale: 0.6, autoAlpha: 0 })
  .to(".hero-visual", { scale: 1.2 }, "<")
```

**Section-by-section full-page (Observer pattern):**
```js
let current = 0, animating = false
Observer.create({
  type: "touch,pointer,wheel",
  tolerance: 10,
  preventDefault: true,
  onUp: () => { if (!animating && current < sections.length - 1) goTo(++current) },
  onDown: () => { if (!animating && current > 0) goTo(--current) },
})
function goTo(index) {
  animating = true
  gsap.to(sections[index], { autoAlpha: 1, duration: 0.6, onComplete: () => animating = false })
  gsap.to(sections[current], { autoAlpha: 0, duration: 0.4 })
}
```

---

## GSAP-SKILLS MODULES (greensock/gsap-skills)

Official AI skill modules — reference the relevant one per task:

| Module | When to reference |
|--------|---------|
| `gsap-core` | Tweens, timeline, stagger, easing |
| `gsap-timeline` | Sequences, position params, labels |
| `gsap-scrolltrigger` | Scroll animations, pin, scrub, batch |
| `gsap-plugins` | Flip, Draggable, Observer, SplitText, etc. |
| `gsap-react` | useGSAP, contextSafe, SSR, cleanup |
| `gsap-utils` | clamp, mapRange, normalize, interpolate |
| `gsap-performance` | GPU layers, avoiding reflow properties |
| `gsap-frameworks` | Vue, Svelte, Angular lifecycle |

---

## PERFORMANCE RULES

✅ Animate: `x` `y` `scale` `rotation` `opacity` `autoAlpha`
❌ Never animate: `width` `height` `top` `left` `margin` `padding` (causes layout reflow)

```js
gsap.set(".el", { force3D: true, transformOrigin: "50% 50%" })
```

---

## COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| Plugin not found | `gsap.registerPlugin(ScrollTrigger)` before any use |
| Animations not cleaning up in React | Use `useGSAP()` not `useEffect()` |
| Event handler animations linger | Wrap with `contextSafe()` |
| ScrollTrigger fires wrong position | Call `ScrollTrigger.refresh()` after DOM changes |
| SplitText wrong line breaks | Use `autoSplit: true` with `onSplit()` |
| SplitText + custom font = wrong splits | Split after `document.fonts.ready` |
| ScrollSmoother + ScrollTrigger conflict | Register ScrollTrigger BEFORE ScrollSmoother |
| Horizontal scroll not working | Add `ease: "none"` to container timeline |
| `text-wrap: balance` + SplitText | Never combine — breaks line detection |
