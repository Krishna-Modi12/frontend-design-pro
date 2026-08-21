# Brand Design Systems — Extended Profiles

> Extended Brand Profiles — additional brands per archetype. Load alongside brand-core.md for full coverage.

Source: VoltAgent/awesome-design-md (68 companies, 9 categories) — synthesized from public design systems  
Version: 10.10.0

---

## Contents

- [Dark Precision Archetype — Extended](#dark-precision-archetype--extended)
- [Luminous Minimal Archetype — Extended](#luminous-minimal-archetype--extended)
- [Neon Developer Archetype — Extended](#neon-developer-archetype--extended)
- [Enterprise System Archetype — Extended](#enterprise-system-archetype--extended)
- [Fintech Trust Archetype — Extended](#fintech-trust-archetype--extended)
- [Consumer Delight Archetype — Extended](#consumer-delight-archetype--extended)
- [Luxury Automotive Archetype — Extended](#luxury-automotive-archetype--extended)
- [Creative Tool Archetype — Extended](#creative-tool-archetype--extended)
- [AI / LLM Archetype — Extended](#ai--llm-archetype--extended)
- [v2 Additions — Extended Brand Profiles](#v2-additions--extended-brand-profiles)

---

## Dark Precision Archetype — Extended

*See brand-core.md for Linear and Raycast (the primary references).*

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

## Luminous Minimal Archetype — Extended

*See brand-core.md for Vercel and Stripe (the primary references).*

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

## Neon Developer Archetype — Extended

*See brand-core.md for Supabase (the primary reference).*

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

## Enterprise System Archetype — Extended

*See brand-core.md for IBM (the primary reference).*

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

## Fintech Trust Archetype — Extended

*See brand-core.md for Stripe and Revolut (the primary references).*

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

## Consumer Delight Archetype — Extended

*See brand-core.md for Spotify and Apple (the primary references).*

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

## Luxury Automotive Archetype — Extended

*See brand-core.md for Ferrari (the primary reference).*

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

## Creative Tool Archetype — Extended

*See brand-core.md for Figma and Framer (the primary references).*

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

## AI / LLM Archetype — Extended

*See brand-core.md for Claude (the primary reference).*

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

## v2 Additions — Extended Brand Profiles

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

### PlanetScale / Neon DB (Database Platforms)

**PlanetScale Atmosphere:** MySQL at scale. Dark with yellow accent. Power user.

```css
--ps-bg:      oklch(9% 0.005 265);
--ps-surface: oklch(13% 0.007 265);
--ps-yellow:  oklch(82% 0.22 90);   /* PlanetScale yellow */
--ps-border:  oklch(22% 0.008 265);
--ps-text:    oklch(93% 0.004 265);
```

**Neon DB Atmosphere:** Serverless PostgreSQL. Neon green on absolute black. Speed.

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
