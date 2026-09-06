# Design Patterns — Canonical Pattern Library

> Canonical home of the 12 Design Principles, Layout Formulas, and 19 pattern entries.
> Routed by: `[patterns]` `[pricing]` `[testimonials]` `[bento]` `[social-proof]` `[empty]` `[overlay]` `[onboarding]` and 9 routing-table rows.
> Style contract: every rule is literal and checkable. MUST = validation-gated. SHOULD = strong default, override only with stated reason.

---

## 1. THE 12 DESIGN PRINCIPLES (always active)

| # | ID | Principle | Rule |
|---|----|-----------|------|
| 1 | `DP-01` | One job per section | Every section answers exactly one question. Hero: "What is this?" Pricing: "What do I pay?" Features: "Why care?" A section answering two questions MUST be split. |
| 2 | `DP-02` | Hierarchy in threes | Primary → Secondary → Tertiary. Never more than 3 levels of visual weight per page. |
| 3 | `DP-03` | White space is signal | Empty space marks importance. Compress only when `VISUAL_DENSITY > 7`. |
| 4 | `DP-04` | CTA gravity | Primary CTA is the visually heaviest element above the fold. Nothing competes. One primary CTA style per page. |
| 5 | `DP-05` | Social proof proximity | Trust signals (logos, stats, testimonials) within 40px of the CTA they support. |
| 6 | `DP-06` | Progressive disclosure | Show the minimum needed to decide. Detail goes behind hover, accordion, or the next page. |
| 7 | `DP-07` | Consistent depth model | Pick one: flat / 1-layer / 2-layer. Never mix. Same-hierarchy cards share the same elevation token. |
| 8 | `DP-08` | Motion as feedback | Animate to confirm actions, not decorate. If removing it breaks understanding, keep it; otherwise cut it. |
| 9 | `DP-09` | Color has one job | Brand color = primary action only. Never background texture. Buttons and key links only. |
| 10 | `DP-10` | Scannable rhythm | Break pattern every 3–4 sections: full-bleed dark → light card grid → feature spotlight → CTA bar. |
| 11 | `DP-11` | Mobile-first = content-first | At 375px: headline, CTA, social proof survive. Everything else must earn its place. |
| 12 | `DP-12` | Anti-perfection | Slight asymmetry, organic shapes, non-round numbers signal human craft. Intentional imperfection = trust. |

---

## 2. LAYOUT FORMULAS (canonical)

Apply at BUILD Pass 1. Referenced by SKILL.md.

```
HERO        = Eyebrow-tag + Headline(≥48px) + Subtext(≤2 lines) + CTA-pair + Social-proof-bar + Visual
FEATURE     = Icon/visual + Headline + Body(2–3 sentences) + Optional-link
PRICING     = Headline + Toggle(monthly/annual) + 3-column-cards + Trust-note + FAQ-link
TESTIMONIAL = Pull-quote(large) + Avatar + Name + Company + Optional-grid
CTA-BAR     = Short-headline + 1–2-CTAs + Microcopy(no risk / cancel anytime)
FOOTER      = Logo + Nav-cols + Legal + Social-icons

DASH-LAYOUT = Sidebar(240px) + Header(56px) + Content(flex-1) + Optional-right-panel(320px)
METRIC-ROW  = 4×KPI-card [value + label + trend + sparkline]
CHART-ROW   = Large-chart(2/3) + Summary-panel(1/3) OR 2×medium-charts
TABLE-ROW   = Search/filter-bar + Data-table + Pagination

SPLIT-AUTH  = Left-panel(brand/visual, hidden mobile) + Right-panel(form, full-width mobile)
ONBOARDING  = Progress-indicator + Single-focus-step + Back/Next + Skip-option
PRODUCT-GRID= Filters-sidebar(desktop) / Filter-drawer(mobile) + Grid(3/2/1 col) + Pagination
PDP         = Gallery(sticky desktop) + Info-panel(title+price+variant+CTA+trust) + Tabs(description/reviews/shipping)
```

---

## 3. PATTERN ENTRIES (19)

### Marketing

**P-01 · Hero** — `[patterns]`
- Anatomy: HERO formula. Headline ≥48px desktop / ≥32px mobile. Subtext max 2 lines at 65ch.
- Layout: Grid `lg:grid-cols-2` (copy left, visual right) or centered single column. Visual MUST NOT push CTA below fold at 1280×800.
- CTA pair: 1 solid primary + 1 ghost secondary. Never two solids.
- A11y: `<h1>` here and only here. Decorative visual gets `alt=""` / `aria-hidden`.

**P-02 · Pricing table** — `[pricing]`
- Anatomy: PRICING formula. Exactly 3 visible tiers (collapse 4+ into "Enterprise → talk to sales").
- Recommended tier: middle position, elevated (border + badge "Most popular"), scale ≤1.03 — never larger.
- Toggle: monthly/annual as `role="radiogroup"`; annual shows savings inline ("2 months free"), never a strikethrough-only.
- Prices: organic values (DP-12): $29/$79/$249 not $30/$80/$250. Feature lists: max 7 rows visible, rest behind "See all features" accordion.
- Enterprise tier: no price — "Custom" + contact CTA. Never fake a number.
- Grid vs flex: CSS Grid `md:grid-cols-3` with `items-stretch`; equal-height via grid, NOT via JS height sync.
- A11y: each card is an `<article>` with `aria-labelledby` its tier name; toggle state announced via the radio group.

**P-03 · Testimonials** — `[testimonials]`
- 5 variants: quote wall (grid), horizontal scroll (snap), masonry, video, stats bar.
- Quote card anatomy: pull-quote (18–20px, max 3 lines) + avatar (40px, initials fallback) + name + role/company. Attribution MUST be real-looking and diverse (DP-12, anti-slop names rule).
- Quote wall: `columns-1 md:columns-2 lg:columns-3` (CSS columns for masonry) or grid with varied `row-span`. Never equal-height uniform cards (anti-slop).
- Horizontal scroll: `snap-x snap-mandatory`, visible partial next card (peek ≥48px) to signal scrollability, `scrollbar-width: thin`.
- A11y: `<blockquote>` + `<cite>`. Carousels: no auto-advance without pause control; arrows are real `<button>`s ≥44px.

**P-04 · Bento / feature grid** — `[bento]`
- 4 variants: icon grid (3×2), bento (mixed spans), screenshot+copy alternating, comparison grid.
- Bento cell anatomy: one hero cell spanning 2×2 or 2×1, remainder 1×1. At least one cell breaks the rhythm (DP-10). Max 6 cells per bento.
- Spanning rules: `grid-cols-4` desktop base; hero cell `col-span-2 row-span-2`; anchor cell aspect via `aspect-[4/3]`, never fixed px heights.
- Content: each cell = FEATURE formula compressed. No cell is filler — if you can't name its job, delete it (DP-01).
- Grid vs flex: always CSS Grid. Flexbox cannot express row spans.
- Mobile: collapse to single column in *content-priority* order, not DOM order if they differ — reorder DOM instead of using `order:` (screen-reader parity).

**P-05 · Social proof / trust signals** — `[social-proof]`
- Variants: logo wall, stats bar, review aggregate (stars + count), press mentions, customer count.
- Proximity rule (DP-05): within 40px of the CTA it supports.
- Logo wall: 5–7 logos, grayscale (`grayscale opacity-70 hover:opacity-100`), uniform height 24–32px, NEVER uniform width. Marquee only if >8 logos, must pause on hover and respect `prefers-reduced-motion`.
- Stats bar: 3–4 stats, organic values ("12,847 teams" not "10,000+"). Label under value, value 2–3× label size.
- A11y: logos are `<img alt="CompanyName">` inside a `<ul aria-label="Trusted by">`, not background images.

**P-06 · CTA bar**
- CTA-BAR formula. Full-bleed contrast band (dark on light page or inverse). One headline ≤8 words, 1–2 CTAs, risk-reversal microcopy ("Free 14-day trial · No credit card").
- Placement: after final feature section, before footer. Never two CTA bars per page.

**P-07 · FAQ**
- Accordion (`<details>`/`<summary>` or ARIA disclosure). 5–8 questions, real objections not filler. One open at a time is NOT required — multiple open allowed (user control).
- A11y: summary is a real button semantic; chevron rotates, honors reduced-motion; content never `display:none` from crawlers' perspective (use native `<details>` where possible).

**P-08 · Comparison table**
- Us-vs-them: max 3 columns, our column visually elevated (border-brand + subtle bg tint).
- Checkmarks: icon + `<span className="sr-only">Included</span>` — never color-only (WCAG 1.4.1).
- Mobile: horizontal scroll with sticky first column (`sticky left-0`), or stacked cards. Never shrink below 14px text.

### SaaS / Dashboard

**P-09 · KPI / metric card**
- Anatomy: value (24–32px, `tabular-nums`) + label (13–14px muted) + trend (arrow + % with color AND direction icon) + optional sparkline.
- METRIC-ROW: 4 across desktop → 2×2 tablet → 1-col mobile. Cards share elevation (DP-07).
- Trend colors: pair icon with color; `aria-label="up 4.7 percent from last month"` on the trend element.
- Sparklines: `aria-hidden="true"` + the value already conveys the data; no interactive tooltip inside a card that is itself a link.

**P-10 · Chart row**
- CHART-ROW formula. Large chart gets a title (`<h2/h3>`), a time-range control, and a text summary line — the summary line is the accessible fallback for the chart (`role="img"` + `aria-label` with the trend sentence).
- Loading: skeleton matching chart aspect ratio, never a spinner replacing layout (CLS).
- Empty: "No data for this range" + range-change CTA — see P-16.

**P-11 · Data table shell**
- TABLE-ROW formula. Semantic `<table>` always — never div-grids for tabular data.
- Sortable headers: `<th aria-sort="ascending|descending|none">` wrapping a `<button>`; sort cycle asc→desc→none.
- Row selection: leading checkbox column, header checkbox = select-all with `indeterminate` state; bulk-action bar appears above table (not floating) announcing count via `aria-live="polite"`.
- Overflow: wrap table in `overflow-x-auto` container with `tabindex="0"` + `role="region"` + `aria-label` (keyboard-scrollable).
- >100 rows: virtualize (TanStack Virtual) — see `vercel-ui-rules.md`. Pagination vs infinite scroll: see §5 Decision Guide.
- Gold: `examples/good-data-table.tsx`.

**P-12 · Activity feed**
- Reverse-chron list, `<ul>` of `<li>`; each item: avatar/icon + actor + verb + object + relative time (`<time datetime>`).
- Group by day with sticky day headers. New items announced via `aria-live="polite"` only when user opted into live updates.
- Cap initial render at 20 items + "Show more" — never infinite scroll inside a dashboard side panel.

**P-13 · Command palette**
- Trigger: `⌘K` / `Ctrl+K` + visible button. Overlay follows P-17 rules.
- Anatomy: input (autofocus) + grouped results + kbd hints. Roving `aria-activedescendant` listbox pattern; arrow keys navigate, Enter selects, Esc closes.
- Fuzzy match with highlighted substrings (`<mark>`). Empty query shows recent + suggested actions, never a blank panel.

### Auth / Onboarding

**P-14 · Split auth**
- SPLIT-AUTH formula. Brand panel hidden `lg:` down — form is the page on mobile.
- Form column max-w-sm centered; OAuth buttons above OR below the email form with an "or" divider — never interleaved.
- Details in `auth-patterns.md` (RHF+Zod, OAuth, magic link).

**P-15 · Onboarding wizard** — `[onboarding]`
- ONBOARDING formula. One decision per step (DP-01). 3–5 steps max; merge or defer the rest.
- Progress: steps as `<ol>` with `aria-current="step"`; show "Step 2 of 4" as text, not dots-only.
- Order by value: first step delivers visible value or personalization, account chores last.
- Back never destroys entered data (WCAG 3.3.7 — redundant entry). Skip is a real option on every non-essential step, same position each step (WCAG 3.2.6 — consistent help placement applies to persistent aids).
- Finish: celebration screen (confetti allowed, MUST respect `prefers-reduced-motion`) + single clear next action.

### Components

**P-16 · Empty state** — `[empty]`
- 5 variants and tone (see `ux-writing.md` for copy formulas):
  | Variant | Tone | CTA |
  |---|---|---|
  | First use | Inviting, opportunity | "Create your first X" |
  | No results | Neutral, actionable | "Clear filters" / edit query echo |
  | Error | Plain, no blame | "Retry" + what happened |
  | Permission | Direct | "Request access" + who to ask |
  | Success void (inbox zero) | Celebratory, brief | none or low-key |
- Anatomy: icon (not an illustration dump) + headline (≤6 words) + body (1 sentence) + CTA. Never bare "No data".
- Error variant carries `role="alert"`; the others do not.

**P-17 · Modal / dialog / drawer / sheet** — `[overlay]`
- 5 variants: center modal (decisions/forms ≤2 fields), full-screen mobile sheet, side drawer (secondary detail), bottom sheet (mobile actions — see `mobile-patterns.md`), confirm dialog (destructive only).
- Element: native `<dialog>` + `showModal()` or Radix/shadcn `Dialog`. Both give focus trap + top-layer free.
- Focus: trap inside while open; initial focus = first meaningful control (NOT the close ×); on close, return focus to the trigger element. MUST.
- Escape closes; backdrop click closes non-destructive overlays only; destructive confirms require explicit button.
- Scroll lock: `overflow:hidden` on body + `overscroll-behavior:contain` on panel.
- Stacking: use the top layer (`<dialog>`/Popover API) so z-index wars can't happen. If not on top layer, use the named z-scale from `ux-deep-rules.md` (`modal:100`, `toast:1000`). Nested modals: avoid; if unavoidable, each layer is its own `<dialog>` (top layer stacks in open order) and Esc closes only the topmost.
- Mobile: center modals become full-screen or bottom sheets below `sm:`.
- Animation: scale 0.95→1 + fade, 200–300ms ease-out; exit 150ms. Reduced-motion: opacity only.
- Title: `aria-labelledby`; body text `aria-describedby`. Confirm dialogs name the object ("Delete 'Q3 report'?") — never "Are you sure?".

**P-17a · Stacking contexts & nested overlays (spec):**
- Z-index escalation when NOT on the top layer: base overlay `z-50`, second level `z-[60]`, third `z-[70]`. Three levels maximum — a fourth stacked surface means the flow needs a redesign (route or wizard), not more z-index. (Top-layer `<dialog>`/Popover surfaces ignore z-index entirely; prefer them.)
- `aria-hidden="true"` goes on the app root's *sibling content* (e.g. `#app-content`), never on `document.body` (hides the dialog itself) and never on an ancestor of the dialog. With stacked overlays, each new layer hides the layer below; on close, remove `aria-hidden` in strict LIFO order — restoring out of order re-exposes a covered layer to screen readers.
- Focus trap boundary per layer: Tab on the last tabbable wraps to the first; Shift+Tab on the first wraps to the last. The trap belongs to the topmost layer only.
- Return-focus queue: on open, push `document.activeElement` onto a stack; on close, pop and `.focus()` it. LIFO order means closing modal 2 restores focus into modal 1, and closing modal 1 restores the page trigger. Never `focus(document.body)`.
- Escape closes only the topmost layer; backdrop click likewise. One backdrop dim per stack (don't multiply opacity).

**P-18 · Toast / notification**
- Sonner default: `<Toaster position="bottom-right" richColors />`. Container is an `aria-live="polite"` region (Sonner handles it) — errors MAY use `assertive`, everything else polite.
- Auto-dismiss 3–5s; persist while hovered/focused; destructive-action toasts carry an Undo button (3–5s window) — see `ux-deep-rules.md` undo-support.
- Never steal focus. Never stack more than 3 visible; collapse the rest ("+2 more").
- Toasts are ephemeral confirmations only — anything requiring a decision is a dialog (P-17), anything persistent is inline.

### E-commerce

**P-19 · Product grid + PDP**
- PRODUCT-GRID formula: filter sidebar (desktop) / filter drawer (mobile, P-17 sheet variant); grid `lg:grid-cols-3 md:grid-cols-2 grid-cols-1`; card = image (`aspect-square`, lazy) + name + price (`tabular-nums`) + one badge max.
- Filters update URL (query params — `memory-persistence.md` nuqs) so results are shareable; active filters shown as removable chips above grid.
- PDP formula: gallery sticky desktop (`lg:sticky lg:top-8`), info panel with price near CTA (proximity, DP-05 applied to trust badges), variant picker as radio group with in-stock state per option.
- CTA: single "Add to cart" primary; feedback = P-18 toast + cart count `aria-live` update.

**P-20 · View transition patterns** — `[vt]`
- Full API, CSS recipes, gotchas: `animations/references/view-transitions.md`.
- Choose by relationship: shared element (`name`) for list→detail continuity · Suspense reveal for "data arrived" · list identity (`key`) for reorder · `enter`/`exit` for appearance · layout-level for route change.
- Directional slides only for hierarchical or ordered navigation; lateral tab switches fade or don't animate.
- `default="none"` on every VT, then opt in per trigger — otherwise background revalidations animate too.
- Mandatory: reduced-motion CSS disabling `::view-transition-*` animations.

---

## 4. LAYOUT ANTI-PATTERNS

| ID | Anti-pattern | Instead |
|----|--------------|---------|
| `AP-01` | Equal-height equal-width card grid for everything | Bento with spans (P-04), data list, or varied rows |
| `AP-02` | Every heading centered | Center only hero + CTA bar; left-align the rest |
| `AP-03` | 4+ pricing tiers all priced | 3 tiers + Enterprise "Custom" (P-02) |
| `AP-04` | Carousel as primary content delivery | Static grid; carousel only for overflow browsing with peek |
| `AP-05` | Modal for content that deserves a page | Route + page; modals are for decisions and short tasks |
| `AP-06` | Toast for errors requiring action | Inline error near source, or dialog if blocking |
| `AP-07` | JS-measured equal heights | CSS Grid `items-stretch` |
| `AP-08` | `order:` / visual reorder diverging from DOM | Reorder DOM; keep reading order = visual order |
| `AP-09` | Fixed px heights on text containers | min-height + intrinsic sizing; text must reflow |
| `AP-10` | Skeletons behind artificial `setTimeout` on static data | Skeleton renders only from a real `isLoading` input; never delay available content |
| `AP-11` | z-index arms race (`z-[9999]`) | Top layer (`<dialog>`, Popover API) or the named z-scale |
| `AP-12` | Infinite scroll on goal-directed tables | Pagination (see §5) |

---

## 5. PATTERN DECISION GUIDE

**Grid vs Flexbox (per pattern):**

| Use CSS Grid when | Use Flexbox when |
|---|---|
| 2-D placement: bento (P-04), pricing (P-02), metric rows (P-09), product grid (P-19) | 1-D flow: nav bars, CTA pairs, card innards (icon+text rows), toolbars |
| Equal heights across a row required | Content-sized items with natural wrap (`flex-wrap` tag lists) |
| Row/col spans exist | Space distribution between few items (`justify-between` headers) |
| Layout defined by container | Layout defined by content |

Rule of thumb: **page and section skeletons = Grid; inside a card = Flex.**

**Pagination vs infinite scroll — decision matrix:**

| Criterion | Pagination | Infinite scroll |
|---|---|---|
| SEO critical | ✅ Yes — paginated URLs indexable, real hrefs | ❌ No |
| User goal: find a specific item | ✅ Yes — position addressable, jump to page | ❌ No |
| User needs to cite/share a location | ✅ Yes — page in URL | ❌ No |
| Content: time-ordered leisure feed | ⚠️ Okay | ✅ Best |
| Data size >10k items | ⚠️ Okay | ✅ Best — WITH virtualization (mandatory past ~100 rendered items) |
| Accessibility | ✅ Easier — landmarks, page counts, reachable footer | ⚠️ Needs `aria-live` announcements + a real "Load more" button for keyboard users |

**Rule: default to pagination.** Use infinite scroll only for feeds where SEO is irrelevant AND you pair it with a "Load more" button for keyboard users. Anything inside a dashboard: pagination.

**Modal vs drawer vs page:**

| Content | Surface |
|---|---|
| Decision / confirm / ≤2-field form | Center modal |
| Detail peek keeping list context | Side drawer |
| Mobile multi-option action | Bottom sheet |
| >5 fields, multi-step, or linkable | Full page/route |

**Toast vs inline vs dialog (feedback):**

| Situation | Surface |
|---|---|
| Success confirmation, low stakes | Toast (P-18) |
| Field/validation error | Inline under field (`aria-describedby`) |
| Blocking error or destructive confirm | Dialog (P-17) |
| Background job progress | Persistent inline status region, `aria-live="polite"` |

---

## 6. SHORTCODE MAP

| Shortcode | Sections |
|-----------|----------|
| `[patterns]` | Entire file |
| `[pricing]` | P-02 + AP-03 + §5 grid table |
| `[testimonials]` | P-03 + P-05 |
| `[bento]` | P-04 + AP-01 + §5 grid table |
| `[social-proof]` | P-05 + DP-05 |
| `[empty]` | P-16 (+ `ux-writing.md`) |
| `[overlay]` | P-17 + AP-05 + AP-11 + §5 modal table |
| `[onboarding]` | P-15 (+ `auth-patterns.md`) |
