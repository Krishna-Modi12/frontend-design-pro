# Brand Design Systems Reference

Source: VoltAgent/awesome-design-md (MIT) — synthesized from public design systems.
83 companies across 9 archetypes. The last 15, under **Additional Profiles**, were
added from the same upstream corpus by way of `xiaopu-ai/web-design` (MIT), which
republishes it; their palettes were computed from the source hex into OKLCH rather
than estimated. Profiles describe an observed design language at a point in time —
sites redesign, so treat a palette as a starting point and re-verify contrast
against your own surfaces.

## How to Use This File

Pick a brand as aesthetic reference for client work. Use the palette, type, and signals to replicate the *feeling* of the brand without copying it. Each profile captures the design language, not the IP.

When prompting: `"Build this in Linear aesthetic"` → load this file + check Dark Precision archetype.

---

## Aesthetic Archetypes (Quick Index)

| Archetype | Key Brands | Signal |
|---|---|---|
| **Dark Precision** | Linear, Raycast, Warp, Cursor, xAI, Vercel (dark) | Near-black bg, monospace accents, surgical spacing |
| **Luminous Minimal** | Vercel, Stripe, Notion, Resend, Mintlify | Stark white/black, negative space as content |
| **Neon Developer** | Supabase, PostHog, Sentry, ElevenLabs | Dark bg + single vivid accent, terminal energy |
| **Enterprise System** | IBM, HashiCorp, MongoDB, Intercom | Grid-first, documentation density, status colors |
| **Fintech Trust** | Stripe, Revolut, Wise, Coinbase, Kraken | Cool blue/purple, trust signals, precision type |
| **Consumer Delight** | Spotify, Airbnb, Pinterest, Uber, Apple | Image-forward, warm neutrals, expressive scale |
| **Luxury Automotive** | Ferrari, Lamborghini, BMW, Tesla | Serif headline, restraint, silver/carbon details |
| **Creative Tool** | Figma, Framer, Webflow, Miro | Gradient accents, 3D depth, bold personality |
| **AI / LLM** | Claude, Cohere, Mistral, Ollama, Replicate | Calm intelligence, warm neutrals or dark precision |

---

## Dark Precision Archetype

*These brands share a near-black canvas, extremely tight spacing, and monospace details that signal engineering precision.*

---

### Linear

**Atmosphere:** Focused. Dense. No decoration earns its place. Every pixel justified.

**Palette (OKLCH)**
```css
--linear-bg:        oklch(10% 0.008 265);   /* Near-black with subtle blue tint */
--linear-surface:   oklch(14% 0.009 265);   /* Card/panel surface */
--linear-border:    oklch(22% 0.010 265);   /* Subtle borders */
--linear-text:      oklch(92% 0.004 265);   /* Primary text */
--linear-muted:     oklch(55% 0.006 265);   /* Secondary/muted text */
--linear-accent:    oklch(65% 0.18 280);    /* Purple accent — links, active states */
--linear-accent-glow: oklch(65% 0.18 280 / 0.15); /* Glow behind active items */
```

**Typography**
- UI: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI"`) at 13–14px
- Headings: 500–600 weight, no tracking adjustment
- Mono: JetBrains Mono for IDs, shortcuts, commit hashes
- Line-height: 1.4–1.5 (dense)

**Key Signals**
- `border-radius: 6px` on cards, `4px` on inputs, `3px` on badges
- Spacing: 4pt scale, very tight — padding of 8px inside components
- Border: `1px solid oklch(22% 0.010 265)` — barely visible
- No drop shadows. Elevation via border only.
- Keyboard shortcuts visible in UI: `Cmd+K`, `G I`, etc.
- Status dots: tiny 6px circles, not badges
- Issue IDs: monospace, muted — `ENG-1042`

**Component Signatures**
- Command palette: `Cmd+K` modal, full-width search bar, grouped results with keyboard navigation
- Sidebar: 240px, icon+label, active item has left purple border `border-left: 2px solid accent`
- Table/list views: alternating barely-there row hovers, no grid lines
- Priority indicators: emoji-free, icon-only (circle, half-circle, full circle)

**Motion**
- `duration-150` for micro-interactions (hover state changes)
- `duration-200 ease-out` for panel opens
- No spring physics — linear transitions throughout
- Command palette: `scale(0.98)` → `scale(1.0)` + `opacity: 0` → `1` in 150ms

---

### Raycast

**Atmosphere:** MacOS-native precision. Glass + blur. Keyboard-first.

**Palette**
```css
--raycast-bg:       oklch(12% 0.010 270);
--raycast-glass:    oklch(18% 0.012 270 / 0.8);   /* backdrop-filter: blur(20px) */
--raycast-accent:   oklch(62% 0.22 25);            /* Warm orange-red */
--raycast-text:     oklch(96% 0.003 265);
--raycast-subtext:  oklch(60% 0.006 265);
```

**Typography**
- Body: SF Pro (system), 13px, weight 400
- Section headers: SF Pro, 11px, weight 600, uppercase, `letter-spacing: 0.06em`
- Accent labels: Orange at 11px

**Key Signals**
- Heavy use of `backdrop-filter: blur(20px) saturate(180%)`
- Window chrome: macOS traffic lights (real or simulated)
- Extension icons: 32×32, rounded-xl, colorful, grid-aligned
- Hotkey badges: `⌘K` in `bg-white/10 rounded px-1 py-0.5 text-xs font-mono`
- Separator lines: 1px with 8% opacity white

**Motion**
- Slide-in from bottom: `translateY(8px)` → `0`, 200ms, spring easing
- Result row hover: background tint in 80ms

---

### Warp (Terminal)

**Atmosphere:** Terminal re-imagined. Dense, precise, hacker-beautiful.

**Palette**
```css
--warp-bg:       oklch(9% 0.006 265);
--warp-surface:  oklch(13% 0.008 265);
--warp-green:    oklch(72% 0.20 145);    /* Terminal green — prompts, success */
--warp-blue:     oklch(67% 0.19 250);   /* Info, links */
--warp-red:      oklch(62% 0.22 25);    /* Errors */
--warp-yellow:   oklch(82% 0.18 85);    /* Warnings */
--warp-text:     oklch(90% 0.005 260);
```

**Typography**
- All primary: JetBrains Mono or Fira Code
- Block headers: Geist, 14px, 600
- Proportional text: Geist, 14px, 400

**Key Signals**
- Prompt line: colored `>` symbol + path in muted + command in white
- Block borders: left-side accent bar for command grouping
- Input area: clearly separated bottom panel with gradient top border
- Tab bar: compact 28px height, pill-shaped active indicator

---

### Cursor (IDE)

**Atmosphere:** VS Code DNA + AI layer. Dark, code-dense, AI hints in violet.

**Palette**
```css
--cursor-bg:      oklch(11% 0.008 270);
--cursor-panel:   oklch(14% 0.009 270);
--cursor-violet:  oklch(65% 0.20 290);   /* AI feature accent */
--cursor-border:  oklch(20% 0.010 270);
--cursor-text:    oklch(88% 0.005 265);
```

**Key Signals**
- AI suggestions: ghost text in `oklch(65% 0.20 290 / 0.5)`
- Chat sidebar: 320px, distinct bg from editor
- Diff view: green `oklch(65% 0.18 145 / 0.15)` / red `oklch(55% 0.22 25 / 0.15)` backgrounds
- Status bar: 22px height, information-dense

---

### xAI / Grok

**Atmosphere:** Stark. Intellectual. No warmth. Science-lab aesthetic.

**Palette**
```css
--xai-bg:       oklch(4% 0.003 265);    /* Near-pure black */
--xai-surface:  oklch(8% 0.004 265);
--xai-border:   oklch(18% 0.006 265);
--xai-text:     oklch(95% 0.003 265);
--xai-accent:   oklch(72% 0.15 265);   /* Cold blue-white */
```

**Typography**
- Body: System, 15px, weight 400
- Headings: weight 700, tracking -0.02em
- Mono elements: Geist Mono

**Key Signals**
- Almost no color — monochromatic with white accents
- Tables and data presented raw, no card wrapping
- Response area: maximum width, generous line-height 1.7
- Minimal iconography — text labels preferred

---

## Luminous Minimal Archetype

*White canvas as a statement. Radical negative space. Typography is the UI.*

---

### Vercel

**Atmosphere:** Absolute black and white. Deployment speed as aesthetic.

**Palette**
```css
--vercel-bg:       oklch(100% 0 0);      /* Pure white */
--vercel-bg-dark:  oklch(7% 0.005 265);  /* Pure dark mode */
--vercel-text:     oklch(5% 0.003 265);
--vercel-muted:    oklch(50% 0.005 265);
--vercel-border:   oklch(90% 0.003 265);
--vercel-success:  oklch(55% 0.18 145);
--vercel-error:    oklch(55% 0.22 25);
```

**Typography**
- Display/UI: Geist (Vercel's own font)
- Mono: Geist Mono for paths, config values, terminal
- Scale: 13px base for dashboard, 16px for marketing

**Key Signals**
- Status indicators: colored dots — green/red/orange/gray only
- Deployment cards: clean white card, border-radius 8px, `box-shadow: 0 1px 3px rgba(0,0,0,0.05)`
- Code blocks: `bg-[#0A0A0A]` in light mode (inverted)
- Domain display: monospace, compact, `truncate`
- Activity feed: tight 36px row height, icon+text+timestamp

**Motion**
- Deploy animation: progress bar with pulsing shimmer
- Status change: crossfade 150ms
- Navigation: instant (no page transitions)

---

### Stripe

**Atmosphere:** Trustworthy precision. Slightly cool. Financial gravity.

**Palette**
```css
--stripe-bg:         oklch(99% 0.003 250);  /* Cool off-white */
--stripe-surface:    oklch(97% 0.004 250);
--stripe-border:     oklch(88% 0.008 250);
--stripe-text:       oklch(12% 0.008 265);
--stripe-muted:      oklch(45% 0.010 265);
--stripe-accent:     oklch(52% 0.22 290);   /* Stripe purple */
--stripe-accent-lt:  oklch(65% 0.18 290);   /* Lighter purple for hover */
--stripe-blue:       oklch(55% 0.20 250);   /* Links */
--stripe-green:      oklch(55% 0.18 150);   /* Success */
--stripe-red:        oklch(55% 0.22 25);    /* Error */
```

**Typography**
- UI: `-apple-system, "Segoe UI"` (system), 14–15px
- Display: Sohne or equivalent — modern grotesque, weight 600–700
- Body copy: 16–18px, line-height 1.7, max-width 65ch
- Code: `JetBrains Mono` or `Source Code Pro`, 13px

**Key Signals**
- Cards: `border-radius: 8px`, `border: 1px solid var(--border)`, subtle shadow `0 1px 3px 0 rgba(0,0,0,0.07)`
- Form inputs: 40px height, `border-radius: 6px`, focused = purple ring
- Inline code/values: `bg-gray-100 rounded px-1.5 py-0.5 font-mono text-sm`
- Payment amounts: tabular-nums, always 2 decimal places
- Status pills: `rounded-full px-2.5 py-0.5 text-xs font-medium` — Stripe colors
- API documentation: 3-column layout (nav + content + code pane)

**Motion**
- Form validation: shake `translateX(-4px 4px)` 300ms on error
- Toast: slide in from bottom-right, 300ms
- Button loading: spinner replaces label, width maintained

---

### Notion

**Atmosphere:** Document-first. Warm canvas. Focused reading.

**Palette (exact Notion values)**
```css
--notion-canvas:    #F7F6F3;   /* Background page */
--notion-canvas-2:  #FBFBFA;   /* Slightly lighter variant */
--notion-card:      #F9F9F8;   /* Card/hover bg */
--notion-text:      #111111;   /* Primary text */
--notion-muted:     #787774;   /* Secondary text */
--notion-border:    rgba(55,53,47,0.16);   /* Subtle dividers */

/* Pale accents (tinted backgrounds for callouts/tags) */
--notion-pale-red:  #FDEBEC;   --notion-red-text:  #9F2F2D;
--notion-pale-blue: #E1F3FE;   --notion-blue-text: #1F6C9F;
--notion-pale-grn:  #E6F3E6;   --notion-grn-text:  #2C7F2F;
--notion-pale-ylw:  #FEF5DE;   --notion-ylw-text:  #946B00;
```

**Typography**
- Body: `-apple-system, "Georgia"` — intentionally document-like
- Code blocks: `SFMono-Regular, Consolas, "Liberation Mono"` — 14px
- Page title: 40px, weight 700, tight tracking
- Database header: 14px, weight 500

**Key Signals**
- Every page starts full-width, centered content max-width ~900px
- Hover-reveal actions: opacity 0 → 1 on row hover
- Block handles: visible on hover only, left of content
- Empty state: soft gray placeholder text, not disabled styling
- Cover images: full-width, 30% height, no border-radius
- Tags: `rounded-sm px-1.5 py-0.5` with pale background
- No visible scrollbars until hover

**Motion**
- Block drag: CSS `opacity: 0.5` + `pointer-events: none` on dragged item
- Expand/collapse: 200ms ease-out height transition
- Hover reveals: 150ms opacity transition

---

### Resend

**Atmosphere:** Email API for developers. Crisp, dark, no frills.

**Palette**
```css
--resend-bg:      oklch(8% 0.005 265);
--resend-surface: oklch(12% 0.007 265);
--resend-border:  oklch(20% 0.008 265);
--resend-accent:  oklch(100% 0 0);     /* Pure white as accent */
--resend-text:    oklch(95% 0.003 265);
--resend-muted:   oklch(55% 0.005 265);
```

**Key Signals**
- Dark + white accent = maximum contrast
- Email preview in full light mode card inside dark dashboard
- API key display: monospace in dark `inset` box
- Delivery status: simple colored text, no badges

---

## Neon Developer Archetype

*Dark foundation + one vivid accent color. Engineering pride + visual energy.*

---

### Supabase

**Atmosphere:** PostgreSQL power made beautiful. Green neon meets database density.

**Palette**
```css
--supa-bg:       oklch(10% 0.008 145);   /* Very dark green-tinted black */
--supa-surface:  oklch(14% 0.010 145);
--supa-border:   oklch(22% 0.012 145);
--supa-green:    oklch(72% 0.24 145);    /* Supabase brand green */
--supa-green-lt: oklch(82% 0.20 145);   /* Lighter green for hover */
--supa-text:     oklch(93% 0.004 145);
--supa-muted:    oklch(55% 0.008 145);
```

**Typography**
- UI: Custom, similar to Inter but not Inter (use Manrope as substitute)
- Code: JetBrains Mono — SQL is first-class content
- CLI output: monospace prominently featured

**Key Signals**
- SQL editor: prominent, centered, core product
- Table editor: spreadsheet-like, power user density
- RLS policies: code blocks as data
- Auth UI: green-tinted card with logo
- CLI code blocks: `bg-[#0C0C0C] border border-green-900/30`
- "Start your project": green gradient CTA button

**Motion**
- Query execution: shimmer loading on result rows
- Real-time data: smooth row insertion at top with highlight fade

---

### PostHog

**Atmosphere:** Open source product analytics. Bold, irreverent, data-rich.

**Palette**
```css
--posthog-bg:       oklch(12% 0.010 40);    /* Dark with slight warm tint */
--posthog-accent:   oklch(75% 0.22 55);     /* PostHog yellow/orange */
--posthog-hedgehog: oklch(65% 0.20 30);     /* Their mascot's warmth */
--posthog-border:   oklch(22% 0.012 40);
--posthog-text:     oklch(92% 0.005 40);
```

**Key Signals**
- Mascot/character illustration used throughout (hedgehog)
- Data visualization: colorful charts, no restrictions on palette
- Feature flags: toggle-heavy UI, color-coded status
- Funnel charts: PostHog signature visualization
- Irreverent copy: "max(7 days, days since you set this up)"

---

### Sentry

**Atmosphere:** Error monitoring. Dark, urgent, information density.

**Palette**
```css
--sentry-bg:      oklch(11% 0.009 270);
--sentry-surface: oklch(15% 0.010 270);
--sentry-accent:  oklch(60% 0.22 25);     /* Sentry orange-red */
--sentry-border:  oklch(22% 0.010 270);
--sentry-text:    oklch(91% 0.004 265);
```

**Key Signals**
- Stack traces: the hero content. Monospace, syntax-highlighted
- Error counts: large numeric displays with trend indicator
- Performance waterfall: horizontal bar chart, color by type
- Issue assignment: avatar-heavy
- `CRITICAL` / `ERROR` / `WARNING` / `INFO` color system

---

### ElevenLabs

**Atmosphere:** Audio AI. Sound waves as visual motif. Dark + electric blue.

**Palette**
```css
--eleven-bg:     oklch(8% 0.006 265);
--eleven-accent: oklch(62% 0.24 250);    /* Electric blue */
--eleven-wave:   oklch(62% 0.24 250 / 0.4); /* Wave visualization color */
--eleven-text:   oklch(95% 0.003 265);
```

**Key Signals**
- Waveform visualization: core UI element, animated
- Voice selector: avatar grid, card-based
- Audio player: custom, prominent, centered
- Generation progress: animated waveform during processing

---

## Enterprise System Archetype

*Structure, documentation density, and systematic consistency above expression.*

---

### IBM

**Atmosphere:** Carbon Design System. Mathematical. Systematic. Global scale.

**Palette**
```css
--ibm-blue-60:  #0043CE;    /* Primary action */
--ibm-blue-50:  #0F62FE;    /* Interactive */
--ibm-gray-100: #161616;    /* Primary text */
--ibm-gray-10:  #F4F4F4;    /* UI background */
--ibm-gray-20:  #E0E0E0;    /* Layer */
--ibm-gray-30:  #C6C6C6;    /* Border */
--ibm-red-60:   #DA1E28;    /* Error / Danger */
--ibm-green-50: #198038;    /* Success */
--ibm-yellow-30:#F1C21B;    /* Warning */
```

**Typography**
- IBM Plex Sans (all IBM UIs)
- IBM Plex Mono (code, technical values)
- Type scale: 12/14/16/20/28/36/42/54/68/86px — rigid scale
- Body: 14px for UI, 16px for content

**Key Signals**
- 8px grid (IBM uses 8pt, not 4pt)
- `border-radius: 0` on most components (Carbon uses sharp corners)
- Form inputs: 40px (default) or 32px (compact) height
- Data tables: condensed rows, sortable, filterable, downloadable
- Notification types: Inline / Toast / Banner — each with icon
- Icon library: Carbon Icons (distinctive angular style)

---

### HashiCorp

**Atmosphere:** Infrastructure as code. Serious, systematic, documentation-heavy.

**Palette**
```css
--hashi-bg:       oklch(99% 0.002 265);
--hashi-black:    oklch(8% 0.005 265);
--hashi-primary:  oklch(50% 0.22 290);   /* HashiCorp purple */
--hashi-accent:   oklch(60% 0.20 170);   /* Terraform teal or product-specific */
```

**Key Signals**
- Product-colored accents per sub-brand (Terraform=purple, Vault=yellow, Consul=pink)
- Documentation: two-column, TOC left, content right, code pane
- Warning callout: left border + icon + pale bg
- Diagram-heavy: infrastructure topology diagrams

---

### MongoDB

**Atmosphere:** Database for modern apps. Green accent, clean documentation.

**Palette**
```css
--mongo-bg:      oklch(99% 0.002 145);   /* Very slight green tint */
--mongo-green:   oklch(55% 0.20 145);   /* MongoDB forest green */
--mongo-text:    oklch(12% 0.006 145);
```

**Key Signals**
- Code examples: prominently featured, multi-language tabs
- Query explorer: BSON/JSON display with syntax highlighting
- Atlas UI: card-based cluster management

---

## Fintech Trust Archetype

*Cool palette, precision typography, trust signals everywhere. Clean = credible.*

---

### Revolut

**Atmosphere:** Challenger bank. Dark premium. Fluid gradients.

**Palette**
```css
--rev-bg:        oklch(8% 0.006 275);
--rev-surface:   oklch(13% 0.008 275);
--rev-accent:    oklch(58% 0.24 290);    /* Revolut blue-violet */
--rev-gradient:  linear-gradient(135deg, oklch(58% 0.24 290), oklch(65% 0.22 330));
--rev-success:   oklch(65% 0.22 145);
--rev-text:      oklch(96% 0.003 265);
```

**Typography**
- Custom "Revolut" font or Neue Haas Grotesk equivalent
- Numbers: tabular-nums, always
- Large balance display: 48px+, weight 700

**Key Signals**
- Card visuals: gradient debit card centered hero
- Currency conversion: live pulsing rates
- Spending chart: area chart with gradient fill
- Notification badges: dot only, no number count visible
- Transaction list: avatar/merchant logo + amount (bold) + category (muted)

---

### Wise (TransferWise)

**Atmosphere:** Friendly fintech. Human warmth. Trustworthy green.

**Palette**
```css
--wise-bg:       oklch(99% 0.003 145);
--wise-green:    oklch(55% 0.22 145);    /* Wise brand green */
--wise-dark:     oklch(20% 0.012 145);
--wise-text:     oklch(12% 0.008 145);
--wise-muted:    oklch(50% 0.008 145);
```

**Key Signals**
- Conversion calculator: always above fold, interactive
- Flag icons: country selection, prominent
- Fee transparency: always show exact costs
- Progress tracker: step indicator for transfers

---

### Coinbase

**Atmosphere:** Crypto made accessible. Clean, blue, institutional.

**Palette**
```css
--cb-bg:        oklch(99% 0.002 250);
--cb-blue:      oklch(55% 0.22 250);    /* Coinbase blue */
--cb-surface:   oklch(97% 0.003 250);
--cb-text:      oklch(10% 0.006 265);
--cb-green:     oklch(55% 0.20 145);   /* Price up */
--cb-red:       oklch(55% 0.22 25);    /* Price down */
```

**Key Signals**
- Price tickers: green/red with `+`/`-` prefix
- Asset logos: circular, 32–40px, on white bg
- Buy/Sell buttons: side-by-side, green/red
- Portfolio chart: interactive sparkline, hover for values
- 2FA/security: always one step ahead, prominent

---

## Consumer Delight Archetype

*Emotional, expressive, image-forward. The product IS the content.*

---

### Spotify

**Atmosphere:** Music = identity. Dark canvas for album art. Green energy.

**Palette**
```css
--spotify-bg:       #121212;
--spotify-elevated: #181818;
--spotify-card:     #282828;
--spotify-hover:    #3E3E3E;
--spotify-green:    #1DB954;    /* Iconic Spotify green */
--spotify-text:     #FFFFFF;
--spotify-muted:    #A7A7A7;
--spotify-link:     #FFFFFF;    /* White links, not colored */
```

**Typography**
- Circular (Spotify's own) or substitute: Cabinet Grotesk / Clash Display
- Body: 14–16px, weight 400
- Track title: weight 700, white
- Artist name: weight 400, muted
- All-caps section headers: 11–12px, weight 700, letter-spacing 0.1em, muted

**Key Signals**
- Album art: the primary visual hierarchy — 100% brightness, no filter
- Hover play button: appears centered on art, circular, green fill
- Now Playing bar: sticky bottom, full-width, dark `#181818`
- Progress bar: thin 4px, green fill, 2px radius
- Context menus: dark `#282828`, no border, `border-radius: 4px`, 200ms fade
- Playlist row: track number → (hover: play icon) swap
- `backdrop-filter: blur(30px)` on modals

**Motion**
- Track switching: crossfade 300ms on now playing
- Page transition: instant with fade 100ms
- Vinyl rotation: `animation: spin 2s linear infinite` (pauses on pause)

---

### Apple

**Atmosphere:** Product is the UI. Restraint. Premium materials as metaphor.

**Palette**
```css
/* Apple uses system colors — adapt to context */
--apple-bg:         #FFFFFF;   /* Or #000000 for product pages */
--apple-text:       #1D1D1F;   /* Not pure black */
--apple-muted:      #6E6E73;
--apple-blue:       #0071E3;   /* CTA / links */
--apple-divider:    rgba(0,0,0,0.1);
```

**Typography**
- SF Pro (system on Apple devices)
- Substitutes: NY (serif for editorial), SF Pro Display for headlines
- Scale: large — hero copy at 80px+, subheadlines 40px
- Weight: 700 for product names, 400 for descriptions

**Key Signals**
- Product photography: white bg, no drop shadow, enormous scale
- Copy: sentence case, short. "Beautifully powerful." "All-day battery life."
- CTAs: `text-[#0071E3] hover:underline` — not buttons on editorial
- Nav: horizontal, translucent blur, full width
- Section rhythm: full-viewport-height sections
- Footnotes: tiny, legal, grouped at bottom

**Motion**
- Scroll-triggered product reveals: slow parallax
- Product image: no animation — perfect stillness
- Page transitions: none (Apple.com loads fresh pages)
- Interactive product demos: WebGL/Three.js, no UI chrome

---

### Airbnb

**Atmosphere:** Home + travel = warmth. Photography-first. Inclusive.

**Palette**
```css
--airbnb-rausch:    #FF5A5F;   /* Primary brand coral-red */
--airbnb-babu:      #00A699;   /* Secondary teal */
--airbnb-arches:    #FC642D;   /* Warm orange */
--airbnb-hof:       #484848;   /* Dark text */
--airbnb-foggy:     #767676;   /* Muted text */
--airbnb-bg:        #FFFFFF;
--airbnb-border:    #DDDDDD;
```

**Typography**
- Cereal (Airbnb's custom font) — substitute: Plus Jakarta Sans or Circular
- Body: 16px, weight 400, line-height 1.5
- Heading: weight 600–800

**Key Signals**
- Search bar: prominent, pill-shaped, segmented (Where/When/Who)
- Property cards: square image, rounded-xl, no border, shadow on hover
- Price: bold, first visible, per-night in large type
- Stars rating: gold `★`, decimal (4.87)
- Host avatar: circular, 40px, top-left of card
- Map pins: coral `#FF5A5F`, circular with price inside

---

### Uber

**Atmosphere:** Efficient movement. Dark, minimal, action-ready.

**Palette**
```css
--uber-bg:      #000000;
--uber-surface: #1A1A1A;
--uber-text:    #FFFFFF;
--uber-muted:   #8C8C8C;
--uber-accent:  #276EF1;   /* Uber blue */
--uber-eats:    #06C167;   /* Uber Eats green */
```

**Typography**
- Uber Move (custom) — substitute: Neue Haas Grotesk / Satoshi
- Body: 14–16px
- Numbers/times: tabular-nums, weight 700

**Key Signals**
- Map as primary canvas — not a background, the content
- ETA display: `14 min` in large, white, bold
- Car selection: horizontal scroll, card-based
- Surge pricing: warm orange badge, not alarming red
- "Your driver is 3 min away" — live update, prominent

---

## Luxury Automotive Archetype

*Restraint. The product communicates. Typography carries brand weight.*

---

### Ferrari

**Atmosphere:** Racing heritage. Italian craftsmanship. Speed = restraint.

**Palette**
```css
--ferrari-red:      #CC0000;    /* Rosso Corsa — exact */
--ferrari-yellow:   #F8C300;    /* Shield yellow */
--ferrari-black:    #111111;
--ferrari-white:    #F5F5F0;    /* Warm white, not pure */
--ferrari-carbon:   #2A2A2A;    /* Carbon fiber reference */
--ferrari-gold:     #B8960C;    /* Subtle accents */
```

**Typography**
- Maranello (Ferrari custom) or substitute: EB Garamond, Cormorant Garamond
- All-caps for model names: `ROMA`, `SF90 STRADALE`
- Body: 16px, generous line-height 1.8
- Numbers: tabular-nums for specifications

**Key Signals**
- Photography: extreme close-up texture shots, lens flare, no people
- No CTAs visible until scroll — let the car land first
- Model specifications: table, technical precision
- `border-bottom: 1px solid rgba(255,255,255,0.15)` on dark sections
- Video background in hero: constant motion, no controls visible

**Motion**
- Scroll-hijacked sections: full-page reveals
- Car configurator: real-time 3D rotation, WebGL
- Loading screen: prancing horse animation

---

### Tesla

**Atmosphere:** Near-future. Clean. Technology as product.

**Palette**
```css
--tesla-bg:     #FFFFFF;
--tesla-dark:   #000000;    /* Used for full sections */
--tesla-text:   #171717;
--tesla-muted:  #5C5E62;
--tesla-accent: #E82127;    /* Tesla red, used sparingly */
--tesla-blue:   #3E6AE1;    /* Order button blue */
```

**Typography**
- Tesla custom font (similar to Gotham/Proxima) — substitute: Satoshi, Geist
- Hero copy: 64px+, weight 400 (surprisingly light)
- Subheadline: 20px, muted, weight 400
- Spec labels: 12px, uppercase, weight 600, letter-spacing 0.08em

**Key Signals**
- Full-viewport image/video heroes — the car IS the hero, no UI overlay
- "Order Now" / "Schedule a Demo": two CTAs, always present
- Spec comparison: horizontal scroll, sticky headers
- Autopilot demo: embedded video, subtle play control
- Interior shots: 3D interactive 360° view
- Bottom sticky: price + order button on mobile

---

### BMW

**Atmosphere:** Performance precision. Blue and white heritage. Engineered luxury.

**Palette**
```css
--bmw-blue:    #1C69D4;    /* BMW blue */
--bmw-white:   #FFFFFF;
--bmw-dark:    #111111;
--bmw-silver:  #8E9BA8;
--bmw-text:    #1A1A1A;
--bmw-muted:   #6B6B6B;
```

**Typography**
- BMW Type (custom) — substitute: Neue Haas Grotesk, Aktiv Grotesk
- Headlines: weight 700, tight tracking
- Technical specs: weight 400, 14px

**Key Signals**
- Navigation: horizontal links, white on blue for selected brand section
- Configurator: 3D interactive, dominant screen real estate
- Color swatches: circular, 24px, with tooltip on hover
- "Starting from": price displayed with disclaimer `*`

---

### Lamborghini

**Atmosphere:** Extreme. Angular. Aggressive precision.

**Palette**
```css
--lambo-yellow:  #E8B500;    /* Giallo Orion */
--lambo-black:   #0A0A0A;
--lambo-carbon:  #1A1A1A;
--lambo-white:   #F0EFE8;
```

**Typography**
- Condensed, aggressive — substitute: Barlow Condensed ExtraBold, Oswald Bold
- All-caps model names: `HURACÁN`, `AVENTADOR`
- Spec values: large, monospaced display

**Key Signals**
- Diagonal slash motifs: `clip-path: polygon(...)` on hero sections
- Scissor door animation: CSS 3D transform on hover
- Y (yellow) as the only color — everything else black/carbon

---

## Creative Tool Archetype

*The tool's UI becomes inspiration. Animation and vibrancy signal capability.*

---

### Figma

**Atmosphere:** Design-forward. Multi-color brand. Collaborative energy.

**Palette**
```css
--figma-red:     #F24E1E;
--figma-violet:  #A259FF;
--figma-blue:    #1ABCFE;
--figma-green:   #0ACF83;
--figma-orange:  #FF7262;
--figma-dark:    #1E1E1E;   /* Editor canvas */
--figma-panel:   #2C2C2C;   /* Sidepanels */
--figma-border:  #3C3C3C;
```

**Typography**
- UI text: Inter 12–13px (editor context — Inter is fine here)
- Marketing: variable font, expressive weights
- Feature labels: weight 600, 11px, uppercase

**Key Signals**
- Editor: dark canvas, floating panels, tight density
- Marketing: white + multi-color gradient accents
- Component thumbnails: colored border-top per component type
- Cursor multiplayer: colored named cursors
- "File browser": large card grid with preview thumbnails

---

### Framer

**Atmosphere:** No-code meets premium motion. Purple gradients. 3D depth.

**Palette**
```css
--framer-bg:         oklch(8% 0.006 280);
--framer-surface:    oklch(14% 0.010 280);
--framer-accent:     oklch(62% 0.24 290);    /* Purple */
--framer-gradient:   linear-gradient(135deg, oklch(55% 0.28 280), oklch(65% 0.22 320));
--framer-text:       oklch(96% 0.003 265);
--framer-muted:      oklch(60% 0.008 265);
```

**Typography**
- Custom "Framer" font — substitute: Clash Display for display, Satoshi for UI
- Large display: 72px+, tight tracking, gradient text fill
- UI: 14px, system

**Key Signals**
- 3D floating cards on marketing pages (real Three.js)
- Gradient border: `border: 1px solid transparent; background-clip: padding-box`
- Interactive prototype embeds in documentation
- "Edit in Framer" CTA: always present, purple
- Template gallery: large, hover-animate

---

### Webflow

**Atmosphere:** Visual development. Blue brand. Empowering builders.

**Palette**
```css
--wf-blue:       oklch(55% 0.22 250);
--wf-dark:       oklch(12% 0.008 265);
--wf-text:       oklch(96% 0.003 265);
--wf-surface:    oklch(16% 0.010 265);
```

**Key Signals**
- Designer UI: dark canvas, panel-heavy, dense
- Marketing: mixed dark/light sections
- "Built in Webflow" badge: site showcase
- Template cards: device mockup overlay

---

### Miro

**Atmosphere:** Infinite canvas collaboration. Bright, accessible, spatial.

**Palette**
```css
--miro-yellow:   #FFD02F;    /* Primary brand */
--miro-bg:       #F2F2F2;   /* Canvas board bg */
--miro-dark:     #050038;   /* Dark navy */
--miro-text:     #1A1A40;
```

**Key Signals**
- Infinite canvas: grid dots, zoom controls
- Sticky notes: colorful, hand-placed visual
- User cursors: colored with name tag
- Toolbar: floating vertical, icon-only

---

## AI / LLM Archetype

*Intelligence made visible. Calm confidence over excitement.*

---

### Claude (Anthropic)

**Atmosphere:** Thoughtful. Warm. Intelligent without coldness.

**Palette**
```css
--claude-bg:      oklch(99% 0.004 60);    /* Warm off-white */
--claude-surface: oklch(96% 0.006 60);
--claude-accent:  oklch(62% 0.18 35);     /* Warm terracotta/copper */
--claude-text:    oklch(15% 0.010 60);
--claude-muted:   oklch(50% 0.010 60);
--claude-border:  oklch(88% 0.008 60);

/* Dark mode */
--claude-dark-bg:      oklch(14% 0.008 260);
--claude-dark-surface: oklch(18% 0.010 260);
--claude-dark-accent:  oklch(72% 0.16 35);
```

**Typography**
- Body/UI: system sans
- Conversation content: Georgia or similar serif for AI responses
- Code: JetBrains Mono
- Body text: 15–16px, generous line-height 1.7

**Key Signals**
- Message bubbles: none. Flat prose blocks with clear attribution
- Avatar: simple circular with initial or icon
- Code blocks: syntax-highlighted, copy button on hover
- Streaming text: no cursor animation, smooth character append
- Tool use: collapsible section, subtle border-left accent
- Max content width: 680px, centered

**Motion**
- Text streaming: no animation frame — immediate character append
- Tool call expand: 200ms ease height transition
- Sidebar: 250ms slide transition

---

### Cohere

**Atmosphere:** Enterprise AI. Coral accent on dark. Business-serious.

**Palette**
```css
--cohere-bg:     oklch(10% 0.006 265);
--cohere-coral:  oklch(65% 0.22 25);    /* Cohere coral */
--cohere-text:   oklch(94% 0.003 265);
--cohere-muted:  oklch(55% 0.005 265);
```

---

### Mistral AI

**Atmosphere:** French engineering. Orange signal. No-nonsense.

**Palette**
```css
--mistral-bg:     oklch(99% 0.002 265);
--mistral-orange: oklch(68% 0.22 55);   /* Mistral orange */
--mistral-text:   oklch(10% 0.005 265);
--mistral-dark:   oklch(8% 0.005 265);  /* For dark sections */
```

---

### Ollama

**Atmosphere:** Local AI. Terminal roots. Minimal to the point of sparse.

**Palette**
```css
--ollama-bg:     oklch(99% 0 0);    /* Pure white */
--ollama-text:   oklch(10% 0 0);    /* Near black */
--ollama-mono:   oklch(20% 0.005 265);  /* Code text */
/* No accent color — monochrome by design */
```

**Key Signals**
- `curl` commands as hero content
- Monospace terminal output as primary UI
- Zero marketing fluff — pure technical documentation

---

## Cross-Archetype Patterns

### Loading States by Brand Category

| Brand Type | Loading Pattern |
|---|---|
| Developer tools | Skeleton rows, no spinners |
| Consumer/Media | Shimmer with brand-colored accent |
| AI/Chat | Streaming text, blinking cursor |
| Fintech | Progress bar, percentage display |
| Automotive | Full-page fade transition |

### Navigation Patterns by Brand

| Brand Type | Nav Pattern |
|---|---|
| Linear/Raycast | Left sidebar, icon+label, 240px |
| Vercel/Stripe | Top nav, white bg, border-bottom |
| Apple/Tesla | Top nav, translucent blur |
| Spotify | Left sidebar + now-playing bottom bar |
| Notion | Left sidebar, collapsible, tree |
| Figma | Top menu bar + floating toolbars |

### Button Aesthetics by Archetype

| Archetype | Button Style |
|---|---|
| Dark Precision | `bg-white text-black rounded-md` (inverted) or `ring-1 ring-white/20 bg-white/5` |
| Luminous Minimal | `bg-black text-white rounded-lg` (filled) + ghost option |
| Neon Developer | `bg-accent text-black rounded-md font-semibold` |
| Enterprise | `bg-blue-600 text-white rounded-sm` (flat, no depth) |
| Consumer Delight | `bg-brand-primary text-white rounded-full` (pill) |
| Luxury Automotive | `border border-white text-white` (ghost) or filled with brand color |

### Agent Prompt Guide (How to Use These Profiles)

When using these profiles with an AI agent:

1. **State the reference brand:** "Build this in the Linear aesthetic"
2. **Name your divergence:** "Linear aesthetic but with orange accent instead of purple"
3. **Use DESIGN.md format (see stitch-design.md):** Generate a DESIGN.md from this profile before building
4. **Combine archetypes:** "Stripe trust signals + Vercel minimal layout + Supabase green accent"

Example prompt pattern:
```
Build a SaaS dashboard that uses:
- Linear's dark precision aesthetic (oklch(10% 0.008 265) bg)
- Stripe's form design language (40px inputs, 6px radius)
- Supabase's green accent (oklch(72% 0.24 145))
- Vercel's typography scale (Geist, 13px UI)
```

---

## v2 Additions — New Brand Profiles

### GitHub

**Atmosphere:** The internet's collaborative layer. Dark or light, always functional. Monospace is native.

**Palette**
```css
/* Light mode */
--gh-canvas:      oklch(99% 0.001 265);  /* #FFFFFF / #F6F8FA */
--gh-surface:     oklch(97% 0.002 265);  /* #F6F8FA */
--gh-border:      oklch(83% 0.005 265);  /* #D1D9E0 */
--gh-accent:      oklch(53% 0.22 264);   /* #0969DA — GitHub blue */
--gh-success:     oklch(48% 0.20 145);   /* #1A7F37 */
--gh-danger:      oklch(50% 0.22 25);    /* #CF222E */
--gh-text:        oklch(16% 0.008 265);  /* #1F2328 */
--gh-text-muted:  oklch(45% 0.010 265);  /* #636C76 */

/* Dark mode (GitHub Dark) */
--gh-dark-canvas: oklch(15% 0.010 265);  /* #0D1117 */
--gh-dark-surface:oklch(18% 0.010 265);  /* #161B22 */
--gh-dark-border: oklch(28% 0.010 265);  /* #30363D */
--gh-dark-accent: oklch(65% 0.18 250);   /* #58A6FF */
--gh-dark-text:   oklch(92% 0.004 265);  /* #E6EDF3 */
```

**Typography**
- UI: `-apple-system, BlinkMacSystemFont, "Segoe UI"` — 14px
- Code: `SFMono-Regular, Consolas, "Liberation Mono"` — 12px (denser than usual)
- Headings: system font, 600 weight
- Monospace featured extensively — commit hashes, file paths, diffs

**Key Signals**
- Diff view: red/green line backgrounds at 10% opacity
- Avatar: `rounded-full`, exact pixel sizes (16/20/24/32/40px)
- Branch/tag pills: `rounded-full bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5`
- Issue labels: `rounded-full` with custom user-defined colors
- Contribution graph: 5-shade OKLCH scale from muted to vivid green
- Repository card: white bg, border, subtle shadow, `rounded-md`
- File tree: icon + name, 20px row height, compact

**Component: Contribution Graph**
```tsx
// 52 weeks × 7 days
const LEVELS = [
  'oklch(95% 0.003 145)',  // 0 — no contributions
  'oklch(82% 0.12 145)',   // 1
  'oklch(67% 0.18 145)',   // 2
  'oklch(52% 0.22 145)',   // 3
  'oklch(40% 0.24 145)',   // 4 — max
]
```

---

### Shopify (Polaris Design System)

**Atmosphere:** Commerce-grade reliability. Warm and approachable but professional. Trust-building.

**Palette**
```css
--polaris-bg:       oklch(98% 0.005 90);   /* Warm white — slightly cream */
--polaris-surface:  oklch(100% 0 0);
--polaris-border:   oklch(85% 0.006 265);  /* #C9CCCF */
--polaris-accent:   oklch(42% 0.22 145);   /* Shopify green #008060 */
--polaris-text:     oklch(16% 0.005 265);  /* #202223 */
--polaris-muted:    oklch(42% 0.008 265);  /* #6D7175 */
--polaris-critical: oklch(52% 0.22 25);    /* #D72C0D */
--polaris-warning:  oklch(75% 0.20 75);    /* #FFC453 */
--polaris-highlight: oklch(60% 0.18 250);  /* #005BD3 */
```

**Typography**
- Body: `-apple-system, BlinkMacSystemFont, "Segoe UI"` — 14px
- Headings: 500–600 weight, system font
- No custom font — deliberately generic and accessible

**Key Signals**
- All cards: `border-radius: 8px`, always `border: 1px solid var(--border)` with subtle shadow
- Input height: 36px (tighter than standard 40px)
- Status badges: filled pill — `bg-green-100 text-green-800` (not outline)
- Save bar: sticky bottom bar when page has unsaved changes
- Navigation: left sidebar with collapsible sections, 240px
- Page layout: max-width 1280px, consistent 16px/24px gutters
- Pricing: always display with currency, 2 decimal places

**Component Signature: Polaris Card**
```tsx
<div className="bg-white rounded-lg border border-[--polaris-border] shadow-[0_1px_2px_rgba(26,26,26,0.07)] p-4">
  <div className="flex items-start justify-between mb-3">
    <h2 className="text-sm font-semibold text-[--polaris-text]">Card title</h2>
    <button className="text-xs text-[--polaris-highlight] hover:underline">Edit</button>
  </div>
  {/* Content */}
</div>
```

---

### PlanetScale / Neon (Database Platforms)

**PlanetScale Atmosphere:** MySQL at scale. Dark with yellow accent. Power user.

```css
--ps-bg:      oklch(9% 0.005 265);
--ps-surface: oklch(13% 0.007 265);
--ps-yellow:  oklch(82% 0.22 90);   /* PlanetScale yellow */
--ps-border:  oklch(22% 0.008 265);
--ps-text:    oklch(93% 0.004 265);
```

**Neon Atmosphere:** Serverless PostgreSQL. Neon green on absolute black. Speed.

```css
--neon-bg:      oklch(5% 0.002 265);   /* Near-pure black */
--neon-green:   oklch(72% 0.30 145);   /* The "Neon" green — very vivid */
--neon-surface: oklch(10% 0.005 265);
--neon-border:  oklch(18% 0.006 265);
--neon-text:    oklch(96% 0.003 265);
```

**Shared DB Platform Signals**
- SQL/query editor: monospace, syntax-highlighted, 14px
- Schema view: graph or table visualization
- Connection string: copyable code block, masked secrets
- Branch visualization: git-like tree diagram
- Query metrics: ms-level response times, p99 charts

---

### Tailwind CSS Brand

**Atmosphere:** Documentation meets personality. Sky blue, playful but precise.

**Palette**
```css
--tw-bg:      oklch(100% 0 0);         /* Pure white */
--tw-sky:     oklch(68% 0.22 220);     /* Tailwind sky-500 */
--tw-sky-lt:  oklch(88% 0.10 220);     /* Sky-100 */
--tw-slate:   oklch(30% 0.015 265);    /* Slate-800 */
--tw-text:    oklch(20% 0.010 265);    /* Slate-900 */
--tw-code-bg: oklch(15% 0.012 265);    /* Code block bg */
```

**Typography**
- UI + Docs: Inter
- Code: `Fira Code` or `JetBrains Mono`
- Class names in docs: `<code>` elements with sky-colored background

**Key Signals**
- Color swatches: 11-step scales (50–950), each labeled
- Utility class display: monospace pill `rounded bg-sky-50 text-sky-800 text-sm px-1.5 py-0.5`
- Playground: split-pane editor + preview
- "AI" search: modal with `Cmd+K`

---

### Loom

**Atmosphere:** Video communication. Warm purple. Async-first.

**Palette**
```css
--loom-bg:      oklch(99% 0.004 305);   /* Warm off-white with purple tint */
--loom-purple:  oklch(55% 0.22 305);    /* Loom brand purple */
--loom-light:   oklch(82% 0.12 305);    /* Light purple for backgrounds */
--loom-text:    oklch(15% 0.008 270);
--loom-muted:   oklch(50% 0.010 270);
```

**Key Signals**
- Record button: red circle, pulsing ring animation when recording
- Video thumbnail: 16:9 ratio, rounded corners, play overlay on hover
- Reaction emojis: float-up animation during playback
- Timestamp links: `#t=1m30s` format in comments
- Viewer count: subtle badge on video

---

## Deep Profile: Implementation Templates

Ready-to-use CSS + component patterns extracted directly from brand analysis.

### Template: Linear-Style Dark Dashboard

```tsx
// globals.css — Linear tokens
:root {
  --bg: oklch(10% 0.008 265);
  --surface: oklch(14% 0.009 265);
  --border: oklch(22% 0.010 265);
  --text: oklch(92% 0.004 265);
  --muted: oklch(55% 0.006 265);
  --accent: oklch(65% 0.18 280);
}

// Sidebar component
function LinearSidebar({ items, active }: SidebarProps) {
  return (
    <nav className="w-[240px] h-[100dvh] bg-[--bg] border-r border-[--border] flex flex-col py-3">
      {items.map(item => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2.5 px-3 py-1.5 text-[13px] rounded-[6px] mx-2 transition-colors',
            active === item.href
              ? 'bg-[--accent]/10 text-[--accent] font-medium'
              : 'text-[--muted] hover:text-[--text] hover:bg-[--surface]'
          )}
        >
          <span className="size-4 shrink-0">{item.icon}</span>
          {item.label}
          {item.count && (
            <span className="ml-auto text-[11px] font-mono text-[--muted]">{item.count}</span>
          )}
        </a>
      ))}
    </nav>
  )
}
```

### Template: Stripe-Style Form Field

```tsx
// Stripe form field — 40px height, 6px radius, purple focus
function StripeField({
  label, id, error, ...props
}: { label: string; id: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(
          'w-full h-10 px-3 text-[14px] border rounded-[6px] outline-none bg-white transition-shadow',
          'focus:ring-2 focus:ring-[--stripe-accent]/30 focus:border-[--stripe-accent]',
          error ? 'border-[--stripe-red]' : 'border-[--stripe-border] hover:border-slate-400'
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="text-[12px] text-[--stripe-red]">{error}</p>
      )}
    </div>
  )
}
```

### Template: Vercel-Style Status Indicator

```tsx
const STATUS = {
  ready:    { label: 'Ready',    color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  building: { label: 'Building', color: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  error:    { label: 'Error',    color: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
  canceled: { label: 'Canceled', color: 'bg-slate-400',  text: 'text-slate-600',  bg: 'bg-slate-100' },
} as const

function DeploymentStatus({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', s.bg, s.text)}>
      <span className={cn('size-1.5 rounded-full shrink-0', s.color,
        status === 'building' && 'animate-pulse'
      )} />
      {s.label}
    </span>
  )
}
```

### Template: Supabase-Style SQL Block

```tsx
function SQLBlock({ sql, filename }: { sql: string; filename?: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-green-900/30 overflow-hidden font-mono text-sm">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-[oklch(12%_0.010_145)] border-b border-green-900/30">
          <span className="text-[--supa-green]/70 text-xs">{filename}</span>
          <button onClick={copy} className="text-xs text-[--supa-muted] hover:text-[--supa-text]">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="bg-[oklch(9%_0.008_145)] text-[--supa-text] p-4 overflow-x-auto leading-relaxed">
        <code className="text-[--supa-green]">{sql}</code>
      </pre>
    </div>
  )
}
```

---

## Additional Profiles

Fifteen more from the same upstream corpus, each tagged with the archetype it
belongs to above. Every palette here was **computed** from the source's published
hex values into OKLCH rather than estimated, so the values are usable directly.

Two house rules bite on this set and are applied throughout:

- **Proprietary faces are named as fact, not prescribed.** Nine of these brands
  ship a custom typeface you cannot license. The profile records what the brand
  uses, then prescribes an available substitute — per the standing rule that a
  reference never has you lift a licensed font.
- **Pure black and pure white are translated, not copied.** Several of these use
  `#000`/`#fff` as surfaces. `SKILL.md` rule 3 forbids that, so the values below
  are the tinted near-equivalents.

---

### ClickHouse
*Archetype: Neon Developer*

**Atmosphere:** Acid-bright volt yellow on absolute black. Database-fast, slightly aggressive, unmistakably not enterprise-blue.

**Palette (OKLCH)**
```css
--ch-bg:      oklch(14% 0.006 110);  /* Near-black, faintly olive-tinted */
--ch-surface: oklch(19.1% 0.004 110);/* Button and elevated surface */
--ch-border:  oklch(37.5% 0.004 110);/* Primary border, used at ~80% opacity */
--ch-text:    oklch(97% 0.004 110);  /* Primary text on dark */
--ch-muted:   oklch(70.6% 0.003 110);/* Secondary body text */
--ch-volt:    oklch(96.9% 0.170 111);/* THE brand colour — acid yellow-green */
--ch-forest:  oklch(44.8% 0.108 151);/* Secondary CTA, deep saturated green */
--ch-olive:   oklch(41.9% 0.092 111);/* Ghost-button border */
```

**Typography** — Brand uses Inter; substitute Manrope or the system stack, since Inter is a banned display face here. Tight headings, monospace for query snippets and metrics.

**Key Signals**
- The volt yellow is a *single* accent — one element per viewport, never two.
- Borders carry elevation; shadows are largely absent.
- Numbers and query text are monospace with `tabular-nums`.

---

### Composio
*Archetype: Neon Developer*

**Atmosphere:** Deep cobalt and electric cyan on void black. Agent-infrastructure energy — wired, high-voltage, technical.

**Palette (OKLCH)**
```css
--cmp-bg:      oklch(16.8% 0.004 264);/* Void black, faint blue cast */
--cmp-surface: oklch(29.3% 0.004 264);/* Secondary buttons, card interiors */
--cmp-text:    oklch(97% 0.003 264);  /* Primary heading text */
--cmp-muted:   oklch(38.7% 0.004 264);/* De-emphasised body, metadata */
--cmp-cobalt:  oklch(38.7% 0.264 264);/* Core brand — deep, very saturated */
--cmp-cyan:    oklch(90.5% 0.155 195);/* Electric cyan, attention only */
--cmp-signal:  oklch(63.4% 0.201 254);/* Interactive blue */
```

**Typography** — Brand uses abcDiatype (proprietary); substitute Manrope. Grotesque, tight tracking on headings.

**Key Signals**
- Cobalt at chroma 0.264 is near the sRGB edge — verify contrast after any lightness change.
- Cyan is a highlight, never a surface. It fails text contrast on dark at body sizes.

---

### opencode.ai
*Archetype: Dark Precision*

**Atmosphere:** Monospace everywhere. A terminal that happens to be a website — no decoration, no display face, total typographic uniformity.

**Palette (OKLCH)**
```css
--oc-bg:     oklch(23.4% 0.005 17);  /* Warm-tinted dark, not neutral */
--oc-text:   oklch(99.2% 0.001 17);  /* Near-white on dark */
--oc-muted:  oklch(68.1% 0.002 17);  /* Secondary text, muted links */
--oc-border: oklch(49.8% 0.003 17);  /* 1px outline borders */
--oc-accent: oklch(60.3% 0.218 257); /* Links, interactive */
--oc-accent-hover:  oklch(46.8% 0.164 257);
--oc-accent-active: oklch(38% 0.129 256);
```

**Typography** — Brand uses Berkeley Mono for *everything*; substitute JetBrains Mono or IBM Plex Mono. The whole design depends on one mono face at several sizes, so keep the substitution consistent — mixing a sans in breaks the concept.

**Key Signals**
- A three-step accent ramp (rest → hover → active) that darkens rather than lightens.
- The warm hue 17 on near-neutrals is deliberate; a cool grey reads wrong here.

---

### RunwayML
*Archetype: AI / LLM*

**Atmosphere:** Gallery-black with cool-slate secondary text. Image-forward, editorial, the interface receding behind the work.

**Palette (OKLCH)**
```css
--rw-bg:      oklch(12% 0.004 265);   /* Near-black canvas */
--rw-surface: oklch(21.8% 0.004 265); /* Elevated cards */
--rw-border:  oklch(27.4% 0.005 286); /* The single dark border tone */
--rw-text:    oklch(97% 0.003 265);   /* On dark */
--rw-light:   oklch(94.3% 0.009 265); /* Cool light section background */
--rw-slate:   oklch(58.8% 0.019 259); /* Secondary text — distinctly blue-grey */
--rw-ink:     oklch(37.1% 0.004 265); /* Body text on light surfaces */
```

**Typography** — Brand uses abcNormal (proprietary); substitute Manrope. Restrained scale; the media carries the hierarchy.

**Key Signals**
- Radius stays 4–8px. Nothing pill-shaped.
- Secondary text is *blue*-grey, not neutral — that cast is the whole personality.
- Light and dark sections alternate; both need their own border tone.

---

### MiniMax
*Archetype: AI / LLM*

**Atmosphere:** Confident blue with a pink counter-accent. Built for Chinese-first typography, which changes the type rules more than the colour ones.

**Palette (OKLCH)**
```css
--mm-brand:      oklch(52.3% 0.239 263);/* Primary brand blue */
--mm-sky:        oklch(72.4% 0.154 244);/* Lighter brand variant */
--mm-pink:       oklch(69.1% 0.203 341);/* Secondary accent */
--mm-brand-deep: oklch(38.6% 0.109 257);/* Deep blue for emphasis */
--mm-text:       oklch(25.2% 0.006 263);/* Primary text */
--mm-text-2:     oklch(43% 0.026 251);  /* Secondary text */
--mm-muted:      oklch(64.8% 0.007 286);/* Tertiary, muted labels */
--mm-bg:         oklch(99% 0.002 263);  /* Page background */
--mm-border:     oklch(92.8% 0.006 265);/* Component borders */
```

**Typography** — For any Chinese copy, `references/cjk-typography.md` governs: the fallback-chain order, no synthetic italics, and line-height at 1.7 or above. A Latin-only scale applied to Chinese text is the failure mode this brand exists to demonstrate.

**Key Signals**
- Blue ramp is a full 200→700 scale, not three tints — use it as a scale.
- Pink appears sparingly against the blue; it is a counter-accent, not a second brand.

---

### NVIDIA
*Archetype: Enterprise System*

**Atmosphere:** That green on black. Industrial, technical, decades-consistent — the accent is doing all the identity work.

**Palette (OKLCH)**
```css
--nv-bg:     oklch(13% 0.004 131);  /* Near-black page */
--nv-surface:oklch(21.8% 0.004 131);/* Dark card surfaces */
--nv-green:  oklch(71.3% 0.194 131);/* THE signature */
--nv-lime:   oklch(89.4% 0.210 124);/* Bright highlight variant */
--nv-orange: oklch(64.6% 0.175 48); /* Alerts, featured badges */
--nv-amber:  oklch(73.8% 0.165 66); /* Secondary warm accent */
--nv-text:   oklch(97% 0.003 131);  /* On dark */
--nv-muted:  oklch(63% 0.003 131);  /* Secondary text */
--nv-border: oklch(48.2% 0.003 131);/* Dividers */
```

**Typography** — Brand uses NVIDIA-EMEA (proprietary, Arial fallback); substitute Manrope or the system stack. Never Arial as the display face.

**Key Signals**
- Green is used for borders and link underlines as much as for fills.
- Hover shifts *blue*, not to a lighter green — a genuinely unusual choice worth copying deliberately or not at all.

---

### Renault
*Archetype: Luxury Automotive*

**Atmosphere:** Pantone yellow, hard corners, no softness anywhere. Industrial European automotive rather than luxury-serif automotive.

**Palette (OKLCH)**
```css
--rn-yellow: oklch(88.8% 0.188 104);/* Signature Pantone */
--rn-yellow-soft: oklch(92.3% 0.172 105);
--rn-ink:    oklch(18% 0.004 104);  /* Buttons, headings */
--rn-bg:     oklch(99% 0.002 104);  /* Editorial surface */
--rn-alt:    oklch(96.1% 0.003 104);/* Alternate light surface */
--rn-dark:   oklch(25.2% 0.004 104);/* Dark text-heavy sections */
--rn-blue:   oklch(62.2% 0.203 256);/* Link hover */
--rn-warm:   oklch(88.4% 0.004 106);/* Disabled states */
--rn-border: oklch(86.1% 0.003 104);/* Input borders */
```

**Typography** — Brand uses NouvelR, a proprietary geometric sans; substitute Manrope, which shares the geometric skeleton.

**Key Signals**
- `border-radius: 0` on buttons. The sharpness is the brand.
- Yellow is a surface here, not just an accent — which forces dark ink on it for contrast.

---

### SpaceX
*Archetype: Dark Precision*

**Atmosphere:** Two colours. Black and a slightly cool off-white. The most restrained palette in this whole file, and the restraint *is* the design.

**Palette (OKLCH)**
```css
--sx-bg:   oklch(11% 0.005 286);   /* The void — near-black, faintly cool */
--sx-text: oklch(95.8% 0.013 286); /* Spectral white, deliberately not #fff */
```

**Typography** — Condensed uppercase sans for headings, wide tracking, generous scale. Substitute the system stack; the effect comes from tracking and case, not from the face.

**Key Signals**
- Two tokens. Adding a third accent breaks the concept — if a state needs distinguishing, use opacity or tracking.
- Full-bleed imagery carries every section; type sits over it, never beside it.
- This is the reference for "what if we removed the accent colour entirely".

---

### Sanity
*Archetype: Creative Tool*

**Atmosphere:** Near-black with a warm coral CTA and a genuinely wide accent range. Developer-facing but not monochrome-austere.

**Palette (OKLCH)**
```css
--sn-bg:      oklch(15% 0.004 28);   /* Sanity black */
--sn-surface: oklch(24.8% 0.004 28); /* Cards, secondary surfaces */
--sn-border:  oklch(32.9% 0.004 28); /* Tertiary surface and border */
--sn-text:    oklch(97% 0.003 28);   /* On dark */
--sn-muted:   oklch(78.6% 0.003 28); /* Body copy on dark */
--sn-red:     oklch(68.2% 0.178 28); /* Primary CTA — warm coral-red */
--sn-blue:    oklch(51.3% 0.244 262);/* Universal hover/active */
--sn-blue-lt: oklch(76.7% 0.134 239);/* Secondary blue */
--sn-green:   oklch(76.1% 0.256 142);/* Vivid success/highlight */
```

**Typography** — Brand uses waldenburgNormal (proprietary); substitute Manrope for display, JetBrains Mono for schema and code.

**Key Signals**
- Radius ranges from 13px to fully pill — the pill is used for tags and status, not buttons.
- Hover is a *hue change* to blue rather than a lightness change. Consistent everywhere.

---

### Superhuman
*Archetype: Luminous Minimal*

**Atmosphere:** Deep purple hero over warm cream body. Fast-email premium — the gradient does the luxury and the cream keeps it readable.

**Palette (OKLCH)**
```css
--sh-purple:   oklch(23.4% 0.058 284);/* Hero gradient base */
--sh-lavender: oklch(82% 0.096 298);  /* Primary accent, highlights */
--sh-ink:      oklch(27.8% 0.002 68); /* Headings on light */
--sh-link:     oklch(51.1% 0.161 296);/* Underlined links */
--sh-bg:       oklch(99% 0.002 85);   /* Dominant page surface */
--sh-cream:    oklch(92.3% 0.012 85); /* Button background, warm neutral */
--sh-border:   oklch(88.2% 0.008 61); /* Parchment card borders */
```

**Typography** — Brand uses Super Sans VF, a custom variable font with non-standard axes; substitute a variable-weight face and animate `wght` only. `references/typographic-finishing.md` covers doing that without forcing optical size.

**Key Signals**
- The radius scale is exactly two values: 8px and 16px. No others.
- Cool purple against warm cream — the temperature clash is intentional and load-bearing.

---

### Zapier
*Archetype: Consumer Delight*

**Atmosphere:** Warm cream and one confident orange. Approachable-utility — friendly without being childish.

**Palette (OKLCH)**
```css
--zp-ink:     oklch(21% 0.018 19);   /* Primary text, dark buttons */
--zp-bg:      oklch(99.7% 0.004 91); /* Cream-white page */
--zp-bg-alt:  oklch(99.4% 0.006 85); /* Secondary surface */
--zp-orange:  oklch(67% 0.222 37);   /* Primary CTA, active underline */
--zp-text-2:  oklch(32.5% 0.011 92); /* Secondary and footer text */
--zp-muted:   oklch(65.2% 0.018 95); /* Tertiary, timestamps */
--zp-border:  oklch(80.8% 0.021 92); /* Sand — primary border */
--zp-sand-lt: oklch(93.7% 0.010 94); /* Secondary button background */
```

**Typography** — Brand pairs GT Alpina (serif display) with Inter (UI). Substitute any editorial serif for display and Manrope for UI; Inter is banned as a display face here.

**Key Signals**
- Every neutral is warm (hue 85–95). A cool grey anywhere reads as a mistake.
- Orange appears once per section, on the primary action only.

---

### Airtable
*Archetype: Enterprise System*

**Atmosphere:** Trustworthy productivity blue on white. Dense, grid-first, unshowy.

**Palette (OKLCH)**
```css
--at-ink:     oklch(23% 0.019 262);  /* Deep navy primary text */
--at-blue:    oklch(51.3% 0.176 259);/* CTA buttons, links */
--at-blue-2:  oklch(45.5% 0.158 263);/* Link/accent variant */
--at-bg:      oklch(99% 0.002 262);  /* Primary surface */
--at-surface: oklch(98.4% 0.003 248);/* Subtle raised surface */
--at-text-2:  oklch(32.1% 0.004 262);/* Secondary text */
--at-border:  oklch(91.2% 0.006 265);/* Card borders */
```

**Typography** — Brand uses Roboto; substitute Manrope or the system stack, as Roboto is a banned display face here. Dense UI sizes, 13–14px body.

**Key Signals**
- Navy text rather than black — softer, and the reason the blue reads as calm.
- Borders define every region; elevation is minimal.

---

### Clay
*Archetype: Creative Tool*

**Atmosphere:** Warm paper cream with black type and oat borders. Editorial-adjacent, tactile, distinctly un-SaaS.

**Palette (OKLCH)**
```css
--cl-bg:       oklch(98.2% 0.003 85); /* Warm paper page */
--cl-ink:      oklch(18% 0.004 85);   /* Type, headings */
--cl-muted:    oklch(69.1% 0.012 85); /* Secondary, footer links */
--cl-charcoal: oklch(44.2% 0.008 89); /* Tertiary text */
--cl-border:   oklch(87.1% 0.018 85); /* Oat — the structural border */
--cl-border-2: oklch(93.5% 0.014 85); /* Lighter border */
--cl-cool:     oklch(93.1% 0.006 265);/* Cool border for contrast sections */
```

**Typography** — Editorial sans at generous size with a serif or mono counterpoint. Substitute Manrope with JetBrains Mono for labels.

**Key Signals**
- Warm neutrals at hue ~85 throughout, with a deliberate cool border for contrast bands.
- The oat border is the design; remove it and the page loses all structure.

---

### Expo
*Archetype: Luminous Minimal*

**Atmosphere:** Cool cloud-grey surfaces, tight radii, documentation-first. Calm, dense, developer-legible.

**Palette (OKLCH)**
```css
--ex-bg:      oklch(95.6% 0.004 286);/* Cloud grey page */
--ex-surface: oklch(99% 0.002 286);  /* Cards, buttons */
--ex-ink:     oklch(24.1% 0.010 248);/* Body text */
--ex-dark:    oklch(21.8% 0.004 248);/* Dark-theme widget surface */
--ex-link:    oklch(55.6% 0.162 252);/* Standard link cobalt */
--ex-sky:     oklch(77.2% 0.138 234);/* Widget accent */
--ex-purple:  oklch(51.7% 0.173 306);/* "Preview" states */
--ex-slate:   oklch(50.2% 0.014 264);/* Workhorse secondary text */
--ex-border:  oklch(34.7% 0.010 254);/* Borders on dark surfaces */
```

**Typography** — Brand uses Inter; substitute Manrope or the system stack. Monospace for CLI output and config, which is most of the content.

**Key Signals**
- Radius stays under 6px on interactive elements.
- Purple is reserved for a single semantic meaning ("preview"). Semantic accents that mean one thing are worth copying.

---

### Lovable
*Archetype: Luminous Minimal*

**Atmosphere:** Warm cream with charcoal type. Soft, approachable, generous whitespace — prompt-to-app friendliness without cartoon.

**Palette (OKLCH)**
```css
--lv-bg:      oklch(96.8% 0.010 87); /* Cream page and card surface */
--lv-ink:     oklch(22.6% 0.004 87); /* Type, dark buttons */
--lv-on-dark: oklch(98.8% 0.004 91); /* Button text on dark */
--lv-muted:   oklch(48.5% 0.003 107);/* Descriptions, captions */
--lv-border:  oklch(93.7% 0.008 91); /* Card borders, dividers */
--lv-ring:    oklch(62.3% 0.188 260);/* Focus ring, at ~50% alpha */
```

**Typography** — Brand uses Camera Plain Variable (proprietary); substitute Manrope. Large, friendly headings; relaxed 1.6+ body leading.

**Key Signals**
- The focus ring is the only saturated colour in the system — which makes it genuinely visible, and is the right instinct.
- Warm cream carries hue 87–91 consistently; the single cool value is the ring.

---

## Brand Mixing Formulas

Tested combinations that work well together:

| Goal | Formula |
|------|---------|
| "Developer SaaS that converts" | Linear dark precision + Stripe form trust + Vercel motion speed |
| "AI startup landing page" | Claude calm warmth + xAI monochromatic restraint + Framer gradient accents |
| "Open source tool" | Supabase green energy + GitHub utility density + Tailwind class aesthetics |
| "B2B enterprise" | Stripe trust palette + IBM grid + HashiCorp documentation clarity |
| "Consumer fintech" | Revolut edge + Wise warmth for forms + Apple motion polish |
| "Creative SaaS" | Figma gradient energy + Notion warmth + Linear precision |
| "Database/infra startup" | PlanetScale yellow on dark + GitHub code density + Vercel status patterns |

