# Live-audit golden fixtures

Deterministic, self-contained HTML pages, each carrying **exactly one** defect
that the source-level constraints (Layer A) structurally cannot see and the
rendered-DOM audit (Layer B, `../../references/live-verification.md`) must catch.
Each `*.html` has a sibling `*.expected.md` — the findings the audit is required
to produce, plus the assertions a regression test checks.

| Fixture | Defect | Expected finding |
|---|---|---|
| `a-overflow.html` | flex child with no `min-width: 0` | `responsive-overflow` · HIGH · engineering — present at 390px, absent at 1920px |
| `b-hierarchy.html` | h1 and h2 render 2px apart | `hierarchy` · MEDIUM · **critique** — never a failure |
| `c-modal.html` | hand-rolled modal does not restore focus on close | `focus-order` · HIGH · engineering |
| `d-console.html` | undefined global + 404 asset | `console-error` · BLOCKER, and `network-error` · HIGH |
| `e-contrast.html` → `e-contrast.fixed.html` | body copy ~3.3:1, under AA | `contrast` · HIGH, taken `FOUND` → `FIXED` → `VERIFIED` |

They are invisible to every gate: the constraint suites glob
`*/examples/*.html` one level deep, so a nested directory is not scanned; Gate 11
does not scan `skills/*/examples/`; Gate 10 reads only `*.md` code blocks, and
these `*.expected.md` files hold none.

Loadable over `file://` with no network except the intentional 404 in
`d-console.html`. Line numbers in the `*.expected.md` transcripts are for the
current fixture text — if you edit a fixture, re-check its sibling.
