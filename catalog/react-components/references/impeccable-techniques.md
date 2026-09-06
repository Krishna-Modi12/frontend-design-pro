# Impeccable Design Techniques

Source: pbakaus/impeccable — 7 reference files (typography, color, spatial, motion, interaction, responsive, craft)

Advanced techniques not covered in other reference files. Load alongside the primary file for the area in question.

---

## Contents

- [Color: OKLCH Over HSL](#color-oklch-over-hsl)
- [Color: Tinted Neutrals](#color-tinted-neutrals)
- [Color: Dual-Layer Token Architecture](#color-dual-layer-token-architecture)
- [Spacing: 4pt Scale (Not 8pt)](#spacing-4pt-scale-not-8pt)
- [Spatial: Hierarchy with the Squint Test](#spatial-hierarchy-with-the-squint-test)
- [Spatial: Optical Adjustments](#spatial-optical-adjustments)
- [Interaction: The 8 Interactive States](#interaction-the-8-interactive-states)
- [Interaction: Height Animation via grid-template-rows](#interaction-height-animation-via-grid-template-rows)
- [Interaction: CSS Anchor Positioning (Dropdowns Fix)](#interaction-css-anchor-positioning-dropdowns-fix)
- [Interaction: Native Modal + Focus Trap](#interaction-native-modal--focus-trap)
- [Interaction: Semantic Z-Index Scale](#interaction-semantic-z-index-scale)
- [Interaction: Roving Tabindex (Tab Components)](#interaction-roving-tabindex-tab-components)
- [Interaction: Undo Over Confirmation](#interaction-undo-over-confirmation)
- [Motion: Stagger with CSS Custom Properties](#motion-stagger-with-css-custom-properties)
- [Motion: Perceived Performance](#motion-perceived-performance)
- [Responsive: Pointer Media Queries](#responsive-pointer-media-queries)
- [Responsive: Safe Area Insets](#responsive-safe-area-insets)
- [Typography: Font Metrics Override (FOUT Fix)](#typography-font-metrics-override-fout-fix)
- [Typography: OpenType Features](#typography-opentype-features)
- [Typography: Fluid vs Fixed Scale Decision](#typography-fluid-vs-fixed-scale-decision)
- [The Craft Flow (5 Steps)](#the-craft-flow-5-steps)

---

## Color: OKLCH Over HSL

**Always use OKLCH for new color definitions. Stop using HSL.**

OKLCH is perceptually uniform — equal numeric steps produce equal perceived changes. HSL does not. Three components:
- Lightness: 0–100%
- Chroma: 0–~0.4 (saturation)
- Hue: 0–360°

```css
/* HSL — perceptually inconsistent */
color: hsl(240, 80%, 50%);

/* OKLCH — perceptually uniform ✓ */
color: oklch(55% 0.2 265);

/* Modern CSS color utilities */
color: oklch(from var(--brand) l c h);
color: color-mix(in oklch, var(--primary) 30%, var(--surface));
color: light-dark(oklch(98% 0.005 250), oklch(18% 0.01 250));
```

**When creating color variants:** maintain consistent chroma and hue; vary only lightness. But reduce chroma near extremes (near white or black) to avoid garish results.

---

## Color: Tinted Neutrals

**Pure gray is dead.** Neutrals without chroma appear lifeless beside branded colors.

Introduce minimal chroma (0.005–0.015) tinted toward your brand's primary hue. The tint should be subconscious — creating visual cohesion without reading as "obviously tinted."

```css
/* Dead gray — avoid */
--neutral-100: oklch(95% 0 0);

/* Tinted neutral — correct ✓ (brand hue = 265) */
--neutral-100: oklch(95% 0.008 265);
--neutral-200: oklch(90% 0.009 265);
--neutral-800: oklch(25% 0.010 265);
```

Never default to warm orange or cool blue tints — derive from your project's actual brand hue.

---

## Color: Dual-Layer Token Architecture

```css
/* Layer 1: Primitive tokens — base values, never used directly */
:root {
  --blue-400: oklch(65% 0.19 250);
  --blue-500: oklch(55% 0.22 250);
  --zinc-950: oklch(12% 0.008 260);
  --zinc-100: oklch(95% 0.005 260);
}

/* Layer 2: Semantic tokens — role-specific mappings */
:root {
  --color-primary: var(--blue-500);
  --color-surface: var(--zinc-100);
  --color-ink: var(--zinc-950);
}

/* Dark mode: redefine semantics only — primitives stay */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: oklch(15% 0.008 260);  /* Dark surface */
    --color-ink:     oklch(92% 0.005 260);  /* Light text */
    --color-primary: oklch(70% 0.16 250);   /* Desaturated for dark */
  }
}
```

**Dark mode:** Lighter surfaces create elevation (not shadows). Three-level elevation scale:
- Base: `oklch(15% 0.008 260)`
- Raised: `oklch(20% 0.009 260)`
- Overlay: `oklch(25% 0.010 260)`

Reduce body text font-weight slightly in dark mode: 350 instead of 400 — light text on dark reads as heavier.

**Alpha is a design smell.** Excessive transparency = incomplete palette design. Alpha creates unpredictable contrast, GPU cost, and visual inconsistency. Define explicit overlay colors instead.

---

## Spacing: 4pt Scale (Not 8pt)

8pt lacks granularity. Use the **4pt scale**:

```
4px · 8px · 12px · 16px · 24px · 32px · 48px · 64px · 96px
```

Name tokens semantically, not by value:

```css
:root {
  --space-1:  4px;   /* Inline gap, icon spacing */
  --space-2:  8px;   /* Tight component padding */
  --space-3:  12px;  /* Input padding */
  --space-4:  16px;  /* Card padding (compact) */
  --space-6:  24px;  /* Card padding (comfortable) */
  --space-8:  32px;  /* Section internal gap */
  --space-12: 48px;  /* Section padding (mobile) */
  --space-16: 64px;  /* Section padding (tablet) */
  --space-24: 96px;  /* Section padding (desktop) */
}
```

Use `gap` instead of margins for sibling spacing — eliminates margin collapse.

---

## Spatial: Hierarchy with the Squint Test

Verify visual hierarchy by blurring your design (squint at it or use CSS `filter: blur(4px)`). You should be able to identify:
- The primary element
- The secondary element
- Distinct groupings

If everything looks equally weighted when blurred → hierarchy problem. Fix by combining 2–3 dimensions simultaneously:

| Dimension | Strong Signal | Weak Signal |
|---|---|---|
| Size | 3:1 ratio or more | Less than 2:1 |
| Weight | Bold vs Regular | Medium vs Regular |
| Color | High contrast | Similar tones |
| Position | Top-left | Bottom-right |
| Space | Surrounded by whitespace | Crowded |

**Cards are frequently overused.** Spacing and alignment naturally establish grouping. Use cards only for: genuinely distinct content items, comparative grids, or clear interaction boundaries. Never nest cards within cards — use spacing, typography, and subtle dividers instead.

---

## Spatial: Optical Adjustments

**Text optical alignment:** Text at `margin-left: 0` appears slightly indented due to letterform whitespace. Apply negative margin for true optical alignment:
```css
h1 { margin-left: -0.05em; }
```

**Icon optical centering:** Geometrically centered icons often appear misaligned. Play buttons look better shifted slightly right; arrows benefit from slight directional offset.

**Touch targets with small visual size:**
```css
.icon-button {
  width: 24px;
  height: 24px;
  position: relative;
}
.icon-button::before {
  content: '';
  position: absolute;
  inset: -10px; /* Expands click area to 44×44px */
}
```

---

## Interaction: The 8 Interactive States

Every interactive element requires all 8. Design them explicitly — don't leave any to browser defaults.

| State | Description | Key rule |
|---|---|---|
| **Default** | Base styling at rest | The foundation |
| **Hover** | Subtle lift/color shift | Pointer only — never required for functionality |
| **Focus** | Visible ring | Must be independently designed from hover |
| **Active** | Pressed state | Darker + slight translate |
| **Disabled** | Reduced opacity | `pointer-events: none; cursor: not-allowed` |
| **Loading** | Processing feedback | Skeleton > spinner |
| **Error** | Invalid state | Red border + icon + message below field |
| **Success** | Completed action | Green checkmark + confirmation copy |

**Keyboard users never see hover states** — focus and hover must be designed independently.

**Focus rings — never remove without replacement:**
```css
/* Wrong: removes all indication */
button:focus { outline: none; }

/* Correct: keyboard-only focus, mouse-clean */
button:focus { outline: none; }
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```
Requirements: 3:1 contrast against adjacent colors; 2–3px thickness; external (not inside element).

---

## Interaction: Height Animation via grid-template-rows

**Never animate `height` directly** — it triggers layout recalculations.

For accordions and collapsible panels:
```css
/* Container */
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;       /* Collapsed */
  transition: grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.accordion-content.open {
  grid-template-rows: 1fr;       /* Expanded */
}

/* Inner wrapper (required — grid needs a child to measure) */
.accordion-content > div {
  min-height: 0;
  overflow: hidden;
}
```

---

## Interaction: CSS Anchor Positioning (Dropdowns Fix)

`position: absolute` inside `overflow: hidden` clips dropdowns — **the single most common dropdown bug in generated code.** Two modern solutions:

**Solution 1: CSS Anchor Positioning (Chrome 125+, Edge 125+)**
```css
.trigger {
  anchor-name: --menu-trigger;
}
.dropdown {
  position: fixed;           /* Escapes overflow clipping */
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-end;
  margin-top: 4px;
}
/* Auto-flip if viewport edge is hit */
@position-try --flip-above {
  position-area: block-start span-inline-end;
  margin-bottom: 4px;
}
```

**Solution 2: Popover API (broad support)**
```html
<button popovertarget="menu">Open menu</button>
<div id="menu" popover>
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```
The `popover` attribute places the element in the **top layer** — above all content regardless of z-index or overflow. Built-in: light-dismiss (click outside to close), stacking, and accessibility.

**React/Vue/Svelte fallback:** `createPortal` / `<Teleport to="body">` + `position: fixed` with `getBoundingClientRect()`.

---

## Interaction: Native Modal + Focus Trap

**Use `<dialog>` with `showModal()` — no JavaScript focus trap needed:**
```html
<dialog id="my-modal">
  <h2>Modal Title</h2>
  <button onclick="document.getElementById('my-modal').close()">Close</button>
</dialog>
<button onclick="document.getElementById('my-modal').showModal()">Open</button>
```
Auto-handles: focus trap, Escape key close, `::backdrop` overlay.

**Or use `inert` attribute for custom modals:**
```html
<main inert><!-- Background content — not focusable/interactive --></main>
<div role="dialog" aria-modal="true">
  <!-- Focus stays entirely inside -->
</div>
```

---

## Interaction: Semantic Z-Index Scale

Never use `z-9999` or arbitrary values. Establish a scale:

```css
:root {
  --z-dropdown:       100;
  --z-sticky:         200;
  --z-modal-backdrop: 300;
  --z-modal:          400;
  --z-toast:          500;
  --z-tooltip:        600;
}
```

---

## Interaction: Roving Tabindex (Tab Components)

Component groups (tabs, menus, radio groups) use one tabbable item; arrow keys navigate within:

```html
<div role="tablist">
  <button role="tab" tabindex="0"  aria-selected="true">Tab 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 3</button>
</div>
```

Arrow keys update `tabindex="0"` to the target tab. Tab key exits the component.

---

## Interaction: Undo Over Confirmation

**Undo is better than confirmation dialogs** — users click through confirmations mindlessly.

Pattern for recoverable destructive actions:
1. Remove item from UI immediately (optimistic)
2. Show toast with undo action ("Deleted. Undo →")
3. Start countdown (5–10s)
4. Actually delete after timer expires
5. If undo tapped: restore to original position

Use confirmation dialogs only for: truly irreversible actions (account deletion), high-cost operations, batch operations.

---

## Motion: Stagger with CSS Custom Properties

```css
/* Parent */
.list { }

/* Per-item: set --i in HTML or JS */
.item {
  animation: fade-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 50ms);
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0);    }
}
```

```html
<li class="item" style="--i: 0">Item 1</li>
<li class="item" style="--i: 1">Item 2</li>
<li class="item" style="--i: 2">Item 3</li>
```

**Cap total stagger time:** 10 items × 50ms = 500ms max. For large lists, reduce per-item delay or limit animation count to first N items.

---

## Motion: Perceived Performance

**80ms perception threshold** — anything under 80ms feels instantaneous. Use for micro-interactions.

Three strategies to make interfaces feel faster than they are:
1. **Preemptive start** — begin transition during loading (skeleton UI, iOS app zoom-in)
2. **Early completion** — progressive content reveal before full load (streaming, buffering)
3. **Optimistic UI** — update interface immediately; gracefully handle failures after

For complex operations (search, analysis): a strategic delay can actually build confidence — instant response may signal "insufficient work done."

---

## Responsive: Pointer Media Queries

Screen size alone doesn't reveal interaction capability. Detect input method:

```css
/* Mouse / trackpad — precise input */
@media (pointer: fine) {
  .button { padding: 8px 16px; }           /* Smaller targets OK */
}

/* Touch / stylus — coarse input */
@media (pointer: coarse) {
  .button { padding: 12px 20px; min-height: 44px; } /* Larger targets */
}

/* Hover capability */
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }  /* Only if hover supported */
}

/* No hover (touch) — never rely on hover for functionality */
@media (hover: none) {
  .tooltip { display: none; }  /* Or use tap-to-show alternative */
}
```

**Rule: Never rely on hover for functionality.** Touch users cannot hover.

---

## Responsive: Safe Area Insets

For modern devices with notches, rounded corners, and system UI intrusion:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
body {
  padding-top:    env(safe-area-inset-top);
  padding-right:  env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left:   env(safe-area-inset-left);
}

/* For sticky footers / bottom nav bars */
.bottom-nav {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

---

## Typography: Font Metrics Override (FOUT Fix)

Match fallback font metrics to minimize layout shift on font load:

```css
@font-face {
  font-family: 'BrandFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}

/* Override fallback to match BrandFont metrics */
@font-face {
  font-family: 'BrandFont-Fallback';
  src: local('Arial');
  size-adjust:        105%;
  ascent-override:    90%;
  descent-override:   20%;
  line-gap-override:  10%;
}

body {
  font-family: 'BrandFont', 'BrandFont-Fallback', sans-serif;
}
```

Use [Fontaine](https://github.com/unjs/fontaine) to calculate override values automatically.

---

## Typography: OpenType Features

```css
/* Data tables — columns align on decimal */
.data-table  { font-variant-numeric: tabular-nums; }

/* Recipe amounts */
.fraction    { font-variant-numeric: diagonal-fractions; }

/* Small caps for acronyms/abbreviations */
abbr         { font-variant-caps: all-small-caps; }

/* Disable ligatures in code */
code         { font-variant-ligatures: none; }

/* Enable kerning globally */
body         { font-kerning: normal; }
```

Check what OpenType features a font supports at [Wakamai Fondue](https://wakamaifondue.com/).

---

## Typography: Fluid vs Fixed Scale Decision

| Use Fluid (`clamp()`) | Use Fixed (`rem`) |
|---|---|
| Headings and display text on marketing/content sites | Application UIs, dashboards |
| When text dominates layout | Data-dense interfaces |
| Wide viewport range matters | Predictability > fluidity |
| | Body text (even on marketing pages) |

Major design systems (Material, Polaris, Primer, Carbon) all use fixed scales with breakpoint adjustments for predictability.

---

## The Craft Flow (5 Steps)

Use this sequence for every non-trivial component or page:

1. **Shape** — Commit to design brief: purpose, tone, one differentiating element
2. **Load** — Pull relevant reference files based on brief (spatial + typography always; add motion/color/interaction as needed)
3. **Build** — In this order:
   - Semantic HTML (primary state only)
   - Layout + spatial rhythm
   - Typography + color
   - Interactive states (hover, focus, active, disabled)
   - Edge case states (empty, loading, error, overflow)
   - Motion + transitions
   - Responsive adaptation
4. **Iterate** — Inspect in browser. Verify: matches brief, not AI-generic, all states intentional, responsive adapts (not shrinks). **Iterate until proud to share — delight, not mere functionality.**
5. **Present** — Show primary state, walk through variants, connect decisions to brief, request feedback
