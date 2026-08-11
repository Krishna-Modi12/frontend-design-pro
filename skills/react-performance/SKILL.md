---
name: react-performance
description: React/Next.js performance — waterfalls, bundle size, RSC, memoization, rendering, virtualization, Core Web Vitals.
version: "14.7.4"
core-deps:
  - core/component-api.md
  - core/validate-checklist.md
---

# React Performance

## When to Use
Performance work and audits: slow pages, request waterfalls, oversized bundles, unnecessary re-renders, long lists, Core Web Vitals (LCP/INP/CLS), Server Component boundaries, lazy loading, prefetching.

## Stack
React 19 · Next.js App Router · TypeScript strict

## Core Rules
1. **Parallelize independent I/O.** `Promise.all()` for anything that doesn't depend on the previous result (`async-parallel`). Check cheap sync conditions *before* awaiting.
2. **Never import from a barrel.** `@/components` pulls the whole graph; import the module (`bundle-barrel-imports`). Keep import paths statically analyzable.
3. **Dynamic-import heavy components** — charts, editors, 3D, PDF — via `next/dynamic` (`bundle-dynamic-imports`). Defer analytics until after hydration.
4. **`React.cache()` for per-request dedup** in RSC; never module-level mutable request state (that's a correctness bug, not just perf). Pass the minimum across the server/client boundary.
5. **Derive during render, never in an effect.** `useEffect` + `setState` to compute a value costs an extra render and flashes stale UI (`rerender-derived-state-no-effect`).
6. **Memoize only with a named problem.** `useMemo`/`memo` on a primitive or a cheap expression is noise. Hoist non-primitive defaults; use functional `setState` for stable callbacks.
7. **Never define a component inside a component** — it remounts its whole subtree every render.
8. **Ternary, not `&&`, for conditional JSX** when the left side is numeric — `items.length && <List/>` renders a literal `0`.
9. **Long lists:** `content-visibility: auto` with `contain-intrinsic-size`, or virtualize past ~100 rendered rows.
10. **`startTransition`/`useDeferredValue`** to keep input responsive while an expensive tree re-renders.

## Patterns
- **Waterfall audit** — read the request timeline, find sequential awaits with no data dependency, collapse into `Promise.all`.
- **Bundle audit** — check for barrel imports, non-analyzable paths, heavy libs in the main chunk.
- **Suspense streaming** — stream the shell, suspend the slow region.
- **Prefetch on intent** — preload on hover/focus for perceived instantaneity.
- **Audit output** — `file:line — rule-id — one-line fix`, severity-ordered.

## Examples
`examples/good-perf.tsx` (virtualizer, lazy, memo, prefetch) · `examples/good-performance-patterns.tsx` (Promise.all, dynamic import, content-visibility, index maps) · `examples/bad-performance.tsx` (anti-example).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| The 70-rule taxonomy with citable IDs across 8 categories | `references/react-performance.md` |
| Vercel UI + React perf rules in prose form | `references/vercel-ui-rules.md` |
| App Router, RSC, Server Actions, caching, Turbopack | `references/nextjs-patterns.md` |
| Component size, state init, import and type optimization | `references/token-optimization.md` |
| Promise.all/allSettled, workers, streaming SSR, IO batching | `references/parallelization.md` |

## Constraints
`PERF-01` no barrel imports · `PERF-02` no numeric `&&` in JSX · `PERF-04` no `transition: all` · `IMG-01` images declare dimensions · plus the shared baseline. Measure before optimizing — an unmeasured "optimization" is speculative complexity (P2).
