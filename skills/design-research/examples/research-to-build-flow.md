# Example: Research → Build Flow

The narrative behind `good-research-to-build.tsx`. Every value in that file traces to a line here.

## User Prompt

> "Build me a landing hero for a developer tool. Dark mode. Inspired by this shot: [gallery URL], I like the card treatment on [component library URL], and the entrance animation on [motion site URL]."

Three references, three different kinds of borrowing. The first thing to do is not to open any of them.

## Step 1 — Classify before browsing

```
Reference 1 (gallery shot)      → mood + composition, starting point
Reference 2 (component library) → structure, technique only
Reference 3 (motion site)       → interaction timing, close match
```

Asked and answered: *starting point or strict match?* The user wants the shot's feel, not its layout, and the motion site's timing exactly. That distinction decides what happens next — a strict match means extracting numbers, a starting point means extracting ratios.

## Step 2 — Extract, one note per source

**Gallery shot** — captured at 1440px, artboard, no responsive information.

- Surface sampled `#101625` → `oklch(15% 0.02 260)`
- Accent sampled at high saturation → chroma reduced 12% → `oklch(70% 0.25 145)`
- Hero split reads as 60/40, text-left. Recorded as a *ratio*, deliberately not as pixels.
- Display face is licensed. Character recorded as "geometric, heavy, tight tracking"; mapped to Manrope over `system-ui`.
- Rejected: the particle field (no CSS equivalent inside budget) and the 10px caption scale (below the readable minimum).

**Component library** — real rendered page, computed styles available.

- Card wrapper: `backdrop-filter: blur(12px)` over a 4% white fill, plus a 1px hairline at 10% white.
- Hover is a spring scale. Recorded, then used on nothing — the page has one showpiece already.
- Rejected: the library's raw hex palette and its glow stack, which fails contrast over our surface.

**Motion site** — DevTools Animations panel.

- Entrance easing `cubic-bezier(0.16, 1, 0.3, 1)`
- Entrance duration 0.4s; stagger 0.08s via container variants
- Site has no reduced-motion path. We are designing that ourselves — noted explicitly so it is not mistaken for something the source solved.

## Step 3 — Convert to constraints

The whole research pass reduces to this. If a finding is not on this list, it did not survive.

```
Surface:      oklch(15% 0.02 260)
Accent:       oklch(70% 0.25 145)     — single accent, no second
Text:         oklch(92% 0.01 260) / oklch(72% 0.015 260)
Grid:         asymmetric 60/40 → grid-cols-[1.5fr_1fr], stacks below lg
Gap:          1.5rem
Card:         blur(12px) + 1px hairline, used exactly once
Entrance:     cubic-bezier(0.16, 1, 0.3, 1), 0.4s, stagger 0.08s
Typography:   Manrope over system-ui; body ≥16px, captions ≥14px
Reduced motion: entrance offsets collapse to opacity-only
```

Six of these came from a source. Three — the text ramp, the responsive stacking, and the reduced-motion path — are ours, because no source supplied them. Saying which is which is the point of the note.

## Step 4 — Show the user before building

> Surface and accent from the shot, chroma pulled back 12% because gallery palettes are tuned for a thumbnail. Split ratio from the shot, but the layout is ours — the artboard has no breakpoints. Card technique from the library, used once on the aside. Timing from the motion site. I dropped the particle field and the glow stack. Reduced motion is not handled by any of the three, so I am designing it.

This is where a wrong reading gets corrected for free. After code is written it costs a rebuild.

## Step 5 — Build

Constraints go into the structure pass (surface, grid, gap, typography) and the animation pass (easing, duration, stagger, reduced motion). Nothing new is invented during the build; if the build needs a value the research did not produce, that is a signal to go back, not to guess.

Result: `good-research-to-build.tsx`. Note what it does *not* contain — no hex, no lifted asset, no second accent, no effect on the constraint cards, and an empty state that says nothing was extracted rather than filling the gap with plausible values.
