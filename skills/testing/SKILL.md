---
name: testing
description: Component testing — Vitest, Testing Library, jest-axe, Playwright e2e, Storybook stories, mock policy. Use when writing or augmenting tests — unit and interaction tests, accessibility assertions, end-to-end flows, Storybook stories, test setup and mocking — or when a component has been delivered without coverage.
metadata:
  version: "14.10.1"
  core-deps:
    - core/component-api.md
    - core/validate-checklist.md
---

# Testing

## When to Use
Writing or augmenting tests: unit/interaction tests, accessibility assertions, end-to-end flows, Storybook stories, test setup and mocking. Also when a component is delivered without coverage — every shipped component needs a test.

## Stack
Vitest + jsdom · `@testing-library/react` + `user-event` · `jest-axe` · Playwright (e2e) · Storybook 8 CSF3

## Core Rules
1. **Untested UI is incomplete UI.** A component is done when a test asserts the behaviour a user depends on — not when it renders.
2. **Test the public contract**, never implementation. Assert on rendered roles and text, never on state variable names or class strings.
3. **Query priority:** `getByRole` > `getByLabelText` > `getByText` > `getByTestId`. If you can't find it by role, neither can a screen reader — that's a finding, not a test problem.
4. **`userEvent`, not `fireEvent`,** for flows — it fires the full focus/keydown/keyup sequence a real user produces.
5. **Every component gets three tests minimum:** renders (asserting real DOM), one role-based interaction, one `jest-axe` pass.
6. **Mock the dependency, never the component under test.** Typed stubs only — no `any`.
7. **No arbitrary waits.** `await screen.findBy…` or `waitFor`, never `setTimeout`.
8. **No placeholder assertions.** `expect(true).toBe(true)` is not a test.
9. **Per component type:** forms assert error wiring via `aria-describedby`; data components assert the empty state; overlays assert focus return and `aria-hidden` on siblings; interactive components assert keyboard activation.

## Patterns
- **Mock policy** — `motion/react` → passthrough proxy; `next/navigation` → stub router; R3F/drei/`three` → `Canvas` becomes a `<div>` (no WebGL in jsdom); TanStack Query → real provider, mocked fetch; recharts → sized `<div>`.
- **axe pass** — `expect(await axe(container)).toHaveNoViolations()` on mounted DOM; open overlays first.
- **Play functions** — Storybook CSF3 `play` with `userEvent` doubles as an interaction test.
- **e2e** — Playwright with role selectors, `checkA11y`, network mocking, keyboard/focus assertions.

## Examples
Every gold example across all skills ships a colocated `*.test.tsx` — read any of them as a reference implementation. `examples/good-playwright.tsx` demonstrates an e2e dashboard surface.

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Doctrine, stack, per-type requirements, mock policy, anti-patterns | `references/testing.md` |
| Playwright: role selectors, visual regression, axe, CI config | `references/playwright.md` |
| Storybook 8 CSF3, argTypes, decorators, autodocs, Chromatic | `references/storybook.md` |

## Constraints
Zero `any` in test files · zero placeholder assertions · role-based queries first · typed mocks · every gold has a colocated `.test.tsx` (release Gate 7) · tests compile under `tsc --noEmit --strict`.
