# Expected findings — `d-console.html`

Two engineering findings — one from the console pass, one from the network pass
(step 4).

```text
✗ [LV-001] uncaught ReferenceError: analytics is not defined   (BLOCKER · engineering · console-error)
  → d-console.html:37 — thrown at script module scope; statements after it never run
  → fix: guard the call (typeof analytics !== 'undefined') or load the analytics script first     [FOUND]

✗ [LV-002] asset request failed: ./hero-illustration.png does not load   (HIGH · engineering · network-error)
  → d-console.html:26 — <img> is broken on screen; request failed (404 over HTTP, ERR_FILE_NOT_FOUND over file://)
  → fix: ship the asset, correct the path, or remove the <img>     [FOUND]
```

## Assertions for the regression test

- exactly **2** findings, both `class: engineering`
- finding 1: `category: console-error`, `severity: BLOCKER`, evidence
  `kind: console`, message contains `analytics` and `not defined`
- finding 2: `category: network-error`, `severity: HIGH`, evidence
  `kind: network`, value names the failed asset `hero-illustration.png` and a
  failure status (HTTP 404, or a `file://` load error)
- `related_constraint: null` for both (neither is the render-residue of one of
  the 61)
- both `validation_state: FOUND`

## Why Layer A cannot catch this

`analytics.track(...)` is valid JavaScript — there is no type error to raise and
no ban-shaped pattern for "an undefined global". The `<img>` has `width`,
`height` and `alt`, so IMG-01 and A11Y-03 pass in source. Whether the request
actually resolves is only knowable from the network log.
