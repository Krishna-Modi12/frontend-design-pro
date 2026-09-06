# Testing Doctrine

Route: `CREATE_COMPONENT`, `REFINE_COMPONENT`, `TEST_COMPONENT`, BUILD → +testing.
Load after: `component-api.md`. This file says how to prove a component works; component-api says how to shape it.

## 1. Philosophy

**Every component that ships has a test that proves it works. Untested UI is incomplete UI.** A component review is not done when it renders — it is done when a test asserts the behavior a user depends on. Tests are written against the public contract (props, roles, events), never against implementation details (state variable names, class strings).

## 2. Test Stack

| Layer | Tool | When |
|---|---|---|
| Unit / interaction | Vitest + `@testing-library/react` + `@testing-library/user-event` | Component behavior, user events, state transitions |
| Accessibility | `jest-axe` (axe-core) | Static a11y violations on rendered output |
| Integration (optional, heavy) | Playwright | End-to-end flows, cross-page navigation, real browser |

Query priority (Testing Library): `getByRole` > `getByLabelText` > `getByText` > `getByTestId` (last resort). Testing by role is testing by accessibility — if you can't find it by role, neither can a screen reader.

## 3. Required Tests Per Component Type

**All components:** renders without crashing · applies a passed `className`/`style` if the prop is exposed · `forwardRef` forwards the ref to the DOM node.

**Interactive (button, input, dialog):** fires `onClick`/`onChange` via `userEvent` · keyboard — Enter/Space activate buttons, Escape closes overlays · focus — correct `tabIndex`, focus-trap boundaries hold.

**Form:** validation errors appear and link to the field via `aria-describedby` · submit handler receives the correct data shape · loading state disables inputs and shows a skeleton.

**Data (table, list):** empty state renders when `data.length === 0` · sort/filter updates the rendered rows · selection persists across re-renders.

**Overlay (modal, toast, dropdown):** `aria-hidden` applied to sibling content while open · focus returns to the trigger on close · toasts announce via `aria-live`.

## 4. Mock Policy

Mock the dependency, never the component under test.
- `motion/react` → mock so `motion.*` renders a plain element and `AnimatePresence` is a passthrough; real animation breaks fake timers and async assertions.
- `next/navigation` / `next/router` → mock `useRouter`, `usePathname`, `useSearchParams`.
- Three.js / `@react-three/fiber` / Spline → mock `Canvas` to a `<div>`; WebGL has no jsdom backend.
- TanStack Query → wrap in a real `QueryClientProvider` with a `createMockQueryClient()` (retries off, `gcTime: Infinity`); mock the fetch layer, not the hooks.
- Heavy charts (recharts) → mock `ResponsiveContainer` to a fixed-size `<div>` so children render.

```tsx
vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => (p: Record<string, unknown>) => <div {...p} /> }),
  AnimatePresence: (props: { children?: unknown }) => <>{props.children as never}</>,
  useReducedMotion: () => true,
}));
```

## 5. Accessibility Test Pattern

```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Run axe on the *rendered* output, not a snapshot. For overlays, open them first (axe only sees mounted DOM). axe catches static violations (missing labels, contrast, roles); it does not replace keyboard-interaction tests.

## 6. Anti-patterns

| Don't | Do |
|---|---|
| `expect(true).toBe(true)` / snapshot-only | Assert a user-visible outcome |
| Query by class or test-id first | `getByRole` / `getByLabelText` |
| `fireEvent.click` for full flows | `userEvent` (fires focus/keydown/up like a real user) |
| Assert on state variable names | Assert on rendered roles/text |
| Mock the component under test | Mock only its dependencies |
| `await new Promise(r => setTimeout(r, 500))` | `await screen.findBy…` / `waitFor` |

## Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-axe jsdom @vitejs/plugin-react
```

`vitest.config.ts`: `test: { environment: 'jsdom', globals: true, setupFiles: './vitest.setup.ts' }`; setup file imports `@testing-library/jest-dom` and extends `toHaveNoViolations`.
