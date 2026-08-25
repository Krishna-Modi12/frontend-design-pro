# State matrix

"All four states" is already the single most-repeated rule in this pack —
`loading / empty / error / success` appears, nearly verbatim, as a numbered
`## Core Rules` item in `skills/data-tables/SKILL.md` ("Four states per data
surface") and `skills/forms/SKILL.md` ("Four states always"), and again in
the `## Constraints` self-check summary line of seven more skills
(`platform`, `landing-pages`, `react-components`, `web-interface`,
`design-principles`, `ai-ui-generation`, `threejs-3d`), plus
`core/validate-checklist.md`, `README.md`, `docs/USAGE.md` and
`docs/CLAUDE_SETUP.md`. This file does not add a new rule. It is the one
place that formalizes what those restatements actually mean per surface
type, cited against the real gold examples that already implement it, and it
states plainly which half of the rule is machine-checked and which half is
not — the same class of honesty `CLAUDE.md`'s "The rules no gate reads"
section applies elsewhere in this repo.

Not placed under `core/`: doing so would add a 9th file to the `core_files`
figure `scripts/check_figures.py` tracks, which several documents cite as
"8 core files" — a real doc-sweep cost, and one this reference does not need
to pay, since nothing here is meant to be a core-dep loaded into every
matching request. It sits in `docs/`, next to `docs/CAPABILITY_MATRIX.md`.

## What's actually machine-checked, and what isn't

Only two of the four states have a constraint behind them at all
(`scripts/test_constraints.py`):

| State | Constraint | What it actually checks | Strength |
|---|---|---|---|
| Loading | `STA-01` | `animate-pulse\|isLoading\|isSubmitting\|isPending\|aria-busy\|skeleton\|Skeleton` present anywhere in the file | Presence of an idiomatic name — does not verify the skeleton matches the final layout, or that it's wired to a real async boundary |
| Error | `STA-02` | The bare word `error` or `Error` present anywhere in the file | Word-presence only. A comment, an unused import, or an `errorBoundary` prop name never rendered would all satisfy it. The real bar is what the golds below actually do — `role="alert"`, a specific message, a retry action — none of which `STA-02` requires |
| Empty | — none — | — | Enforced by nothing. A component that never renders a zero-result branch passes every gate |
| Success | — none — | — | Enforced by nothing, for the same reason — it's usually the fallback branch, so it's present by construction, but nothing confirms it's reachable or correct |

This is not a gap this file closes — a general "empty state exists" check
would need to know what "empty" means for the specific surface (see below),
which is exactly the kind of per-context judgment call `docs/RESEARCH.md`
already declined to force into a regex for the four deferred WCAG 2.2 SCs.
Recorded here so the next reader doesn't assume `STA-01`/`STA-02` verify
more than they do.

## What "empty" and "success" mean, per surface — from the real golds

The bare labels `loading/empty/error/success` hide a real difference: what
counts as "empty" is not the same shape on a data surface as it is on a form.

### Data surface (table, list, grid)

Source: `skills/data-tables/examples/good-data-table.tsx`.

| State | Trigger | What renders | Route out |
|---|---|---|---|
| Loading | `isLoading` true | Skeleton rows matching the final row count/layout (no CLS) — `Array.from({length:8}, ...) => <SkeletonRow/>` | — |
| Empty | fetch succeeded, `pageRows.length === 0` | An in-place row (not a full-page swap) explaining *why* it's empty — here, "No users match \"{search}\"" | A specific action out of the empty state — here, "Clear search" (a zero-results-from-filtering empty state and a zero-data-ever empty state warrant different copy and a different route out; this gold only demonstrates the filtered case) |
| Error | fetch failed, `error` truthy | A full-surface replacement, `role="alert"`, an icon, a specific message ("Could not connect to the analytics service"), never the raw error object | `Retry` button calling the same fetch |
| Success | fetch succeeded, rows present | The normal table body | — |

Note the branch order in the gold (`isLoading ? … : pageRows.length === 0 ? … : …`,
line ~466): error is handled as an early return *before* this ternary, empty
and success share one ternary after it. Loading and error each replace the
whole surface; empty replaces only the row area, because the toolbar
(search, column headers) stays interactive and is often the way *out* of
the empty state.

### Form / checkout flow

Source: `skills/forms/examples/good-checkout.tsx`.

The label itself changes here — this gold's own state type is
`"loading" | "ready" | "error" | "success"`, not `"empty"`. A form has
nothing to be empty *of* before the user acts; the state a data surface
calls "empty" doesn't have a form-shaped equivalent, so the fourth label is
"ready" — the form is mounted and awaiting input. Copy this type directly
rather than reinventing the union per component:

```ts
type PageState = "loading" | "ready" | "error" | "success"
const [pageState, setPageState] = useState<PageState>("loading");
```

| State | Trigger | What renders |
|---|---|---|
| Loading | initial mount, before the payment intent resolves | Skeleton matching the real form's field layout |
| Ready | intent resolved | The real `PaymentElement` + order summary |
| Error | `confirmPayment` returns an error | An alert region with the specific failure, form remains editable (never re-ask for data already entered — `docs/CAPABILITY_MATRIX.md`'s WCAG 3.3.7 note applies here too) |
| Success | payment confirmed | Confirmation screen, not a toast — this is the terminal state of the flow, not a transient notice |

### Presentational component (not itself async)

`STA-01`'s own check comment states this precisely: "a presentational
component has no async of its own" — if a component receives `isLoading`/
`error` as *props* rather than owning a fetch, the four states still apply,
but the component's job is to render whatever state its parent hands it
correctly, not to own the state machine. Don't add a fetch to a component
that shouldn't have one just to satisfy the constraint scanner directly —
scan it in context (`--component` mode, `docs/TROUBLESHOOTING.md`), or
verify the state contract at the parent.

## Choosing a shape

Three shapes appear across the real golds; pick the narrowest one that fits:

- **A closed union with no payload**, when the state itself carries no data
  (`"loading" | "ready" | "error" | "success"` — `good-checkout.tsx`).
- **Independent booleans/derived conditions**, when states can be
  determined from data already in scope rather than tracked separately
  (`isLoading` boolean + `pageRows.length === 0` derived + `error` truthy —
  `good-data-table.tsx`). This is the right shape when "empty" isn't a
  distinct fetch outcome but a property of the data you already have.
- **A discriminated union with a payload**, when a state needs data the
  others don't (an error state needs a message, a success state needs the
  fetched rows). Prefer this over four separate `useState` calls that can
  drift out of sync (an `isLoading` still `true` alongside a populated
  `data` array is a real bug this shape makes structurally impossible):

  ```ts
  type AsyncState<T> =
    | { status: "loading" }
    | { status: "empty" }
    | { status: "error"; message: string }
    | { status: "success"; data: T };
  ```

  Nothing in this pack's golds currently uses this fourth shape — it's
  included because it's the standard fix for the boolean-drift failure mode
  the independent-booleans shape above is exposed to on a component with a
  more complex fetch lifecycle than either gold needed. Reach for it when
  independent booleans start requiring a comment to explain which
  combinations are actually reachable.
