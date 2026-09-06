# React Performance Best Practices (Vercel)

Route: `CREATE_COMPONENT`, `CREATE_PAGE` (dashboard), `OPTIMIZE_PERFORMANCE` → +react-performance. Shortcode `[performance]`.
Load after: `component-api.md`, `react-patterns.md`. Companion to `vercel-ui-rules.md` (prose form) — this file is the **citable rule taxonomy**: every rule has a stable ID you can quote in a review.
Source: vercel-labs/agent-skills · react-best-practices (70 rules, 8 categories).

Severity: **CRITICAL** ship-blocker · **HIGH** fix this sprint · **MEDIUM** fix when touched · **LOW** opportunistic.

## 1 · Eliminating waterfalls — `async-` (CRITICAL)

| ID | Rule |
|---|---|
| `async-cheap-condition-before-await` | Check cheap sync conditions before awaiting a flag or remote value |
| `async-parallel` | `Promise.all()` for independent operations |
| `async-defer-await` | Move `await` into the branch that actually uses it |
| `async-dependencies` | Partial dependencies: start what you can, await late |
| `async-api-routes` | In route handlers, start promises early, await late |
| `async-suspense-boundaries` | Stream with `<Suspense>` instead of blocking the whole route |

```tsx
// ✗ sequential — 2 round trips
const user = await getUser(id);
const posts = await getPosts(id);
// ✓ parallel — 1 round trip
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

## 2 · Bundle size — `bundle-` (CRITICAL)

| ID | Rule |
|---|---|
| `bundle-barrel-imports` | Import from the module, not a barrel `index.ts` |
| `bundle-analyzable-paths` | Keep import paths statically analyzable (no computed specifiers) |
| `bundle-dynamic-imports` | `next/dynamic` for heavy components (charts, editors, 3D) |
| `bundle-defer-third-party` | Load analytics/logging after hydration |
| `bundle-conditional` | Import a module only when its feature activates |
| `bundle-preload` | Preload on hover/focus for perceived speed |

```tsx
// ✗ pulls the whole library graph
import { Button } from "@/components";
// ✓ direct
import { Button } from "@/components/button";
```

## 3 · Server-side — `server-` (HIGH)

`server-cache-react` (`React.cache()` for per-request dedup) · `server-cache-lru` (cross-request) · `server-dedup-props` · `server-hoist-static-io` (fonts/logos at module level) · **`server-no-shared-module-state`** (module-level mutable request state leaks between users — a correctness bug, not just perf) · `server-serialization` (pass the minimum to client components) · `server-parallel-fetching` · `server-parallel-nested-fetching` · `server-after-nonblocking` (`after()` for logging/analytics) · `server-auth-actions` (authenticate Server Actions exactly like route handlers).

## 4 · Client data fetching — `client-` (MEDIUM-HIGH)

`client-swr-dedup` · `client-event-listeners` (dedupe global listeners) · `client-passive-event-listeners` (`{ passive: true }` on scroll) · `client-localstorage-schema` (version and minimize stored data).

## 5 · Re-render optimization — `rerender-` (MEDIUM)

`rerender-memo` · `rerender-memo-with-default-value` (hoist non-primitive defaults) · `rerender-dependencies` (primitive deps) · `rerender-derived-state` (subscribe to derived booleans) · **`rerender-derived-state-no-effect`** (derive during render — never `useEffect` + `setState`) · `rerender-functional-setstate` · `rerender-lazy-state-init` (`useState(() => expensive())`) · `rerender-simple-expression-in-memo` (don't memo primitives) · `rerender-split-combined-hooks` · `rerender-move-effect-to-event` · `rerender-transitions` (`startTransition`) · `rerender-use-deferred-value` · `rerender-use-ref-transient-values` · **`rerender-no-inline-components`** (a component defined inside a component remounts its subtree every render).

```tsx
// ✗ effect-derived state: extra render, stale flash
const [full, setFull] = useState("");
useEffect(() => { setFull(`${first} ${last}`); }, [first, last]);
// ✓ derive during render
const full = `${first} ${last}`;
```

## 6 · Rendering — `rendering-` (MEDIUM)

`rendering-content-visibility` (`content-visibility: auto` + `contain-intrinsic-size` on long lists) · `rendering-hoist-jsx` (static JSX outside the component) · **`rendering-conditional-render`** (ternary, not `&&` — `0 && <X/>` renders a literal `0`) · `rendering-resource-hints` (`preload`/`preconnect` via React DOM) · `rendering-animate-svg-wrapper` · `rendering-svg-precision` · `rendering-activity` · `rendering-usetransition-loading` · `rendering-hydration-no-flicker` · `rendering-script-defer-async`.

```tsx
{items.length > 0 ? <List items={items} /> : null}   // ✓
{items.length && <List items={items} />}             // ✗ renders "0"
```

## 7 · JavaScript — `js-` (LOW-MEDIUM)

`js-batch-dom-css` · `js-index-maps` (build a `Map` for repeated lookups) · `js-set-map-lookups` (O(1)) · `js-combine-iterations` (one pass, not filter→map→reduce) · `js-cache-property-access` · `js-cache-function-results` · `js-cache-storage` · `js-length-check-first` · `js-early-exit` · `js-hoist-regexp` · `js-min-max-loop` · `js-tosorted-immutable` · `js-flatmap-filter` · `js-request-idle-callback`.

## 8 · Advanced — `advanced-` (LOW)

`advanced-effect-event-deps` · `advanced-event-handler-refs` · `advanced-init-once` · `advanced-use-latest`.

## Audit output format

Report as `file:line — rule-id — one-line fix`, grouped by file, severity order. Example:
`app/dashboard/page.tsx:24 — async-parallel — two independent awaits; wrap in Promise.all`.
