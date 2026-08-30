# Soft / Premium Agency Style

Source: taste-skill (soft-skill) + Leonxlnx/taste-skill v2

## Philosophy

"$150k+ agency-level digital experiences." Haptic depth, cinematic spatial rhythm, obsessive micro-interactions, and flawless fluid motion. Every pixel earns its place. Variance Engine is active — no two generations should share the same vibe or layout archetype.

---

## STEP 1 — Variance Engine (Silent Thought)

Before writing any code, select ONE from each group:

### Vibe Archetypes (Select One)

**1. Ethereal Glass (SaaS / AI / Tech)**
- Background: deepest OLED black `#050505`
- Radial mesh gradients with glowing purple or emerald orbs
- Cards: Vantablack with `backdrop-blur-2xl`, `bg-white/5`, `border border-white/10`
- Typography: wide geometric Grotesk (Geist, Outfit)
- Surface feel: zero-gravity, floating UI

**2. Editorial Luxury (Lifestyle / Real Estate / Agency)**
- Background: warm cream `#FDFBF7`, muted sage, or deep espresso
- High-contrast variable serif fonts for massive headings
- CSS noise/film-grain overlay at `opacity-[0.03]`
- Physical paper texture feel; warm ink tones
- Typography: PP Editorial New, Fraunces, or Instrument Serif for headers — Fraunces and Instrument Serif are on the Convergence Watch (`font-pairings.md`); this archetype is the editorial brand reason that clears them, so name it rather than defaulting to them

**3. Soft Structuralism (Consumer / Health / Portfolio)**
- Background: silver-grey or pure white `#FFFFFF`
- Massive bold Grotesk typography
- Airy floating components, almost no visible borders
- Highly diffused ambient shadows
- Typography: Geist, Clash Display, or Plus Jakarta Sans

---

### Layout Archetypes (Select One)

**1. Asymmetrical Bento**
- Masonry-like CSS Grid with intentionally varied card sizes
- Example: `col-span-8 row-span-2` next to stacked `col-span-4` cards
- Grid breaks visual monotony without appearing random
- Mobile: falls back to `grid-cols-1 gap-6`; all col-span → `col-span-1`

**2. Z-Axis Cascade**
- Elements stacked like physical cards with slight overlaps
- Varying depths of field; subtle `rotate-[-2deg]` or `rotate-[3deg]` on cards
- `-mt-12` or `translate-y` negative offsets create layering
- Mobile: remove all rotations and negative-margin overlaps below 768px; stack vertically

**3. Editorial Split**
- Massive typography on left half (`w-1/2`)
- Interactive, scrollable content — image pills or staggered cards — on right
- Strong left/right tension; neither side is passive
- Mobile: full-width vertical stack (`w-full`); typography on top, interactive content below

**Universal Mobile Override:** Below 768px, use `w-full px-4 py-8`. Never `h-screen` — always `min-h-[100dvh]` to prevent iOS Safari viewport jumping.

---

## Typography

- Display: Geist, Clash Display, or Plus Jakarta Sans; never Inter
- Massive bold Grotesk headlines: `text-4xl md:text-6xl tracking-tighter leading-none`
- Body: `text-base text-gray-600 leading-relaxed max-w-[65ch]`
- Never serif for UI — serif only for editorial/lifestyle content (Vibe 2)
- Font scale: 3× difference between smallest body text and hero display

---

## Color

- Single accent color, saturation < 80%
- Base: Zinc/Slate neutrals
- Forbidden: "AI Purple/Blue" aesthetic, purple→pink→blue gradient
- Forbidden: Pure black `#000000` — use Zinc-950 `#09090B` or off-black `#050505`
- Color is a scarce resource — reserve only for semantic meaning and the single accent

---

## Spacing

- Container: `max-w-[1400px] mx-auto`
- Section padding: `py-24` minimum — `py-32` to `py-40` for premium feel
- Card internal: `p-8` or `p-10`
- Form inputs: `gap-2`
- Eyebrow tag → headline gap: `mb-3`

---

## Motion

- All motion simulates real-world mass and spring physics
- Spring: `{ type: "spring", stiffness: 100, damping: 20 }`
- Custom easing: `cubic-bezier(0.32, 0.72, 0, 1)` for all non-spring transitions
- Standard easing: `cubic-bezier(0.23, 1, 0.32, 1)` for enters (ease-out power)
- Hardware acceleration: animate ONLY `transform` and `opacity` — never `top`, `left`, `width`, `height`
- Staggered reveals with cascading delays
- Scroll-triggered fade-ups: from `translate-y-16 blur-md opacity-0` → `translate-y-0 blur-0 opacity-100`, 800ms+
- Perpetual micro-animations on hero elements (pulse, float, shimmer) — isolated in memoized components
- Use `IntersectionObserver` or Framer `whileInView` — never `window.addEventListener('scroll')`

---

## Component Architecture

### Double-Bezel (Doppelrand)

Nested containers mimicking machined hardware. Apply to all major cards, inputs, and feature grids:

```jsx
{/* Outer shell */}
<div className="bg-black/5 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 p-1.5 rounded-[2rem]">
  {/* Inner core */}
  <div
    className="bg-white dark:bg-zinc-900 rounded-[calc(2rem-0.375rem)]"
    style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}
  >
    {/* content */}
  </div>
</div>
```

Outer shell: subtle `bg-black/5`, hairline `ring-1`, padding `p-1.5`, `rounded-[2rem]`  
Inner core: distinct background, inner highlight, radius = outer radius − padding

### Button-in-Button (Island CTA)

Trailing icons NEVER sit naked next to text. Nest inside a circular wrapper:

```jsx
<button className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-full">
  <span>Get Started</span>
  <span className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 transition-transform duration-300">
    <ArrowRight className="w-4 h-4" />
  </span>
</button>
```

Active state: `active:scale-[0.98]` to simulate physical pressing.

### Eyebrow Tags

Microscopic pill-shaped badge always precedes H1/H2:

```jsx
<span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-zinc-100 text-zinc-600 mb-3">
  New · Spring Release
</span>
<h1 className="text-6xl font-bold tracking-tighter leading-none">...</h1>
```

### Fluid Island Nav

The nav must never be a standard sticky bar:

**Closed state:** floating glass pill detached from edge
```jsx
<nav className="fixed top-6 left-1/2 -translate-x-1/2 w-max rounded-full backdrop-blur-xl bg-white/80 border border-white/20 px-6 py-3 z-50 flex items-center gap-6">
```

**Hamburger morph:** lines rotate 45° to form X (never disappear):
```jsx
{/* Line 1 */}
<span className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ${open ? 'rotate-45 translate-y-0' : '-translate-y-1'}`} />
{/* Line 2 */}
<span className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ${open ? '-rotate-45 translate-y-0' : 'translate-y-1'}`} />
```

**Modal expansion:** screen-filling overlay with `backdrop-blur-3xl bg-black/80` or `bg-white/80`

**Staggered mask reveal (nav links):** from `translate-y-12 opacity-0` → `translate-y-0 opacity-100` with delays `delay-100`, `delay-150`, `delay-200`

### Bento Grid Cards

White cards `#ffffff` on `#f9fafb`, `rounded-[2.5rem]`, diffusion shadow only:
```
shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]
```

Five card archetypes:
1. **Intelligent Lists** — clean data rows with subtle separators
2. **Command Inputs** — inline search/command bar with suggestion chips
3. **Live Status** — pulsing indicator + real-time metric
4. **Data Streams** — mini sparkline or number ticker
5. **Contextual UI** — micro-form or quick-action cluster

Labels always positioned outside and below cards, never inside card container.

---

## Shadows

- Diffusion only: `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`
- Never neon glows, never outer box-shadows as decoration
- Use inner highlight (`inset` shadow) instead of glow effects
- Colored shadows: tint to match background hue (never pure `rgba(0,0,0,X)`)

---

## Performance Guardrails

- `backdrop-blur` ONLY on fixed/sticky elements (nav, overlays) — never on scrolling containers
- Grain/noise overlays on `position: fixed; inset: 0; pointer-events: none` pseudo-elements only
- `will-change: transform` sparingly, only on actively animating elements
- Named z-index scale: `sticky: 10`, `modal: 50`, `overlay: 40`, `tooltip: 60`
- Infinite animations isolated in memoized child components

---

## Icons

- Phosphor Light or Remix Line (ultra-light, precise strokes)
- Standardize `strokeWidth` globally (1.5 or 2.0 — never mixed)
- Avoid default Lucide metaphors — choose original, unexpected icons

---

## Pre-Output Checklist

Before delivering, verify all 10:

- [ ] No banned fonts (Inter, Roboto, Arial, Poppins, DM Sans, Space Grotesk)
- [ ] Vibe Archetype chosen and fully applied (not mixed)
- [ ] Layout Archetype chosen and applied (not default centered grid)
- [ ] All major cards/containers use Double-Bezel nested architecture
- [ ] CTA buttons use Button-in-Button trailing icon pattern
- [ ] Section padding minimum `py-24` — layout breathes heavily
- [ ] All transitions use `cubic-bezier(0.32, 0.72, 0, 1)` — no `linear` or `ease-in-out`
- [ ] Scroll entry animations present — no static element appearance
- [ ] All animations on `transform` and `opacity` only
- [ ] `backdrop-blur` only on fixed/sticky elements, never scrolling content
- [ ] Overall impression: "$150k agency build", not "template with nice fonts"
