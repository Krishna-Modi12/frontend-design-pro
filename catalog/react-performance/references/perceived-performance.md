# Perceived Performance

`rendering-performance.md` is about making the work fast. This file is about
the wait that is left: what to show while it happens so the interface never
reads as frozen, and how to spend a small budget of prefetching to make the
next navigation feel instant.

The mechanics of streaming, `useOptimistic` and prefetch-on-hover are in
`parallelization.md` §5–§8. This file is the *decision* layer on top of them —
which pattern, and how to time it.

## The perception thresholds

Response time research gives three numbers that every pattern here derives
from:

| Budget | The user perceives | Design response |
|---|---|---|
| **≤ 100 ms** | Instant — direct manipulation | No indicator. Just do it. This is the INP target. |
| **100 ms – 1 s** | A slight pause, but their train of thought holds | A cursor or inline state change is enough; no spinner |
| **1 s – 10 s** | Waiting. Attention starts to drift | A determinate progress indicator, or a skeleton of the result |
| **> 10 s** | Gone — they will switch tasks | Progress with a time estimate and a way to keep working; notify on completion |

The corollary: **an indicator shown for an operation that finishes in 300 ms
makes the app feel slower**, because a flash of spinner reads as a stutter. The
timing rules below exist to avoid that.

## Choosing the pattern

| Situation | Show | Not |
|---|---|---|
| Mutation the server will almost certainly accept (like, favourite, reorder, add to cart) | **Optimistic update** — apply the result now, reconcile on response | A spinner on the button |
| Navigation or data load where you know the result's shape | **Skeleton** matching that shape | A centred spinner |
| Load where you cannot predict the shape, or a small in-place refresh | **Inline spinner** in the region, after a delay | A full-page overlay |
| Work with a knowable size — upload, export, import, multi-step | **Determinate progress** (bar + count) | An indeterminate spinner |
| Anything ≤ 100 ms | Nothing | — |

Never block the whole page for one slow region. Render everything you have,
and scope the pending state to the part that is actually waiting.

## Spinner timing

Two rules turn a jittery loader into a calm one:

- **Delay before showing.** Wait ~200 ms before rendering a spinner. If the work
  finishes first, the user sees an instant result instead of a flash. Pure CSS:

```css
.spinner {
  animation: fade-in 120ms ease-out 200ms both; /* 200ms delay, then fade in */
}
@media (prefers-reduced-motion: reduce) {
  .spinner { animation-delay: 200ms; animation-duration: 1ms; }
}
```

- **Minimum visible time.** Once shown, keep it for at least ~500 ms even if
  the data arrives at 520 ms. A spinner that vanishes 20 ms after appearing is
  a glitch. Track `shownAt` and delay the hide.

React's `useTransition` gives you the "is pending" boolean without a manual
timer; combine it with the CSS delay above so a fast transition shows nothing.

## Skeletons

A skeleton is a promise about the layout. It works only if it keeps that
promise:

- **Match the real thing** — same number of lines, same card height, same grid.
  A skeleton that does not match causes a layout shift when content replaces it,
  which is the CLS the skeleton was supposed to prevent.
- **One pulse, not a light show.** A single low-contrast `pulse` (opacity
  60%↔100%) or a slow shimmer sweep. Reduced motion drops it to a static
  tint — the shape still communicates.
- **It must reflect a real pending state.** A skeleton driven by a
  `setTimeout` on mount, shown before any request is in flight, is the
  `DELAY-01` anti-pattern — a fake loader. Drive it from the actual fetch or
  the router's pending state.
- **Do not skeleton forever.** After ~10 s, swap to an explicit "still
  loading…" message with a retry, so a hung request is not indistinguishable
  from a slow one.

## Optimistic updates

Applying the result before the server confirms it removes the wait entirely
for the common case. The cost is the uncommon case, and that is a UX decision,
not a code one (`parallelization.md` §6 has the `useOptimistic` mechanics):

- **Only when rejection is rare and reversible.** A "like" is fine. "Transfer
  £500" is not — the rollback is too expensive to be a surprise.
- **Reconcile visibly.** On failure, animate the item back to its previous
  state and say why — a toast, or an inline error on the row. A silent revert
  reads as the app losing the user's action.
- **Keep the optimistic item interactive.** If a new comment appears
  optimistically, its delete and edit affordances should work; queue the
  actions if the create is still in flight.
- **Disable the trigger only for non-idempotent actions.** Re-liking is
  harmless; re-submitting a payment is not.

## Show cached, then revalidate

For data that is allowed to be a few seconds stale, render what you have
immediately and refresh in the background — the stale-while-revalidate pattern
that SWR and TanStack Query implement by default. The user sees content on the
first frame; the update swaps in quietly, ideally with a crossfade rather than
a jump. Pair it with a subtle "updated just now" affordance only where
freshness matters (prices, stock, live scores).

The same idea at the document level: a service worker serving the last-known
HTML shell while the network response is fetched turns a cold navigation into
a warm one.

## Streaming and boundary placement

Streaming SSR sends the page shell immediately and fills slow regions as their
data resolves (`parallelization.md` §5). The judgement is *where the
boundaries go*:

- Wrap a `<Suspense>` around each independently-slow region — the product grid,
  the review list — not around the whole page.
- Put fast, above-the-fold content (nav, hero, the primary heading) *outside*
  every boundary so it is in the first byte.
- Give each boundary a skeleton `fallback` that matches, per the rules above.
- Nesting boundaries streams content in reading order as it becomes ready;
  a single boundary low in the tree holds everything below it hostage to the
  slowest query.

## Prefetching the next step

A small budget of speculative loading makes navigation feel instant. Spend it
in priority order:

- **`<Link prefetch>`** (Next.js) prefetches route code and data on viewport
  entry or hover — on by default for static routes, worth enabling explicitly
  for the likely next click.
- **Speculation Rules** for full-document prerender on a multi-page site:

```html
<script type="speculationrules">
{ "prerender": [{ "where": { "selector_matches": "a.likely-next" },
                  "eagerness": "moderate" }] }
</script>
```

  `eagerness` is the budget dial — `conservative` (on pointerdown),
  `moderate` (~200 ms hover), `eager` (immediately / on viewport). Prerender
  runs the whole page in the background, so scope it tightly and expect
  analytics to need the "prerender until a blocking script" mode or a
  `visibilitychange` guard. Unsupported browsers ignore the block.
- **Resource hints** for known cross-origin dependencies: `<link
  rel="preconnect">` for an API or font host you will hit within a second,
  `rel="preload">` for the LCP image or the critical font, `fetchpriority="high"`
  on the LCP image element. Preload two resources at most — everything
  "important" is nothing important.

## Check before you ship

- Nothing shows a loading indicator for work that usually finishes under
  ~200 ms.
- Every spinner has a show-delay and a minimum-visible-time.
- Skeletons match the real layout's dimensions — verified by toggling between
  the two.
- No skeleton or loader is driven by a mount-time timer instead of a real
  pending state.
- Optimistic updates are used only where rejection is rare, and a rejection
  animates back with a reason.
- Suspense boundaries wrap slow regions individually; the shell and hero are
  outside all of them.
- At most two `preload` hints; the LCP image has `fetchpriority="high"`.
- Prerender rules use `moderate` or `conservative` eagerness and account for
  analytics side effects.

## Sources

The 100 ms / 1 s / 10 s thresholds are Nielsen Norman Group's, themselves from
response-time research going back to the 1960s. Skeleton, spinner-timing and
optimistic-UI guidance synthesised from the Nielsen Norman Group and web.dev
UX writing and reconciled with this pack's `DELAY-01` constraint and the
`animations` skeleton rule. Speculation Rules and resource-hint syntax from the
WICG specification and MDN. No third-party code was taken.
