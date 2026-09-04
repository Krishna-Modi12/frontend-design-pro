# DESIGN.md

> A warm, restrained, machine-checked homepage that argues its own case by running its own rules live, in the browser, in front of the reader.

## 1. Visual Theme & Atmosphere

**Style**: Verified editorial — a technical report with one accent and real motion, not a generic dark dev-tool landing page.
**Keywords**: warm, restrained, evidentiary, technical, unhurried, precise, quietly confident, machine-checked.
**Tone**: calm and evidentiary — proves claims live instead of asserting them — NOT hype-driven, NOT loud, NOT generic-SaaS-dark.
**Feel**: reading a well-typeset technical report — paper with a faint tooth, ruled between sections — that occasionally moves under your cursor.

**Interaction tier**: L2 fluid interaction (scroll-linked reveals, on-load stagger, live client-computed demos — no scroll-jacking), **with no exceptions**. There was one, for the hero's pinned sequence, for as long as the hero was a WebGL object that needed a scroll-driven progress value; §7 records why it went when the object did. **Nothing on this page pins.**
**Dependencies**: `gsap@3.12.7` (+ `ScrollTrigger`) for tweens and scroll triggers, `lenis@1.1.20` for the smooth-scroll driver, `geist@1.3.1` self-hosted via `next/font` for type (zero external font requests — stronger than even a Google Fonts `@import`, which section 3 below departs from the upstream template for).

## 2. Color Palette & Roles

```css
@theme {
  /* Ground */
  --color-bg-page: oklch(98% 0.008 80);
  --color-bg-surface: oklch(95% 0.022 80);      /* deeper cream, same L=95% — see note */
  --color-bg-elevated: oklch(100% 0.005 80);
  --color-bg-invert: oklch(18% 0.02 270);       /* footer only */

  /* Accent — one chromatic hue on the whole page */
  --color-accent: oklch(50.5% 0.088 225);       /* marine blue */
  --color-accent-ink: oklch(100% 0 0);
  --color-accent-glow: oklch(50.5% 0.088 225 / 0.12);

  /* Ink */
  --color-text-primary: oklch(18% 0.02 80);
  --color-text-secondary: oklch(45% 0.03 85);
  --color-text-muted: oklch(50% 0.025 85);

  /* Edges */
  --color-border: oklch(84% 0.02 80);           /* decorative hairline */
  --color-border-strong: oklch(60% 0.03 80);    /* control boundaries, clears WCAG 1.4.11 */

  /* Footer-only ink, at bg-invert's own hue (H=270) */
  --color-ink-invert: oklch(93% 0.01 270);
  --color-ink-invert-secondary: oklch(68% 0.02 270);

  /* NEW — subordinate emphasis, for badges/card highlights that must read as
     quieter than a real call-to-action. Same neutral hue family as ink/border
     (H≈80-85), not the accent's hue (H=45) — a second neutral role, not a
     second accent. */
  --color-emphasis: oklch(38% 0.03 85);
  --color-emphasis-bg: oklch(91% 0.015 85);
}
```

**Colour rules:**
- Every colour is referenced through a custom property; no literal hex in components (`COL-04`).
- `--color-accent` is the page's **only** chromatic hue — it already appears in more than one place (hero glow, CTA fills, metric numbers, eyebrow labels, step-card motifs) and that is correct: restraint means *no second accent hue exists anywhere on the page*, not that the accent appears exactly once. (This corrects an imprecise reading from earlier planning — the root README's screenshot alt text describes the hero specifically, captured above-the-fold per `SCREENSHOT_CONTRIBUTION.md`, and even there the accent already does double duty as the glow *and* the CTA fill. The claim was never "one occurrence"; it's "one hue.")
- **New components (`ShowcaseCard` badges, `SectionSkillCatalog` card emphasis) use `--color-emphasis`/`--color-emphasis-bg`, never `--color-accent`.** This is a distinct, narrower rule: accent-level color is reserved for primary calls-to-action and the page's own live-metric numbers, so a badge on a screenshot card never competes with an actual "Get the skill pack" button for visual priority. `--color-emphasis`'s exact contrast ratios (text-on-bg, and against `--color-emphasis-bg`) are stated here as measured-in-spirit but must be re-verified against `pages:verify`'s axe pass once built — flagged explicitly in the plan as a Phase 2 risk, not silently assumed.
- One ground family, one accent hue, one emphasis-neutral family. Every gradient on the page is a soft single-hue accent wash fading to transparent, never a purple→pink→blue AI-gradient shape (`COL-03`). **The hero rebuild narrowed this sanction rather than widening it**: the hero's radial accent glow and the radial `bg-page` scrim that used to sit over it are both gone, so the only gradient left anywhere is the optional, non-default `mesh` world's three positioned `radial-gradient` washes of `color-mix(in oklch, var(--color-accent) …, transparent)` (`lib/tokens.ts`). The default `signature` world, the hero, and the base page now carry **no gradient at all**; `signature`'s grain texture (§6) is an alpha-only desaturated noise — not a gradient and not a colour — so it adds tooth without adding a hue.
- **The accent is a marine blue, and it was chosen by measurement.** It replaced a terracotta that had shipped since the page was built, for three reasons that are all recorded in full in [`tokens.css`](tokens.css)'s Accent comment: the old value was outside the sRGB gamut (blue channel −0.0153, clipped by every browser, so the authored colour was never the rendered one); it sat at OKLab ΔE 0.085 from **both** `--color-danger` and `--color-warning`, putting the page's primary call-to-action almost exactly on top of its own critical-severity marker; and cream-plus-terracotta is two thirds of a cluster this pack's own always-loaded wall names as an AI-design default. Marine's worst separation from any other chromatic token is 0.167 — about double — and it is in gamut. The cost, stated because it is real: chroma drops from 0.157 to 0.088, so the accent carries visibly less force than it did. On a page whose keywords are *warm, restrained, evidentiary* that reads as consistent, but it is a genuine change in temperature and it was checked in a browser, not assumed.
- **The hero introduces no colour beyond the accent, and spends it on exactly one mark.** `HeroCorpusRing` draws all 119 references in `--color-text-primary` at 34% and lights a single one in `--color-accent`, which is also the only tick that breaks the ring's outer edge. (22% was the block layout's value and it did not survive the move to hairline ticks — measured on the rendered page, the corpus read as a smudge and the lit tick had nothing to be lit against.) That ratio is the restraint rule made literal: the accent marks the one thing a request actually reaches for, and the other 118 are the page's ink. The WebGL object this replaced had to argue the same point harder — it kept the accent off its body and onto the silhouette rim only, because an early pass mixed it in and the object read as a brick in the accent hue. A flat drawing gets there by construction instead of by tuning.
- **`--color-bg-surface` is a deeper cream at the same lightness (`oklch(95% 0.022 80)`), not a darker grey.** Lightness is pinned at 95% because accent-as-text on `bg-surface` is the page's tightest ratio (4.94); the surface can gain chroma and shift toward `bg-page`'s own H=80, but it cannot lose luminance. Under the terracotta this replaced that ratio was 4.50 — exactly the AA floor, no headroom at all. The pin stays anyway: the constraint is structural, not a property of whichever accent is current. The warmth plus the §6 seams and grain are what separate the below-hero sections — a lightness step is not available here.

## 3. Typography Rules

**Font stack** (self-hosted, no `@import` — see §1's dependency note; this is the pack's own override of the upstream template's CDN-font assumption):
```ts
// home/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
// applied as CSS variables --font-sans / --font-mono, system-ui fallback stack
```

| Role | Font | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Hero H1 | Geist Sans | `clamp(2.75rem, 7vw, 5rem)` | 500 (medium) | 1.03 | -0.02em (`[data-display]`) |
| Section H2 | Geist Sans | `clamp(1.75rem, 3.4vw, 2.5rem)` | 600 (semibold) | 1.03 | -0.02em (`[data-display]`) |
| H3 (card headings) | Geist Sans | 1.125rem (`text-lg`) | 600 (semibold) | 1.4 | normal |
| Body | Geist Sans | 1rem (`text-base`), hero subhead 1.125rem (`text-lg`) | 400 | 1.6 (`leading-relaxed`) | normal |
| Label | Geist Sans | 0.75rem | 600 | 1.2 | 0.14em, uppercase (`[data-label]`) |
| Mono / metric | Geist Mono | 2.25–3rem (`text-4xl`/`sm:text-5xl`) at card scale, 0.875rem inline | 500 (medium) | 1.1 | normal, `tabular-nums` (`[data-metric]`) |

**Typography rules:**
- Heading weight ≥ 500 on every `[data-display]` element; never below 400 anywhere.
- **Never use**: Inter, Roboto, Arial, Poppins, DM Sans, Space Grotesk as the display face (`TYP-02`) — Geist Sans/Mono only, system-ui fallback.
- New components inherit this table exactly — no third face, no ad hoc size outside the existing `clamp()`/Tailwind scale already in use.

**Text decoration:** no gradient text, no text-shadow anywhere, including the new `ProblemComparison` mock UI and `SectionSkillCatalog` cards — restrained direction, matching every existing heading on the page (`TYP-03`).

## 4. Component Stylings

### Buttons
```css
/* Primary — existing Hero CTA pattern, reused by any new primary action */
.btn-primary {
  display: inline-flex; align-items: center;
  min-height: 2.75rem; min-width: 44px; /* tapTarget */
  border-radius: 0.75rem; /* rounded-xl */
  background: var(--color-accent);
  color: var(--color-accent-ink);
  padding: 1rem 2rem;
  font-weight: 600;
  transition: box-shadow 300ms ease-out;
}
.btn-primary:hover { box-shadow: 0 0 40px var(--color-accent-glow); }
.btn-primary:active { box-shadow: 0 0 20px var(--color-accent-glow); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-accent), 0 0 0 4px var(--color-bg-page);
}
.btn-primary:disabled { opacity: 0.5; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .btn-primary { transition: none; } }

/* Secondary — existing Hero "See how it works" pattern */
.btn-secondary {
  display: inline-flex; align-items: center;
  min-height: 2.75rem; min-width: 44px;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border-strong);
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  padding: 1rem 2rem;
  font-weight: 500;
  transition: border-color 300ms ease-out;
}
.btn-secondary:hover { border-color: var(--color-accent); }
.btn-secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-accent), 0 0 0 4px var(--color-bg-page);
}
.btn-secondary:disabled { opacity: 0.5; pointer-events: none; }
```

### Cards
```css
/* Existing cardShell/cardInset from lib/tokens.ts — reused by ShowcaseCard,
   SectionSkillCatalog's cards, and the rebuilt ProblemComparison panels */
.card {
  border-radius: 1rem; /* rounded-2xl, 16px per the brief's one-radius rule */
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  padding: 1.5rem; /* lg:p-8 = 2rem */
}
.card:hover { border-color: var(--color-border-strong); }
.card:focus-within {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-accent), 0 0 0 4px var(--color-bg-page);
}
```

### Navigation
```css
/* Navbar — extends the existing sticky/backdrop-blur pattern, now 6 items */
.navbar {
  position: sticky; top: 0; z-index: 40;
  backdrop-filter: blur(0px);
  transition: backdrop-filter 200ms ease-out, background-color 200ms ease-out;
}
.navbar[data-scrolled] {
  backdrop-filter: blur(12px);
  background-color: oklch(from var(--color-bg-page) l c h / 0.85);
  border-bottom: 1px solid var(--color-border);
}
.navbar a {
  min-height: 44px; display: inline-flex; align-items: center;
  color: var(--color-text-secondary);
}
.navbar a:hover { color: var(--color-text-primary); }
.navbar a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-accent);
}
.navbar a[aria-current="true"] { color: var(--color-text-primary); font-weight: 600; }
```

### Links
```css
.link {
  color: var(--color-text-primary);
  text-underline-offset: 3px;
  text-decoration-color: var(--color-border-strong);
  transition: text-decoration-color 200ms ease-out;
}
.link:hover { text-decoration-color: var(--color-accent); }
.link:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--color-accent); }
@media (prefers-reduced-motion: reduce) { .link { transition: none; } }
```

### Tags and badges
```css
/* NEW — Showcase "Live"/"Static preview" badges, SkillCatalog group tags,
   ShowcaseSelfCheck's lead-in marker. Subordinate emphasis token, never accent. */
.badge {
  display: inline-flex; align-items: center; gap: 0.375rem;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em;
  background: var(--color-emphasis-bg);
  color: var(--color-emphasis);
}
.badge[data-variant="live"]::before {
  content: ""; width: 6px; height: 6px; border-radius: 9999px;
  background: currentColor;
}
```

## 5. Layout Principles

**Container:** `max-w-6xl` (existing `sectionShell`), `px-5` mobile / `px-8` from `sm:` up. No narrower text-only variant needed — every section already reads at this width, including the new Showcase/Catalog sections.

**Spacing scale:** section padding `py-16` (mobile) → `py-24` (`sm:`) → `py-32` (`lg:`) — existing `sectionSpacing`, reused as-is for the two new sections. Card interior padding `p-6` → `lg:p-8`. Card gap `gap-4`–`gap-6` depending on grid density.

**Grid:**
```css
/* SectionSkillCatalog — 3-4 cards */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}
@media (min-width: 640px) {
  .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .catalog-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem; }
}

/* SectionShowcase — 4 cards, 2 live + 2 static. Not a grid: a coverflow
   carousel on a native scroll-snap track, one slide wide at every breakpoint,
   with the neighbours rotated away in 3D. See `ShowcaseCoverflow`. */
.showcase-track {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  perspective: 1200px;
  /* so the first and last card can still reach the centre */
  padding-inline: max(1.25rem, calc(50% - var(--slide) / 2));
}
.showcase-track > * {
  --slide: min(78vw, 21rem);
  width: var(--slide);
  flex-shrink: 0;
  scroll-snap-align: center;
}
```

## 6. Depth & Elevation

Depth on this page is built from ground, tooth, and hairlines — never shadow.

| Level | Treatment | Used for |
|---|---|---|
| Ground texture | `signature` world only: a static desaturated `feTurbulence` grain at 3.5% alpha, painted through the `[data-section-surface]` / `--world-texture` channel in `lib/tokens.ts`. No colour, no motion. | Every below-hero section (incl. the `#install` footer) — gives the ~7,000px scroll a felt surface so it doesn't read as one flat field |
| Section seam | `[data-section-surface] + [data-section-surface] { border-top: 1px solid var(--color-border) }` — a 1px hairline between each pair of consecutive below-hero sections, horizontal only | Making one section legibly end and the next begin, without a lightness step big enough to threaten the accent-on-`bg-surface` ratio |
| Flat | `border: 1px solid var(--color-border)`, no shadow | Card outlines, other decorative dividers |
| Subtle | `border: 1px solid var(--color-border)` + `bg-bg-elevated` | Default card state (existing `cardShell`), Showcase/Catalog cards at rest — the grain sits on the ground, not the card, so an untextured card reads as cleanly lifted from a textured ground |
| Elevated | `border-color: var(--color-border-strong)` on hover, no box-shadow anywhere on the page (deliberate — shadows read as the generic-SaaS default this pack argues against) | Card hover states, focus-within |

## 7. Animation & Interaction

**Motion philosophy:** content is visible in server-rendered HTML from first paint; motion is a layer on top, never a gate a reader must wait through.
**Tier:** L2 fluid interaction.

### Dependencies
```
gsap@3.12.7
lenis@1.1.20
```

### Base setup
```ts
// lib/gsapClient.ts — existing, reused as-is
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
```

### Entrance
```css
/* useFadeUp + fadeUp() class string — existing, reused for new sections */
.fade-up {
  transition-property: opacity, transform;
  transition-duration: 600ms;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); /* ease-out family, MOTION-02 */
}
.fade-up[data-hidden] { opacity: 0; transform: translateY(2.5rem); }
.fade-up[data-visible] { opacity: 1; transform: translateY(0); }
```

### Scroll behaviour
```ts
// New sections reuse the existing per-component matchMedia gate pattern —
// SectionSkillCatalog and SectionShowcase each check reduced-motion
// individually before registering a ScrollTrigger, exactly as Hero,
// SectionHow, SectionWall and ProblemComparison already do.
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  ScrollTrigger.create({ trigger: node, start: "top 90%", once: true, onEnter: () => { /* … */ } });
}
```

### Hover and focus
```css
/* Every interactive element: card, badge-as-link, nav item, button — all
   defined in §4 above. No hover-only affordance anywhere (native :focus-visible
   parity is required, per the existing <details data-disclosure> precedent). */
```

### The hero: no pin, and no exception left
This page used to carry exactly one documented exception to its stated L2
interaction tier — a full-viewport `ScrollTrigger` pin on the hero, bounded to
one viewport of travel. **It is gone.** The pin existed to drive a single
number: a 0→1 progress that the WebGL hero object read to reveal its strata as
you scrolled. `HeroCorpusRing` shows the whole corpus at first paint instead,
because the point was never that the corpus is large *in instalments* — it is
that it is large and mostly untouched, which is a fact about a still image.
With the object gone the pin had nothing left to drive, so it went with it and
the page now honours its own interaction tier with no exception at all.

What the hero does instead, all of it on load and none of it scroll-linked:
the headline's words stagger up, the blocks beneath follow, and a read head
circles the corpus once and comes to rest on the one reference this pack would
load. One authored moment, then still — and *still* is literal here, since the
head's arrival is the last frame this page schedules.

**The two motions have different owners on purpose.** GSAP staggers the type
column; the ring animates itself with a CSS transition on a property nothing
else writes. That separation is the fix for a shipped defect, not a style
preference: when `Hero.tsx` reached into the corpus with `gsap.from()` over
marks whose opacity React was already setting, 0 of 119 ticks were visible at
500ms and still 0 at 8s. Do not reach into that subtree from the hero's
effect; drive it from a prop the component owns.

**Under `prefers-reduced-motion: reduce` no timeline is registered at all** and
every element is already in its final state — the corpus is server-rendered
markup at full opacity, not a hidden thing waiting to be revealed, so a reader
with motion off or JavaScript disabled gets the finished hero rather than
nothing.

**Standing requirement:** `npm run pages:verify` asserts that the corpus draws
one mark per reference file (counted against `data.generated.json`, not a
literal), that exactly one is lit at rest, that **every mark is actually on
screen under default motion**, and that all of it is in the server-rendered
HTML. The visibility assertion is the newest and the one that was missing: the
other three passed in full while all 119 marks sat at opacity 0. Run it on any hero change. The separate `hero:verify`
harness is retired: the three things it existed to prove — that the pin
released, that no canvas mounted below 640px, and that a denied WebGL context
still left a complete hero — are all statements about a hero that no longer
exists, and a harness whose docblock describes a deleted feature is worse than
no harness.

### Special effects
No custom cursor (`SLOP-06`), no page transition, no parallax. Two
scroll-linked effects, and they are linked to different scrollers.
`RouteStroke` in `#how-it-works` tracks the *page* scroll: a routing path
whose drawn length follows the section, three plateaus stepping down through
the three cards it labels. `ShowcaseCoverflow` tracks its *own container's*
horizontal scroll, ramping each slide's `rotateY`/`translateZ`/`scale` by its
distance from the centre — so it moves only when the reader drags it, and
never while the page itself is scrolling past. It replaced a flat 1px rule whose width
was scrubbed the same way — the mechanic was already right and had no shape —
and it runs on that section's existing ScrollTrigger rather than bringing a
second animation runtime along for one stroke. Everything the hero once
stacked here is gone: the canvas particle field, then the shader-mesh
background, then the WebGL object, each of them a second canvas and a second
`requestAnimationFrame` loop behind the first, which is the stacked-effects
pattern this page's direction argues against.

### Reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  .fade-up, .catalog-card, .showcase-card {
    opacity: 1 !important;
    transform: none !important;
  }
  /* Destination state, not nothing: every new card is fully visible and
     interactive with zero motion, matching the existing [data-fade] rule
     in lib/tokens.ts. */
}
```

## 8. Do's and Don'ts

### Do
- Use `--color-emphasis`/`--color-emphasis-bg` for all new badges and card highlights — never `--color-accent`.
- Reuse `cardShell`/`cardInset`/`sectionShell`/`sectionSpacing`/`fadeUp`/`focusRing`/`tapTarget` from `lib/tokens.ts` rather than inventing new spacing or focus-ring values.
- Give every new interactive card real link semantics (a real `<a>`, not a `<div onClick>`) — Showcase's static cards resolve to `screenshot-full.png`, so they are genuine links, not decorative.
- Gate every new GSAP `ScrollTrigger` on `matchMedia("(prefers-reduced-motion: reduce)")` individually, matching the existing per-component pattern.
- Ship resized/compressed Showcase images with explicit dimensions and lazy-loading below the fold — first raster assets this app has shipped.
- Run `python scripts/test_constraints.py --dir home --component` against every new/changed file before considering it done, even though it isn't CI-gated today.

### Don't
- Don't reuse `--color-accent` on any new badge, tag, or card emphasis — that is exactly the restraint this spec exists to protect.
- Don't add a second display face, a new gradient treatment (the sanctioned ones are the hero glow and the non-default `mesh` world — see §2; nothing else), or `min-h-screen` (`min-h-[100dvh]` only).
- Don't add a hover-only interaction with no keyboard/touch equivalent (the repo's own `pages:verify` has caught this class before).
- Don't SSR-render `MetricCard`'s real value while leaving its `textContent`-writing effect untouched — preserve the "JSX renders the static start state only" invariant.
- Don't hardcode a raw image path string for Showcase assets — use `next/image` or a static `import` so `basePath` resolves correctly under the Pages export.
- Don't let `SectionSkillCatalog`'s curated skill IDs go unvalidated — the `generate.mjs` check must fail the build loudly if one goes missing.
- Don't touch `scripts/test_constraints.py`'s `GRANDFATHERED` matching regex or any `skills/`-scoped entry — additive `home/` keys only.
- Don't add new component-test infrastructure (jsdom/RTL/jest-axe) — accessibility for new components is verified through `pages:verify`'s existing browser-level axe pass, per the explicit scope decision.

## 9. Responsive Behavior

| Name | Width | Key changes |
|---|---|---|
| Desktop | ≥1024px (`lg:`) | 4-column Catalog/Showcase grids, full 6-item nav row, `py-32` section spacing |
| Tablet | 640–1023px (`sm:`) | 2-column grids, 6-item nav row (validate this is the width where it's tightest), `py-24` |
| Mobile | <640px | 1-column grids, nav collapses via the existing `<details>`-based mobile menu, `py-16` |

**Touch targets:** minimum 44×44px on every control (`tapTarget`, existing) — applies to new Showcase/Catalog cards' link areas and badges too.
**Collapsing strategy:** Navbar's existing `<details>` mobile menu absorbs the two new entries (Showcase, Catalog) below `sm:`; grids collapse column count only, never reorder content.

```css
/* Nav row overflow check — the specific named risk from this plan: validate
   at 768px (the narrowest width the 6-item row actually renders at, per
   pages:verify's overflow check) before building anything downstream. */
```
