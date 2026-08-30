# Minimalist / Editorial Style

Source: taste-skill (minimalist-skill) + Leonxlnx/taste-skill v2

## Philosophy

Ultra-minimalist, "document-style" web interfaces. Notion/Linear/Basecamp-inspired. Typography IS the primary design element — the design stays completely out of the way. Quiet sophistication. Every border, shadow, and motion choice should be defensible as essential.

---

## Typography

**Sans-Serif stack (primary):** SF Pro Display, Geist Sans, Helvetica Neue, Switzer  
**Serif stack (editorial headers only):** Lyon Text, Newsreader, Playfair Display, Instrument Serif  
- Serif tracking: `letter-spacing: -0.02em` to `-0.04em`  
**Monospace stack:** Geist Mono, SF Mono, JetBrains Mono

- High-contrast variable serif for massive headings (editorial flavor)
- Extreme typographic contrast establishes editorial feel
- Body: clean sans-serif, `max-w-[65ch]` for optimal 65-character line length
- Text colors: `#111111` or `#2F3437` (never pure black), secondary: `#787774`
- NO Inter, Roboto, or Open Sans

---

## Color Palette

```
Canvas:      #FFFFFF or #F7F6F3 / #FBFBFA
Cards:       #FFFFFF or #F9F9F8
Borders:     #EAEAEA or rgba(0,0,0,0.06)
Text:        #111111 (primary) / #787774 (secondary)
```

**Muted pastel accents** — for tags, badges, and status only. Never as backgrounds:

| Name | Background | Text |
|------|-----------|------|
| Pale Red | `#FDEBEC` | `#9F2F2D` |
| Pale Blue | `#E1F3FE` | `#1F6C9F` |
| Pale Green | `#EDF3EC` | `#346538` |
| Pale Yellow | `#FBF3DB` | `#956400` |

Rules:
- NO gradients whatsoever
- NO saturated colors in main UI
- NO glass effects or backdrop-blur
- One accent tint maximum per page (use the pale palette above)

---

## Layout

- Bento-style with `1px solid #EAEAEA` borders — the structure is the decoration
- Content constrained to `max-w-4xl` or `max-w-5xl` (never wider)
- Generous whitespace as a design element — `py-24` to `py-32` between sections
- Single-column content with sidebar navigation preferred
- Flat components — zero elevation, zero depth

---

## Motion

- MOTION_INTENSITY capped at 2–3
- Scroll entry: `translateY(12px) opacity(0)` → `translateY(0) opacity(1)`, 600ms, `cubic-bezier(0.16, 1, 0.3, 1)`
- Hover: `box-shadow: 0 2px 8px rgba(0,0,0,0.04)` transition over 200ms
- Active buttons: `scale(0.98)` over 100ms
- Staggered reveals: `delay: calc(var(--index) * 80ms)` — use CSS custom property on each child
- Background blobs: `animation-duration: 20s+`, `opacity: 0.02–0.04` (essentially invisible — texture only)
- Animate ONLY `transform` and `opacity` — never layout properties

---

## Shadows

- None or extremely muted
- `shadow-none` or `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`
- Cards: `box-shadow: none; border: 1px solid #EAEAEA`

---

## Components

**Cards:**
- Border: exactly `1px solid #EAEAEA`
- Border-radius: 8px or 12px maximum (never `rounded-full` or `rounded-2xl`)
- Padding: 24px–40px generous spacing
- Background: `#F9F9F8` or `#FFFFFF`

**Buttons:**
- Primary: `background: #111111; color: #FFFFFF; border-radius: 4–6px; no box-shadow`
- Ghost: `background: transparent; border: 1px solid #EAEAEA; color: #111111`
- Active: `scale(0.98)` — no shadow addition

**Tags / Badges:**
- Pill-shaped: `border-radius: 100px; padding: 2px 10px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em`
- Use pale accent palette above, never brand color
- No emojis inside tags

**Accordions:**
- `border-bottom: 1px solid #EAEAEA` dividers only
- Toggle: `+` / `−` text symbols (not icons)

**Keyboard UI (`<kbd>`):**
- `border: 1px solid #EAEAEA; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 0.75rem; background: #F9F9F8`

---

## Icons & Imagery

- Phosphor Icons (Bold or Fill weight) or Radix UI Icons — never Lucide or Feather **within this style**. This overrides the pack default in `skills/iconography/`, which is Lucide; the override applies only to work in the minimalist direction
- Illustrations: monochromatic line sketches with single muted pastel shape (from palette above)
- Photography: desaturated, warm-toned, `filter: saturate(0.6) brightness(1.05)`
- Backgrounds: subtle radial gradients at `opacity: 0.03`, minimal patterns

---

## Execution Checklist

Follow in order:

1. Establish macro-whitespace first (`py-24` or `py-32`)
2. Constrain content to `max-w-4xl` or `max-w-5xl`
3. Apply typographic hierarchy — CSS custom properties for color tokens immediately
4. Every border: `1px solid #EAEAEA` — no exceptions, no variations
5. Staggered scroll-entry animations on major blocks only (not every element)
6. Sections require visual depth via subtle imagery, radial gradient at `opacity: 0.03`, or noise texture
7. Deliver native, polished code — no inline style hacks, no manual adjustments needed

---

## Banned Elements

- Inter, Roboto, Open Sans — any generic system font as primary
- Lucide, Feather, Heroicons — default AI icon choices, banned **in this style only** (Lucide is the pack default elsewhere)
- `shadow-md`, `shadow-lg`, `shadow-xl` — heavy Tailwind shadow utilities
- Colored section backgrounds (any non-neutral background)
- Gradients, neon colors, glassmorphism, any blur effect
- `rounded-full` on containers, cards, or form inputs (pills allowed for tags/badges only)
- Emojis in any capacity
- Generic placeholder content (John Doe, Lorem Ipsum, Acme Corp)
- Marketing clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve"
