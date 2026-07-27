# Validate Checklist (core)

Constraint IDs enforced by `scripts/` on every gold example. Self-check output against this before returning. Examples live in skill files, not here.

## Parser-enforced (AST — 16)

| ID | Rule |
|---|---|
| `A11Y-01` | `aria-*` exist as real JSX attributes, not comment décor |
| `A11Y-02` | `focus-visible` only on interactive / `tabIndex` / `role` elements |
| `A11Y-03` | `<img>`/`<Image>` declare `width`+`height` (or `fill`) |
| `MOTION-01` | `prefers-reduced-motion` is functional (matchMedia / hook / `@media` / `motion-reduce:`) |
| `MOTION-02` | No bare `ease-in` in entrance or timing context (exit-keyed is fine) |
| `TS-01-AST` | Declared `*Props` types exist **and are used** — no dead declarations |
| `COL-02-AST` | White surfaces banned on page containers, allowed on components |
| `DELAY-01-AST` | No `setTimeout` gating state inside a mount `useEffect(…, [])` |
| `COMP-01` | `forwardRef`, when used, takes `(props, ref)`, returns JSX, is exported |
| `PERF-01` | No barrel-file imports |
| `PERF-02` | No numeric `&&` in JSX (renders a literal `0`) |
| `PERF-04` | No `transition: all` / `transition-all` |
| `COPY-01` | No `...` in UI copy — use `…` |
| `3D-01` | R3F `<Canvas>` declares `dpr` |
| `3D-02` | No raw `requestAnimationFrame` in an R3F file |
| `3D-03` | Manual geometry/material construction is memoized |

## Regex-enforced (35)

Typography `TYP-01/02` · Colour `COL-01/03/04` · Accessibility `A11Y-01/02/04/05` · Animation `ANI-03` · States `STA-01/02` · Anti-slop `SLOP-01/02/03/04` · Responsive `RES-01/02` · Tokens `TOK-01/02` · Quality `QUA-01/02/03` · Delay `DELAY-01` · Copy `COPY-02` · Touch `TOUCH-01`, `SAFE-01` · Perf `PERF-04R`, `IMG-01` · Behaviour `BEHAV-05/06` · 3D `3D-04/05/06/07`.

## Self-checks (not machine-enforceable)

| ID | Rule |
|---|---|
| `BEHAV-01` | Every changed line traces directly to the user's request — no adjacent refactoring |
| `BEHAV-02` | No speculative abstraction — everything delivered is used |
| `BEHAV-03` | Success criteria were stated and are met |
| `BEHAV-04` | Any assumption was stated explicitly in the output |

**Total: 51 machine-enforced (16 parser + 35 regex) + 4 self-checks.**
