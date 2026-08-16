# Accessibility Baseline (core)

WCAG 2.2 AA is the floor, not the goal. Every skill inherits this; skill files add only what is specific to them.

## Structure

Semantic HTML before ARIA — `<button>`, `<a>`, `<label>`, `<table>` carry behaviour ARIA only describes. One `<h1>` per page, heading levels never skip. Landmarks (`main`, `nav`, `aside`, `footer`) on every page. Skip link to `#main-content` on full pages. `scroll-margin-top` on anchor targets.

## Keyboard

Everything interactive is reachable and operable: Tab order follows visual order · Enter and Space activate buttons · Escape closes overlays · Arrow keys drive composite widgets (tabs, menus, listboxes) via roving tabindex. Never `<div onClick>` — that is a button.

## Focus

`focus-visible:ring-2 ring-offset-2`, contrast ≥3:1 against both the component and the page (WCAG 2.2 §2.4.11). Never `outline: none` without a replacement. `:focus-visible` over `:focus` so clicks don't ring. `:focus-within` for compound controls. Modals trap focus while open and **return it to the trigger** on close, LIFO across stacked layers.

## Naming and state

Icon-only controls require `aria-label` — no exceptions. Inputs are wired to labels via `htmlFor`/`id`, errors via `aria-describedby`, invalidity via `aria-invalid`. Images take `alt` (empty for decorative). Decorative icons and canvases take `aria-hidden="true"`. Async changes announce through `aria-live="polite"` (`assertive` only for errors). Sortable columns carry `aria-sort`; disclosure triggers carry `aria-expanded` + `aria-controls`.

## Contrast and colour

Normal text ≥4.5:1, large text ≥3:1, non-text UI ≥3:1. Never convey meaning by colour alone — pair with icon, text or shape. Interaction states must *increase* contrast over rest. Where tooling supports it, APCA (Lc ≥75 body) is the better perceptual check; WCAG 2 remains the shipping gate.

**Inventing colour?** If your skill did not declare `core/design-tokens.md`, load it — ten of the nineteen route without it, and the wall bans raw hex without saying what a scale looks like.

## Touch and motion

Targets ≥44×44px — that is §2.5.5, which is **AAA**, and this pack's house rule. The **AA** floor is §2.5.8: 24×24 CSS px, or smaller with ≥24px of clear spacing. Hold 44 wherever a surface can be touched; `platform/references/desktop-patterns.md` is the one place the 24px floor applies, and it says which to pick and why. `touch-action: manipulation`. Any drag interaction needs a single-pointer alternative (§2.5.7). Help stays in a consistent position (§3.2.6). Never re-ask for data already given in the session (§3.3.7). No cognitive-test CAPTCHA without an alternative (§3.3.8). `prefers-reduced-motion` disables animation, autoplay, parallax and auto-rotation.

## States

Every data-dependent component ships four: `loading` (skeleton, never a mount-time `setTimeout`), `empty` (icon + headline + sub-copy + action — never bare "No data"), `error` (`role="alert"` + retry + how to fix), `success`.
