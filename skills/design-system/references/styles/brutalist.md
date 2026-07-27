# Brutalist / Terminal Style

Source: taste-skill (brutalist-skill) + Leonxlnx/taste-skill v2  
Version: 10.8.0

## Philosophy

Swiss Industrial Typography meets Terminal aesthetics. Absolute geometric rigidity. Form follows function with aggressive honesty. Choose ONE paradigm per project — never mix.

---

## Two Visual Paradigms

### Paradigm 1: Swiss Industrial Print (Light Mode)

High-contrast light surfaces, heavy typography, structural visibility, mechanical precision.

```
Background: #F4F4F0 or #EAE8E3 (off-white substrate)
Foreground: #050505 to #111111
Accent:     #E61919 or #FF2A2A (Aviation Red — only accent allowed)
Border:     2px solid #000000 (structure IS decoration)
```

- Typography: Neue Haas Grotesk, Archivo Black, or any heavy neo-grotesque — exclusively
- Emphasis: horizontal rules as structural elements, thick borders as grid scaffolding
- Only light mode for this paradigm — never on dark background

### Paradigm 2: Tactical Telemetry / CRT Terminal (Dark Mode)

High-density data on dark substrate, monospace dominance, simulated analog degradation.

```
Background: #0A0A0A or #121212 (void)
Foreground: #EAEAEA (white phosphor)
Accent:     #E61919 or #FF2A2A (same Aviation Red)
Border:     #333333
Terminal Green (single element only): #4AF626
```

- Typography: JetBrains Mono, IBM Plex Mono, Space Mono — ALL data in monospace
- All uppercase for metadata and coordinates
- CRT scanline overlay applied to full surface (see below)

---

## Typography Architecture

### Macro-Typography (Headers)

- Font: Neue Haas Grotesk, Archivo Black, or any heavy neo-grotesque
- Scale: `clamp(4rem, 10vw, 15rem)` fluid scaling — letters are MASSIVE
- Tracking: `-0.03em` to `-0.06em` (extremely tight, compressed)
- Line-height: `0.85` to `0.95` (tighter than tight)
- Case: EXCLUSIVELY UPPERCASE
- No decorative serif in headers

### Micro-Typography (Data / Telemetry / Labels)

- Font: JetBrains Mono, IBM Plex Mono, or Space Mono
- Scale: `10px` to `14px` fixed (never fluid for data labels)
- Tracking: `0.05em` to `0.1em` (generous — improves small-cap readability)
- Case: ALL UPPERCASE for metadata and coordinates
- Example: `REV 2.6 · UNIT D-01 · STATUS ACTIVE`

---

## Layout Engineering

- CSS Grid with `gap: 1px` + contrasting color backgrounds for razor-thin dividing lines (not borders)
- All 90-degree corners — `border-radius: 0` everywhere, zero exceptions
- No floating, no absolute-positioned stacking — strict grid anchoring
- Bimodal density: alternating blocks of dense data and expansive negative space
- Borders: `1px` to `2px solid` for delineation; `4px solid` for emphasis zones

---

## ASCII Symbology & Structural Elements

Use sparingly as authentic brutalist framing:
- Brackets: `[ DELIVERY SYSTEMS ]` · `[ STATUS: ACTIVE ]`
- Angles: `< RE-IND >` · `< OUTPUT />`
- Directional markers: `>>>` · `///` · `\\`
- Registration marks as structural elements: ®, ©, ™
- Crosshairs, barcode patterns as decorative zones
- Metadata labels: `REV 2.6` · `UNIT / D-01`

---

## CRT / Analog Degradation Effects

### Scanline Overlay (Paradigm 2 only)
```css
.scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.1) 2px,
    rgba(0,0,0,0.1) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

### Halftone / 1-bit Dithering
```css
.halftone-overlay {
  mix-blend-mode: multiply;
  /* Apply SVG noise filter globally for film grain */
}
```

### SVG Noise Filter
```html
<svg style="position:fixed;width:0;height:0">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
</svg>
<div style="position:fixed;inset:0;filter:url(#noise);opacity:0.04;pointer-events:none;z-index:50"/>
```

---

## Motion

- MOTION_INTENSITY capped at 2–3
- Transitions: instant (0ms) or very fast (80–150ms) — no in-between
- Easing: `steps(1)` for instant, or `linear` (brutalism resists organic easing)
- Terminal-style typing animations allowed (monospace, character-by-character)
- No gradients, no soft shadows, no translucency, no blur
- Stagger allowed for data rows: 20–30ms per row maximum

---

## Semantic HTML Mandate

Brutalism demands semantic HTML precision. Use these over generic divs:

| Element | Use when |
|---------|---------|
| `<data value="">` | Displaying machine-readable values |
| `<samp>` | Sample output from a program/system |
| `<kbd>` | Keyboard input / commands |
| `<output>` | Result of a calculation or user action |
| `<dl>`, `<dt>`, `<dd>` | Definition/specification lists |
| `<abbr title="">` | Technical abbreviations |
| `<code>` | Inline code values |
| `<pre><code>` | Terminal/code blocks |
| `<table>` | Tabular data — full grid borders, uppercase `<th>` |

---

## Components

**Cards:** solid 2–4px borders, no shadow, `border-radius: 0`, no hover glow  
**Buttons:** `border: 2px solid currentColor`, `border-radius: 0`, `translateY(4px)` on active (press-shift)  
**Inputs:** `border: 2px solid #000 (or #EAEAEA)`, monospace text, no placeholder blur  
**Tables:** full-grid borders, uppercase `<th>`, alternating `#F4F4F0 / #FFFFFF` rows  
**Navigation:** plain horizontal rule separators, all uppercase text labels — no icons

---

## Critical Constraints

- Choose ONE paradigm per project — never mix light and dark paradigms
- Never use gradients (scanline gradients exempt)
- Never use soft shadows or blur effects
- Typography is primary — imagery is always secondary
- No modern translucency effects
- No emojis, no icons (text labels or ASCII only)
- No rounded corners — `border-radius: 0` is absolute
