# UI Redesign Audit Framework

Source: taste-skill (redesign-skill) + Leonxlnx/taste-skill v2 + ui-ux-pro-max-skill  
Version: 10.8.0

## How to Use

Follow this 3-step sequence for every REDESIGN intent:

1. **Scan** — Read the codebase. Identify framework, styling method (Tailwind version, vanilla CSS, styled-components), and current design patterns.
2. **Diagnose** — Run through every category below. List every generic pattern, weak point, and missing state found.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do NOT rewrite from scratch. Do NOT migrate frameworks.

---

## 7-Category Design Audit

Score each area 1–10. Prioritize improvements from lowest-scoring areas first.

---

### 1. Typography

| Problem | Fix |
|---------|-----|
| Browser defaults or Inter/Roboto everywhere | Replace with Geist, Outfit, Cabinet Grotesk, or Satoshi; pair serif header with sans body for editorial work |
| Headlines lack presence | Increase size, tighten `letter-spacing`, reduce `line-height` for weight |
| Body text too wide | Limit to `max-w-[65ch]`; increase `line-height: 1.5–1.7` |
| Only 400 and 700 weights used | Introduce 500 (Medium) and 600 (SemiBold) for subtle hierarchy |
| Numbers in proportional font | Use monospace or `font-variant-numeric: tabular-nums` for data interfaces |
| Missing tracking adjustments | Negative tracking for large headers; positive for small-caps/labels |
| All-caps subheaders | Try lowercase italics, sentence case, or small-caps instead |
| Orphaned words at line end | Fix with `text-wrap: balance` (headings) or `text-wrap: pretty` (body) |

---

### 2. Color & Surfaces

| Problem | Fix |
|---------|-----|
| Pure `#000000` background | Replace with off-black: `#0a0a0a`, `#121212`, or dark navy |
| Oversaturated accent colors | Keep saturation below 80%; desaturate to blend with neutrals |
| Multiple accent colors | Pick ONE; remove the rest — consistency beats variety |
| Mixing warm and cool grays | Stick to one gray family with consistent hue tinting throughout |
| Purple/blue "AI gradient" | This is the #1 AI design fingerprint. Replace with neutral base + single accent |
| Generic `box-shadow` | Tint shadows to match background hue; use colored shadows not pure black |
| Flat design, zero texture | Add subtle CSS noise, grain, or micro-patterns to backgrounds |
| Perfectly even linear gradients | Use radial gradients, noise overlays, or mesh gradients instead |
| Inconsistent lighting direction | Audit shadows — single, consistent light source throughout |
| Random dark sections in light mode | Either commit to full dark mode or maintain consistent background throughout |
| Empty flat sections, no depth | Add high-quality background imagery (blurred, overlaid), subtle patterns, or ambient gradients |

---

### 3. Layout

| Problem | Fix |
|---------|-----|
| Everything centered and symmetrical | Break symmetry: offset margins, mixed aspect ratios, left-aligned headers over centered content |
| Three equal card columns as feature row | **Most generic AI layout.** Replace with 2-column zig-zag, asymmetric grid, horizontal scroll, or masonry |
| `height: 100vh` for full-screen sections | Replace with `min-height: 100dvh` — iOS Safari viewport jumping fix |
| Complex flexbox percentage math | Replace with CSS Grid for reliable multi-column structures |
| No max-width container | Add constraint (1200–1440px) with `margin: 0 auto` |
| Cards of equal height forced by flexbox | Allow variable heights or use masonry |
| Uniform border-radius everywhere | Vary: tighter on inner elements (`4px`), softer on containers (`20–24px`) |
| No overlap or depth | Use negative margins to create layering and visual depth |
| Symmetrical vertical padding | Adjust optically — bottom padding often needs to be slightly larger |
| Left sidebar always present | Try top navigation, floating command menu, or collapsible panel |
| Missing whitespace | Double the spacing. Let it breathe. |
| Buttons not bottom-aligned in card groups | Pin buttons to bottom of each card with `mt-auto` for clean horizontal line |

---

### 4. Interactivity & States

| Problem | Fix |
|---------|-----|
| No hover states on buttons | Add background shift, slight scale (`scale(1.02)`), or translate on hover |
| No active/pressed feedback | Add `scale(0.98)` or `translateY(1px)` on active/press |
| Instant transitions (0 duration) | Add 200–300ms smooth transitions to all interactive elements |
| Missing focus ring | Visible focus indicators — `focus-visible:ring-2 focus-visible:ring-offset-2` |
| Generic spinner for loading | Replace with skeleton loaders matching the actual layout shape |
| No empty state | Design composed "getting started" view — never just blank space |
| No error state | Clear inline error messages — never `window.alert()` |
| Dead links (href="#") | Either link to real destinations or visually disable the element |
| No current page indicator in nav | Style active nav link differently (weight, color, underline) |
| Scroll jumping | Add `scroll-behavior: smooth` to anchor clicks |
| Animations triggering layout reflow | Switch to `transform` and `opacity` only — GPU-accelerated |

---

### 5. Content

| Problem | Fix |
|---------|-----|
| "John Doe" / "Jane Smith" | Use diverse, realistic names: Ana Ngugi, Kenji Tanaka, Priya Shah, Mateus Oliveira |
| Round numbers (`99.99%`, `50%`) | Use organic data: `47.2%`, `$99.00`, `+1 (312) 847-1928` |
| Generic company names ("Acme", "Nexus") | Invent contextual, believable brand names |
| AI copywriting clichés | Avoid "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve", "In the world of..." |
| Exclamation marks in success messages | Remove. Be confident, not loud. |
| "Oops!" error messages | Be direct: "Connection failed. Please try again." |
| Passive voice | Active voice: "We couldn't save your changes" not "Mistakes were made" |
| All blog dates identical | Randomize dates to appear real |
| Same avatar for multiple users | Unique assets for each distinct person |
| Lorem Ipsum placeholder text | Write real draft copy — always |
| Title Case On Every Header | Use sentence case instead |

---

### 6. Component Patterns

| Problem | Fix |
|---------|-----|
| Generic card (border + shadow + white bg) | Remove border, use only background color; or use only spacing; never all three |
| One filled + one ghost button only | Add text links or tertiary styles to reduce visual noise |
| Pill "New" and "Beta" badges | Try square badges, flags, or plain text labels |
| Accordion FAQ sections | Try side-by-side list, searchable help, or inline progressive disclosure |
| 3-card carousel testimonials with dots | Replace with masonry wall, embedded social posts, or single rotating quote |
| Pricing table with 3 equal towers | Highlight recommended tier with color and emphasis — not just extra height |
| Modals for everything | Use inline editing, slide-over panels, or expandable sections |
| Avatar circles exclusively | Try squircles or `rounded-[20%]` |
| Light/dark toggle = sun/moon switch | Use dropdown, system preference detection, or settings integration |
| Footer link farm with 4 columns | Simplify — focus on main nav paths and legally required links |

---

### 7. Iconography & Code Quality

**Iconography:**
| Problem | Fix |
|---------|-----|
| Stock Lucide metaphors, unvaried | The library is not the tell — the reflex metaphor is. Vary the metaphor first (see next row); switch sets (Phosphor, Radix, Tabler) when the aesthetic calls for it. Lucide remains the pack default — see `skills/iconography/` |
| Rocketship for "Launch", shield for "Security" | Replace clichéd metaphors with less obvious icons (bolt, fingerprint, spark, vault) |
| Inconsistent stroke widths | Standardize to one stroke weight (1.5 or 2.0) throughout |
| Missing favicon | Always include a branded favicon |
| Stock "diverse team" photos | Use real team photos, candid shots, or consistent illustration style |

**Code quality:**
| Problem | Fix |
|---------|-----|
| Div soup | Semantic HTML: `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>` |
| Inline styles mixed with CSS classes | Move all styling to project's styling system |
| Hardcoded pixel widths | Use relative units (`%`, `rem`, `em`, `max-width`) |
| Missing alt text | Describe content for screen readers; `alt=""` only for decorative images |
| Arbitrary z-index (`9999`) | Establish clean z-index scale in theme/variables |
| Commented-out dead code | Remove all debug artifacts before shipping |
| Import hallucinations | Verify every import exists in `package.json` before using it |
| Missing meta tags | Add `<title>`, `description`, `og:image`, and social sharing meta |

---

## Fix Priority Order

Apply changes in this sequence for maximum visual impact with minimum risk:

1. **Font swap** — Biggest instant improvement, lowest risk
2. **Color palette cleanup** — Remove clashing or oversaturated colors, fix surfaces
3. **Hover and active states** — Makes interface feel alive immediately
4. **Layout and spacing** — Proper grid, max-width, consistent padding, break equal grids
5. **Replace generic components** — Swap cliché patterns for modern alternatives
6. **Add loading / empty / error states** — Makes it feel finished and production-ready
7. **Typography scale and spacing polish** — Premium final touch
8. **Animation layer** — Micro-interactions added LAST (icing, not foundation)

---

## Upgrade Techniques

### Typography Upgrades
- **Variable font animation** — Interpolate `font-weight` or `font-stretch` on scroll/hover for text that feels alive
- **Outlined-to-fill transition** — Text starts as stroke outline (`-webkit-text-stroke`), fills with color on scroll/interaction
- **Text mask reveals** — Large typography acting as `clip-path` window to video or animated imagery behind it

### Layout Upgrades
- **Broken grid / asymmetry** — Elements deliberately ignore column structure (overlap, bleed, offset)
- **Whitespace maximization** — Aggressive negative space forces focus on a single element
- **Parallax card stacks** — Sections stick (`position: sticky`) and physically stack over each other during scroll
- **Split-screen scroll** — Two halves of screen sliding in opposite directions simultaneously

### Motion Upgrades
- **Smooth scroll with inertia** — Decouple from browser default for heavier, cinematic feel (Lenis)
- **Staggered entry** — Elements cascade in with delays, combining Y-axis translation with opacity fade
- **Spring physics** — Replace `linear` easing with `cubic-bezier(0.32, 0.72, 0, 1)` for natural, weighty feel
- **Scroll-driven reveals** — Content entering through expanding masks, wipes, or SVG paths tied to scroll progress

### Surface Upgrades
- **True glassmorphism** — Beyond `backdrop-filter: blur`. Add `1px inner border` and subtle inner shadow to simulate edge refraction: `box-shadow: inset 0 1px 1px rgba(255,255,255,0.15)`
- **Spotlight borders** — Card borders that illuminate dynamically under cursor position (`background: radial-gradient(circle at var(--x) var(--y), rgba(255,255,255,0.3), transparent 60%)`)
- **Grain and noise overlays** — Fixed `pointer-events-none` overlay with subtle noise to break flatness
- **Colored / tinted shadows** — Shadows carrying the hue of background, not generic black

---

## Strategic Omissions (What AI Always Forgets)

Check these exist before shipping:

- [ ] **Legal links** — Privacy policy and Terms of Service in footer
- [ ] **"Back" navigation** — Every page needs a way back; no dead ends
- [ ] **Custom 404 page** — Helpful, branded "page not found" experience
- [ ] **Form validation** — Client-side validation for emails, required fields, format checks
- [ ] **Skip to content link** — `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>` — keyboard users
- [ ] **Cookie consent** — Compliant consent banner if jurisdiction requires it
- [ ] **Favicon** — Branded, not browser default
- [ ] **Open Graph meta** — `og:title`, `og:description`, `og:image` for social sharing
- [ ] **Loading states** — Every async operation has a visible loading state
- [ ] **Empty states** — Every list/table/feed has a designed empty state
- [ ] **Error boundaries** — Client components wrapped in React ErrorBoundary

---

## Quick Wins (Do These First — 15 Minutes)

1. Replace Inter/Roboto with Geist or Outfit via `next/font`
2. Change `#FFFFFF` backgrounds to `#F8FAFC`
3. Change `#000000` text to `#0F1419`
4. Add `hover:shadow-lg transition-shadow duration-200` to cards
5. Add `focus-visible:ring-2 focus-visible:ring-offset-2` to all buttons
6. Set hero headline to ≥48px with `tracking-tighter`
7. Add skeleton loading state with `animate-pulse`
8. Replace equal 3-column card grid with varied-size bento or zig-zag layout
9. Replace purple gradient with neutral base + single accent
10. Replace John Doe names with diverse real-sounding names

---

## Rules (Non-Negotiable)

- Work with existing tech stack — do not migrate frameworks or styling libraries
- Do not break existing functionality — test after every change
- Before importing any new library, check `package.json` first
- If project uses Tailwind, check version (v3 vs. v4) before modifying config
- Keep changes reviewable and focused; prefer small targeted improvements over big rewrites
- Never deliver partial work — all states (loading, empty, error) before shipping
