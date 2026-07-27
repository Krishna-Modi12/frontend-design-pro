# Google Stitch Design System Generator

Source: Leonxlnx/taste-skill (stitch-skill)  
Version: 10.8.0

## Purpose

This reference generates `DESIGN.md` files optimized for Google Stitch screen generation (labs.google.com/stitch). It converts frontend design principles into Stitch's semantic design language — descriptive, natural-language rules combined with precise values — producing premium, non-generic interfaces through the Stitch agent.

Use this when:
- User asks to "export a DESIGN.md" or "generate design system for Stitch"
- User pastes a Google Stitch URL
- User mentions "Google Stitch" or "Stitch-compatible design"

---

## Atmosphere Dials (Set Before Writing DESIGN.md)

| Dial | Range | Default |
|------|-------|---------|
| Density | 1 (airy gallery) → 10 (dense cockpit) | 4 |
| Variance | 1 (symmetric) → 10 (chaotic asymmetric) | 8 |
| Motion | 1 (static) → 10 (cinematic) | 6 |

Adapt defaults per project type:
- SaaS dashboard → Density 7, Variance 4, Motion 4
- Marketing landing → Density 3, Variance 8, Motion 7
- Editorial / blog → Density 4, Variance 6, Motion 3

---

## DESIGN.md Template

```markdown
# Design System: [Project Title]

## 1. Visual Theme & Atmosphere

[1-3 sentences: describe the mood, philosophy, and overall impression the UI should make.
Example: "A precision-engineered dark interface inspired by aerospace telemetry systems. Dense 
information without clutter. Every element has a functional role — no decoration for its own sake."]

**Density:** [X/10 — e.g., "8/10 — information-dense dashboard feel"]
**Variance:** [X/10 — e.g., "6/10 — structured with deliberate asymmetric breaks"]
**Motion:** [X/10 — e.g., "5/10 — purposeful micro-interactions, no cinematic scroll effects"]

---

## 2. Color Palette & Roles

- [Name] ([HEX]) — [Functional role]
  Example: Deep Charcoal Ink (#18181B) — primary surface and background
- [Name] ([HEX]) — [Role]
  Example: Phosphor White (#EAEAEA) — all body copy and UI text
- [Name] ([HEX]) — [Role]  
  Example: Aviation Red (#E61919) — single accent: CTAs, active states, alerts only
- [Name] ([HEX]) — [Role]
  Example: Void Black (#0A0A0A) — deepest background layer

**Rules:**
- Maximum ONE accent color; saturation capped at 80%
- BANNED: "AI Purple/Blue Neon" aesthetic, purple glows, neon gradients
- BANNED: Pure black (#000000) — use off-black or charcoal
- Consistent palette throughout — no warm/cool gray shifts mid-page

---

## 3. Typography Rules

**Display font:** [Font name] — [personality description]
Example: "Neue Haas Grotesk Display — compressed, mechanical, all-caps for major headings"

**Body font:** [Font name] — [personality description]
Example: "IBM Plex Mono — monospace for all content; tabular data reads with precision"

**Scale:**
- Hero / Display: [size range with clamp() values if applicable]
- Section headings: [size]
- Body text: [size] with [line-height]
- Labels / metadata: [size], always UPPERCASE, tracking [value]
- Max body line width: 65 characters

**BANNED fonts:** Inter, Roboto, Arial, Open Sans, Poppins, DM Sans, Space Grotesk
**BANNED generic serifs (for dashboards/software):** Times New Roman, Georgia, Garamond, Palatino
**Allowed distinctive serifs (editorial/creative only):** Fraunces, Gambarino, Editorial New, Instrument Serif

---

## 4. Component Stylings

**Buttons:**
- Primary: [Background] background, [Text color] text, [radius] border-radius, no outer glow
- Press state: translate(-0, -1px) — tactile downward push, no shadow addition
- Ghost: transparent background, `1px solid [border color]` border

**Cards:**
- Border-radius: [value] (generously rounded for soft/agency; 0 for brutalist)
- Shadow: [description — e.g., "whisper diffusion shadow: 0 20px 40px -15px rgba(0,0,0,0.05)"]
- Rule: used ONLY to communicate visual hierarchy — remove if they add noise
- High-density (Density >7): replace cards with `border-top` dividers only

**Form Inputs:**
- Label: always above the field (never floating)
- Error text: below the field (never above or inline)
- Focus ring: `2px solid [accent color]` — no colored background fill
- No floating label patterns

**Loading states:** Skeletal shimmer matching exact layout dimensions — no generic spinners  
**Empty states:** Composed design — never plain "No data" text  
**Error states:** Clear inline message with retry action — never modal alerts

---

## 5. Layout Principles

**Grid:** [Describe grid — e.g., "12-column CSS Grid, 24px gutters, 80px section gaps"]
**Container max-width:** [e.g., "1400px centered with auto margins"]
**Asymmetry rule:** [e.g., "Variance >6: centered hero sections banned. Use split-screen, left-aligned, or asymmetric whitespace layouts"]

**BANNED layouts:**
- Three equal-width card columns as primary feature section
- Centered hero when Variance >4
- `h-screen` for full-height sections (use `min-h-[100dvh]`)
- Horizontal overflow on any viewport width

**Responsive:**
- Mobile-first breakpoints
- All multi-column layouts collapse to single column below 768px
- Minimum touch target: 44px
- Typography scales via `clamp()` from mobile minimum to desktop maximum
- Vertical spacing reduces proportionally: `clamp(3rem, 8vw, 6rem)`

---

## 6. Motion & Interaction

**Spring physics:** `stiffness: 100, damping: 20` — weighty, natural feel; never linear easing

**Micro-interactions (always active):**
- Buttons: `scale(0.98)` on press, `scale(1.02)` on hover (duration: 150ms)
- Cards: subtle `translateY(-2px)` on hover
- Form focus: smooth `box-shadow` transition (200ms)

**Scroll animations:**
- Entry: `translateY(16px) opacity(0)` → `translateY(0) opacity(1)` — 600–800ms, spring easing
- Stagger children: `delay: calc(var(--index) * 60ms)`

**Perpetual micro-loops (on key hero elements):**
- Pulse, float, shimmer — duration 3–6s, `opacity: 0.4–0.8` range
- Isolate in separate memoized components to prevent parent re-renders

**Performance:**
- Animate ONLY via `transform` and `opacity`
- BANNED animated properties: `top`, `left`, `width`, `height`, `padding`, `margin`
- Grain/noise overlays: `position: fixed; pointer-events: none; z-index: 50` only

---

## 7. Anti-Patterns (Banned Explicitly)

The following are prohibited. Stitch must not generate any of these:

- No emojis in any UI element
- No Inter, Roboto, or generic system fonts as primary display/body font
- No pure black (#000000) surfaces
- No neon/outer glow `box-shadow` effects
- No oversaturated accent colors (saturation >80%)
- No excessive gradient text on large headers
- No custom cursor (pointer-events interference)
- No overlapping elements without intentional z-axis design
- No three-column equal-width card layouts as primary feature grid
- No generic placeholder names (John Doe, Jane Smith, Acme Corp, Nexus)
- No fake round numbers (99.99%, 50%, $100.00)
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer")
- No filler UI text ("Scroll to explore", "Swipe down", bouncing chevrons)
- No centered hero section when Variance >4
- No `h-screen` (always `min-h-[100dvh]`)
- No placeholder image links — use picsum.photos/seed/{keyword}/1920/1080 or SVG placeholders
```

---

## Best Practices for Writing DESIGN.md

1. **Start with atmosphere** — describe the feeling before tokenizing values
2. **Name colors semantically** — "Deep Charcoal Ink (#18181B)" not "dark text"
3. **Explain functional roles** — state what each element DOES, not just what it looks like
4. **Include exact values** — hex codes, rem values, border-radius px, timing ms
5. **Be opinionated** — enforce a specific premium aesthetic, not a neutral template
6. **Anti-patterns carry equal weight as rules** — list them explicitly

---

## Common Failures to Prevent

- Technical jargon without translation ("rounded-xl" → say "generously rounded with 20px radius")
- Missing hex codes or descriptive-only naming ("a nice dark blue" → useless for Stitch)
- Omitting element functional roles
- Vague atmosphere ("modern, clean look" → meaningless)
- Neglecting anti-pattern enforcement
- Defaulting to generic "safe" design instead of a curated aesthetic

---

## Example Atmosphere Descriptions

**Ethereal SaaS (for AI / tech tools):**
> "A floating, gravity-defying interface rendered in deep OLED black. Precision glassmorphic surfaces suggest intelligence without ornamentation. Typography is wide geometric Grotesk — commanding but not aggressive. Color is reduced to a single electric accent; everything else is a calibration of black, white, and zinc."

**Editorial Agency (for agencies / portfolios):**
> "A premium print-inspired digital publication. Warm cream substrates with film-grain texture simulate physical paper. Massive serif headlines contrast against compact sans-serif body text. The UI deliberately slows the eye — this is a space for reading and discovery, not conversion optimization."

**Utilitarian Minimalism (for tools / productivity apps):**
> "A document-first interface inspired by Notion and Linear. No decoration — borders and whitespace ARE the design. Typography controls all visual hierarchy; spacing is the only animation. A Notion user would feel immediately at home."
