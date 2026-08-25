# Interaction Patterns

The same motion catalogue that `animation-recipes.md` holds, indexed by **tier**
rather than by effect. Load it when the tier is already decided — `motion-budget.md`
picked L1, L2 or L3 — and you need the set of moves that belong at that level,
in framework-free CSS and DOM so they drop into a static page, an email-adjacent
landing, or a non-React surface as readily as into Next.js.

Where a pattern has a deeper, React-native treatment in this pack, the entry
points at it rather than restating it. Where the upstream code broke one of this
skill's own rules, the code here is corrected and the change is noted inline.

## Contents

- [Shared foundation](#shared-foundation)
- [Reduced motion, done properly](#reduced-motion-done-properly)
- [L1 — refined static](#l1--refined-static)
- [L2 — fluid interaction](#l2--fluid-interaction)
- [L3 — immersive](#l3--immersive)
- [Decorative effects, by direction](#decorative-effects-by-direction)
- [What was corrected on the way in](#what-was-corrected-on-the-way-in)
- [Sources](#sources)

---

## Shared foundation

Every tier builds on the same reveal trigger. One observer, unobserved after it
fires, so a revealed element stops costing anything.

```tsx
import { useCallback, useEffect, useState } from "react";

export function useInView(
  options: IntersectionObserverInit = {},
): [(node: HTMLElement | null) => void, boolean] {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, ...options },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, options]);

  return [useCallback((n: HTMLElement | null) => setNode(n), []), inView];
}
```

Deeper treatment: `framer-motion.md` covers `useInView` and `whileInView`, which
you should prefer when Framer is already a dependency — it handles re-entry,
margins and `once` without your own observer.

The frameworkless equivalent, for a page with no React:

```js
function initScrollReveal(selector = ".reveal", cls = "in-view") {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(cls);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
}
document.addEventListener("DOMContentLoaded", () => initScrollReveal());
```

**The trap in that pattern, and the fix.** A `.reveal` class that starts at
`opacity: 0` makes the content invisible to anyone whose JavaScript did not run —
a failed bundle, a crawler, a strict content blocker. The starting state must
therefore be applied *by* script, not by stylesheet:

```js
document.documentElement.classList.add("js");
```

```css
/* Hidden only once we know something is able to un-hide it. */
.js .reveal { opacity: 0; transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1); }
.js .reveal.in-view { opacity: 1; }
```

Anchored scrolling, which every pinned or in-page-nav pattern below assumes:

```css
html { scroll-behavior: smooth; }
[id] { scroll-margin-top: 80px; }
```

**Drop the `scroll-behavior` line if the page uses Lenis** — Lenis drives scroll
from a rAF loop and the browser animating the same property alongside it makes
anchor jumps stutter or land short. `scroll-margin-top` still applies either way.
See `lenis-smooth-scroll.md`.

`scroll-margin-top` is the one people forget; without it a fixed header covers
the heading the anchor just jumped to.

## Reduced motion, done properly

The blanket override is worth knowing and worth *not* shipping alone:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

It is a safety net, not a strategy. It collapses durations, which lands most
elements on their end state — but anything whose end state depends on a class a
script adds is still gated on that script, and anything mid-`@keyframes` at
iteration one can land somewhere arbitrary. `motion-budget.md` states the
principle this implements: **reduced motion renders the destination, it does not
render nothing.** For each pattern below, the reduced-motion answer is "the
element, finished, in place" — so pair the net with an explicit rule:

```css
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-scale { opacity: 1; transform: none; }
}
```

---

## L1 — refined static

Elegant hover feedback and a soft arrival. Motion never competes with the
content; information comes first. This is the correct tier for dashboards,
documentation, forms and anything a person uses daily.

### Entrance — fade

```css
.js .reveal {
  opacity: 0;
  transition: opacity 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.js .reveal.in-view { opacity: 1; }
```

### Entrance — small rise

```css
.js .reveal-up {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.js .reveal-up.in-view { opacity: 1; transform: translateY(0); }
```

16px is deliberately small. The rise should register as *arrival*, not as
travel; past roughly 32px at L1 the eye starts tracking the movement instead of
reading what arrived.

### Hover — lift and shadow

```css
.card {
  transition: transform 300ms ease-out, box-shadow 300ms ease-out;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px oklch(0% 0 0 / 0.06);
}
```

Deeper treatment: `animation-recipes.md` § 10 Hover Lift Card.

### Hover — colour shift

```css
.btn {
  background: var(--color-brand);
  transition: background-color 200ms ease-out, color 200ms ease-out;
}
.btn:hover { background: var(--color-brand-hover); }
```

### Hover — underline slide

```css
.link { position: relative; text-decoration: none; }
.link::after {
  content: "";
  position: absolute;
  inset-block-end: -2px;
  inset-inline-start: 0;
  inline-size: 0;
  block-size: 2px;
  background: var(--color-brand);
  transition: inline-size 300ms ease-out;
}
.link:hover::after { inline-size: 100%; }
```

Animating `inline-size` is a layout property and therefore not compositor-driven —
tolerable on a 2px rule that affects nothing around it, and the reason this is a
pseudo-element rather than a border on the link itself. For a link inside running
text, prefer `text-underline-offset` and a colour change; see
`../../design-system/references/typographic-finishing.md`.

### Focus ring

```css
:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
```

Not optional and not a motion decision. `A11Y-06` fails any `outline: none` that
does not replace the indicator with something visible.

---

## L2 — fluid interaction

Scroll reveals, parallax, a navigation bar that responds to position. Each
section reads as a scene with its own arrival. This is the tier most marketing
pages want.

### Entrance — rise with stagger

Travel and duration are the canonical reveal expressed in CSS — see
`animation-framework.md` § *The canonical scroll reveal*.

```css
.js .reveal-stagger { opacity: 0; transform: translateY(24px); }
.js .reveal-stagger.in-view { opacity: 1; transform: translateY(0); }
.js .reveal-stagger > * {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 500ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
.js .reveal-stagger.in-view > * { opacity: 1; transform: translateY(0); }
```

Rather than hand-writing `:nth-child` delays — which silently stop staggering at
whatever count you wrote — set them from the DOM, and cap the total:

```js
function initStaggerReveal(containerSelector = ".reveal-stagger", step = 0.08) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      Array.from(entry.target.children).forEach((child, i) => {
        child.style.transitionDelay = `${Math.min(i * step, 0.6)}s`;
      });
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(containerSelector).forEach((el) => observer.observe(el));
}
```

The 0.6s cap is the load-bearing line. Twelve cards at the canonical 80ms apart
means the last one arrives 0.96 seconds after the first, by which point it reads
as a slow page rather than as choreography — so the cap bites at item eight.

Deeper treatment: `animation-recipes.md` § 1 Staggered List Reveal, and
`framer-motion.md` for `staggerChildren` when Framer is present.

### Entrance — scale in

```css
.js .reveal-scale {
  opacity: 0;
  transform: scale(0.92);
  transition:
    opacity 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.js .reveal-scale.in-view { opacity: 1; transform: scale(1); }
```

0.92, never 0 — a scale from zero reads as a glitch rather than as an entrance.
That easing overshoots slightly past 1, which is what gives it the small pop.

### Parallax — native scroll-driven

```css
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .parallax-bg {
      animation: parallaxShift linear both;
      animation-timeline: scroll();
    }
  }
  @keyframes parallaxShift {
    from { transform: translateY(0); }
    to { transform: translateY(-80px); }
  }
}
```

This runs off the main thread and is the right answer where it is supported.
Deeper treatment: `scroll-experience.md` § CSS scroll-timeline.

### Parallax — JavaScript fallback

```js
function initParallax(selector = ".parallax", speed = 0.3) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = Array.from(document.querySelectorAll(selector));
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
}
```

`{ passive: true }` and the rAF gate are both required, not stylistic: without
the first the browser cannot scroll until your handler returns, and without the
second you run layout arithmetic several times per frame.

### Navigation — transparent to frosted

```css
.nav {
  position: fixed;
  inset-block-start: 0;
  inline-size: 100%;
  z-index: 100;
  background: transparent;
  border-block-end: 1px solid transparent;
  transition:
    background-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 300ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.nav.scrolled {
  background: oklch(from var(--color-surface) l c h / 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-block-end-color: var(--color-border);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.06);
}
```

```js
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
}, { passive: true });
```

Two corrections from the upstream version, both of which the gates enforce:
`transition: all` is banned by `PERF-04` because it animates properties you never
intended including ones that force layout, so the properties are listed; and the
translucent background comes from `oklch(from …)` relative colour rather than a
parallel `--color-bg-rgb` channel variable, which is a second source of truth
that drifts from the first.

### Scroll progress bar

```css
.scroll-progress {
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  block-size: 3px;
  inline-size: 100%;
  background: var(--color-brand);
  z-index: 1000;
  transform-origin: left;
  transform: scaleX(0);
}
```

```js
const bar = document.querySelector(".scroll-progress");
window.addEventListener("scroll", () => {
  const max = document.body.scrollHeight - window.innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}, { passive: true });
```

The `max > 0` guard matters: on a page shorter than the viewport the upstream
form divides by zero and writes `scaleX(Infinity)`.

Deeper treatment: `animation-recipes.md` § 6 Scroll-Progress Bar.

### Hover — image scale inside a card

```css
.img-card { overflow: hidden; border-radius: var(--radius); }
.img-card img {
  display: block;
  inline-size: 100%;
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
.img-card:hover img { transform: scale(1.06); }
```

The `overflow: hidden` on the parent is the whole trick — the image grows, the
frame does not.

### Hover — glowing border, dark directions only

```css
.glow-card { position: relative; transition: box-shadow 300ms ease-out; }
.glow-card:hover {
  box-shadow:
    0 0 0 1px var(--color-brand),
    0 0 20px oklch(from var(--color-brand) l c h / 0.15);
}
```

On a light surface this reads as a smudge rather than as light. It needs a
genuinely dark background to work at all.

### Button press

```css
.btn { transition: transform 150ms ease-out, box-shadow 150ms ease-out; }
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px oklch(from var(--color-brand) l c h / 0.25);
}
.btn:active { transform: translateY(0) scale(0.97); box-shadow: none; }
```

The `:active` state is the one that sells it. Hover alone tells you the control
is live; the press tells you it received the click.

### Number counter

```js
function countUp(el, end, duration = 2000) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = new Intl.NumberFormat();
  if (reduce) { el.textContent = fmt.format(end); return; }

  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt.format(Math.round(end * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initCounters(selector = ".count-up") {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target, Number(entry.target.dataset.end));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
}
```

```html
<span class="count-up" data-end="1200">1,200</span>+
```

Three corrections worth understanding. The upstream version drives the count from
`setInterval(…, 16)`, which drifts against the real frame clock and keeps running
in a background tab; `requestAnimationFrame` with a time delta does not. The
easing makes it decelerate rather than crawl at a constant rate. And the markup
ships the **final** value, not `0` — a crawler, a social-card unfurl or a client
that never finishes hydrating otherwise records the number as zero permanently.

Deeper treatment: `animation-recipes.md` § 2 Counter Number Ticker.

---

## L3 — immersive

Scroll-driven timelines, pinned sections, cursor effects, page transitions.
Confirm the dependency with the user before introducing GSAP — and check the
ceiling in `motion-budget.md` first: at L3 the budget is six to eight signature
moments and at most one WebGL surface for the whole page, so each pattern here
spends from a fixed allowance.

### GSAP and ScrollTrigger

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Install from npm rather than the CDN `<script>` tags the upstream file uses: a
CDN tag cannot be tree-shaken, is a third-party origin in your CSP, and pins you
to whatever that URL serves. In React, drive it through `useGSAP` so the timeline
is cleaned up on unmount — see `gsap.md`, which covers all twelve plugins.

### Section pin

```ts
gsap.to(".pinned-content", {
  scrollTrigger: {
    trigger: ".pin-section",
    start: "top top",
    end: "+=200%",
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
  },
  opacity: 1,
  y: 0,
});
```

Built from: `scroll-experience.md` § GSAP — Pinned storytelling sequence.
Costs one signature moment. `invalidateOnRefresh` is added here because pinned
distances computed at load are wrong after a font swap or an orientation change.

### Scroll-driven timeline

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".timeline-section",
    start: "top center",
    end: "bottom center",
    scrub: true,
    invalidateOnRefresh: true,
  },
});

tl.from(".step-1", { opacity: 0, y: 40 })
  .from(".step-2", { opacity: 0, y: 40 }, "+=0.1")
  .from(".step-3", { opacity: 0, y: 40 }, "+=0.1");
```

`motion-budget.md` caps a page at three GSAP timelines. Past that the scroll
position is being read by so many independent watchers that the page stops
feeling authored and starts feeling nervous.

### Horizontal scroll section

```ts
const panels = gsap.utils.toArray<HTMLElement>(".h-panel");
const container = document.querySelector<HTMLElement>(".h-scroll-container");

if (container) {
  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      end: () => `+=${container.scrollWidth}`,
    },
  });
}
```

```css
.h-scroll-container { display: flex; inline-size: fit-content; flex-wrap: nowrap; }
.h-panel { inline-size: 100vw; block-size: 100dvh; flex-shrink: 0; }
```

`100dvh` rather than `100vh` — on mobile the dynamic unit accounts for the
retracting browser chrome, which is the difference between a panel that fits and
one that is cropped by the address bar.

Horizontal scroll hijacks the primary reading direction, so it needs a genuine
reason: a timeline, a process, a comparison that *is* lateral. It is also close
to unusable with a keyboard unless each panel is separately focusable.

### Cursor follow and magnetic buttons

**Read this before shipping it.** `SKILL.md`'s anti-slop wall lists custom mouse
cursors among the patterns that mark generated work, and it is right for almost
every product surface: replacing the system cursor removes a control the user
knows and gains nothing functional. The legitimate case is narrow — a portfolio
or a showcase where the cursor *is* the piece. Everywhere else, take the magnetic
button and leave the cursor alone.

Both must be gated to a precise pointer. On touch there is no cursor to follow,
and the listener costs battery to discover that every frame.

```js
const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
const still = window.matchMedia("(prefers-reduced-motion: reduce)");

if (fine.matches && !still.matches) {
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    let x = 0, y = 0, pending = false;
    document.addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        pending = false;
      });
    }, { passive: true });
  }

  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${dx * 0.3}px, ${dy * 0.3}px, 0)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}
```

```css
.custom-cursor {
  position: fixed;
  inset-block-start: -16px;
  inset-inline-start: -16px;
  inline-size: 32px;
  block-size: 32px;
  border: 2px solid var(--color-brand);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transition: inline-size 200ms ease-out, block-size 200ms ease-out;
}
```

The upstream version writes `style.transform` directly inside the `mousemove`
handler, which asks the browser to composite at whatever rate the mouse reports —
often faster than the display. Batching into `requestAnimationFrame` and using
`translate3d` keeps it on one composited layer per frame.

Deeper treatment: `animation-recipes.md` § 7 Magnetic Button.

### Cursor glow, dark directions only

```css
.cursor-glow {
  position: fixed;
  inline-size: 400px;
  block-size: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, oklch(from var(--color-brand) l c h / 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  transform: translate(-50%, -50%);
  transition: opacity 300ms ease-out;
}
```

Position it with the same rAF-batched handler above, writing `translate3d`
alongside the centring transform rather than animating `left`/`top`, which are
layout properties and will jitter.

### Text reveal, word by word

```js
function splitForReveal(el, { cjkGranularity = "line" } = {}) {
  const text = el.textContent ?? "";
  const hasCJK = /[一-鿿぀-ヿ가-힯]/.test(text);

  // CJK has no word delimiter, so a naive split lands on every glyph. Revealing
  // per character destroys the reading rhythm and multiplies the node count by
  // an order of magnitude; motion-budget.md sets CJK reveals to line level.
  if (hasCJK && cjkGranularity === "line") return;

  const parts = text.split(" ");
  el.textContent = "";
  parts.forEach((part, i) => {
    const span = document.createElement("span");
    span.textContent = part;                      // never innerHTML — see note
    span.style.display = "inline-block";
    span.style.opacity = "0";
    span.style.transform = "translateY(100%)";
    span.style.transition = `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${i * 40}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${i * 40}ms`;
    el.append(span);
    if (i < parts.length - 1) el.append(document.createTextNode(" "));
  });
  el.style.overflow = "hidden";
}
```

Two corrections. The upstream version interpolates the element's text into an
`innerHTML` string, which turns any copy containing markup — a CMS field, a
user's display name — into executable HTML; building nodes and assigning
`textContent` cannot. And it splits CJK per character, which this pack's motion
budget explicitly rules against; the granularity is now a parameter that defaults
to leaving CJK alone.

A reveal that reorganises the DOM also has to put the text back for assistive
technology. Give the source element an `aria-label` carrying the original string,
or mark the split spans `aria-hidden` beside a visually-hidden copy.

### Page transition

```css
.page-enter { animation: pageEnter 400ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-exit { animation: pageExit 200ms ease-in both; }
@keyframes pageExit {
  to { opacity: 0; transform: translateY(-8px); }
}
```

The exit is 200ms, not the upstream 250ms: this skill permits `ease-in` only for
exits of 200ms or less, because an accelerating curve over a longer span reads as
the page being dragged away rather than leaving.

For an App Router project, prefer the View Transition API — it cross-fades the
old and new documents without either being unmounted mid-flight. See
`view-transitions.md`.

### 3D perspective card

```css
.perspective-card { perspective: 1000px; }
.perspective-card-inner {
  transition: transform 400ms ease-out;
  transform-style: preserve-3d;
}
```

```js
document.querySelectorAll(".perspective-card").forEach((card) => {
  const inner = card.querySelector(".perspective-card-inner");
  if (!inner) return;
  card.addEventListener("pointermove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    inner.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  });
  card.addEventListener("pointerleave", () => { inner.style.transform = ""; });
});
```

`preserve-3d` is flattened by any `overflow`, `filter` or `opacity` on an
ancestor, which is the usual reason a tilt card renders flat. `animation-pitfalls.md`
covers that failure and the text-blur that comes with transformed text.

### Lenis smooth scroll

```ts
import Lenis from "lenis";

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Deeper treatment: `lenis-smooth-scroll.md`, which covers the full option set, the
RAF handoff and the reduced-motion gate that must wrap this — hijacking the
scroll wheel is precisely what a person who asked for less motion is asking you
not to do.

---

## Decorative effects, by direction

These are background texture, not feedback. Every one runs forever, so this
skill's rule against uncontrolled infinite animation applies: each must be inside
a `prefers-reduced-motion: no-preference` block, and none should sit behind text
a user is expected to read for more than a moment.

```css
@media (prefers-reduced-motion: no-preference) {

  /* Drifting gradient — luminous and high-energy directions */
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .gradient-bg {
    background: linear-gradient(-45deg, var(--color-brand), var(--color-accent), var(--color-brand-alt));
    background-size: 400% 400%;
    animation: gradientShift 12s ease-in-out infinite;
  }

  /* Glow pulse — dark directions only */
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px oklch(from var(--color-brand) l c h / 0.2); }
    50%      { box-shadow: 0 0 40px oklch(from var(--color-brand) l c h / 0.4); }
  }
  .glow { animation: glowPulse 3s ease-in-out infinite; }

  /* Blob — playful directions */
  @keyframes blobMorph {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50%      { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
  }
  .blob {
    position: absolute;
    inline-size: 300px;
    block-size: 300px;
    background: var(--color-brand);
    opacity: 0.08;
    filter: blur(60px);
    animation: blobMorph 8s ease-in-out infinite;
    z-index: 0;
    pointer-events: none;
  }
}
```

`motion-budget.md` counts a drifting gradient and a blurred blob as *heavy
continuous* effects and allows two per page. A 60px blur on a 300px element is
repainted every frame; two of them plus a gradient is a measurable battery cost
on a phone for decoration nobody consciously sees.

### Typewriter

```css
@media (prefers-reduced-motion: no-preference) {
  @keyframes typing { from { inline-size: 0; } to { inline-size: 100%; } }
  @keyframes blink  { 50% { border-color: transparent; } }
  .typewriter {
    overflow: hidden;
    white-space: nowrap;
    border-inline-end: 3px solid var(--color-brand);
    inline-size: fit-content;
    animation:
      typing 3s steps(30) 1s both,
      blink 700ms step-end infinite;
  }
}
```

The `steps(30)` has to match the character count or the reveal stutters against
the glyphs, and `white-space: nowrap` means the line cannot wrap — so this only
works on a short, fixed string at a width you control. For anything variable,
drive it from JavaScript. Deeper treatment: `animation-recipes.md` § 3
Typewriter / Text Scramble.

---

## What was corrected on the way in

Kept every pattern; changed the code where it broke a rule this skill enforces.

| Pattern | Upstream | Why it changed |
|---|---|---|
| Navigation frost | `transition: all` | `PERF-04` bans it — animates unintended properties, some of which force layout |
| All colour values | `rgba()` / hex | `COL-04` — OKLCH only, via `oklch(from …)` relative syntax rather than parallel RGB channel variables |
| Reveal base state | `.reveal { opacity: 0 }` in CSS | Content is invisible without JavaScript; now gated behind a `.js` class the script adds |
| Scroll progress | `scrollY / (scrollHeight - innerHeight)` | Divides by zero on a page shorter than the viewport |
| Number counter | `setInterval(…, 16)`, markup ships `0` | Drifts from the frame clock, runs in background tabs, and records zero for anything that does not hydrate |
| Text reveal | `innerHTML` with interpolated text | Executes markup arriving in copy; now builds nodes with `textContent` |
| Text reveal, CJK | split per character | `motion-budget.md` sets CJK reveals to line level — per-glyph destroys reading rhythm |
| Page exit | `ease-in` at 250ms | This skill allows `ease-in` only for exits of 200ms or less |
| Cursor follow | ungated `mousemove` | Now behind `(hover: hover) and (pointer: fine)` plus reduced motion, batched into rAF |
| GSAP / Lenis | CDN `<script>` tags | Third-party origin in the CSP, no tree-shaking, unpinned version |
| Decorative loops | bare `infinite` | Wrapped in `prefers-reduced-motion: no-preference` |
| Panel height | `100vh` | `100dvh` — mobile browser chrome crops the former |

Custom cursors remain listed on this pack's anti-slop wall. The pattern is
documented here because the file is a complete catalogue; the wall still applies.

## Sources

Translated from the Chinese original in `xiaopu-ai/web-design`
(MIT, Copyright © 2026 KAOPU-XiaoPu) and adapted to this pack's rules. The
tier scheme it uses is the same L1/L2/L3 system this skill's `motion-budget.md`
documents, which also came from that repository. Corrections, the accessibility
notes, the `.js` gating and the cross-references to this pack's deeper treatments
are ours.
