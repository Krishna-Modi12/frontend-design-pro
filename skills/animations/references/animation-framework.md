# Animation Decision Framework (Emil Kowalski)

Source: emilkowalski/skill — distilled from Sonner, Vaul, and animation.dev

> **Cross-reference:** This file covers WHEN and HOW to animate (principles, timing, easing).
> For IMPLEMENTATION details of each library, load the dedicated files:
> - Framer Motion → `references/framer-motion.md` ([framer] shortcode)
> - GSAP (ScrollTrigger, SplitText, Flip…) → `references/gsap.md` ([gsap] shortcode)
> - CSS-only animations → patterns in this file

---

## Library Decision Guide

Pick ONE library per animation context. Never mix on the same element.

| Scenario | Best Tool | Why |
|----------|-----------|-----|
| Component enter/exit (modal, toast, sheet) | **Framer Motion** | AnimatePresence, physics springs |
| Shared element morph (card → detail) | **Framer Motion** | layoutId — built for this |
| Drag, swipe, gesture interactions | **Framer Motion** | useDragControls, velocity detection |
| Micro-interactions (button, hover, toggle) | **Framer Motion** or **CSS** | Both work; CSS is zero-bundle |
| Simple hover/focus transitions | **CSS** | No JS, zero overhead, interruptible |
| Scroll-driven sequences (pinned sections) | **GSAP ScrollTrigger** | Unmatched scroll control |
| SVG path drawing / morphing | **GSAP DrawSVG / MorphSVG** | No rival |
| Complex staggered timelines | **GSAP** | Timeline API is best in class |
| Text splitting per-char/per-word | **GSAP SplitText** | Purpose-built |
| 3D / WebGL transitions | **Three.js** | See threejs-advanced.md |
| Page-level route transitions | **React View Transitions API** | Native, zero JS | 

**Bundle cost awareness:**
- CSS: 0KB
- Framer Motion full: ~45KB gzip (use LazyMotion + domAnimation: ~27KB)
- GSAP core: ~24KB (plugins extra)
- React View Transitions: 0KB (browser native)

**Never mix Framer + GSAP on same element** — conflicting transform matrices break both.

---

## The Four Questions

Before animating ANYTHING, answer in order:

### 1. Should it animate?

| Frequency | Animate? | Examples |
|-----------|----------|----------|
| High (100+/day) | NEVER | Keyboard shortcuts, command palette, toggles, tab switches |
| Occasional | Standard timing | Modals, toasts, dropdowns, page transitions |
| Rare/first-time | Can be elaborate | Onboarding, empty state → content, celebration |

### 2. What's the purpose?

Valid reasons ONLY:
- **Spatial consistency** — element enters/exits from where it belongs
- **State indication** — showing something changed
- **Explanation** — helping user understand a layout shift
- **Immediate feedback** — confirming an action was received
- **Preventing jarring changes** — smoothing abrupt DOM updates

"Looks cool" alone is NOT a valid reason.

### 3. What easing?

| Motion type | Easing | Custom curve |
|-------------|--------|-------------|
| Entering viewport | ease-out | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Leaving viewport | ease-in | `cubic-bezier(0.55, 0, 1, 0.45)` |
| On-screen movement | ease-in-out | `cubic-bezier(0.77, 0, 0.175, 1)` |
| Drawer/sheet | custom organic | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Spring (drag/gesture) | spring physics | `{ type: "spring", stiffness: 100, damping: 20 }` |

**NEVER use `ease-in` for entering elements** — feels sluggish.
**NEVER use bare CSS `linear` or `ease`** — always custom curve.

### 4. How fast?

| Element | Duration | Notes |
|---------|----------|-------|
| Button press/active | 100–160ms | Immediate feedback |
| Tooltip show | 150–200ms | Skip delay on subsequent hovers |
| Dropdown open | 150–250ms | |
| Toast enter/exit | 200–400ms | Exit can be faster than enter |
| Modal enter | 200–500ms | |
| Page transition | 300–800ms | Max allowed |
| Skeleton → content | 200–300ms | Crossfade |

**Hard rule: UI animations MUST stay under 300ms** (except page transitions and modals).

---

## Key Patterns

### Never Scale From Zero
```css
/* BAD — unnatural */
transform: scale(0) → scale(1);

/* GOOD — subtle entrance */
transform: scale(0.95) → scale(1);
opacity: 0 → 1;
```

### Popover Origin Awareness
```css
/* Scale from trigger point, not center */
transform-origin: var(--radix-popover-content-transform-origin);
```

### Interruptible UI
Use CSS transitions (not keyframes) for interactive elements. Transitions can be retargeted mid-animation; keyframes restart from zero.

```css
/* GOOD — interruptible */
.element { transition: opacity 400ms ease, transform 400ms ease; }

/* BAD — restarts on re-trigger */
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
```

### Blur Crossfade Bridge
```css
.element.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

### Button Active State
```css
button:active {
  transform: scale(0.97);
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

### Toast Pattern (Sonner)
```css
@keyframes sonner-fade-in {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
/* Swipe: 200ms ease-out */
/* Multiple transitions: transform 400ms, opacity 400ms, height 400ms */
```

### Drawer Pattern (Vaul)
```css
/* All drawer animations use this custom curve */
animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
animation-duration: 0.5s;

[data-vaul-drawer] {
  touch-action: none;
  will-change: transform;
  transform: translate3d(0, 0, 0); /* Hardware acceleration */
}
```

### Spring Configuration (Apple-style)
```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
// Keep bounce subtle (0.1–0.3)
// Avoid bounce in most UI contexts
```

---

## Performance Rules

| Do | Don't |
|----|-------|
| Animate only `transform` and `opacity` | Animate `width`, `height`, `top`, `left` |
| CSS transitions for interruptible UI | Keyframes for rapid repeated interactions |
| `will-change: transform` on animated elements | `will-change` on everything |
| Test on real devices under load | Assume desktop = mobile performance |

---

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- `prefers-reduced-motion`: disable ALL animations for opt-out users
- Touch devices: no hover-dependent animations
- Keyboard actions: NEVER animate command palette or keyboard shortcut results

---

## Asymmetric Enter/Exit

Enter and exit often need different durations. A toast might fade in at 300ms but out at 200ms. Test with fresh eyes — what feels right after coding often feels off after sleep.

**Rule:** Exit = 60–70% of enter duration. Enter commands attention; exit gets out of the way.

```
Enter 300ms → Exit 180–210ms
Enter 500ms → Exit 300–350ms
Enter 200ms → Exit 120–140ms
```

---

## Quick Implementation Reference

For full code, load the dedicated file. Here quick anchors:

**Framer Motion** — component animations ([framer] shortcode):
```tsx
// Enter/exit
<AnimatePresence><motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} /></AnimatePresence>
// Spring: { type:'spring', stiffness:400, damping:30 }
// Shared morph: layoutId="card-1"
```

**GSAP ScrollTrigger** — scroll sequences ([gsap] shortcode):
```js
gsap.to(el, { y: -100, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 20%', scrub: true } })
```

**CSS transitions** — hover/focus states (no library):
```css
.btn { transition: transform 120ms cubic-bezier(0.23,1,0.32,1), box-shadow 120ms; }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0) scale(0.98); }
```

**React View Transitions** — page/route transitions ([vt] shortcode):
```tsx
<ViewTransition enter="slide-up" exit="fade-out"><Page /></ViewTransition>
```
