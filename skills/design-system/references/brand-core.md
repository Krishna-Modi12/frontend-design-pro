# Brand Design Systems — Core Reference

> Core brands + implementation templates. For remaining brand profiles load brand-extended.md.

Source: VoltAgent/awesome-design-md (68 companies, 9 categories) — synthesized from public design systems  
Version: 10.10.0

## Contents

- [How to Use This File](#how-to-use-this-file)
- [Aesthetic Archetypes (Quick Index)](#aesthetic-archetypes-quick-index)
- [Dark Precision Archetype](#dark-precision-archetype)
- [Luminous Minimal Archetype](#luminous-minimal-archetype)
- [Neon Developer Archetype](#neon-developer-archetype)
- [Enterprise System Archetype](#enterprise-system-archetype)
- [Fintech Trust Archetype](#fintech-trust-archetype)
- [Consumer Delight Archetype](#consumer-delight-archetype)
- [Luxury Automotive Archetype](#luxury-automotive-archetype)
- [Creative Tool Archetype](#creative-tool-archetype)
- [AI / LLM Archetype](#ai--llm-archetype)
- [Cross-Archetype Patterns](#cross-archetype-patterns)
- [Deep Profile: Implementation Templates](#deep-profile-implementation-templates)
- [Brand Mixing Formulas](#brand-mixing-formulas)

---

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
