# UX Guidelines (99 Rules Condensed)

Source: nextlevelbuilder/ui-ux-pro-max-skill

## Navigation

- Smooth scroll: `scroll-behavior: smooth` on html
- Sticky nav: add body padding to prevent content obscuring
- Active state: color + underline indicator on current page/section
- Deep linking: proper `history.pushState()` for sections
- Breadcrumbs: only for 3+ hierarchy levels
- Mobile: hamburger menu with animated open/close, full-screen overlay

## Animation & Motion

- Limit to 1-2 key animated elements per viewport
- Micro-interactions: 150–300ms (never >500ms)
- Check `@media (prefers-reduced-motion: reduce)` always
- Show skeleton screens for operations >300ms
- Animate ONLY `transform` and `opacity`
- `ease-out` for entrances, `ease-in` for exits
- No infinite loops without user control

## Touch & Mobile

- Touch targets: minimum 44×44px
- Target spacing: 8px gaps between tappable elements
- Avoid horizontal swipes on main content area
- `touch-action: manipulation` eliminates 300ms tap delay
- `overscroll-behavior: contain` prevents pull-to-refresh interference
- Reserve haptic feedback for confirmations and critical actions

## Interactive States

- Always show visible focus rings for keyboard users
- Hover: cursor change + subtle visual feedback (shadow, color)
- Immediate visual confirmation during any interaction
- Disabled: reduced opacity (0.5) + `cursor-not-allowed`
- Loading buttons: disable during async, show spinner inside button
- Errors: display near the problem, not in global alerts
- Destructive actions: always require confirmation dialog

## Forms

- Always display labels (never rely solely on placeholder text)
- Show errors directly beneath the field they belong to
- Validate on blur (not every keystroke)
- Use semantic input types: `email`, `tel`, `number`, `url`
- Support autocomplete attributes for browsers
- Password: provide visibility toggle
- Submit: show loading → success/error transition

## Empty States

- Icon + headline + description + CTA
- Never just "No data" or "Nothing here"
- Make the CTA guide the user to populate the state
- Example: "No projects yet" → "Create your first project" button

## Error Handling

- Inline errors near the source (not top-of-page banners)
- Include: what went wrong + how to fix it + retry action
- Error messages: specific, not "Something went wrong"
- Network errors: "Connection lost. Retrying..." with auto-retry
- 404: helpful navigation, search, or link to home

## Performance Perception

- Skeleton screens > spinners (feels faster)
- Optimistic updates for low-risk actions
- Progressive loading: show content as it arrives
- Lazy load below-fold images: `loading="lazy"`
- Inline critical CSS, defer non-critical
- `font-display: swap` prevents FOIT

## Accessibility Essentials

- Text contrast: 4.5:1 minimum normal, 3:1 large text
- Never convey info with color alone — pair with icon/text
- Alt text on all content images
- Heading hierarchy: h1 → h2 → h3 (no skipping)
- `aria-label` for icon-only buttons
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<aside>`
- Form labels with `htmlFor` attribute
- `role="alert"` or `aria-live` for dynamic error messages
- Skip links on navigation-heavy pages

## Emerging Patterns

- AI-generated content: clearly label with disclaimer
- Streaming responses: token-by-token typing effect with cursor
- AI feedback loops: thumbs up/down or regenerate button
- Voice input: show waveform visualization during recording

---

## Visual Hierarchy

**Golden rule:** Every element on screen must have a clear role — primary, secondary, or decorative. If you can't name its role, remove it.

### Size and weight hierarchy
- One H1 per page — the largest text element, sets context immediately
- Max 3 font sizes visible at once in any viewport section
- Weight contrast (400 vs 700) is more effective than size alone for secondary labels
- Never bold body text — use a color shift to `var(--color-ink-secondary)` instead

### Spacing as hierarchy signal
- Group related elements: `gap-2` (8px) — tight unit
- Separate sections: `gap-8` (32px) or more — breathing room signals new topic
- Rule of thumb: double the internal gap when crossing component boundaries

### Z-axis / Elevation
| Layer | Use case | CSS |
|---|---|---|
| 0 — flat | Default cards, inputs | no shadow |
| 1 — raised | Hovered cards, dropdowns | `shadow-sm` |
| 2 — floating | Popovers, tooltips | `shadow-md` |
| 3 — overlay | Modals, drawers | `shadow-xl` |
| 4 — sticky | Navbars, floating CTAs | `shadow-2xl` + `z-40+` |

**Never mix elevation levels arbitrarily** — a card can't sit at layer 0 inside a layer-2 popover and still look right.

---

## Grid System Compliance

### 12-column baseline
```css
/* Core grid container */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;                         /* gutter */
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 48px);
}
```

### Column span rules
| Content type | Mobile | Tablet (768px+) | Desktop (1280px+) |
|---|---|---|---|
| Full bleed | 12 | 12 | 12 |
| Main + sidebar | 12 / 0 | 8 / 4 | 8 / 4 |
| Feature cards | 12 | 6 | 4 |
| Stats row | 6 | 3 | 3 |
| Hero text | 12 | 10 | 7 |

**Asymmetric is almost always better.** A 7+5 or 8+4 split feels more intentional than 6+6.

### Never do equal N-up grids for marketing content
```tsx
// ❌ Three identical columns — feels like a template
<div className="grid grid-cols-3 gap-6">
  <FeatureCard /><FeatureCard /><FeatureCard />
</div>

// ✅ Lead with a large card + two smaller ones
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2"><FeatureCard large /></div>
  <div className="grid gap-6">
    <FeatureCard /><FeatureCard />
  </div>
</div>
```

---

## Whitespace Standards

### Section breathing room
| Screen | Top/bottom section padding |
|---|---|
| Mobile (< 640px) | `py-16` (64px) |
| Tablet (640–1024px) | `py-20` (80px) |
| Desktop (> 1024px) | `py-28` to `py-32` (112–128px) |

### Component internal spacing
| Component | Internal padding | Gap between children |
|---|---|---|
| Card | `p-5` or `p-6` | `gap-4` |
| Form field group | `space-y-4` | — |
| Button row | — | `gap-3` |
| Icon + label | — | `gap-2` |
| Section header → content | `mb-8` to `mb-12` | — |

### Common whitespace mistakes
- **Collapsed headings:** `H2` touching the content below it — always `mb-6+` after section headers
- **Cramped cards:** `p-3` is too tight for cards with text — minimum `p-5`
- **Uniform spacing:** using `space-y-4` for everything — vary gap sizes to create rhythm
- **Gutter collapse on mobile:** always maintain `px-4` minimum on mobile, never flush to edge

---

## Contrast Ratios (WCAG 2.2)

| Text type | Minimum ratio | Notes |
|---|---|---|
| Body text (< 18px) | 4.5 : 1 | Most common case |
| Large text (≥ 18px regular or ≥ 14px bold) | 3 : 1 | Headlines, large labels |
| UI components, icons, borders | 3 : 1 | Inputs, buttons, chart lines |
| Decorative, disabled text | No requirement | Still aim for 2:1 |
| Focus indicators (WCAG 2.2 §2.4.11) | 3 : 1 | Against adjacent colors |

### Quick contrast test tokens
```css
/* Default brand palette — passes AA */
/* --color-brand #6366F1 on #FFFFFF → 4.8:1 ✅ */
/* --color-ink #0F172A on #F8FAFC → 16.2:1 ✅ */
/* --color-ink-secondary #475569 on #F8FAFC → 5.9:1 ✅ */
/* --color-ink-tertiary #94A3B8 on #F8FAFC → 2.9:1 ❌ — decorative/timestamps only */

/* Dark mode */
/* --color-brand #818CF8 on #0F1419 → 5.2:1 ✅ */
/* --color-ink #F1F5F9 on #0F1419 → 15.8:1 ✅ */
```

**Tools:** [Stark](https://www.getstark.co/), [Polypane](https://polypane.app/), `npx contrast-ratio`.

---

## Responsive Design Rules

### Breakpoint system (Tailwind defaults)
| Prefix | Min width | Use for |
|---|---|---|
| (none) | 0px | Mobile-first base |
| `sm:` | 640px | Large phones, landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large monitors |

### Container queries (`@container`) — component-level responsive
```tsx
// Tailwind v4 / @tailwindcss/container-queries
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
    {/* Responds to parent container, not viewport */}
  </div>
</div>
```

### Mobile-first rules
1. Start with the mobile layout — never shrink desktop to fit mobile
2. Stack vertically on mobile, expand to horizontal on `md:`+
3. Hide navigation on mobile with a drawer/sheet, never a collapsed row
4. Touch targets: `min-h-[44px]` for all interactive elements
5. Font sizes: `text-sm` minimum on mobile, bump to `text-base` on `md:`
6. Max line length: 65–75ch on desktop — `max-w-prose` class

---

## Microinteraction Recipes

### Button press feedback
```css
/* Tactile press — feels real */
button:active {
  transform: scale(0.97);
  transition: transform 60ms ease-out;
}
```

### Smooth height transitions (accordion, expand)
```tsx
// useRef + scrollHeight trick — no max-height guessing
function Accordion({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      style={{
        overflow: 'hidden',
        height: isOpen ? ref.current?.scrollHeight : 0,
        transition: 'height 220ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {children}
    </div>
  )
}
```

### Staggered list entrance
```tsx
// items animate in sequence, not all at once
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
  >
    <ItemCard item={item} />
  </div>
))}

/* globals.css */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up { animation: none; }
}
```

### Number counter animation
```tsx
function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const { ref, isVisible } = useIntersectionObserver({ freezeOnceVisible: true })

  useEffect(() => {
    if (!isVisible) return
    const duration = 1000
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isVisible, target])

  return <span ref={ref}>{count.toLocaleString()}</span>
}
```

---

## Content Design Rules

### Headlines
- Lead with the benefit, not the feature: "Ship faster" not "Improved CI pipeline"
- Max 8 words for hero headline — if it wraps to 3 lines on mobile, cut it
- Avoid stacked infinitives: "Build. Ship. Scale." reads as lazy
- Question headlines convert well: "Ready to stop context-switching?"

### Body copy
- Max 65–75 characters per line (use `max-w-prose`)
- 1.5–1.7 line height for paragraph text (`leading-relaxed` or `leading-loose`)
- Never justify text — ragged right is more readable
- One idea per paragraph — if you use "Additionally" or "Furthermore", split the paragraph

### Numbers and data
- Use specific numbers: "47% faster" beats "significantly faster"
- Round large numbers appropriately: "$2.4M ARR" not "$2,412,847 ARR"
- Always include units: "14ms" not "14"
- Compare to a reference: "2× faster than Webpack 4"

### Calls to action
- Primary CTA: 2–4 words, verb-first: "Start free trial", "Book a demo", "Get started"
- Secondary CTA: lower commitment: "See how it works", "View pricing"
- Never two primary CTAs side by side — one leads, one follows
- Avoid: "Click here", "Learn more" (without context), "Submit"

## Animation additions (Vercel web-interface-guidelines)

- **Never `transition: all`** — list properties explicitly. `all` animates unknown future properties and forces extra style recalculation.
- Set an intentional `transform-origin` — the default `center` is rarely what a menu or tooltip wants.
- SVG: apply transforms to a `<g>` wrapper with `transform-box: fill-box; transform-origin: center`.
- Animations must be **interruptible** — respond to new input mid-flight rather than finishing first.
