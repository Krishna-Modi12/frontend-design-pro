# Rendering Performance

`react-performance.md` is the citable taxonomy for waterfalls, bundles and
re-renders — work that happens before or around paint. This file is about the
main thread *during* interaction and scroll: why a frame is dropped, how to
see it, and how to give the browser room to paint.

Framework-agnostic. It cross-links the React-specific rules rather than
restating them, and the smooth-scroll and easing rules stay in
`../../animations/references/`.

## The frame budget

The browser tries to produce a frame every **16.7 ms** at 60 Hz, **8.3 ms** at
120 Hz. Subtract the browser's own compositing, style and layout work and the
script budget per frame is closer to **10 ms** and **5 ms**. Go over it and the
frame is late — the pointer stalls, the scroll hitches, the animation steps.
That is jank, and it is a main-thread problem almost every time: the GPU is
idle while JavaScript holds the thread.

Two things follow. Long, uninterrupted work is worse than the same work split
into pieces, because the split lets input and paint run in the gaps. And work
that runs *in response to* input — a click handler, a `resize`, a `scroll` —
is on the critical path for the next frame, so it is where the budget is
tightest.

## Metrics — naming the cost

| Metric | Where | Threshold | Measures |
|---|---|---|---|
| **Long Task** | Lab + field | any task > 50 ms | A single block of main-thread work. Blunt — no attribution. |
| **Long Animation Frame (LoAF)** | Field (Chrome) | frame > 50 ms | A rendering-blocked frame, *with* script attribution, and a style/layout/paint breakdown. The better signal where it is available. |
| **TBT** — Total Blocking Time | Lab | sum of (task − 50 ms) between FCP and TTI | Lighthouse's proxy for load-time responsiveness. |
| **INP** — Interaction to Next Paint | Field | ≤ 200 ms good · 200–500 ms needs work · > 500 ms poor, at p75 | The Core Web Vital for responsiveness — the slowest interaction on the page across the visit. |

INP is the one that ships in the ranking signal, and it is a *whole-visit*
measurement: one slow menu open at the end drags the score down as much as a
slow one at the start. TBT in the lab and INP in the field usually move
together — fix TBT and INP tends to follow.

## Seeing it

- **DevTools → Performance.** Record an interaction. The main-thread track shows
  tasks as bars; a red top-right corner marks a long task. Widen one to see the
  call tree. Turn on **Paint flashing** (Rendering tab) to see what repaints
  each frame, and **Layout Shift Regions** for CLS.
- **`PerformanceObserver`** in the page, for real-user data:

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) report(entry);
}).observe({ type: "long-animation-frame", buffered: true });
```

  Feature-detect with
  `PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")`;
  fall back to `type: "longtask"`. For INP specifically, the `web-vitals`
  library (Google, MIT) wraps the `event` timing entries and the p75 maths.
- **The lab lies about the CPU you don't have.** Profile with a 4× or 6× CPU
  throttle — a mid-range Android phone is roughly that far behind a dev laptop.

## Break up long tasks

If a task must do a lot of work, hand the thread back between chunks so input
and paint can run:

```js
async function process(items) {
  for (let i = 0; i < items.length; i++) {
    doWork(items[i]);
    if (i % 50 === 0) await yieldToMain();
  }
}

function yieldToMain() {
  if ("scheduler" in window && "yield" in scheduler) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

`scheduler.yield()` (Chrome and Firefox; not Safari yet) resumes *before* other
pending tasks, so yielding does not send your work to the back of the queue.
`scheduler.postTask()` adds priorities (`background` / `user-visible` /
`user-blocking`) for work you schedule rather than loop over. `isInputPending()`
lets a loop yield only when the user is actually waiting. All need the
`setTimeout(0)` fallback.

In React, `startTransition` and `useDeferredValue` are the idiomatic version of
this for state updates that trigger an expensive re-render
(`react-performance.md` §5, `rerender-transitions`). Reach for the scheduler
APIs for non-React work: parsing, formatting, canvas, data transforms.

## Forced synchronous layout

The browser batches style and layout changes until it needs the result. Ask
for a geometry value while a write is pending and it must lay out *now*, mid
task — a forced synchronous layout, or "layout thrashing" when it happens in a
loop.

```js
// ✗ read, write, read, write — one layout per iteration
for (const el of items) {
  el.style.height = el.offsetHeight / 2 + "px";
}

// ✓ read all, then write all — one layout total
const heights = items.map((el) => el.offsetHeight);
items.forEach((el, i) => { el.style.height = heights[i] / 2 + "px"; });
```

Properties that force layout when read with a pending write include
`offsetTop` / `offsetWidth` / `offsetHeight`, `scrollTop`, `clientWidth`,
`getBoundingClientRect()`, `getComputedStyle()`, `focus()`, and
`window.scrollY`. Do all reads first, do all writes in the next
`requestAnimationFrame`, and never read layout inside a `scroll` or `resize`
handler without that split. `seo.md` and `react-performance.md`'s
`js-batch-dom-css` carry the same rule for the Next.js context.

## content-visibility and containment

`content-visibility: auto` tells the browser to skip rendering work — layout,
paint, style — for a subtree that is off-screen, then do it as the element
nears the viewport.

```css
.row {
  content-visibility: auto;
  contain-intrinsic-size: auto 4rem; /* real once rendered, this as a guess before */
}
```

`contain-intrinsic-size` reserves the box so the scrollbar is honest; the
`auto` keyword makes the browser remember the last rendered size. `contain:
layout paint` is the manual version — it promises the element's internals do
not affect outside layout, which lets the browser skip it more aggressively.

Two caveats. Skipped content is still in the accessibility tree and still
found by in-page search, which is correct — but a huge `content-visibility`
subtree can slow `Ctrl+F`. And support is strongest in Chromium; Safari and
Firefox have been catching up, so treat it as an enhancement over a plain long
list, not a load-bearing layout tool. Past ~100 rendered rows, a real
virtualiser still wins (`react-performance.md` §6).

## High-frequency handlers

`scroll`, `pointermove`, `resize`, `wheel` and `input` fire many times per
second. A handler that does real work on every one — especially `setState` —
re-renders or re-lays-out every frame.

- **Passive listeners.** `addEventListener("touchstart", fn, { passive: true })`
  (and `wheel`, `scroll`) tells the browser you will not call
  `preventDefault()`, so it can scroll on the compositor without waiting for
  your handler. `react-performance.md`'s `client-passive-event-listeners`.
- **Coalesce to a frame.** For anything that updates the DOM from scroll or
  pointer position, store the value in the handler and do the write once per
  `requestAnimationFrame`, guarded by a `ticking` flag. This is the pack's
  standard for scroll-driven UI — a bare `scroll` → `setState` is an `ANI-04`
  finding.
- **Debounce vs throttle.** Debounce (run after input stops) for search-as-you
  -type and autosave; throttle (run at most every N ms) for progress readouts.
  rAF-coalescing is the right throttle for anything visual.
- **Scroll-linked animation** belongs in CSS where it can:
  `animation-timeline: scroll()` and `view()` run off the main thread entirely.
  `IntersectionObserver` replaces a scroll handler for "is it visible"
  questions. `../../animations/references/scroll-experience.md` covers the
  scroll-story cases that genuinely need JavaScript.

## will-change is a loan, not a gift

`will-change: transform` (or the old `translateZ(0)` hammer) promotes an
element to its own compositor layer so its animation skips paint. Each layer
costs GPU memory, and a page that promotes twenty elements exhausts the budget
and gets *slower* — the compositor spends its time managing layers.

- Set it just before the animation starts — on `:hover`, or from script one
  frame ahead — and **remove it when the animation ends**
  (`web-interface-guidelines.md` §2).
- Never put it in a static stylesheet on a class that many elements carry.
- If you are animating `transform` and `opacity` only (which you should be —
  `animations` rule 5), the browser often promotes automatically and you do
  not need `will-change` at all.

## Off the main thread

| Work | Move it to |
|---|---|
| Parsing, formatting, diffing, crypto, search-index build, image decode/resize | A **Web Worker** — `parallelization.md` §4 has the Comlink setup |
| Canvas or WebGL rendering that runs every frame | **`OffscreenCanvas`** transferred to a worker, so the render loop never touches the main thread |
| Analytics beacons, cache warming, prefetching low-priority data, non-urgent logging | **`requestIdleCallback`** — runs in the gaps after a frame, with a `timeout` so it is not starved forever |

`requestIdleCallback` gives you a `deadline.timeRemaining()` — treat 50 ms as
the ceiling and yield if you are close, the same discipline as a long task.

## DOM size

Style recalculation and layout scale worse than linearly with node count.
Lighthouse warns past **~800** nodes and errors past **~1,400**, and past a
depth of **~32**. A large DOM also means more memory and slower
`querySelector`.

The fixes are the same three: render less (pagination, "load more"),
virtualise long lists, or `content-visibility: auto` on off-screen sections.
A component that renders 5,000 table rows into the DOM is the single most
common cause of a janky page that profiles clean on load.

## Paint cost

Paint is cheap until it is not. These are expensive per frame, and ruinous if
animated:

- **`filter`** and **`backdrop-filter`** — especially `blur()`. A large blur
  radius over a large area repaints that whole area every frame the backdrop
  changes. `glassmorphism.md` covers the glass-specific budget; the general
  rule is one or two backdrop-blurred surfaces per screen, never on a scrolling
  list.
- **`box-shadow`** with a large blur or spread, stacked several deep — each
  layer is a paint. A single tight shadow is free; six soft ones on every card
  in a grid is not.
- **Large `border-radius` with `overflow: hidden`** on an element that also
  has a shadow or filter forces the browser to clip on every paint.

Animate `transform` and `opacity`, which the compositor handles without
repainting. Use **Paint flashing** in devtools to find what is repainting that
should not be — a fixed header repainting on every scroll frame is the classic
catch.

## Check before you ship

- Profiled with a 4–6× CPU throttle, not just on the dev machine.
- No interaction handler runs more than ~50 ms of script; long work yields.
- DOM reads and writes are batched; nothing reads geometry inside a scroll or
  resize handler.
- Scroll and pointer handlers are passive where possible and coalesced to
  `requestAnimationFrame`; no `setState` per scroll event.
- `will-change` is applied for the duration of an animation and removed after —
  never static on a shared class.
- No list renders more than ~100 rows without virtualisation or
  `content-visibility`.
- `backdrop-filter` is on at most one or two surfaces per screen and never on a
  scrolling container.
- A field metric for INP or LoAF is actually being collected, not assumed.

## Sources

Frame-budget and rendering-pipeline model from the Chrome team's public
rendering-performance guidance and the RAIL model. Long Animation Frames and
`scheduler.yield()` / `scheduler.postTask()` from the WICG and W3C
specifications and their MDN references; INP thresholds from web.dev's Core Web
Vitals documentation (Google). `content-visibility` from the CSS Containment
Module. The rAF-coalescing rule and the `ANI-04` reference are this pack's.
No third-party code was taken; the two snippets are written for this file.
