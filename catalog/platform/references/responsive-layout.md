# Responsive Layout

`SKILL.md` rule 2 says responsive web layout reflows rather than shrinks, and
names the four viewports to test at. This file is the how: the layout
primitives that reflow on their own, the one decision that separates container
queries from media queries, and a validation matrix that reconciles the three
different breakpoint lists already in the pack.

It does not restate what is already written. The fluid type and space scales
are in `core/design-tokens.md` and `mobile-patterns.md` §8; safe-area recipes
and `dvh`/`svh` are in `mobile-patterns.md` §1 and §7; pointer-media queries and
touch-target sizing are in `mobile-patterns.md` §1 and §12. Load those for the
mechanics. Load this when the question is *what shape should the layout be*.

## Reflow without media queries

Most responsive layout needs no breakpoints at all. Three primitives cover it:

| Primitive | Pattern | Reflows because |
|---|---|---|
| Fluid grid | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` | Each track is at least `16rem` until only one fits, then `min(100%, …)` lets the last row fill. Column count is a function of available width, not a breakpoint. |
| Flex wrap | `display: flex; flex-wrap: wrap` with `flex: 1 1 20rem` on children | Children hold `20rem` until the row is full, then wrap. |
| Intrinsic sidebar | `grid-template-columns: minmax(0, 1fr) minmax(0, 20rem)` collapsing to one column below a container width | The `minmax(0, …)` floor is what stops a long word forcing overflow. |

`auto-fit` collapses empty tracks so the content stretches; `auto-fill` keeps
them, holding a column grid open when it is half-full. Pick `auto-fit` for card
walls, `auto-fill` for anything that should stay aligned to a grid as it fills.

**The `min(100%, 16rem)` inside `minmax` is load-bearing.** A bare
`minmax(16rem, 1fr)` overflows its parent on a viewport narrower than `16rem`,
because the track refuses to go below its floor. Wrapping the floor in
`min(100%, …)` lets it shrink on the smallest screens.

## Container queries, and when to reach for them

A media query asks how wide the *viewport* is. A container query asks how wide
*this component's container* is. The component is the same in a sidebar, a
modal and a full-width section, so its own layout should follow its own space.

```css
.card-list { container-type: inline-size; }

.card {
  display: grid;
  grid-template-columns: 1fr;
}
@container (min-width: 30rem) {
  .card { grid-template-columns: 8rem 1fr; }
}
```

Container query length units resolve against the query container:
`cqi` (inline size) · `cqb` (block size) · `cqmin` / `cqmax`. `font-size:
clamp(1rem, 4cqi, 1.5rem)` scales a card's heading to the card, not the window.

| Use a container query when | Use a media query when |
|---|---|
| The component appears at more than one width in the same layout | The change is page-level — a nav collapsing, a sidebar becoming a drawer |
| A design-system component must be context-agnostic | The change depends on device class, not available space (`pointer`, `hover`, `prefers-*`) |
| You are fighting a cascade of viewport breakpoints inside one widget | You need the query to affect the element it is declared on (containers query an ancestor only) |

Container queries are Baseline across current engines. The one cost:
`container-type: inline-size` establishes containment, so the container can no
longer be sized by its children's block size in that axis — do not put it on an
element that needs to grow to fit its content vertically from horizontal
content.

## Viewport units and the mobile keyboard

`mobile-patterns.md` §1 covers `dvh` (dynamic — resizes with browser chrome)
and `svh` (small — the chrome-visible minimum). Two more:

- **`lvh`** (large — the chrome-hidden maximum). Use it only when you want a
  hero to fill the tallest the viewport ever gets and accept that content
  scrolls under the address bar on first paint.
- **`svh` for anything that must not resize under the user.** `dvh` on a pinned
  or `position: sticky` element makes it jump every time the address bar
  animates. Pin to `svh` and let the extra space be padding.

The soft keyboard does not change any of these. When it opens, the layout
viewport is unchanged and only the *visual* viewport shrinks, so a
`position: fixed` bottom bar sits behind the keyboard. Read the real number
from the `visualViewport` API:

```js
visualViewport.addEventListener("resize", () => {
  document.documentElement.style.setProperty(
    "--kb-inset",
    `${Math.max(0, innerHeight - visualViewport.height)}px`,
  );
});
```

Then `padding-bottom: max(env(safe-area-inset-bottom), var(--kb-inset, 0px))`.
`interactive-widget=resizes-content` in the viewport meta tag is the simpler
fix where it is supported, but the JS path is the portable one.

## Breakpoints are not test viewports

The pack carries three lists and they are not in conflict once the two ideas
are separated:

- **Breakpoints** — where the layout is *authored* to change. The systematic
  set is `640 · 768 · 1024 · 1280 · 1536` (`ux-deep-rules.md` §5, matching
  Tailwind). Add one only where the content visibly breaks between two of them,
  not to hit a device.
- **Validation points** — where the result is *checked*. A wider spot-check
  grid, because a layout that survives its breakpoints can still fail between
  them:

| px | Stands in for |
|---|---|
| 320 | Smallest phone still in use — the hard floor, nothing may overflow |
| 360 / 390 / 414 | The phone band — most real mobile traffic |
| 768 / 834 | Portrait tablet — where a two-column layout first appears |
| 1024 / 1280 | Landscape tablet and small laptop — the awkward middle |
| 1440 / 1920 | Desktop — the design's home turf |
| 2560+ | Ultrawide — content should cap, not stretch to a 200-character measure |

Check each at the OS reduced-motion and dark settings, and once with the
browser font size at 150% (a `vw`-only `clamp()` middle term ignores it — see
`typographic-finishing.md`).

## Overflow is a bug with a method

Horizontal page scroll on mobile is almost always one element wider than its
parent. Find it rather than papering over it with `overflow-x: hidden` on
`body`, which also kills legitimate scroll containers inside the page.

1. `* { outline: 1px solid red }` in devtools — the overflowing box is the one
   whose outline crosses the viewport edge.
2. Common causes: an unwrapped `<pre>` or long URL (needs `overflow-wrap:
   anywhere` or `min-width: 0`), a `100vw` element inside a padded container
   (`100vw` ignores the scrollbar and the padding), a negative margin, an
   image without `max-width: 100%`, a flex or grid child without `min-width: 0`
   (the default `min-width: auto` refuses to shrink below content size).
3. Wide content that genuinely needs its own scroll — a data table, a code
   block, a diagram — goes in its own `overflow-x: auto` container with the
   scroll region reachable by keyboard. The page body never scrolls sideways.

`overflow-x: clip` is usually the better choice than `hidden` when you do need
it on a wrapper: it clips without creating a scroll container or a new
formatting context, so `position: sticky` descendants keep working.

## Images across widths

Serving one desktop-sized image to every screen is the most common wasted
payload on a responsive page.

- **Resolution switching** — same picture, different sizes. `srcset` with
  `w` descriptors plus a `sizes` attribute that tells the browser how wide the
  image will *render* before layout: `sizes="(min-width: 64rem) 40rem, 100vw"`.
  Next.js `<Image>` generates the `srcset`; you still write `sizes`, and a
  wrong `sizes` is worse than none.
- **Art direction** — different crop or aspect ratio per width. `<picture>`
  with `<source media="…">`, a tall crop for phones and a wide one for desktop.
- **Format** — offer AVIF then WebP then a JPEG fallback via `<picture>` type
  sources, or let the image CDN negotiate on `Accept`.
- **Always** set `width` and `height` (or `aspect-ratio`) so the box is
  reserved before the bytes arrive — this is the CLS half of the job, covered
  in `web-interface`'s image rules.

## Check before you ship

- Card and tile layouts use an intrinsic grid, not a stack of `grid-cols-*`
  breakpoints.
- Every flex and grid child that contains text has `min-width: 0` where it
  could otherwise overflow.
- No horizontal scroll at 320px. Checked, not assumed.
- Components that appear at more than one width use a container query, not the
  viewport.
- Pinned and sticky elements are sized in `svh`, not `dvh`.
- Fixed bottom bars account for the visual-viewport inset when the keyboard is
  open.
- Images carry `sizes`, reserve their box, and no screen loads a file larger
  than it renders.

## Sources

Layout primitives from the CSS Grid and Flexbox specifications and the
long-standing "every layout" body of work on intrinsic, algorithmic layout;
container query units from the CSS Containment Module Level 3. Viewport-unit
and `visualViewport` behaviour from the CSSOM View and MDN references. The
breakpoint set matches Tailwind CSS defaults; the validation matrix and the
overflow method are written for this pack, reconciling `platform/SKILL.md`
rule 2, `ux-deep-rules.md` §5 and `mobile-patterns.md`.
