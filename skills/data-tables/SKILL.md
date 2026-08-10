---
name: data-tables
description: Tables, grids, charts and dashboards — sorting, filtering, pagination, selection, KPIs, data fetching.
version: "14.7.3"
core-deps:
  - core/component-api.md
  - core/accessibility-baseline.md
---

# Data Tables & Dashboards

## When to Use
Tabular or data-dense UI: data tables, lists, grids, pagination, sorting, filtering, row selection, KPI cards, charts, analytics dashboards, admin panels. Mentions of TanStack Table/Query route here.

## Stack
React 19 · TypeScript strict · Tailwind v4 · TanStack Table/Query · Recharts (default)

## Core Rules
1. **Semantic `<table>` for tabular data.** Never div-grids. Sortable headers use `<th aria-sort>` wrapping a `<button>`; the sort cycle is asc → desc → none.
2. **Selection.** Leading checkbox column, header checkbox carries the `indeterminate` state, bulk-action bar sits above the table and announces its count via `aria-live="polite"`.
3. **Overflow is keyboard-reachable.** Wrap in `overflow-x-auto` with `tabIndex={0}`, `role="region"` and an `aria-label`.
4. **Default to pagination.** Infinite scroll only for feeds where SEO is irrelevant, and always with a "Load more" button for keyboard users. Past ~100 rendered rows, virtualize.
5. **State lives in the URL.** Filters, sort, page and expanded panels go in query params so views are shareable and restorable.
6. **Numbers are `tabular-nums`** and formatted with `Intl.NumberFormat`; dates with `Intl.DateTimeFormat`. Never hardcode formats.
7. **Charts need a text equivalent.** `role="img"` plus an `aria-label` stating the trend; a summary line beside the chart serves both sighted scanners and screen readers.
8. **Four states per data surface.** Skeleton matching the final layout (no CLS), empty with a route out, error with `role="alert"` and retry, success.
9. **Never colour alone** for status — pair with icon or text.

## Patterns
- **TABLE-ROW** = search/filter bar + table + pagination.
- **METRIC-ROW** = 4 KPI cards (value, label, trend with direction icon, optional sparkline).
- **CHART-ROW** = large chart (2/3) + summary panel (1/3), or two medium charts.
- **Optimistic mutation** — update the cache, roll back on error (see tanstack-query).
- **DASH-LAYOUT** = sidebar 240px + header 56px + flexible content.

## Examples
`examples/good-data-table.tsx` (sort, select, paginate, all states) · `examples/good-tanstack.tsx` (useQuery/useMutation/useInfiniteQuery, optimistic) · `examples/good-dashboard.tsx` (KPI + charts).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| Table/KPI/chart/feed pattern anatomy (P-09…P-12), pagination-vs-infinite matrix | `../landing-pages/references/design-patterns.md` |
| 25 chart types with accessibility ratings | `references/chart-types.md` |
| Queries, mutations, infinite scroll, SSR prefetch | `references/tanstack-query.md` |
| URL state (nuqs), localStorage, cross-tab sync | `references/memory-persistence.md` |

## Constraints
Semantic table markup with `aria-sort` · keyboard-reachable overflow · `tabular-nums` and `Intl.*` formatting · four states with skeletons that don't shift layout · OKLCH tokens · TypeScript strict · WCAG 2.2 AA · no mount-time fake delays.
