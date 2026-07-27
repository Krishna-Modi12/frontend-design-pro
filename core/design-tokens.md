# Design Tokens (core)

Loaded as a core dependency by `landing-pages`, `design-system`, `animations`, `web-interface`.
Full palette library and brand profiles live in `skills/design-system/references/`.

## Colour — OKLCH only

Never raw hex in component code. `oklch(L% C H)` — L lightness 0–100%, C chroma 0–0.4, H hue 0–360.

```css
:root {
  --color-surface:        oklch(98% 0.005 240);
  --color-surface-raised: oklch(99.5% 0.004 255);
  --color-ink:            oklch(14% 0.012 240);
  --color-ink-secondary:  oklch(45% 0.010 240);
  --color-brand:          oklch(60% 0.185 276);
  --color-error:          oklch(55% 0.220 25);
  --color-success:        oklch(65% 0.175 162);
  --color-border:         oklch(90% 0.005 240);
  --shadow-card: 0 1px 3px oklch(0% 0 0 / .08), 0 1px 2px oklch(0% 0 0 / .06);
}
```

Never `#000000` or `#FFFFFF` as a surface. Dark mode inverts L and keeps H — hue consistency across themes is what makes a palette feel designed. Tint borders and shadows toward the surface hue rather than using neutral grey.

## Spacing — 4pt scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` px (`p-1 … p-24`). Every gap, pad and margin is a multiple of 4. Section gaps ≥32px mobile / ≥48px desktop. Page padding ≥80px top and bottom. Prefer logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`) — RTL is the default assumption, not a special case.

## Typography

Body ≥16px · labels ≥14px · headings ≥18px · hero ≥48px desktop. Line-height ≥1.6 body, ≥1.2 headings. At least two sizes with ≥3× difference per section. `text-wrap: balance` on headings, `text-pretty` on paragraphs. `tabular-nums` for any column of figures.

**Banned as display/heading faces:** Inter, Roboto, Arial, Poppins, DM Sans, Space Grotesk. They may sit in a fallback stack (`Manrope, Inter, system-ui`) but never carry brand identity.

## Radius, elevation, z-index

Nested radii are concentric: `child = parent − padding`. Shadows use ≥2 layers (ambient + direct), never one blurry drop. Named z-scale: `base 0 · raised 10 · dropdown 20 · sticky 40 · modal 100 · toast 1000` — or use the top layer (`<dialog>`, Popover API) and skip z-index entirely.

## Motion

Enter `ease-out` `cubic-bezier(0.23,1,0.32,1)`; `ease-in` only for exits ≤200ms; never `ease-in` for entrances. Durations: button 100–160ms · dropdown 150–250ms · modal 200–500ms · never >600ms for UI. Animate `transform` and `opacity` only. Never `transition: all`. `prefers-reduced-motion` is mandatory wherever motion exists.

## Typography & canvas detail

- Base 16px (1rem). Fluid scaling via `clamp()` beats breakpoint jumps.
- Line height 1.5 body · 1.2 headings · 1.75 long-form reading.
- Letter spacing −0.02em on large headings · 0 on body · +0.05em on small caps and labels.
- `font-display: swap` always; preload the critical face. Never strip `&display=swap`.
- `text-wrap: balance` on headings over two words; `text-pretty` on paragraphs.
- `font-variant-numeric: tabular-nums` for data, prices, counters and anything that updates in place.
- Canvas text: measure with `OffscreenCanvas` in a worker — never call `measureText` during render.
- Contrast floor 4.5:1 body / 3:1 large; APCA (Lc ≥75 body) is the better perceptual check where tooling supports it.
