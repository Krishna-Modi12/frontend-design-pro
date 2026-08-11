---
name: landing-pages
description: Marketing pages — heroes, pricing, testimonials, bento grids, social proof, CTAs, empty states, onboarding.
version: "14.8.0"
core-deps:
  - core/design-tokens.md
  - core/accessibility-baseline.md
---

# Landing Pages

## When to Use
Full marketing or product pages and their sections: hero, features, pricing, testimonials, logo wall, comparison table, FAQ, CTA bar, footer. Also empty states and onboarding flows. For a single reusable component use `react-components`; for the form inside a page use `forms`.

## Stack
React 19 · TypeScript strict · Tailwind v4 · Next.js App Router (default)

## Core Rules
1. **One job per section.** Every section answers exactly one question. Hero: "what is this?" Pricing: "what do I pay?" A section answering two must be split.
2. **CTA gravity.** The primary CTA is the visually heaviest element above the fold. One primary CTA style per page. Pair it with a ghost secondary — never two solids.
3. **Never an equal-height card grid.** Use bento with spans, editorial asymmetry, or a data list. At least one element per major section breaks the column grid.
4. **Social proof proximity.** Trust signals sit within 40px of the CTA they support.
5. **Scannable rhythm.** Break the pattern every 3–4 sections: full-bleed dark → light card grid → feature spotlight → CTA bar.
6. **Hero type ≥48px desktop.** At least two type sizes with ≥3× difference per section. `text-wrap: balance` on headings.
7. **Organic content.** Real diverse names (Ana Ngugi, Kenji Tanaka), non-round figures (47.2%, $12,847). Never lorem ipsum, John Doe, or "Elevate/Seamless/Unleash".
8. **Mobile-first is content-first.** At 375px the headline, CTA and social proof survive; everything else earns its place.
9. **Empty states are designed.** Icon + headline + one sentence + action. Never a bare "No data".

## Patterns
- **HERO** = eyebrow + headline(≥48px) + subtext(≤2 lines) + CTA pair + proof bar + visual.
- **PRICING** = headline + monthly/annual toggle + exactly 3 tiers + trust note. Enterprise is "Custom", never a fake number.
- **BENTO** = one hero cell spanning 2×2, remainder 1×1, max 6 cells, aspect-anchored.
- **TESTIMONIAL** = pull-quote + avatar + name + company; masonry or peek-scroll, never uniform cards.
- **CTA-BAR** = short headline + 1–2 CTAs + risk-reversal microcopy.

## Examples
`examples/good-landing.tsx` · `examples/good-brand-linear.tsx` (Linear-style dark precision) · `examples/good-design-md-round-trip.tsx` (DESIGN.md token injection, pricing tiers).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Pattern anatomy P-01…P-08, anti-patterns, decision guides | `references/design-patterns.md` |
| 34 full landing specs with conversion copy | `references/landing-patterns.md` |
| Vertical-specific rules (fintech, health, SaaS…) | `references/industry-rules.md` |
| Auditing and upgrading an existing page | `references/redesign-framework.md` |
| Button labels, error copy, microcopy | `references/ux-writing.md` |
| Generating a DESIGN.md for Google Stitch | `references/stitch-design.md` |

## Constraints
No equal-card grids · no banned display fonts · no purple→pink→blue gradients · OKLCH tokens only · `min-h-[100dvh]` · organic data values · four states · WCAG 2.2 AA with one `<h1>` and no skipped heading levels · `prefers-reduced-motion`.
