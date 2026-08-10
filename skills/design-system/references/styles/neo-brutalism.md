# Neo-Brutalism Style Reference

Source: frontend-design-pro skill (internal)
Version: 10.14.0

Neo-brutalism = digital graphic design aesthetic. Heavy borders, hard shadows, cream/off-white base,
loud accent colors, press-state buttons. Playful but structured. Feels handmade, loud, confident.

Distinct from Swiss Brutalism (see brutalist.md) — neo-brutalism is warm, playful, colorful.
Swiss is cold, typographic, monochrome.

---

## Core Signature

```
4px solid black border
4px / 4px hard box-shadow (black, no blur)
Cream/off-white background
Hot accent color (yellow, orange, or coral)
Bold rounded sans-serif font
Button press = translate(4px, 4px) + shadow(0, 0)
```

---

## OKLCH Color Palette

```css
:root {
  /* Backgrounds */
  --neo-bg:          oklch(97% 0.015 90);   /* cream */
  --neo-surface:     oklch(99% 0.008 90);   /* off-white card */

  /* Borders + shadows */
  --neo-border:      oklch(10% 0.005 240);  /* near-black */
  --neo-shadow:      oklch(10% 0.005 240);  /* same near-black */

  /* Accent palette — pick ONE per design */
  --neo-accent-yellow:  oklch(88% 0.180 95);   /* sunflower */
  --neo-accent-orange:  oklch(72% 0.180 40);   /* tangerine */
  --neo-accent-coral:   oklch(68% 0.160 20);   /* coral red */
  --neo-accent-green:   oklch(78% 0.160 145);  /* lime green */
  --neo-accent-blue:    oklch(65% 0.160 235);  /* electric blue */
  --neo-accent-pink:    oklch(72% 0.160 350);  /* hot pink */

  /* Text */
  --neo-ink:         oklch(10% 0.005 240);
  --neo-ink-muted:   oklch(40% 0.005 240);

  /* Standard metrics */
  --neo-border-width: 2px;          /* cards, inputs */
  --neo-border-bold: 4px;           /* buttons, featured cards */
  --neo-shadow-offset: 4px;
  --neo-radius: 8px;                /* slight rounding — not sharp, not pill */
  --neo-radius-lg: 12px;
}
```

### Tailwind v4 integration

```css
@theme {
  --color-neo-bg:       oklch(97% 0.015 90);
  --color-neo-border:   oklch(10% 0.005 240);
  --color-neo-accent:   oklch(88% 0.180 95);   /* swap per brand */
  --color-neo-ink:      oklch(10% 0.005 240);
}
```

---

## Button — The Signature Component

The neo-brutalist button is the clearest expression of the style.
Hard shadow creates a 3D raised look. Click = visually pushes down.

```tsx
// Primary button
<button
  className="
    relative px-5 py-3 font-bold text-sm uppercase tracking-wide
    bg-[--neo-accent-yellow] text-[--neo-ink]
    border-[3px] border-[--neo-border] rounded-lg
    shadow-[4px_4px_0px_var(--neo-border)]
    transition-[transform,box-shadow] duration-100 ease-out
    hover:shadow-[6px_6px_0px_var(--neo-border)] hover:-translate-x-px hover:-translate-y-px
    active:shadow-[0px_0px_0px_var(--neo-border)] active:translate-x-[4px] active:translate-y-[4px]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--neo-border]
  "
>
  Click me
</button>

// Secondary / outlined button
<button
  className="
    px-5 py-3 font-bold text-sm uppercase tracking-wide
    bg-[--neo-bg] text-[--neo-ink]
    border-[3px] border-[--neo-border] rounded-lg
    shadow-[4px_4px_0px_var(--neo-border)]
    transition-[transform,box-shadow] duration-100 ease-out
    hover:bg-[--neo-accent-yellow]
    active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--neo-border]
  "
>
  Secondary
</button>
```

### CSS approach

```css
.neo-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--neo-accent-yellow);
  color: var(--neo-ink);
  border: var(--neo-border-bold) solid var(--neo-border);
  border-radius: var(--neo-radius);
  box-shadow: var(--neo-shadow-offset) var(--neo-shadow-offset) 0 var(--neo-shadow);
  transition: box-shadow 80ms ease-out, transform 80ms ease-out;
  cursor: pointer;
}

.neo-btn:hover {
  box-shadow: 6px 6px 0 var(--neo-shadow);
  transform: translate(-1px, -1px);
}

.neo-btn:active {
  box-shadow: 0 0 0 var(--neo-shadow);
  transform: translate(4px, 4px);
}

.neo-btn:focus-visible {
  outline: 2px solid var(--neo-border);
  outline-offset: 3px;
}
```

---

## Card

```tsx
export function NeoCard({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className={`
        rounded-xl border-[3px] border-[--neo-border]
        shadow-[4px_4px_0px_var(--neo-border)]
        p-6
        ${accent ? 'bg-[--neo-accent-yellow]' : 'bg-[--neo-surface]'}
      `}
    >
      {children}
    </div>
  )
}
```

### Featured card (accent bg + bold shadow)

```css
.neo-card-featured {
  background: var(--neo-accent-yellow);
  border: var(--neo-border-bold) solid var(--neo-border);
  border-radius: var(--neo-radius-lg);
  box-shadow: 6px 6px 0 var(--neo-shadow);
  padding: 24px;
}
```

---

## Input / Form Fields

```tsx
<input
  className="
    w-full px-4 py-3 text-base font-medium
    bg-[--neo-bg] text-[--neo-ink]
    border-[3px] border-[--neo-border] rounded-lg
    shadow-[3px_3px_0px_var(--neo-border)]
    placeholder:text-[--neo-ink-muted]
    transition-shadow duration-100
    focus:outline-none focus:shadow-[5px_5px_0px_var(--neo-border)]
    focus:border-[--neo-border]
  "
  placeholder="Type here..."
/>
```

### Label style

```css
.neo-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--neo-ink);
}
```

---

## Badge / Tag

```tsx
<span className="
  inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wide
  bg-[--neo-accent-yellow] text-[--neo-ink]
  border-2 border-[--neo-border] rounded-md
  shadow-[2px_2px_0px_var(--neo-border)]
">
  New
</span>
```

---

## Modal / Dialog

```tsx
export function NeoModal({ open, onClose, title, children }: NeoModalProps) {
  return (
    <dialog
      open={open}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="
          relative max-w-md w-full p-8
          bg-[--neo-bg]
          border-[4px] border-[--neo-border] rounded-2xl
          shadow-[8px_8px_0px_var(--neo-border)]
        "
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="
            absolute top-4 right-4 w-8 h-8 flex items-center justify-center
            border-2 border-[--neo-border] rounded-md font-bold text-lg
            hover:bg-[--neo-accent-yellow]
            active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
            shadow-[2px_2px_0px_var(--neo-border)]
            transition-[transform,box-shadow] duration-75
          "
        >
          ✕
        </button>
        <h2 className="text-xl font-black mb-4 uppercase tracking-tight">{title}</h2>
        {children}
      </div>
    </dialog>
  )
}
```

---

## Navigation

```tsx
export function NeoNav({ links }: { links: { label: string; href: string }[] }) {
  return (
    <nav className="
      flex items-center gap-2 px-4 py-3
      bg-[--neo-bg] border-b-[4px] border-[--neo-border]
    ">
      {/* Logo mark */}
      <div className="
        w-10 h-10 flex items-center justify-center font-black text-lg
        bg-[--neo-accent-yellow] border-[3px] border-[--neo-border] rounded-lg
        shadow-[2px_2px_0px_var(--neo-border)]
      ">
        ◆
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1 ml-4">
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="
              px-3 py-1.5 text-sm font-bold uppercase tracking-wide
              rounded-lg border-2 border-transparent
              hover:border-[--neo-border] hover:bg-[--neo-accent-yellow]
              hover:shadow-[2px_2px_0px_var(--neo-border)]
              transition-[transform,box-shadow] duration-75
            "
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
```

---

## Typography

```css
/* Font choices — bold character required */
/* Option 1: System grotesque (most accessible) */
--font-display: 'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif;

/* Option 2: Quirky personality */
--font-display: 'Space Grotesk', 'DM Sans', sans-serif;   /* Space Grotesk ALLOWED in neo-brutalism — banned only as generic */

/* Option 3: Maximum impact */
--font-display: 'Syne', 'Unbounded', sans-serif;
```

```css
/* Heading style */
.neo-heading {
  font-weight: 900;           /* Black weight only */
  text-transform: uppercase;
  letter-spacing: -0.02em;    /* Tight tracking for impact */
  line-height: 1.0;            /* Very tight line-height for big headings */
}

/* Body — readable, not too styled */
.neo-body {
  font-weight: 500;
  line-height: 1.6;
  color: var(--neo-ink-muted);
}
```

---

## Spacing & Layout Rules

- Section padding: `80px 24px` desktop, `48px 16px` mobile
- Card gap: multiples of 8px always
- Border weight rule: featured/primary = 4px, supporting = 2–3px, decorative = 1px
- Shadow offset: matches border weight (`4px border → 4px offset`)
- Radius: 8–12px (slight rounding — not sharp brutalism, not pill softness)

```css
/* Grid layout for neo-brutalism */
.neo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Offset grid for visual interest */
.neo-offset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.neo-offset-grid > :nth-child(even) {
  margin-top: 32px; /* stagger rows */
}
```

---

## Animation Rules

Neo-brutalism uses **mechanical, snappy** motion — not smooth/fluid:

```css
/* All transitions: short + ease-out */
.neo-interactive {
  transition: box-shadow 80ms ease-out, transform 80ms ease-out, background-color 80ms ease-out;
}

/* Hover: float up slightly */
.neo-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--neo-shadow);
}

/* Active/press: push down */
.neo-card:active {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 var(--neo-shadow);
}
```

**No spring physics** — snap is the aesthetic. Use `ease-out` not spring.
**No blur transitions** — everything sharp.
**Stagger OK** on list entrance — `calc(var(--index) * 60ms)`.

---

## Dark Mode Neo-Brutalism

```css
.dark {
  --neo-bg:       oklch(14% 0.010 240);
  --neo-surface:  oklch(18% 0.010 240);
  --neo-border:   oklch(85% 0.005 240);   /* near-white border */
  --neo-shadow:   oklch(85% 0.005 240);   /* near-white shadow */
  --neo-ink:      oklch(90% 0.005 240);
  --neo-ink-muted: oklch(55% 0.005 240);
  /* accents stay the same — they pop harder on dark */
}
```

---

## Complete Page Example

```tsx
export default function NeoBrutalismPage() {
  return (
    <div className="min-h-[100dvh] bg-[--neo-bg] font-[--font-display]">
      <NeoNav links={[
        { label: 'Work', href: '#work' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ]} />

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* Hero */}
        <section className="mb-20">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-black uppercase tracking-widest
            bg-[--neo-accent-yellow] border-2 border-[--neo-border] rounded-md
            shadow-[2px_2px_0px_var(--neo-border)]">
            Available for work
          </div>
          <h1 className="text-7xl font-black uppercase tracking-tight leading-none mb-6">
            Design That<br />Doesn't Hide
          </h1>
          <p className="text-lg font-medium text-[--neo-ink-muted] max-w-lg mb-8">
            Products with soul. Interfaces with attitude. Work that makes people stop and look.
          </p>
          <button className="neo-btn">See my work →</button>
        </section>

        {/* Featured card grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6" id="work">
          <NeoCard accent>
            <div className="text-4xl mb-3">◆</div>
            <h2 className="text-xl font-black uppercase mb-2">Branding</h2>
            <p className="text-sm font-medium text-[--neo-ink-muted]">Identity systems that mean something.</p>
          </NeoCard>
          <NeoCard>
            <div className="text-4xl mb-3">▲</div>
            <h2 className="text-xl font-black uppercase mb-2">Web Design</h2>
            <p className="text-sm font-medium text-[--neo-ink-muted]">Sites people actually remember.</p>
          </NeoCard>
        </section>
      </main>
    </div>
  )
}
```

---

## Validation Gate (Step 7 additions for neo-brutalism)

- [ ] Border ≥ 2px on ALL interactive elements
- [ ] Hard box-shadow (no blur radius) on buttons + featured cards
- [ ] Button active state: `translate(4px, 4px)` + `box-shadow: 0 0 0`
- [ ] Font weight ≥ 700 for headings
- [ ] Accent color: exactly ONE per design (not multiple competing)
- [ ] Background: cream (`oklch(97% 0.015 90)`) not pure white
- [ ] Transition durations ≤ 100ms (snap, not float)
- [ ] Shadow color matches border color (both near-black or near-white in dark mode)

---

## Anti-Patterns

| Anti-Pattern | Fix |
|---|---|
| Blurred / soft box-shadows | Hard offset only — `4px 4px 0 var(--neo-border)` |
| Multiple accent colors | Pick ONE — contrast is the feature, not variety |
| Pure white background (`#FFFFFF`) | Cream: `oklch(97% 0.015 90)` |
| Rounded pill buttons | Keep `border-radius: 8px` — not `9999px` |
| Smooth spring animations | Snap: `80ms ease-out`, no spring physics |
| No active press state | Every button MUST have translate(4px,4px) active state |
| Thin borders (1px) | Minimum 2px, featured = 3–4px |
| All caps everywhere | Headings + labels uppercase; body text sentence case |
| Missing hover: float effect | `hover:-translate-x-px -translate-y-px + larger shadow` |
