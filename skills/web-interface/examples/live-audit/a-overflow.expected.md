# Expected findings — `a-overflow.html`

One engineering finding. The document scrolls sideways at 390px and does not at
1920px, so it must be caught by the width sweep (step 3) and the overflow check
(step 4), not by either width alone.

```text
✗ [LV-001] body scrolls sideways at 390px — horizontal overflow   (HIGH · engineering · responsive-overflow)
  → a-overflow.html:17 (.card) — scrollWidth > clientWidth at 390x844; clean at 1920x1080
  → fix: min-width: 0 on .card AND overflow-wrap: anywhere (or truncation) on .ref     [FOUND]
```

## Assertions for the regression test

- exactly **1** finding, `class: engineering`
- `category: responsive-overflow`, `severity: HIGH`
- overflow is present at viewport `390x844` and **absent** at `1920x1080`
- `evidence.kind: measurement`, and the value shows `scrollWidth` exceeding
  `clientWidth` (documentElement or body)
- `location.source.file` ends with `a-overflow.html`; the mapped line is the
  `.card` flex child or the `.ref` token, i.e. within the commented DEFECT span
- `related_constraint: RES-01`
- `validation_state: FOUND`

## Why Layer A cannot catch this

The source is `display: flex` plus a child with a long unbroken string. No
ban-shaped pattern matches it; RES-01 checks that overflow utilities exist on
text containers, not that the rendered layout actually stays within the
viewport.
