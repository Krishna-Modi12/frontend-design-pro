# Validate Checklist (core)

Constraint IDs enforced by `scripts/` on every gold example. Self-check output against this before returning. Examples live in skill files, not here.

## Parser-enforced (AST — 17)

| ID | Rule |
|---|---|
| `A11Y-01` | `aria-*` exist as real JSX attributes, not comment décor |
| `A11Y-02` | `focus-visible` only on interactive / `tabIndex` / `role` elements |
| `A11Y-03` | `<img>`/`<Image>` declare `width`+`height` (or `fill`) |
| `MOTION-01` | `prefers-reduced-motion` is functional (matchMedia / hook / `@media` / `motion-reduce:`) |
| `MOTION-02` | No bare `ease-in` in entrance or timing context (exit-keyed is fine) |
| `ANI-04` | No `scroll` listener calling `setState` un-batched — re-renders every frame. Throttled/debounced/rAF handlers pass; prefer `useScroll()`, ScrollTrigger, IntersectionObserver |
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

## Regex-enforced (44)

Typography `TYP-01/02/03` · Colour `COL-01/03/04` · Accessibility `A11Y-04/05/06/07/08` · Animation `ANI-03`, `MOTION-02R` · States `STA-01/02` · Anti-slop `SLOP-01/02/03/04/05/06` · Responsive `RES-01/02/03` · TypeScript `TS-02` · Forms `FORM-01` · Platform `PLAT-01` · Tokens `TOK-01/02` · Quality `QUA-01/02/03` · Delay `DELAY-01` · Copy `COPY-02` · Touch `TOUCH-01`, `SAFE-01` · Perf `PERF-04R`, `IMG-01` · Behaviour `BEHAV-05/06` · 3D `3D-04/05/06/07`.

`RES-03` (no `min-h-screen`), `TS-02` (no `React.FC`) and `PLAT-01` (no `onPress` on web) are named in the anti-slop wall and were, until recently, enforced by nothing — the anti-examples had even begun annotating `❌ [RES] min-h-screen`, citing an ID the suite did not define. `PLAT-01` exempts any file importing from `react-native`/`expo`, where `onPress` is the correct handler rather than a mistake.

`A11Y-06`, `TYP-03` and `FORM-01` are three defects the field ships and almost nobody checks. The claim was verified against source, not assumed, across eight packs — impeccable (46 detector rules), ui-ux-pro-max-skill, `anthropics/skills` frontend-design, taste-skill, awesome-claude-design, vercel-labs/web-interface-guidelines and emilkowalski/skill. Only impeccable enforces any of them — a `gradient-text` detector that fires unconditionally, including on display headings. Its font-size floor for interactive text is 11px, so a 14px input passes it; its iOS-zoom guidance is prose in `harden.md`, enforced by nothing. None of the four has any rule for `outline-none` with no replacement indicator.

- **`A11Y-06`** — `outline-none` with no focus indicator. `A11Y-02` (AST) checks that a `focus-visible` class sits on an interactive element, which catches the ring being in the *wrong place*; it cannot catch the outline being removed and replaced with nothing. Either `focus:` or `focus-visible:` satisfies this — the rule is that a visible indicator exists, not which variant spells it. A focus-trapped dialog container is the one legitimate bare `outline-none`, and takes a documented exemption.
- **`TYP-03`** — `bg-clip-text` on body-sized text. Legitimate on a display heading. On prose it sets the computed colour to `transparent`, which destroys contrast *and* silently defeats every contrast checker, because the ratio gets measured against a colour no reader ever sees.
- **`FORM-01`** — an `input`, `textarea` or `select` carrying `text-sm` (14px) or `text-xs` (12px). Below 16px, focusing the field makes iOS Safari zoom the viewport, and it does not zoom back on blur. Invisible on desktop, universal on iPhone. `text-sm sm:text-base` is the same bug: the small value is the one mobile gets. Adding it found **11 instances in this pack's own golds and 11 more in its references**, including five in `auth-patterns.md`.

`MOTION-02R` widens `MOTION-02`'s concern from easing *direction* to easing *quality*: no bounce, elastic or back easing, and no spring `bounce` above 0.4. It is anchored on the `ease`/`easing` property, so the `animate-bounce` utility and Framer's `dragElastic` prop are untouched — neither is an easing curve.

## Self-checks (not machine-enforceable)

| ID | Rule |
|---|---|
| `BEHAV-01` | Every changed line traces directly to the user's request — no adjacent refactoring |
| `BEHAV-02` | No speculative abstraction — everything delivered is used |
| `BEHAV-03` | Success criteria were stated and are met |
| `BEHAV-04` | Any assumption was stated explicitly in the output |

**Total: 61 machine-enforced (17 parser + 44 regex) + 4 self-checks.** Every ID is unique to one suite — the regex `A11Y-01`/`A11Y-02` were renumbered to `A11Y-07`/`A11Y-08` because they named different rules from the parser checks of the same number, and the regex widening of `MOTION-02` takes the suffixed ID `MOTION-02R` for the same reason (as `PERF-04`/`PERF-04R` already do).
