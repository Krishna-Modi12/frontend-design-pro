# Testing

Two different things are called "tests" in this repo, and conflating them is how the claim in the README went stale.

| | What it asserts | Where it runs | Blocking? |
|---|---|---|---|
| **Gate 7** | Every gold example has a 1:1 `.test.tsx`, and every test file compiles under strict TypeScript | `scripts/build_release.py`, CI | **Yes** — blocks the release |
| **`npm test`** | The tests actually execute and their assertions hold | vitest, locally | **No** — not run in CI |

Gate 7 is the contract. `npm test` is a development convenience that is **partially green**, and this file says exactly how partially, because "runtime exec is out of scope" was true before and is not true now.

## Current state

**20 of 39 test files pass.** Measured per-file with a 60s cap on a machine with no competing load:

```bash
for f in skills/*/examples/*.test.tsx; do npx vitest run "$f"; done
```

Run the whole suite at once and you will get a different, worse answer — see *Measuring this honestly* below.

## Why most of them used to fail

Gold examples import ~25 peer libraries the repo deliberately does not install: the pack ships no runtime, and vendoring three.js, React Native and Storybook to render a markdown skill pack would be absurd. Those imports are satisfied for `tsc` by ambient `declare module` blocks in `skills/*/examples/_stubs.d.ts`.

**Declaration files do not exist at runtime.** They satisfy the type checker and are invisible to Vite, so every import of `motion/react`, `three`, `zod` and the rest failed to resolve and 29 of 39 files died before running a single assertion. Expanding `_stubs.d.ts` cannot fix this — it is the wrong layer.

The fix is resolution-level: `vitest.config.ts` aliases each specifier to a small **runtime** module under `test/stubs/`. Those modules are test-only — `build_release.py` ships `core/ skills/ scripts/ evals/ rules/ demo/ install/` plus four root files, and `test/` is in none of them.

A second cause was self-inflicted: 34 test files carried a hand-written `vi.mock('motion/react', …)` whose Proxy rendered *every* motion element as a `<div>` and forwarded animation props to the DOM. That silently turned `motion.h1` into a non-heading, so `getAllByRole('heading')` found nothing. `vi.mock` outranks a resolve alias, so those mocks were overriding the correct stub. They were removed; the shared stub maps tag names properly and strips motion-only props.

## The 19 that still fail

### Worker exits — 8 files

`threejs-3d/good-3d{,-interaction,-loader,-scene,-shader}`, `data-tables/good-dark-mode`, `design-system/good-dark-mode`, `platform/good-react-native`.

The worker process exits silently during module load — `transform` completes, then `setup 0ms`, `collect 0ms`, and the pool reports `Worker exited unexpectedly` after ~87s. It reproduces one file at a time on an idle machine, under both the `threads` and `forks` pools, so it is not contention. Root cause is not established; these components reach for environments jsdom does not provide (a WebGL context, a native module bridge), which is the most likely explanation but is not proven.

**Do not read a silent worker exit as a component defect without checking machine load first** — see below.

### Missing accessible button — 4 files

`ai-ui-generation`, `component-patterns`, `react-components/good-composition-patterns`, `forms/good-checkout`.

These query a `role="button"` that the stubbed component tree does not produce. The shadcn stub renders a real `<button>`, so the gap is in a composition path that wraps or replaces it. Fixable with more faithful stubs; not fixed here.

### Assertion failures — 7 files

`animations/good-{scroll,view-transitions,vt-shared-element}`, `data-tables/good-tanstack`, `forms/good-rhf`, `iconography/good-shadcn`, `react-components/good-shadcn`.

Assertions that depend on behaviour the stubs deliberately do not model: Radix portals and focus management, TanStack's real row model, zod validation actually running. Making these pass means reimplementing shadcn/ui, Radix and zod inside `test/stubs/` — a larger and worse project than the gap it closes.

## Measuring this honestly

Each test file spins up its own jsdom environment. Unbounded, 39 of them exhaust memory on a 16 GB machine and the pool starts reporting `Worker exited unexpectedly` — **a resource failure that is indistinguishable from a component crash** and will send you debugging the wrong thing. It also leaves orphaned `node` workers behind when a run is interrupted, which poisons every subsequent measurement until they are cleared.

`vitest.config.ts` caps worker concurrency at 4 for this reason. Before trusting any number:

```bash
# Windows — check for orphans from an interrupted run
powershell "(Get-Process node -ErrorAction SilentlyContinue).Count"
```

If that is more than a handful and no dev server is running, kill them and measure again.

## What would close the gap

In rough order of value per unit of work:

1. **The 4 button failures** — trace which wrapper eats the `role`, fix that stub. Cheapest real win.
2. **The 8 worker exits** — establish the actual cause first. If it is a missing browser API, a targeted polyfill in `vitest.setup.ts` fixes a whole cluster.
3. **The 7 assertion failures** — needs real library behaviour. The honest options are installing the real packages as devDependencies, or accepting these as permanently out of scope. Do not fake it with stubs that assert their own mock data back.

Whatever happens, the number in this file must be re-measured and updated in the same commit. A test-coverage claim that nobody re-derives is exactly the defect this repo keeps shipping.
