# Expected findings — `c-modal.html`

One engineering finding, caught by the targeted-interaction pass (step 6):
open the modal, close it, read `document.activeElement`.

```text
✗ [LV-001] modal does not restore focus on close — focus lands on <body>   (HIGH · engineering · focus-order)
  → c-modal.html:76 — after #close click, document.activeElement is BODY, not #open
  → fix: on close, call open.focus() (or return focus to the element that opened the modal)     [FOUND]
```

## Assertions for the regression test

- exactly **1** finding, `class: engineering`
- `category: focus-order`, `severity: HIGH`
- the sequence is: click `#open` → modal open, `#close` focused → click
  `#close` → modal hidden → `document.activeElement` is `BODY`
  (expected: `#open`)
- evidence names the element focus was expected on and the element it actually
  landed on
- `location.source` maps to the `close` handler (the commented DEFECT line)
- `related_constraint: null` — none of the 61 covers focus restoration
  (A11Y-06/07 are about the ring existing and icon-button labels, not where
  focus goes after a close)
- `validation_state: FOUND`

## Why Layer A cannot catch this

The source has a focusable trigger, `role="dialog"` + `aria-modal`, a label, and
a `:focus-visible` style — A11Y-01/02 and friends all pass. Focus *restoration*
is runtime behaviour: it only exists as a fact about `document.activeElement`
after an interaction, which no static read can produce. (A native `<dialog>`
opened with `showModal()` would restore focus automatically — the bug is that a
hand-rolled modal, which most component libraries and app code still use, does
not.)
