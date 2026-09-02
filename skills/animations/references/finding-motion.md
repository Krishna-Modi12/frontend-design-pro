# Finding Motion — a forward sweep for what should move and does not

Route: "what could be animated here?", "make this feel more alive", or a design
review that has to name specific missing motion rather than gesture at polish.
Read-only — this proposes motion with exact values and an equally long list of
what it rejected; it does not implement anything. Shortcode `[finding-motion]`.

Every other motion file in this skill works on motion that already exists.
`motion-budget.md` caps how much a page may move; `animation-framework.md` says
how a given thing should move; Layer B (`web-interface/references/live-verification.md`)
audits what shipped. This file is the one that walks a built, motionless
interface, finds where a transition is missing — and then throws most of its own
candidates away.

## Contents

- [Operating posture](#operating-posture)
- [The gate every candidate passes](#the-gate-every-candidate-passes)
- [Where to hunt](#where-to-hunt)
- [The rejected list is not optional](#the-rejected-list-is-not-optional)
- [Output format](#output-format)
- [Worked pass](#worked-pass)
- [Sources](#sources)
- [What was corrected on the way in](#what-was-corrected-on-the-way-in)

## Operating posture

- **Read-only.** Propose with exact values; never edit. The hand-off is a
  separate step done against `animation-framework.md`.
- **Reject more than you keep.** A sweep that blesses everything it finds has
  filtered nothing. A healthy result is roughly 3–6 kept and 3–6 rejected.
- **The page's motion tier is the ceiling.** Read it from `motion-budget.md`
  first. On an L1 surface — checkout, settings, a tool opened daily — the sweep
  is allowed to return nothing but functional feedback, and often should. Do not
  propose entrance choreography on a form because the form has none.
- **One property pair: `transform` and `opacity`.** A candidate that only works
  by animating `height`, `width` or `filter` is a FLIP or clip-path job — say so
  and cross-reference `animation-pitfalls.md`, don't wave at it. **The one
  exception is disclosure** (accordion, "show more", a filter panel): the
  container genuinely has to occupy more space, so `animation-recipes.md` § 15
  animates a measured `height` on purpose. Name it as the exception when you
  propose it — an agent that reads Core Rule 5 as absolute will otherwise reject
  the pack's own recipe.

## The gate every candidate passes

`animation-framework.md` § *The Four Questions* is the decision procedure for one
animation you already mean to build. This gate runs the same checks as a
**filter** over candidates a sweep produced, in order. A candidate that fails any
stage is rejected and the stage is named in the output.

| Stage | The question | What it rejects |
|---|---|---|
| **Frequency** | How often does one user see this? | 100+/day → animate zero. Keyboard-initiated actions — command palette, shortcuts, tab switches — never animate regardless of how good it would look once. |
| **Purpose** | Which reason is this? | The list is: feedback · spatial consistency · state indication · explaining a layout shift · preventing a jarring change. First-run delight is a sixth, rationed to one moment per surface. "Feels alive" is not on the list and is the most common rejection. |
| **Speed** | Does it fit the element's budget? | press 100–160ms · tooltip / small popover 125–200ms · dropdown / select 150–250ms · modal / drawer 200–500ms. If the idea needs longer than its element's band to read, it is too large a move for that element. |
| **Function** | Does motion help or block the task here? | An analytics chart that animates its bars on every filter change taxes the read it exists for. Motion on the critical path of a frequent task fails here even when Frequency passed. |

## Where to hunt

Six places a motionless interface usually has a real gap:

1. **Instant appearances.** Toasts, popovers, dropdowns, tooltips that snap in on
   a `display` toggle. Entry: `opacity` 0→1 with `scale` 0.96→1, ease-out, inside
   the element's Speed band. Never `scale` from 0.
2. **Pressables with no `:active`.** `scale(0.97)` on press (0.95–0.98 by size),
   with the hover half behind `@media (hover: hover) and (pointer: fine)`.
3. **Disclosure that jumps.** Accordions, "show more", filter panels that change
   height in a single frame. This is the layout-property exception named above,
   so state it as one: height + opacity, 150–250ms, off a **measured** height —
   `animation-recipes.md` § 15 for the `AnimatePresence` form, or
   `react-components/references/impeccable-techniques.md` for the CSS
   `grid-template-rows: 0fr → 1fr` alternative. Never a `max-height` guess.
4. **State that changes silently.** A count going 12→13, a status pill flipping,
   a tab indicator that teleports between tabs. The value or the indicator should
   travel between states.
5. **Destructive actions on a bare click.** Hold-to-confirm: a fill over ~2s
   linear while held, ~200ms snap-back on release. `native-motion-physics.md` and
   `animation-framework.md` carry the press/release asymmetry.
6. **Route and list changes with no continuity.** A detail view that swaps in
   over a list with no shared element; a reordered list that jumps. `layoutId` or
   the View Transitions API.

## The rejected list is not optional

A report that lists only what to add reads as a green light on all of it. The
rejected candidates are the evidence that the gate ran: each one is something a
naive pass would have added, paired with the stage that killed it. If the sweep
found nothing to reject, it was not looking hard enough — or the surface is
already at its tier and the honest verdict is "no motion needed", which is a
valid and common result.

## Output format

Three parts, always:

1. **Opportunities** — a table: `# · Location (file:line) · Today · Purpose ·
   Frequency · Suggested motion`. The suggested-motion cell is concrete:
   property, from→to, duration, easing — enough to implement without a second
   conversation.
2. **Rejected candidates** — 3–6 rows, each naming the gate stage that
   eliminated it (`Frequency: command palette, 100+/day`).
3. **Verdict** — one paragraph: does this surface need motion at all; what state
   is it in now; the single highest-leverage addition; and an explicit hand-off
   line — implement against `animation-framework.md` values and do not exceed the
   page's `motion-budget.md` tier.

## Worked pass

A settings page (L1). Sweep finds: save button has no press state; a "danger
zone" delete is a plain button; the success toast appears instantly; the
collapsed "advanced" section jumps open; the sidebar nav indicator teleports;
tab switches between panels are instant.

**Kept (3):** toast entry — `opacity` 0→1 + `scale` 0.97→1, 180ms ease-out
(*Purpose: feedback*). Save button — `scale(0.97)` press, 120ms (*feedback*).
Delete — hold-to-confirm fill, 2s linear / 200ms release (*preventing an
irreversible mistake*).

**Rejected (3):** advanced-section expand — *Function: it is on the path of a
frequent settings edit; a 250ms height animation is felt as lag by visit three*.
Sidebar indicator — *Frequency: navigation, dozens/day, reduce not add — a 100ms
slide at most, and only if the team wants it*. Tab switches — *Frequency: 100+/day
within a session; never animate*.

**Verdict:** this page needs functional feedback, not choreography. It is at
roughly half of L1 today — focus rings are present, press and confirmation states
are not. Highest leverage is the hold-to-confirm delete, because it converts an
instant irreversible click into a deliberate one. Implement with
`animation-framework.md` durations; stay at L1.

## Sources

Adapted from `emilkowalski/skills` (the `find-animation-opportunities` skill —
MIT, Copyright © Emil Kowalski). The forward-sweep framing, the four-stage gate,
the six hunting grounds, the mandatory rejected list and the three-part report
are from that source.

Converted to this pack's rules: the per-element millisecond bands are subordinated
to `motion-budget.md`'s page tier rather than stated as absolutes; easing and
spring values defer to `animation-framework.md` and `native-motion-physics.md`
instead of an inline token list; first-run delight is mapped to the budget's
"one signature moment" rule.

## What was corrected on the way in

| From the source | Change | Why |
|---|---|---|
| Per-element durations stated as fixed absolutes | Framed as the element band *within* the page's motion tier | `motion-budget.md` — an L1 page can reject motion that fits the element band |
| Spring dismissal `bounce: 0.1–0.3` | Stated as `bounce ≤ 0.2` | Matches `native-motion-physics.md` and the pack's position that UI overshoot reads dated; `MOTION-02R` |
| Inline easing-token list (`--ease-out`, `--ease-in-out`, `--ease-drawer`) | Dropped; cross-referenced instead | One source of truth for curves is `animation-framework.md`; a copied list drifts |
| "Delight (rare / first-time tier)" as its own category | Mapped to the budget's one-signature-moment rule | The pack already rations expressive motion by tier, not by a per-animation flag |
