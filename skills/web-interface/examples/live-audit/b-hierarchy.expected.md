# Expected findings — `b-hierarchy.html`

One **critique**-class finding. It is never reported as a failure and never
blocks the audit — it appears only in the separate, labelled critique section.

```text
~ [LV-001] h1 and h2 are 2px apart — the type ramp has collapsed, no visual hierarchy   (MEDIUM · critique · hierarchy)
  → b-hierarchy.html:22 (h1 / h2 rules) — computed h1 font-size 20px vs h2 18px; ratio 1.11
  → suggestion: widen the type ramp (e.g. h1 ~1.5x the h2 size) so scanning order is legible     [FOUND]
```

## Assertions for the regression test

- exactly **1** finding, `class: critique`
- `category: hierarchy`, `severity: MEDIUM`
- the finding does **not** change the audit's pass/fail verdict — a run whose
  only finding is this one still reports the page as passing Layer B
- evidence records both computed sizes (h1 20px, h2 18px) and their ratio
- `related_constraint: null`
- it is emitted in the `critique` array of the composed report, not
  `engineering`

## Why Layer A cannot catch this

Both headings are real semantic elements with real text and pass every A11Y and
TYP source check. "The type ramp collapsed" is a judgement about rendered sizes;
the pack has no constraint for it, and — per the engineering/critique split —
should not fail a build for taste.
