# Glassmorphism Style Reference

Source: frontend-design-pro skill (internal)
Version: 10.14.0

Frosted-glass UI: translucent panels with blur, soft borders, and depth through layering.
Works best against rich backgrounds (gradients, imagery, 3D). Fails on flat/white backgrounds.

---

## Core Concept

Glassmorphism = **perceived depth through translucency**. The blur reveals layers behind,
the border catches light, the shadow grounds it. Three elements must coexist:
1. A rich background (gradient mesh, image, or dark scene)
2. A translucent frosted panel over it
3. Subtle border + shadow to define the panel edge

Without a background worth seeing through, there is no glass — just a blurry white box.

---

## 4-Layer Glass Stack (build bottom-up)

```css
.glass-panel {
  /* Layer 1: Frosted base — translucent fill */
  background: oklch(100% 0 0 / 0.08);           /* light mode */
  /* background: oklch(20% 0.01 240 / 0.40);    dark mode */

  /* Layer 2: Blur — creates the frosted effect */
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%); /* Safari required */

  /* Layer 3: Border highlight — catches simulated light */
  border: 1px solid oklch(100% 0 0 / 0.18);     /* light mode */
  /* border: 1px solid oklch(100% 0 0 / 0.10);  dark mode */
  border-radius: 16px;

  /* Layer 4: Drop shadow — grounds the panel */
  box-shadow:
    0 4px 24px oklch(0% 0 0 / 0.08),
    inset 0 1px 0 oklch(100% 0 0 / 0.20);       /* inner top highlight */
}
```

### Dark Mode Glass

```css
.glass-panel-dark {
  background: oklch(20% 0.015 240 / 0.45);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid oklch(100% 0 0 / 0.08);
  border-radius: 16px;
  box-shadow:
    0 8px 32px oklch(0% 0 0 / 0.30),
    inset 0 1px 0 oklch(100% 0 0 / 0.12);
}
```

---

## OKLCH Token System for Glass

```css
:root {
  /* Glass fills */
  --glass-fill-light:   oklch(100% 0 0 / 0.08);
  --glass-fill-medium:  oklch(100% 0 0 / 0.14);
  --glass-fill-heavy:   oklch(100% 0 0 / 0.22);

  /* Dark glass fills */
  --glass-fill-dark-light:  oklch(20% 0.01 240 / 0.35);
  --glass-fill-dark-medium: oklch(20% 0.01 240 / 0.50);
  --glass-fill-dark-heavy:  oklch(15% 0.01 240 / 0.65);

  /* Borders */
  --glass-border-light: oklch(100% 0 0 / 0.18);
  --glass-border-dark:  oklch(100% 0 0 / 0.08);

  /* Blur levels */
  --glass-blur-sm:  blur(8px)  saturate(150%);
  --glass-blur-md:  blur(16px) saturate(180%);
  --glass-blur-lg:  blur(24px) saturate(200%);
  --glass-blur-xl:  blur(40px) saturate(200%);
}
```

### Tailwind v4 Integration

```css
@theme {
  --color-glass-fill:    oklch(100% 0 0 / 0.10);
  --color-glass-border:  oklch(100% 0 0 / 0.18);
}
```

```tsx
/* Tailwind utility approach */
<div className="
  bg-white/10 backdrop-blur-xl backdrop-saturate-180
  border border-white/20 rounded-2xl
  shadow-[0_4px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]
">
```

---

## Blur Intensity Guide

| Level | Value | Use case |
|-------|-------|----------|
| Subtle | `blur(4px)` | Slight depth hint, minimal visual weight |
| Standard | `blur(12px)` | Tooltips, dropdowns, chips |
| Panel | `blur(16–20px)` | Cards, sidebars, modals |
| Hero | `blur(32–40px)` | Full-page overlays, dramatic hero panels |
| Max | `blur(60px)` | Background decorative blobs only |

**Rule:** UI readable content → max `blur(20px)`. Higher → text becomes unreadable.

---

## Light vs Dark Glassmorphism

### Light mode (glass over light gradient)
- Fill: `oklch(100% 0 0 / 0.08–0.15)` — very low opacity
- Border: `oklch(100% 0 0 / 0.20)` — white highlight
- Background required: colorful gradient (`135deg, #a8edea, #fed6e3`) or image
- Avoid: glass on white — invisible

### Dark mode (glass over dark scene)
- Fill: `oklch(20% 0.01 240 / 0.40–0.55)` — higher opacity for readability
- Border: `oklch(100% 0 0 / 0.08)` — subtle white edge
- Background: dark gradient, 3D scene, or mesh gradient
- Best effect: glass + particle/Spline 3D behind it

---

## Depth Hierarchy (multiple glass layers)

Create depth by varying blur + opacity:

```css
/* Background layer — most transparent, least blur */
.glass-bg    { background: oklch(100% 0 0 / 0.05); backdrop-filter: blur(8px); }

/* Mid layer — card level */
.glass-card  { background: oklch(100% 0 0 / 0.10); backdrop-filter: blur(16px); }

/* Foreground — modals, popovers */
.glass-modal { background: oklch(100% 0 0 / 0.18); backdrop-filter: blur(24px); }
```

Never use the same opacity + blur at multiple levels — hierarchy collapses.

---

## Component Patterns

### Glass Card

```tsx
export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        relative rounded-2xl p-6 overflow-hidden
        bg-white/10 backdrop-blur-xl backdrop-saturate-180
        border border-white/20
        shadow-[0_4px_24px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.20)]
      "
    >
      {/* Inner top-edge highlight shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {children}
    </div>
  )
}
```

### Glass Navigation Bar

```tsx
export function GlassNav() {
  return (
    <nav
      className="
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-6 px-6 py-3
        bg-white/10 backdrop-blur-xl backdrop-saturate-180
        border border-white/20 rounded-full
        shadow-[0_4px_20px_rgba(0,0,0,0.10)]
      "
    >
      {/* nav links */}
    </nav>
  )
}
```

### Glass Modal Overlay

```tsx
export function GlassModal({ open, onClose, children }: GlassModalProps) {
  return (
    <dialog
      open={open}
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/20 backdrop-blur-sm
      "
      onClick={onClose}
    >
      <div
        className="
          relative max-w-lg w-full mx-4 p-8 rounded-3xl
          bg-white/15 backdrop-blur-2xl backdrop-saturate-200
          border border-white/25
          shadow-[0_20px_60px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.25)]
        "
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  )
}
```

---

## Background Requirements

Glass is only as good as its background. Must have:

Derive the background from the project's brand hue. Violet→purple→pink is the
gradient the anti-slop wall bans by name, and reaching for it here is how glass
ends up looking like every other AI-generated landing page.

```tsx
/* Option 1: Gradient mesh — two stops off one brand hue, not three off the wheel */
<div
  className="min-h-[100dvh] bg-[linear-gradient(135deg,var(--brand-600),var(--brand-900))]"
>

/* Option 2: Ambient blobs — same hue family, different lightness */
<div className="relative overflow-hidden">
  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-60 bg-[var(--brand-500)]" />
  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-60 bg-[var(--brand-700)]" />
</div>

/* Option 3: Spline 3D scene (best result) */
<Spline scene="https://prod.spline.design/..." className="absolute inset-0 -z-10" />

/* Option 4: Image with overlay */
<div className="relative">
  <img src={bgImage} className="absolute inset-0 w-full h-full object-cover -z-10" />
  <div className="absolute inset-0 bg-black/20 -z-10" />
</div>
```

---

## Performance Rules

- `backdrop-filter` triggers GPU compositing layer — **use `will-change: transform`** on parent if animating
- Limit to ≤ 5 glass elements per viewport — each is an independent compositor layer
- Never `backdrop-filter` on elements that are frequently re-rendered (live data, real-time feeds)
- Mobile: `blur(> 12px)` on mid-range hardware causes jank → cap at `blur(8px)` for mobile glass or disable via `@media (hover: none)`:

```css
@media (hover: none) {
  .glass-panel {
    backdrop-filter: blur(8px) saturate(140%);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
  }
}
```

### Browser Support

```css
/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(1px)) {
  .glass-panel {
    background: oklch(98% 0.005 240 / 0.92); /* near-opaque fallback */
    border: 1px solid oklch(80% 0.005 240);
  }
}
```

| Browser | Support |
|---------|---------|
| Chrome/Edge | 76+ ✅ |
| Firefox | 103+ ✅ |
| Safari | 9+ ✅ (needs `-webkit-`) |
| Mobile Safari | ✅ |
| Mobile Chrome | ✅ |

---

## Validation Gate (Step 7 additions for glassmorphism)

- [ ] `-webkit-backdrop-filter` present alongside `backdrop-filter`
- [ ] `@supports not (backdrop-filter)` fallback written
- [ ] Background behind glass panels is rich (gradient/image/3D) — not flat white/grey
- [ ] Blur ≤ 20px for any panel containing readable text
- [ ] ≤ 5 glass compositor layers per viewport
- [ ] `will-change: transform` on animated glass elements
- [ ] Text contrast on glass ≥ 4.5:1 against blurred background colors

---

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Glass on flat white background | Add gradient/image background first |
| `blur(40px)` on text panels | Cap blur at 16–20px for readability |
| Neon glow on glass edges | Use `inset 0 1px 0 rgba(white/20%)` highlight instead |
| 10+ glass layers on one page | Max 5 compositor layers → use solid panels elsewhere |
| Missing `-webkit-backdrop-filter` | Always pair both prefixed + unprefixed |
| Animating `backdrop-filter` value | Animate `opacity` instead — filter changes are expensive |
| Glass on scrolling list items | Each item = compositor layer → use glass on container only |
| No fallback for unsupported browsers | Always `@supports not` block |
