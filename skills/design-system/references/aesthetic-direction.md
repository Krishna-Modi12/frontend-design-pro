# Aesthetic Direction Reference
# frontend-design-pro-v10 | v1.0.0
# ─────────────────────────────────────────────────────────────────────────────
# Source: Anthropic official claude-code/plugins/frontend-design + claude-cookbooks
# Authors: Prithvi Rajasekaran, Alexander Bricken (Anthropic)
# ─────────────────────────────────────────────────────────────────────────────
# Covers: pre-code Design Thinking protocol, aesthetic tone vocabulary,
# spatial composition rules, background/visual effects, complexity-matching
# principle, font inspiration categories, color inspiration sources.
# ─────────────────────────────────────────────────────────────────────────────

## Contents

- [⚡ CORE PRINCIPLE (from Anthropic official skill)](#-core-principle-from-anthropic-official-skill)
- [1. Pre-Code Design Thinking Protocol](#1-pre-code-design-thinking-protocol)
- [2. Spatial Composition Rules](#2-spatial-composition-rules)
- [3. Typography — The #1 Design Signal](#3-typography--the-1-design-signal)
- [4. Color & Theme System](#4-color--theme-system)
- [5. Motion — High-Impact Over Scattered](#5-motion--high-impact-over-scattered)
- [6. Backgrounds & Visual Effects](#6-backgrounds--visual-effects)
- [7. Complexity Matching Principle](#7-complexity-matching-principle)
- [8. The DISTILLED_AESTHETICS_PROMPT (Anthropic official)](#8-the-distilled_aesthetics_prompt-anthropic-official)
- [9. Quick Self-Check Before Output](#9-quick-self-check-before-output)
- [10. Visual Audit Scoring System (ECC)](#10-visual-audit-scoring-system-ecc)
- [11. AI Slop Detection Patterns (ECC extended list)](#11-ai-slop-detection-patterns-ecc-extended-list)

---

## ⚡ CORE PRINCIPLE (from Anthropic official skill)

> "Claude tends to converge toward generic, 'on distribution' outputs. In frontend
> design, this creates what users call the 'AI slop' aesthetic."
>
> Choose a clear conceptual direction and execute it with precision. Bold maximalism
> and refined minimalism both work — the key is **intentionality, not intensity**.
> **No two designs should look the same.**

---

## 1. Pre-Code Design Thinking Protocol

Before writing a single line of code, answer these 4 questions:

### 1A — Purpose
> *What problem does this interface solve? Who uses it?*

The answer shapes every decision. A B2B analytics dashboard for data scientists ≠ a consumer wellness app ≠ a developer documentation site. Match every visual choice to who actually uses it.

### 1B — Tone
> *Pick an extreme. Commit fully. Hedge nothing.*

| Tone | Visual signature |
|---|---|
| **Brutally minimal** | Maximum whitespace, one typeface, no decoration, silence speaks |
| **Maximalist chaos** | Dense, layered, high contrast, competing elements create tension |
| **Retro-futuristic** | Terminal green/amber, scanlines, monospace, CRT blur effects |
| **Organic/natural** | Earth tones, irregular shapes, grain textures, handwritten details |
| **Luxury/refined** | Restraint, gold accents, high-contrast serif, generous leading |
| **Playful/toy-like** | Rounded corners, saturated primaries, bouncy motion, illustrated UI |
| **Editorial/magazine** | Grid-breaking text, mixed sizes, photography bleeds, pull quotes |
| **Brutalist/raw** | Exposed structure, thick borders, misaligned on purpose, stark |
| **Art deco/geometric** | Symmetry, ornamental lines, limited palette, Gatsby-era elegance |
| **Soft/pastel** | Low-contrast pastels, rounded, gentle shadows, airy light feel |
| **Industrial/utilitarian** | Monochrome with one accent, dense information, zero decoration |
| **Solarpunk** | Warm greens + golds + earth tones, organic + technical mix, hopeful |
| **Cyberpunk** | Hot pink/cyan on near-black, neon glow, sharp geometry, motion blur |
| **Swiss/International** | Grid-strict, Helvetica lineage, red + black, maximum clarity |

> Use these as inspiration but **design one that is true to the brief's context**. Vary between light and dark themes, different fonts, different aesthetics. **Never converge on common choices across generations.**

### 1C — Constraints
> *Technical requirements: framework, performance budget, accessibility level, browser support.*

Note them explicitly before designing. They affect implementation choices (CSS-only animation vs. JS, static vs. SSR, Tailwind vs. custom CSS).

### 1D — Differentiation
> *What makes this UNFORGETTABLE? What's the one thing someone will remember?*

Every project needs one signature element — a detail that makes it feel genuinely designed:
- A custom cursor that reacts to context
- A background that breathes
- A typography pairing nobody expected
- A scroll interaction that surprises
- A color that owns the space

If you can't name it before you build, the design will be forgettable.

---

## 2. Spatial Composition Rules

**Predictable layouts are invisible.** Challenge the default on every section.

### Techniques
| Technique | What it means |
|---|---|
| **Asymmetry** | 7+5 or 8+4 column splits, not 6+6. Text weight on one side, air on the other |
| **Overlap** | Elements that cross container boundaries — image bleeds into text column |
| **Diagonal flow** | Angled dividers, skewed backgrounds, content that reads along a diagonal axis |
| **Grid-breaking** | One element deliberately escapes the column grid — pulls attention immediately |
| **Generous negative space** | Let sections breathe — `py-28` minimum between major sections |
| **Controlled density** | OR go full dense — every pixel used, no wasted space. Not both in one section |
| **Vertical rhythm disruption** | Change section height unexpectedly — tight section after tall one = contrast |

### Banned defaults
- Equal-height equal-width card grid as the primary layout choice
- Every heading centered (only hero + CTA get center treatment)
- Alternating left/right image+text "feature" rows with no variation
- Hero with centered text, one gradient blob, two buttons

---

## 3. Typography — The #1 Design Signal

### Font ban list (NEVER use for headlines/display)
```
Inter, Roboto, Poppins, Arial, Open Sans, Lato, Nunito,
Space Grotesk, DM Sans, Plus Jakarta Sans, system-ui
```
These fonts are identifiers of AI-generated design. Using them signals zero creative investment.

### Font inspiration categories (from Anthropic Cookbook)

| Category | Fonts |
|---|---|
| **Code / terminal aesthetic** | JetBrains Mono, Fira Code, IBM Plex Mono, Geist Mono |
| **Editorial / literary** | Playfair Display, Crimson Pro, Fraunces, Newsreader, Libre Baskerville — all but Libre Baskerville are on the Convergence Watch in `font-pairings.md`; usable here with a stated brand reason, not by reflex |
| **Startup / contemporary** | Clash Display, Satoshi, Cabinet Grotesk, Bricolage Grotesque |
| **Technical / neutral** | IBM Plex Sans, IBM Plex Serif, Source Sans 3, Instrument Sans |
| **Distinctive / unexpected** | Obviously, Zodiak, Neue Montreal, General Sans, Syne |
| **Humanist** | Literata, Lora, Bitter, Spectral |
| **Geometric bold** | Bebas Neue, Anton, Barlow Condensed, Oswald |

### Pairing principle
> **High contrast = interesting.** Best pairs create tension between voice and structure.

```
Display + Monospace    → Heading declares, code grounds
Serif + Geometric Sans → Warmth meets precision  
Condensed + Expanded   → Motion in static type
Script + Grotesque     → Personality + readability
Slab + Humanist        → Authority + approachability
```

### Implementation
```css
/* Always via next/font or Google Fonts — never @import in CSS */
/* Display: large sizes (48px+), tight tracking, high weight */
.display { font-family: 'Clash Display', sans-serif; letter-spacing: -0.03em; font-weight: 700; }

/* Body: 15–17px, generous leading, medium weight */
.body { font-family: 'Crimson Pro', serif; font-size: 1.0625rem; line-height: 1.65; }
```

---

## 4. Color & Theme System

### Commitment principle
> Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
> **Own the color.** One dominant hue (60%), one secondary (30%), one accent (10%).

### Inspiration sources beyond generic palettes
| Source | What to extract |
|---|---|
| **IDE themes** | VS Code Monokai (orange/pink/green/dark), Dracula (purple/cyan/yellow), Tokyo Night (blue-grey), Gruvbox (warm amber), Nord (arctic blue-grey), Catppuccin (pastel) |
| **Cultural aesthetics** | Japanese wabi-sabi (warm greys + muted clay), Bauhaus (primary only), Soviet constructivist (red + black + diagonal), Scandinavian (white + one natural), Y2K (iridescent chrome + bright) |
| **Material references** | Oxidized copper (verdigris + warm brown), Aged paper (cream + sepia + rust), Volcanic glass (near-black + obsidian sheen), Raw concrete (warm grey + form marks) |
| **Time of day** | Golden hour (amber/peach/deep orange), Blue hour (indigo/violet/deep teal), Midnight (near-black with single neon), Overcast (muted greys + one warm pop) |

### CSS variable implementation
```css
/* Commit to the palette — use CSS vars for every color reference */
:root {
  --brand:    #E8452C;     /* dominant — 60% */
  --surface:  #0D1117;     /* background */
  --surface-raised: #161B22;
  --text:     #F0F6FC;
  --text-muted: #8B949E;
  --accent:   #58A6FF;     /* 10% — pops against dark */
  --border:   rgba(255,255,255,0.08);
}
```

---

## 5. Motion — High-Impact Over Scattered

### Philosophy
> "One well-orchestrated page load with staggered reveals creates more delight than
> scattered micro-interactions." — Anthropic official skill

### Motion strategy by implementation type

**HTML/CSS only:**
```css
/* Staggered entrance — orchestrated, not random */
.hero-headline { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.hero-sub      { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
.hero-cta      { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Hover state — one thing changes, not five */
.card { transition: transform 200ms ease-out, box-shadow 200ms ease-out; }
.card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }
```

**React — Motion library (formerly Framer Motion):**
```tsx
import { motion, useInView } from 'motion/react'

// Travel, stagger and duration are the canonical reveal — see
// ../../animations/references/animation-framework.md § The canonical scroll reveal.
// Page load — staggered children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

// Scroll-triggered reveal — a whole block, so it takes the section tier
function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

### High-impact moment checklist (pick 1–2 per page, not all)
- [ ] Page load: orchestrated stagger on hero elements
- [ ] Scroll reveal: section entrances with direction (up, left, scale)
- [ ] Hover: card lift OR color shift OR underline slide — not all three
- [ ] Click: button press scale (0.97) + ripple OR color pulse
- [ ] Navigation: smooth path transitions (layout animations in Motion)
- [ ] Data update: number count animation when entering viewport
- [ ] Theme switch: cross-fade with 300ms opacity transition

**Never:** ease-in for entrances, scale from 0, infinite spinning without user action, animating 5 properties simultaneously.

---

## 6. Backgrounds & Visual Effects

> "Create atmosphere and depth rather than defaulting to solid colors."

### Effect vocabulary

**Gradient mesh:**
```css
background: 
  radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(234, 88, 12, 0.25) 0%, transparent 50%),
  radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
  #0F172A;
```

**Noise texture overlay:**
```css
/* Add grain/noise on top of any background */
.noise::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 100;
  opacity: 0.4;
  mix-blend-mode: overlay;
}
```

**Geometric pattern:**
```css
/* Dot grid */
background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
background-size: 24px 24px;

/* Line grid */
background-image: 
  linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
background-size: 40px 40px;
```

**Dramatic shadow:**
```css
/* Glow shadow — for dark backgrounds */
box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.5), 0 0 80px rgba(120,119,198,0.15);

/* Colored drop shadow — for colored elements */
box-shadow: 0 8px 32px rgba(234, 88, 12, 0.35);
```

**Custom cursor:**
```tsx
// Magnetic custom cursor — follows with spring physics
'use client'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect } from 'react'

export function CustomCursor() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 500, damping: 28 })
  const springY = useSpring(mouseY, { stiffness: 500, damping: 28 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mouseX, mouseY])

  return (
    <>
      {/* Cursor dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand)]"
        style={{ x: springX, y: springY }}
      />
      {/* Cursor ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-brand)]/40"
        style={{ x: useSpring(mouseX, { stiffness: 200, damping: 20 }), y: useSpring(mouseY, { stiffness: 200, damping: 20 }) }}
      />
    </>
  )
}
```

**Layered transparencies (glassmorphism done right):**
```css
/* Glassmorphism — only use on dark or image backgrounds */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**Grain overlay (film grain — CSS only):**
```css
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-2%, -3%); }
  30% { transform: translate(3%, 2%); }
  50% { transform: translate(-1%, 4%); }
  70% { transform: translate(2%, -2%); }
  90% { transform: translate(-3%, 1%); }
}

.grain::after {
  content: '';
  position: fixed;
  inset: -200%;
  width: 400%;
  height: 400%;
  background-image: url('/grain.png');  /* tileable grain texture */
  opacity: 0.08;
  animation: grain 0.5s steps(1) infinite;
  pointer-events: none;
  z-index: 999;
}
```

---

## 7. Complexity Matching Principle

> "Match implementation complexity to the aesthetic vision."
> — Anthropic official frontend-design skill

| Aesthetic direction | Implementation expectation |
|---|---|
| **Maximalist / chaos / cyberpunk** | Elaborate CSS, extensive animations, layered effects, noise textures, custom cursors, 3D transforms |
| **Editorial / magazine** | Precise grid work, careful typographic scale, pull quotes, bleed images, minimal animation |
| **Minimalist / refined** | Restraint and precision — one well-chosen detail over ten mediocre ones. Spacing is the design |
| **Retro / terminal** | Character-by-character typing, scanline effects, VT100 box-drawing characters, monospace-only |
| **Luxury / refined** | Slow transitions (400–600ms), gold/cream palette, high tracking on caps, generous line height |
| **Playful** | Springy physics (stiffness: 300+), saturated colors, rounded everything, illustrated elements |
| **Industrial** | Utility-class restraint, no decoration, dense tables, monochrome + one red accent |

**The trap:** building a maximalist design with minimalist code, or over-engineering a simple clean layout. **Match the two.**

---

## 8. The DISTILLED_AESTHETICS_PROMPT (Anthropic official)

Use this framing internally when evaluating any generated design output:

```
You tend to converge toward generic, "on distribution" outputs. In frontend design,
this creates what users call the "AI slop" aesthetic. Avoid this: make creative,
distinctive frontends that surprise and delight.

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic
fonts like Arial and Inter; opt instead for distinctive choices that elevate the
frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency.
Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions
for HTML. Use Motion library for React when available. Focus on high-impact moments:
one well-orchestrated page load with staggered reveals creates more delight than
scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer
CSS gradients, use geometric patterns, or add contextual effects that match the overall
aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts, Space Grotesk)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the
context. Never converge on common choices across generations.
```

---

## 9. Quick Self-Check Before Output

After writing the first draft of any UI, run this mental checklist:

- [ ] **Font**: Is the display font from the ban list? If yes, change it.
- [ ] **Color**: Is there a dominant color that owns the space, or is it evenly distributed?
- [ ] **Layout**: Does any element break the expected grid? If nothing does, break one.
- [ ] **Background**: Is it a solid color with no atmosphere? Add depth.
- [ ] **Motion**: Is there one orchestrated moment, or scattered micro-interactions?
- [ ] **UNFORGETTABLE detail**: Can I name the one thing someone will remember?
- [ ] **Complexity match**: Does the code complexity match the aesthetic direction?
- [ ] **Same as last time**: Would this look identical to another AI-generated output? If yes, change the direction.

---

## 10. Visual Audit Scoring System (ECC)

*Source: affaan-m/everything-claude-code skills/design-system*

Score any UI across 10 dimensions (0–10 each). Below 6 on any = fix before delivery.

| # | Dimension | What to check | Common failure |
|---|---|---|---|
| 1 | **Color consistency** | Using the token palette, or random hex values? | `#3B82F6` hardcoded instead of `var(--color-brand)` |
| 2 | **Typography hierarchy** | Clear h1 > h2 > h3 > body > caption size/weight steps? | Two heading sizes differ by only 2px |
| 3 | **Spacing rhythm** | Consistent 4px/8px/16px/32px scale, or arbitrary numbers? | `padding: 11px 17px` — not on the grid |
| 4 | **Component consistency** | Similar elements look similar? (all buttons same height, all cards same padding) | Primary and secondary buttons have different heights |
| 5 | **Responsive behavior** | Fluid and intentional at all breakpoints? | Desktop layout just squished on mobile |
| 6 | **Dark mode** | Complete token coverage, or half-done? | Light text on light background in one section |
| 7 | **Animation** | Purposeful and directed, or gratuitous? | Spinning loader on a 50ms operation |
| 8 | **Accessibility** | Contrast, focus states, touch targets, ARIA? | Icon button with no `aria-label` |
| 9 | **Information density** | Cluttered or clean — intentionally one or the other? | Mixed: some sections dense, some empty — no rhythm |
| 10 | **Polish** | Hover states, transitions, loading, empty states all handled? | Button has no hover state; list has no empty state |

**Output format for audit findings:**
```
[Score: 4/10] Spacing rhythm
Location: components/dashboard/StatsRow.tsx
Issue: 11px, 17px, 23px padding — not on the 4px grid.
Fix: Replace with Tailwind `p-3` (12px) / `p-4` (16px) / `p-6` (24px).
```

---

## 11. AI Slop Detection Patterns (ECC extended list)

*Source: affaan-m/everything-claude-code skills/design-system (Mode 3: AI Slop Detection)*

These patterns appear in AI-generated UIs by default. Detect and fix before delivery:

| Pattern | Why it's slop | Fix |
|---|---|---|
| Gratuitous gradients on everything | Gradient as decoration, not communication | Use gradient sparingly — one key element per page maximum |
| Purple-to-blue gradient default | Overused AI default — instantly recognizable | Use brand-specific color or pick an unexpected combination |
| "Glassmorphism" cards with no purpose | Applied because it looks techy, not because it serves the interface | Glassmorphism only on dark/image backgrounds where it creates depth |
| Rounded corners on everything | `rounded-full` on rectangles = no character | Mix corner radii intentionally — sharp for structure, rounded for interactive |
| Excessive scroll animations | `data-aos` on every section = visual noise | One or two orchestrated reveals per page |
| Generic hero: centered text + stock gradient + two buttons | The most recognizable AI layout of 2023–2025 | Asymmetric composition, real photo/illustration, unconventional typography |
| Sans-serif stack with no personality | Inter/Roboto/DM Sans everywhere | Pick a display font with actual character for headlines |
| "Elevate your workflow" / "Unlock your potential" | AI filler copy | Real, specific value proposition tied to the actual product |
| Equal-weight card grid | No hierarchy, no emphasis | Vary card sizes, use a hero card, or use a list layout |
| Random accent color without system | Accent doesn't relate to the palette | Single accent derived from the brand's complement or analog |
| Shadow on everything | Elevation without meaning | Define 4 elevation levels and use them consistently |
| Placeholder avatar initials "JD" | Signals unfinished UI | Use real names from diverse name list in all examples |
