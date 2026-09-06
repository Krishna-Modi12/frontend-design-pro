# React View Transitions Reference

Source: vercel-labs/agent-skills (react-view-transitions skill)

React's View Transition API creates smooth, hardware-accelerated animations for DOM changes — page navigation, list reorder, shared-element morphs, Suspense reveals — without JavaScript animation libraries.

---

## Contents

- [When to Use](#when-to-use)
- [The `<ViewTransition>` Component](#the-viewtransition-component)
- [Critical Placement Rule](#critical-placement-rule)
- [Type-Keyed Transitions (Direction-Aware)](#type-keyed-transitions-direction-aware)
- [Shared Element Transitions](#shared-element-transitions)
- [Common Patterns](#common-patterns)
- [CSS Recipes (copy into global CSS)](#css-recipes-copy-into-global-css)
- [Next.js Integration](#nextjs-integration)
- [Animation Decision Guide](#animation-decision-guide)
- [CSS Pseudo-Elements Reference](#css-pseudo-elements-reference)
- [Browser Support](#browser-support)
- [Key Gotchas](#key-gotchas)
- [Availability](#availability)
- [Upstream additions (vercel-labs/agent-skills, current)](#upstream-additions-vercel-labsagent-skills-current)

---

## When to Use

Every transition should communicate **spatial relationships or continuity**. Implement in this priority order:

1. Shared element transitions (`name` prop — e.g. card thumbnail → hero)
2. Suspense reveals (skeleton → content)
3. List identity (per-item `key` — reorder/add/remove)
4. State changes (`enter`/`exit` string props)
5. Route changes (layout-level)

**Do NOT use** for silent operations (revalidation, background refreshes) → use `default="none"`.

---

## The `<ViewTransition>` Component

React auto-assigns unique `view-transition-name` values and calls `document.startViewTransition` internally. **Never call `startViewTransition` directly.**

```tsx
import { ViewTransition } from 'react'
```

### Props

| Prop | Values | Behavior |
|---|---|---|
| `enter` | `"auto"` / `"none"` / class name / type-keyed object | Animation on insert |
| `exit` | same | Animation on removal |
| `update` | same | DOM mutations inside component |
| `share` | same | Shared element morph (matched `name` props) |
| `default` | same | Fallback for all triggers |
| `name` | unique string | Links this VT to a matching one for shared morph |

### Animation Triggers

Only these activate animations:
- `startTransition()`
- `useDeferredValue`
- `Suspense`

**Regular `setState` does NOT trigger View Transitions.**

---

## Critical Placement Rule

`<ViewTransition>` must wrap the element **before** any DOM nodes in the parent:

```jsx
// ✅ Works
<ViewTransition enter="fade-in" exit="fade-out">
  <div>Content</div>
</ViewTransition>

// ❌ Broken — VT must be the outermost layer
<div>
  <ViewTransition enter="fade-in" exit="fade-out">
    <div>Content</div>
  </ViewTransition>
</div>
```

---

## Type-Keyed Transitions (Direction-Aware)

Tag a transition with a type to apply different animations by context:

```tsx
import { startTransition, addTransitionType } from 'react'
import { useRouter } from 'next/navigation'

function NavigateButton({ href }: { href: string }) {
  const router = useRouter()
  return (
    <button onClick={() => {
      startTransition(() => {
        addTransitionType('nav-forward')
        router.push(href)
      })
    }}>
      Go Forward
    </button>
  )
}
```

```tsx
// Component receives directional animation based on type
<ViewTransition
  enter={{ 'nav-forward': 'slide-from-right', 'nav-back': 'slide-from-left', default: 'none' }}
  exit={{ 'nav-forward': 'slide-to-left', 'nav-back': 'slide-to-right', default: 'none' }}
  share={{ 'nav-forward': 'morph-forward', 'nav-back': 'morph-back', default: 'morph' }}
  default="none"
>
  <Page />
</ViewTransition>
```

**Note:** `router.back()` and browser back buttons do NOT trigger View Transitions (popstate is synchronous). You cannot detect the back direction without a custom history stack.

---

## Shared Element Transitions

Match `name` props between views to create morphing animations:

```tsx
// List view — thumbnail
<ViewTransition name={`product-image-${product.id}`}>
  <img src={product.thumbnail} width={160} height={160} alt={product.name} />
</ViewTransition>

// Detail view — full image
<ViewTransition name={`product-image-${product.id}`}>
  <img src={product.fullImage} width={640} height={480} alt={product.name} />
</ViewTransition>
```

**Shared element rules:**
- Only ONE VT per `name` can be mounted simultaneously
- Use ID-based unique names: `photo-${id}`, never generic `hero-image`
- Watch for shared components rendering in both list and detail simultaneously
- `share` takes precedence over `enter`/`exit` when matched
- **Never fade-out pages that contain shared morphs** — use directional slides instead

---

## Common Patterns

### Enter / Exit (Conditional render)

```tsx
{show && (
  <ViewTransition enter="fade-in" exit="fade-out">
    <Panel />
  </ViewTransition>
)}
```

### List Reorder / Add / Remove

```tsx
{items.map(item => (
  <ViewTransition key={item.id}>
    <ItemCard item={item} />
  </ViewTransition>
))}
```

Each item gets a unique auto-assigned `view-transition-name` from its `key`.

### Nested: List Identity + Shared Morph

```tsx
{items.map(item => (
  <ViewTransition key={item.id}>          {/* outer: handles reorder */}
    <Link href={`/items/${item.id}`}>
      <ViewTransition name={`item-image-${item.id}`} share="morph">  {/* inner: shared element */}
        <Image src={item.image} alt={item.name} width={200} height={200} />
      </ViewTransition>
      <p>{item.name}</p>
    </Link>
  </ViewTransition>
))}
```

### Force Re-Enter with `key`

When the same component re-renders with new data (search results, filter change):

```tsx
<ViewTransition key={searchParams.toString()} enter="slide-up" default="none">
  <ResultsGrid results={results} />
</ViewTransition>
```

### Suspense: Skeleton → Content

Simple cross-fade:

```tsx
<ViewTransition>
  <Suspense fallback={<Skeleton />}>
    <Content />
  </Suspense>
</ViewTransition>
```

Directional (skeleton slides out, content slides in):

```tsx
<Suspense fallback={
  <ViewTransition exit="slide-down">
    <Skeleton />
  </ViewTransition>
}>
  <ViewTransition enter="slide-up" default="none">
    <Content />
  </ViewTransition>
</Suspense>
```

---

## CSS Recipes (copy into global CSS)

### Timing Variables

```css
:root {
  --vt-exit:  150ms;
  --vt-enter: 210ms;
  --vt-move:  400ms;
}
```

### Shared Keyframes

```css
@keyframes vt-fade {
  from { filter: blur(3px); opacity: 0; }
  to   { filter: blur(0);   opacity: 1; }
}
@keyframes vt-slide {
  from { translate: var(--slide-offset); }
  to   { translate: 0; }
}
@keyframes vt-slide-y {
  from { transform: translateY(var(--slide-y-offset, 10px)); }
  to   { transform: translateY(0); }
}
```

### Fade In / Out

```css
::view-transition-old(.fade-out) {
  animation: var(--vt-exit) ease-in vt-fade reverse;
}
::view-transition-new(.fade-in) {
  animation: var(--vt-enter) ease-out var(--vt-exit) both vt-fade;
}
```

### Vertical Slide

```css
::view-transition-old(.slide-down) {
  animation:
    var(--vt-exit) ease-out both vt-fade reverse,
    var(--vt-exit) ease-out both vt-slide-y reverse;
}
::view-transition-new(.slide-up) {
  animation:
    var(--vt-enter) ease-in var(--vt-exit) both vt-fade,
    var(--vt-move)  ease-in both vt-slide-y;
}
```

### Directional Navigation (nav-forward / nav-back)

```css
::view-transition-old(.nav-forward) {
  --slide-offset: -60px;
  animation:
    var(--vt-exit) ease-in both vt-fade reverse,
    var(--vt-move) ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-forward) {
  --slide-offset: 60px;
  animation:
    var(--vt-enter) ease-out var(--vt-exit) both vt-fade,
    var(--vt-move)  ease-in-out both vt-slide;
}

::view-transition-old(.nav-back) {
  --slide-offset: 60px;
  animation:
    var(--vt-exit) ease-in both vt-fade reverse,
    var(--vt-move) ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-back) {
  --slide-offset: -60px;
  animation:
    var(--vt-enter) ease-out var(--vt-exit) both vt-fade,
    var(--vt-move)  ease-in-out both vt-slide;
}
```

### Shared Element Morph

```css
::view-transition-group(.morph) {
  animation-duration: var(--vt-move);
}
::view-transition-image-pair(.morph) {
  animation-name: vt-via-blur;
}
@keyframes vt-via-blur {
  30% { filter: blur(3px); }
}
```

### Text Morph (no cross-fade — just position transition)

```css
::view-transition-group(.text-morph) {
  animation-duration: var(--vt-move);
}
::view-transition-old(.text-morph) {
  display: none;
}
::view-transition-new(.text-morph) {
  animation: none;
  object-fit: none;
  object-position: left top;
}
```

### Scale In / Out

```css
@keyframes vt-scale-down { from { transform: scale(1); opacity: 1; } to { transform: scale(0.85); opacity: 0; } }
@keyframes vt-scale-up   { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }

::view-transition-old(.scale-out) { animation: var(--vt-exit)  ease-in  vt-scale-down; }
::view-transition-new(.scale-in)  { animation: var(--vt-enter) ease-out var(--vt-exit) both vt-scale-up; }
```

### Persistent Navigation (header/nav bar doesn't animate)

```css
::view-transition-group(persistent-nav) { animation: none; z-index: 100; }
::view-transition-old(persistent-nav)   { display: none; }
::view-transition-new(persistent-nav)   { animation: none; }
```

### Reduced Motion (REQUIRED — always include)

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

---

## Next.js Integration

### Config (next.config.js)

```js
// next.config.js
const nextConfig = {
  experimental: { viewTransition: true },
}
module.exports = nextConfig
```

This wraps all `<Link>` navigations in `startViewTransition`. Because of this, use `default="none"` on all VTs that shouldn't fire on every link click.

### Link with Transition Types (Next.js 15+ / 16+)

```tsx
import Link from 'next/link'

// No need for manual startTransition + addTransitionType + router.push
<Link href="/products/1" transitionTypes={['nav-forward']}>
  View Product
</Link>
```

### Layout Rules

**Do NOT add a layout-level `<ViewTransition>` wrapping `{children}`** if pages have their own VTs — nested transitions silence child enter/exit animations.

Layouts persist across route changes; their enter/exit only fire on initial mount. Use page-level VTs for page animations.

### Server Components

`<ViewTransition>` and `<Link transitionTypes>` work in Server Components.  
`startTransition`, `addTransitionType` require Client Components (`"use client"`).

---

## Animation Decision Guide

| Transition Context | Animation to Use | Why |
|---|---|---|
| List → Detail navigation | Type-keyed `nav-forward`/`nav-back` | Communicates spatial depth |
| Tab-to-tab lateral | `default="none"` or bare crossfade | No depth to communicate; directional slides mislead |
| Suspense: skeleton → content | `enter`/`exit` string props | Content arriving |
| Revalidation / background refresh | `default="none"` | Silent — user didn't trigger |
| List reorder / add / remove | `key` on each item, no extra props | Browser handles morph via auto-name |
| Modal enter/exit | `enter="scale-in" exit="scale-out"` | Layer depth change |
| Shared image: list → detail | `name={`item-${id}`} share="morph"` | Continuity across views |

---

## CSS Pseudo-Elements Reference

| Pseudo-element | Targets | What to style |
|---|---|---|
| `::view-transition-old(.className)` | Outgoing snapshot | Exit animation |
| `::view-transition-new(.className)` | Incoming snapshot | Enter animation |
| `::view-transition-group(.className)` | Container (position + size) | Duration, z-index |
| `::view-transition-image-pair(.className)` | Old + new pair together | Blend effects |

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge | 111+ |
| Firefox | 144+ |
| Safari | 18.2+ |

Graceful degradation: unsupported browsers skip transitions — UI still works, just without animation.

---

## Key Gotchas

- **`router.back()` / browser back** → no transition (popstate is synchronous)
- **Nested VTs**: when parent exits, nested VTs do NOT fire their own enter/exit — only outermost animates
- **Staggered per-item animation during page navigation** is not currently possible
- **Shared `name` must be unique per mount** — having the same name on two mounted components breaks the transition
- **`experimental.viewTransition: true` in next.config** wraps ALL `<Link>` clicks — use `default="none"` liberally

---

## Availability

**Next.js:** Don't install `react@canary` manually — App Router bundles React canary internally. Enable via config only.  
**Without Next.js:** `npm install react@canary react-dom@canary`

---

## Upstream additions (vercel-labs/agent-skills, current)

**When to animate — implement every applicable pattern, in this order:**

| # | Pattern | Communicates |
|---|---|---|
| 1 | Shared element (`name`) | "Same thing — going deeper" |
| 2 | Suspense reveal | "Data loaded" |
| 3 | List identity (per-item `key`) | "Same items, new arrangement" |
| 4 | State change (`enter`/`exit`) | "Something appeared/disappeared" |
| 5 | Route change (layout level) | "Going to a new place" |

If you can't articulate what a transition communicates, delete it. Reserve **directional** slides for hierarchical navigation (list → detail) and ordered sequences (prev/next, carousel). Lateral navigation (tab-to-tab) gets a fade or `default="none"` — a slide there falsely implies depth.

**Use `default="none"` liberally.** Without it every VT fires the browser cross-fade on *every* transition, including Suspense resolves, `useDeferredValue` updates and background revalidations. Opt in explicitly per trigger.

**Placement rule:** `<ViewTransition>` only activates enter/exit if it appears *before* any DOM node — a wrapping `<div>` suppresses it.

**Composing shared elements with list identity** — two nested boundaries, they are independent concerns:

```jsx
{items.map(item => (
  <ViewTransition key={item.id}>                                    {/* list identity */}
    <Link href={`/items/${item.id}`}>
      <ViewTransition name={`item-image-${item.id}`} share="morph"> {/* shared element */}
        <Image src={item.image} />
      </ViewTransition>
    </Link>
  </ViewTransition>
))}
```

**Gotchas:**
- Only one VT per `name` may be mounted at a time — use `photo-${id}`. A named VT inside a component rendered in both a modal *and* a page mounts twice and breaks the morph.
- `share` takes precedence over `enter`/`exit`; when no pair forms, `enter`/`exit` fires instead — decide the fallback deliberately.
- Never use a fade-out exit on a page with a shared morph; use a directional slide.
- `router.back()` and the browser back button do **not** trigger VTs (`popstate` is synchronous). Use `router.push()` with an explicit URL.
- Transition types are available during navigation but **not** during subsequent Suspense reveals — type maps for page enter/exit, plain string props for Suspense.
- Nested VTs inside an exiting parent do not fire their own enter/exit; per-item staggering during navigation isn't possible today.
- Next.js: do **not** install `react@canary` — the App Router already bundles it. Browser support: Chromium 111+, Firefox 144+, Safari 18.2+; degrades gracefully.
- Accessibility: the reduced-motion CSS is mandatory — `@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }`
