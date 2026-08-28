# Expected findings — `e-contrast.html` → `e-contrast.fixed.html`

One engineering finding, taken end to end: `FOUND` on `e-contrast.html`,
`FIXED` by the edit that produces `e-contrast.fixed.html`, `VERIFIED` by
re-measuring the same node.

```text
✗ [LV-001] body copy contrast ~3.3:1 — below WCAG AA (4.5:1)   (HIGH · engineering · contrast)
  → e-contrast.html:24 (main p) — #68686b on #151517, normal-weight 16px text
  → fix: lift the text lightness — #68686b -> #8f8f92     [FOUND]

  FIXED    e-contrast.fixed.html:23 — p { color: #8f8f92 }
  VERIFIED re-measured same selector at same viewport — ~5.7:1, passes AA
```

## Assertions for the regression test

- on `e-contrast.html`: exactly **1** finding, `class: engineering`,
  `category: contrast`, `severity: HIGH`
- measured ratio is **below 4.5** (the `~3.3` is illustrative — the audit
  recomputes it; assert the threshold, not the exact value)
- `related_constraint: null` — contrast on rendered text is in the
  "covered by no constraint" bucket (COL-01/03/04 are about surface and
  gradient colour, not text-to-background ratio)
- on `e-contrast.fixed.html`: the same selector at the same viewport measures
  **at or above 4.5**, and the finding's `validation_state` is `VERIFIED`
- the transcript shows all three states in order: `FOUND` → `FIXED` →
  `VERIFIED`

## Why Layer A cannot catch this

The ratio is a property of two computed colours resolved by the browser. A
source checker would have to resolve every custom property, inherited colour and
`color-mix()` exactly as the engine does, on the real cascade — which is what
running the engine is for.
