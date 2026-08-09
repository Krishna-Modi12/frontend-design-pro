# Testing

Two different things are called "tests" in this repo, and conflating them is how the claim in the README went stale once already.

| | What it asserts | Where it runs | Blocking? |
|---|---|---|---|
| **Gate 7** | Every gold example has a 1:1 `.test.tsx`, every test file compiles under strict TypeScript, **and the suite passes** | `scripts/build_release.py`, CI | **Yes** — blocks the release |
| **`npm test`** | The same suite, on its own, in about 35 seconds | vitest, locally | It *is* Gate 7's third layer |

## Current state

**45 of 45 test files, 176 of 176 tests.** Read off the same `npm run gates` that refuses to build an archive when it is not true.

Gate 7 degrades rather than lies. A fresh clone with no `npm install` has neither `tsc` nor `vitest`, and the gate names which layers actually ran instead of implying all three did.

## Why the suite could not run at all

Gold examples import ~25 peer libraries the repo deliberately does not install: the pack ships no runtime, and vendoring three.js, React Native and Storybook to render a markdown skill pack would be absurd. Those imports are satisfied for `tsc` by ambient `declare module` blocks in `skills/*/examples/_stubs.d.ts`.

**Declaration files do not exist at runtime.** They satisfy the type checker and are invisible to Vite, so every import of `motion/react`, `three`, `zod` and the rest failed to resolve and 29 of 39 files died before running a single assertion. Expanding `_stubs.d.ts` cannot fix this — it is the wrong layer.

The fix is resolution-level: `vitest.config.ts` aliases each specifier to a small **runtime** module under `test/stubs/`. Those modules are test-only — `build_release.py` ships `core/ skills/ scripts/ evals/ rules/ install/` plus four root files, and `test/` is in none of them. The rules they follow, and the failure that produced each rule, are in [`test/stubs/README.md`](../test/stubs/README.md).

## The three causes, once they were established

The first pass through this reached 20 of 39 and listed the remaining 19 as three unexplained clusters. Each had a single root cause, and none was the one that looked most likely.

### Worker exits — 8 files

Reported as `Error: Worker exited unexpectedly` after ~87s, which reads exactly like memory pressure. It was not. Those files were the ones whose `vi.mock` factory returned a **bare `new Proxy({}, { get })`**:

```ts
vi.mock('@react-three/drei', () => new Proxy({}, { get: () => Component }))
```

The trap answers *every* key, including `then`. Vitest does `await factory()`, JavaScript sees a thenable and calls `then(resolve, reject)` — which returns a React element and never calls `resolve`. The module never finishes loading, the file hangs, and the pool eventually kills the worker.

The tell: the eight affected files were exactly the eight with a bare-Proxy factory whose module was actually imported. `good-dashboard` has the same pattern for `recharts` and passed the whole time, because its gold never imports `recharts`, so the factory never ran.

All 64 inline `vi.mock` factories are now gone; the aliased stubs are the single source of truth.

### Missing accessible roles — 4 files

Not a stub gap. Three queried `getAllByRole('button')` against `<button role="tab">`, where the explicit role replaces the implicit one — so the query correctly matched nothing. They now assert that activating a tab moves `aria-selected`. The fourth read the first frame of a checkout that opens on a skeleton, and now waits with `findAllByRole`.

### Assertion failures — 7 files

The first pass concluded these needed real Radix/TanStack/zod behaviour, and that closing them meant reimplementing those libraries. Two were genuine defects in the golds; the rest were stubs that were wrong rather than merely shallow:

- `good-view-transitions.tsx` destructured `React.ViewTransition` and rendered it. That API ships only in React's experimental channel, so on a stable build it is `undefined` and the component threw for every consumer — not only under test. The `as unknown as` shim that kept it type-clean is what hid it from `tsc`.
- Both copies of `good-shadcn.tsx` gave the action column `header: ''`, rendering `<th></th>` — an axe `empty-table-header` violation, and a column a screen-reader user cannot identify.
- The rest were stub fidelity: `useQuery` reporting `isLoading: false` with no data (a state no real query client produces), a header `getContext()` returning `{}` so `column.getIsSorted()` threw, and `document.fonts` missing from jsdom.

## What the suite does and does not prove

It proves the examples mount, expose the roles and labels they claim, respond to interaction, and pass axe. It does **not** prove they work against the real `three`, `motion/react` or `react-hook-form`, and it will not while those are uninstalled.

Two rules keep the stubs from flattering the golds, and both are load-bearing:

- **Props are forwarded.** A stub that swallows them deletes `role`, `aria-label` and `onClick`, turning a passing accessibility assertion into a false negative — worse than the import error it replaced.
- **A stub that takes an ARIA role owns that role's name.** `role="dialog"` without `aria-labelledby`, or `role="combobox"` without `aria-expanded`, is an axe violation the real Radix component does not have. Emitting one fails a gold for a defect that exists only in the stub — the same error in the opposite direction.

Where jsdom has no answer — WebGL, layout, virtualisation — the stub renders nothing rather than something no user could perceive. A `<Canvas>` that rendered its scene graph into the DOM would let a test assert on content invisible to every real user, which is exactly why the golds put `role="img"` and an `aria-label` on the wrapper instead.

## Measuring this honestly

Each test file spins up its own jsdom environment. Unbounded, 39 of them are a real memory cost, and `vitest.config.ts` caps worker concurrency at 4 for that reason.

Note what that cap is *not* for. A silent worker exit was blamed on memory here once, and the cap was added on that theory; the actual cause was the thenable Proxy above. **Do not read `Worker exited unexpectedly` as resource pressure without checking whether a module is hanging at import** — the two are indistinguishable from the message alone, and one of them is a five-minute fix.

An interrupted run also leaves orphaned `node` workers behind, which poisons every subsequent measurement until they are cleared:

```bash
# Windows — check for orphans from an interrupted run
powershell "(Get-Process node -ErrorAction SilentlyContinue).Count"
```

## If you add a gold example

Add its `good-*.test.tsx` too — Gate 7 fails on a gold without one, and now also on a test that does not pass. If it imports a peer library nothing else uses, add a stub: one file per specifier, no exceptions, for the three reasons in [`test/stubs/README.md`](../test/stubs/README.md).

Whatever happens, the numbers in this file must be re-measured and updated in the same commit. A test-coverage claim that nobody re-derives is exactly the defect this repo keeps shipping.
