# UX Deep Rules — Implementation Reference
# frontend-design-pro-v10 | v1.0.0
# ─────────────────────────────────────────────────────────────────────────────
# Source: nextlevelbuilder/ui-ux-pro-max-skill (quick-reference.md)
# 200+ implementation-level rules with Apple HIG and Material Design citations.
# Companion to ux-guidelines.md (principles) — this file is implementation spec.
# ─────────────────────────────────────────────────────────────────────────────

## Contents

- [Priority Matrix](#priority-matrix)
- [1. Accessibility (CRITICAL)](#1-accessibility-critical)
- [2. Touch & Interaction (CRITICAL)](#2-touch--interaction-critical)
- [3. Performance (HIGH)](#3-performance-high)
- [4. Style Selection (HIGH)](#4-style-selection-high)
- [5. Layout & Responsive (HIGH)](#5-layout--responsive-high)
- [6. Typography & Color (MEDIUM)](#6-typography--color-medium)
- [7. Animation (MEDIUM) — Most detailed — read in full](#7-animation-medium--most-detailed--read-in-full)
- [8. Forms & Feedback (MEDIUM)](#8-forms--feedback-medium)
- [9. Navigation Patterns (HIGH)](#9-navigation-patterns-high)
- [10. Charts & Data (LOW → HIGH for data products)](#10-charts--data-low--high-for-data-products)
- [Cross-Cutting Rules](#cross-cutting-rules)
- [Vercel additions (web-interface-guidelines)](#vercel-additions-web-interface-guidelines)

---

## Priority Matrix

| Priority | Category | Impact |
|---|---|---|
| **CRITICAL** | Accessibility | Blocks users entirely if missing |
| **CRITICAL** | Touch & Interaction | Unusable without correct targets/feedback |
| **HIGH** | Performance | Directly affects conversion and retention |
| **HIGH** | Style Selection | First impression, brand credibility |
| **HIGH** | Layout & Responsive | Broken on mobile = 50%+ audience lost |
| **HIGH** | Navigation Patterns | Users can't find what they need |
| **MEDIUM** | Typography & Color | Readability and hierarchy |
| **MEDIUM** | Animation | Delight and feedback |
| **MEDIUM** | Forms & Feedback | Conversion and trust |
| **LOW** | Charts & Data | Edge case for most products |

---

## 1. Accessibility (CRITICAL)

| Rule | Spec | Source |
|---|---|---|
| `color-contrast` | 4.5:1 normal text; 3:1 large text (≥18px or ≥14px bold) | WCAG 2.2 AA |
| `focus-states` | Visible focus ring 2–4px on all interactive elements | Apple HIG, MD |
| `alt-text` | Descriptive alt for meaningful images; `alt=""` for decorative | WCAG |
| `aria-labels` | `aria-label` on every icon-only button; `accessibilityLabel` in native | Apple HIG |
| `keyboard-nav` | Tab order matches visual order; full keyboard operability | Apple HIG |
| `form-labels` | `<label for="">` on every input — never placeholder-only | WCAG |
| `skip-links` | "Skip to main content" on keyboard-first pages | WCAG 2.4.1 |
| `heading-hierarchy` | Sequential h1→h6, never skip levels | WCAG 1.3.1 |
| `color-not-only` | Never convey info by color alone — add icon or text | WCAG 1.4.1 |
| `dynamic-type` | Support system text scaling; avoid truncation as text grows | Apple HIG |
| `reduced-motion` | `@media (prefers-reduced-motion: reduce)` disables/reduces all animations | WCAG 2.3.3 |
| `escape-routes` | Cancel/back affordance in every modal and multi-step flow | Apple HIG |
| `aria-live-regions` | `aria-live="polite"` for status updates; `role="alert"` for errors | WCAG 4.1.3 |

---

## 2. Touch & Interaction (CRITICAL)

| Rule | Spec | Source |
|---|---|---|
| `touch-target-size` | **44×44pt** (iOS) / **48×48dp** (Android); extend hit area beyond visual | Apple HIG, MD |
| `touch-spacing` | Min **8px** gap between adjacent touch targets | Apple HIG, MD |
| `hover-vs-tap` | Primary interactions are tap/click — never hover-only | WCAG 2.5.3 |
| `loading-buttons` | Disable + show spinner during async; restore on completion | MD |
| `tap-delay` | `touch-action: manipulation` eliminates 300ms browser tap delay | Web |
| `press-feedback` | Visual feedback within **100ms** of tap (ripple, highlight) | Apple HIG, MD |
| `haptic-feedback` | Use haptic for confirmations and critical actions; avoid overuse | Apple HIG |
| `gesture-conflicts` | No horizontal swipe on main content area | Apple HIG |
| `standard-gestures` | Use platform standard gestures consistently; never redefine swipe-back | Apple HIG |
| `system-gestures` | Don't block Control Center, back swipe, or home indicator | Apple HIG |
| `gesture-alternative` | Never gesture-only for critical actions — visible control required | WCAG 2.5.1 |
| `safe-area-awareness` | Primary targets clear of notch, Dynamic Island, and gesture bar | Apple HIG |
| `no-precision-required` | No pixel-perfect tap requirements on small icons or thin edges | WCAG 2.5.5 |
| `swipe-clarity` | Swipe actions need visible affordance (chevron, label, or tutorial) | Apple HIG |
| `drag-threshold` | Movement threshold before drag starts to prevent accidental trigger | MD |

---

## 3. Performance (HIGH)

| Rule | Spec | Source |
|---|---|---|
| `image-optimization` | WebP/AVIF + `srcset`/`sizes` + lazy load non-critical | Core Web Vitals |
| `image-dimension` | Always declare `width`/`height` or `aspect-ratio` to prevent CLS | CWV |
| `font-loading` | `font-display: swap` or `optional`; reserve space to reduce FOIT/CLS | MD |
| `font-preload` | Preload only critical fonts (1–2 max); don't preload all variants | |
| `lazy-loading` | Lazy load non-hero components via `dynamic()` / route-level splitting | Next.js |
| `bundle-splitting` | Split by route/feature; keep initial bundle < 100KB gzipped | |
| `third-party-scripts` | Load async/defer; audit and remove unused scripts | MD |
| `reduce-reflows` | Batch DOM reads then writes; avoid read/write alternation | |
| `content-jumping` | Reserve space for async content (ads, images, embeds) before load | CWV CLS |
| `virtualize-lists` | Virtualise lists with 50+ items (TanStack Virtual, react-window) | |
| `main-thread-budget` | < 16ms per frame for 60fps; off-load heavy work to Web Worker | Apple HIG, MD |
| `progressive-loading` | Skeleton / shimmer for operations > 300ms; never empty blank space | Apple HIG |
| `input-latency` | Keep tap/scroll latency < 100ms | MD |
| `debounce-throttle` | Debounce search (200ms); throttle scroll/resize handlers | |
| `network-fallback` | Degraded mode for slow networks (lower-res images, fewer animations) | |

---

## 4. Style Selection (HIGH)

| Rule | Spec |
|---|---|
| `style-match` | Match style to product type — use industry-rules.md for 161 rules |
| `consistency` | Same style system across all pages — no style-switching between sections |
| `no-emoji-icons` | SVG icons only (Lucide, Heroicons, Phosphor) — never emoji as UI elements |
| `effects-match-style` | Shadows, blur, radius must align with chosen style (glass/flat/clay) |
| `platform-adaptive` | Respect iOS HIG vs Material Design idioms per platform |
| `state-clarity` | Hover/pressed/disabled states must be visually distinct |
| `elevation-consistent` | Consistent 4-level shadow scale: 0 / sm / md / xl — no random values |
| `dark-mode-pairing` | Design light and dark together; test contrast on both independently |
| `icon-style-consistent` | One icon set throughout — same stroke width, corner radius, fill style |
| `system-controls` | Prefer native/system controls over custom unless branding requires |
| `blur-purpose` | Blur = "background is dismissed" (modals, sheets) — not decorative | Apple HIG |
| `primary-action` | One primary CTA per screen; secondary actions visually subordinate | Apple HIG |

---

## 5. Layout & Responsive (HIGH)

| Rule | Spec |
|---|---|
| `viewport-meta` | `width=device-width, initial-scale=1` — **never** disable zoom |
| `mobile-first` | Design mobile-first then expand; never shrink desktop to mobile |
| `breakpoints` | Systematic: 375 / 640 / 768 / 1024 / 1280 / 1536 |
| `readable-font-size` | Min **16px** body on mobile — prevents iOS auto-zoom on input focus |
| `line-length-control` | Mobile 35–60 chars/line; desktop 60–75 chars (≈ `max-w-prose`) |
| `no-horizontal-scroll` | Content must fit viewport width on mobile at all times |
| `spacing-scale` | 4pt/8dp incremental spacing (4/8/12/16/24/32/48/64px) |
| `container-width` | `max-w-6xl` or `max-w-7xl` on desktop with `px-4` safe inset on mobile |
| `z-index-management` | Named z-index scale: `base:0` / `raised:10` / `dropdown:20` / `sticky:40` / `modal:100` / `toast:1000` |
| `fixed-element-offset` | Fixed nav or bottom bar must add padding to underlying content |
| `viewport-units` | Use `min-h-dvh` not `100vh` on mobile (accounts for browser chrome) |
| `orientation-support` | Layout must remain readable and operable in landscape mode |
| `content-priority` | Most important content first on mobile — fold secondary below |
| `visual-hierarchy` | Size + spacing + contrast to establish hierarchy; never color alone |

---

## 6. Typography & Color (MEDIUM)

| Rule | Spec | Source |
|---|---|---|
| `line-height` | 1.5–1.75 for body text (`leading-relaxed` / `leading-loose`) | |
| `line-length` | 65–75 characters per line; `max-w-prose` in Tailwind | |
| `font-scale` | Consistent type scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64px | |
| `weight-hierarchy` | Headings 600–700; body 400; labels/captions 500 | MD |
| `text-styles-system` | Use Material type roles (display / headline / title / body / label) | MD |
| `color-semantic` | Semantic tokens (`--color-brand`, `--color-error`, `--color-surface`) — never raw hex in components | MD |
| `color-dark-mode` | Dark: desaturated/lighter tonal variants; never inverted light colors; test contrast independently | HIG, MD |
| `color-accessible-pairs` | All foreground/background pairs verified at 4.5:1 (AA) or 7:1 (AAA) | WCAG |
| `color-not-decorative-only` | Functional color (error red, success green) must have icon/text too | HIG, MD |
| `truncation-strategy` | Prefer wrapping over truncation; when truncating add tooltip with full text | Apple HIG |
| `number-tabular` | `font-variant-numeric: tabular-nums` on prices, data columns, timers | |
| `whitespace-balance` | Whitespace groups related items and separates sections — never fill for the sake of it | Apple HIG |
| `letter-spacing` | Respect default tracking; never tight `letter-spacing` on body text | HIG, MD |

---

## 7. Animation (MEDIUM) — Most detailed — read in full

| Rule | Spec | Source |
|---|---|---|
| `duration-timing` | Micro-interactions **150–300ms**; complex transitions ≤ 400ms; never > 500ms | MD |
| `transform-performance` | Animate `transform` and `opacity` **only** — never width/height/top/left | |
| `easing` | `ease-out` for entering; `ease-in` for exiting; never `linear` for UI | |
| `spring-physics` | Prefer spring/physics curves for natural feel | Apple HIG |
| `exit-faster-than-enter` | Exit animations **60–70% of enter duration** — feels more responsive | MD |
| `stagger-sequence` | List/grid entrances: **30–50ms stagger per item** — never all-at-once | MD |
| `motion-meaning` | Every animation must express cause-and-effect — not just decorative | Apple HIG |
| `state-transition` | State changes (hover/expanded/collapsed) must animate, not snap | |
| `continuity` | Page transitions maintain spatial continuity (shared element, directional slide) | Apple HIG |
| `hierarchy-motion` | Enter from below = deeper level; exit upward = going back | MD |
| `interruptible` | All animations must be interruptible — user gesture cancels immediately | Apple HIG |
| `no-blocking-animation` | Never block input during an animation — UI stays interactive | Apple HIG |
| `scale-feedback` | Subtle scale **0.95–1.05** on press for tappable cards/buttons | HIG, MD |
| `gesture-feedback` | Drag/swipe/pinch must provide real-time visual response tracking the finger | MD |
| `opacity-threshold` | Fading elements: don't linger below 0.2 opacity — fade fully or stay visible | |
| `modal-motion` | Modals/sheets animate from trigger source (scale+fade or directional slide) | HIG, MD |
| `navigation-direction` | Forward → left/up; backward → right/down — consistent throughout | HIG |
| `layout-shift-avoid` | Animations must not cause reflow or CLS — `transform` for position changes | |
| `parallax-subtle` | Parallax must respect `prefers-reduced-motion`; no disorientation | Apple HIG |
| `excessive-motion` | Max 1–2 animated elements per viewport section | |
| `motion-consistency` | Unified duration/easing tokens globally — all animations share the same rhythm | |
| `fade-crossfade` | Content replacement within same container → crossfade, not flash/jump | MD |

### Quick-reference timing table

```
Micro (hover, press)       → 150ms   ease-out
Entry (modal, dropdown)    → 250ms   ease-out
Exit (modal, dropdown)     → 150ms   ease-in   (60% of entry)
Page transition            → 300ms   spring
Complex / choreographed    → 400ms   ease-in-out
Stagger per child item     → 40ms    (30–50ms range)
Never exceed               → 500ms
```

---

## 8. Forms & Feedback (MEDIUM)

| Rule | Spec | Source |
|---|---|---|
| `input-labels` | Visible label per input — never placeholder-only | WCAG 1.3.1 |
| `error-placement` | Error message directly below the related field | WCAG 3.3.1 |
| `inline-validation` | Validate on blur — never on every keystroke | MD |
| `submit-feedback` | Loading → success/error state on every form submit | |
| `required-indicators` | Mark required fields with `*` and explain convention once | |
| `progressive-disclosure` | Reveal complex options progressively; don't overwhelm upfront | Apple HIG |
| `undo-support` | "Undo delete" toast for destructive actions (3–5s window) | Apple HIG |
| `sheet-dismiss-confirm` | Confirm before dismissing sheet/modal with unsaved changes | Apple HIG |
| `error-clarity` | Error = cause + how to fix; never just "Invalid input" | HIG, MD |
| `error-recovery` | Every error state has a clear recovery path (retry / edit / help) | HIG, MD |
| `error-summary` | Multiple errors → summary at top with anchor links to each field | WCAG 3.3.3 |
| `focus-management` | After failed submit, auto-focus the first invalid field | WCAG 3.3.1 |
| `aria-live-errors` | Form errors use `aria-live` region or `role="alert"` | WCAG |
| `multi-step-progress` | Step indicator or progress bar; allow back navigation | MD |
| `form-autosave` | Long forms auto-save drafts to prevent accidental loss | Apple HIG |
| `success-feedback` | Completed actions: brief visual confirmation (checkmark, toast, flash) | MD |
| `disabled-states` | Disabled: opacity 0.38–0.5 + `cursor-not-allowed` + `aria-disabled` | MD |
| `input-type-keyboard` | Semantic input types trigger correct mobile keyboard (`email`, `tel`, `number`) | HIG, MD |
| `password-toggle` | Show/hide toggle on every password field | MD |
| `autofill-support` | `autocomplete` attributes on all form fields | HIG, MD |
| `toast-dismiss` | Auto-dismiss toasts 3–5s; keep if user is hovering | |
| `toast-accessibility` | Toasts: `aria-live="polite"` — never steal focus | WCAG |
| `confirmation-dialogs` | Confirm before all destructive actions | |
| `destructive-emphasis` | Destructive actions: semantic red, visually separated from primary CTA | HIG, MD |
| `read-only-distinction` | Read-only state visually and semantically different from disabled | MD |
| `field-grouping` | Group related fields with `<fieldset>/<legend>` or visual grouping | MD |
| `contrast-feedback` | Error/success colors must meet 4.5:1 contrast | WCAG |
| `timeout-feedback` | Request timeout shows clear message with retry option | MD |

---

## 9. Navigation Patterns (HIGH)

| Rule | Spec | Source |
|---|---|---|
| `back-behavior` | Back must be predictable, consistent, and preserve scroll/state | HIG, MD |
| `deep-linking` | All key screens reachable via deep link / URL | HIG, MD |
| `tab-bar-ios` | iOS: bottom Tab Bar for top-level navigation | Apple HIG |
| `top-app-bar-android` | Android: Top App Bar with nav icon for primary structure | MD |
| `nav-label-icon` | Nav items must have both icon and label — icon-only nav harms discoverability | MD |
| `nav-state-active` | Current location visually highlighted (color, weight, indicator) | HIG, MD |
| `bottom-nav-limit` | Bottom nav max **5 items**; never more | MD |
| `modal-escape` | Clear close/dismiss affordance; swipe-down to dismiss on mobile | Apple HIG |
| `search-accessible` | Search in top bar or dedicated tab; show recent/suggested queries | MD |
| `breadcrumb-web` | Web: breadcrumbs for 3+ deep hierarchies | MD |
| `state-preservation` | Navigating back restores scroll position, filter state, and input | HIG, MD |
| `gesture-nav-support` | Support iOS swipe-back and Android predictive back without conflict | HIG, MD |
| `adaptive-navigation` | ≥1024px: sidebar preferred; < 1024px: bottom/top nav | Material Adaptive |
| `back-stack-integrity` | Never silently reset nav stack or unexpectedly jump to home | HIG, MD |
| `avoid-mixed-patterns` | Never mix Tab + Sidebar + Bottom Nav at the same hierarchy level | |
| `modal-vs-navigation` | Modals are not for primary navigation flows | HIG |
| `focus-on-route-change` | After page transition, move focus to main content for screen readers | WCAG 2.4.3 |
| `persistent-nav` | Core navigation reachable from deep pages — never fully hidden | HIG, MD |
| `destructive-nav-separation` | Delete/logout visually and spatially separated from normal nav | HIG, MD |
| `tab-badge` | Badges on nav items sparingly; clear after user visits | HIG, MD |
| `overflow-menu` | When actions overflow, use ⋯ overflow menu instead of cramming | MD |
| `navigation-consistency` | Nav placement identical across all pages | |

---

## 10. Charts & Data (LOW → HIGH for data products)

| Rule | Spec | Source |
|---|---|---|
| `chart-type` | Trend → line; comparison → bar; proportion → donut (≤5 slices) | |
| `no-pie-overuse` | Pie/donut for ≤5 categories only; switch to bar for more | |
| `color-guidance` | Accessible palette; avoid red/green only pairs (colorblind) | WCAG |
| `pattern-texture` | Supplement color with patterns/textures so data readable without color | WCAG, MD |
| `legend-visible` | Always show legend near chart — never below a scroll fold | MD |
| `legend-interactive` | Click legend items to toggle series visibility | MD |
| `tooltip-on-interact` | Hover (web) / tap (mobile) tooltips show exact values | HIG, MD |
| `tooltip-keyboard` | Tooltip content keyboard-reachable — no hover-only content | WCAG |
| `axis-labels` | Axes labeled with units; no truncated or rotated labels on mobile | |
| `responsive-chart` | Reflow or simplify on small screens; fewer ticks, horizontal bars | |
| `loading-chart` | Skeleton/shimmer while data loads — never empty axis frame | MD |
| `empty-data-state` | Meaningful empty state with guidance — never blank chart | MD |
| `animation-optional` | Chart entrance animations respect `prefers-reduced-motion` | HIG |
| `large-dataset` | 1000+ points: aggregate or sample; provide drill-down for detail | MD |
| `number-formatting` | Locale-aware formatting for numbers, dates, currencies | HIG, MD |
| `touch-target-chart` | Interactive chart elements ≥ 44pt tap area or expand on touch | Apple HIG |
| `data-density` | Limit information per chart; split into multiple if needed | |
| `gridline-subtle` | Grid lines low-contrast (e.g. `gray-200`) — never compete with data | |
| `trend-emphasis` | Emphasize trends over decoration — no heavy gradients obscuring data | |
| `focusable-elements` | Chart bars/points/slices keyboard-navigable | WCAG |
| `screen-reader-summary` | `aria-label` or text summary describing chart's key insight | WCAG |
| `error-state-chart` | Load failure shows error + retry — never a broken/empty chart | |
| `export-option` | Data-heavy products: offer CSV/image export | |
| `time-scale-clarity` | Time series: clearly label granularity (day/week/month); allow switching | |
| `sortable-table` | Data tables support sorting with `aria-sort` indicating current state | WCAG |
| `direct-labeling` | Small datasets: label values directly on chart to reduce eye travel | |
| `data-table` | Provide accessible table alternative alongside charts | WCAG |

---

## Cross-Cutting Rules

### What this file is vs ux-guidelines.md

| File | Purpose |
|---|---|
| `ux-guidelines.md` | High-level design principles and anti-patterns (why) |
| `ux-deep-rules.md` | Platform-specific implementation rules with citations (how) |

### When to load this file
- Auditing existing UI for violations
- Building any component that involves touch targets, animation, or form states
- Verifying chart accessibility
- Checking navigation architecture against HIG/MD standards
- Pre-delivery checklist for mobile or native-adjacent web apps

## Vercel additions (web-interface-guidelines)

| Rule | Detail |
|---|---|
| `form-autocomplete-off` | `autocomplete="off"` on non-auth fields so password managers don't trigger on unrelated inputs |
| `form-unsaved-warning` | Warn before navigating away with unsaved changes (`beforeunload` or router guard) |
| `form-placeholder-pattern` | Placeholders end with `…` and show an example pattern (`name@company.com…`) — never restate the label |
| `form-no-paste-block` | Never `onPaste` + `preventDefault` — breaks password managers and 2FA codes |
| `img-explicit-dimensions` | `<img>` needs explicit `width`/`height` (or `fill`) — prevents CLS |
| `img-loading-priority` | Below fold `loading="lazy"`; above-fold critical `priority` / `fetchpriority="high"` |
