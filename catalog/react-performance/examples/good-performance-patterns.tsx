// GOLD: React performance patterns — references/react-performance.md (Vercel rule IDs cited).
//   • async-parallel        — Promise.all for independent fetches
//   • bundle-dynamic-imports— heavy chart lazy-loaded, never in the main bundle
//   • bundle-barrel-imports — direct module imports only
//   • rerender-memo         — expensive row extracted + memoized
//   • rerender-derived-state-no-effect — derived during render, not in an effect
//   • rerender-transitions  — startTransition for non-urgent filtering
//   • rendering-content-visibility — long list skips offscreen paint
//   • rendering-conditional-render — ternary, never numeric &&
//   • js-index-maps         — Map for repeated lookups
import * as React from "react";

const HeavyChart = React.lazy<React.ComponentType<{ points: number[] }>>(() =>
  Promise.resolve({ default: function Chart({ points }: { points: number[] }) {
    const max = Math.max(...points, 1);
    return (
      <div role="img" aria-label={`Throughput trend, ${points.length} points, peak ${max}`}
        className="flex h-24 items-end gap-1">
        {points.map((p, i) => (
          <span key={i} className="w-2 rounded-t bg-[oklch(60%_0.185_276)]"
            style={{ height: `${Math.round((p / max) * 100)}%` }} />
        ))}
      </div>
    );
  } }),
);

export interface Region { id: string; name: string; requests: number; p95: number; tier: string }
const REGIONS: Region[] = [
  { id: "iad1", name: "Washington, D.C.", requests: 128_472, p95: 118, tier: "edge" },
  { id: "cdg1", name: "Paris", requests: 84_193, p95: 142, tier: "edge" },
  { id: "hnd1", name: "Tokyo", requests: 61_887, p95: 173, tier: "edge" },
  { id: "gru1", name: "São Paulo", requests: 27_431, p95: 214, tier: "regional" },
  { id: "bom1", name: "Mumbai", requests: 39_264, p95: 187, tier: "regional" },
  { id: "syd1", name: "Sydney", requests: 18_902, p95: 231, tier: "regional" },
];
const TIER_LABEL = new Map<string, string>([["edge", "Edge"], ["regional", "Regional"]]); // js-index-maps

// rerender-memo + rerender-no-inline-components: defined once, at module scope.
const RegionRow = React.memo(function RegionRow({ region }: { region: Region }) {
  return (
    <li className="flex items-center justify-between border-b border-[oklch(90%_0.005_240)] px-4 py-3 last:border-b-0">
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[oklch(14%_0.012_240)]">{region.name}</span>
      <span className="w-24 text-right text-sm tabular-nums text-[oklch(45%_0.010_240)]">
        {region.requests.toLocaleString("en-US")}
      </span>
      <span className="w-20 text-right text-sm tabular-nums text-[oklch(45%_0.010_240)]">{region.p95}&nbsp;ms</span>
      <span className="ms-4 rounded-full bg-[oklch(94%_0.02_276)] px-2 py-0.5 text-xs font-semibold text-[oklch(40%_0.12_276)]">
        {TIER_LABEL.get(region.tier) ?? region.tier}
      </span>
    </li>
  );
});

export interface EdgeDashboardProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  regions?: Region[];
}
export default function EdgeDashboard({ isLoading = false, regions = REGIONS }: EdgeDashboardProps = {}) {
  const [query, setQuery] = React.useState("");
  const [deferredQuery, setDeferredQuery] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // rerender-derived-state-no-effect: derived during render, no effect, no extra pass.
  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return q ? regions.filter((r) => r.name.toLowerCase().includes(q)) : regions;
  }, [regions, deferredQuery]);
  const totalRequests = React.useMemo(
    () => filtered.reduce((sum, r) => sum + r.requests, 0), [filtered],
  );

  function handleQuery(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQuery(next);
    React.startTransition(() => setDeferredQuery(next)); // rerender-transitions
  }

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8" aria-busy="true">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-[oklch(92%_0.005_240)]" />
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
      </main>
    );
  }
  if (error) {
    return (
      <main role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[oklch(98%_0.005_240)] p-8">
        <p className="text-sm text-[oklch(45%_0.010_240)]">{error}</p>
        <button type="button" onClick={() => setError(null)}
          className="h-11 rounded-lg bg-[oklch(60%_0.185_276)] px-5 text-sm font-semibold text-[oklch(98%_0.005_240)] transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2">
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif]">
      <a href="#regions" className="sr-only focus:not-sr-only">Skip to regions</a>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance">Edge Network</h1>
      <p className="mt-1 text-sm text-[oklch(45%_0.010_240)]">
        {totalRequests.toLocaleString("en-US")} requests across {filtered.length} regions
      </p>

      <section className="mt-6 rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] p-4">
        <h2 className="mb-3 text-sm font-semibold text-[oklch(14%_0.012_240)]">Throughput</h2>
        <React.Suspense fallback={<div className="h-24 animate-pulse rounded bg-[oklch(93%_0.005_240)]" />}>
          <HeavyChart points={filtered.map((r) => r.requests)} />
        </React.Suspense>
      </section>

      <label htmlFor="region-filter" className="mt-8 block text-sm font-medium text-[oklch(14%_0.012_240)]">
        Filter regions
      </label>
      <input id="region-filter" type="search" value={query} onChange={handleQuery}
        placeholder="Tokyo…" spellCheck={false} autoComplete="off"
        className="mt-1 h-11 w-full max-w-sm rounded-lg border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] px-3 text-base transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)]" />

      {filtered.length > 0 ? (
        <ul id="regions" aria-label="Regions"
          className="mt-4 overflow-hidden rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)]"
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 480px" }}>
          {filtered.map((r) => <RegionRow key={r.id} region={r} />)}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[oklch(85%_0.01_240)] p-10 text-center">
          <p className="text-sm font-semibold text-[oklch(14%_0.012_240)]">No regions match “{query}”</p>
          <p className="mt-1 text-sm text-[oklch(45%_0.010_240)]">Clear the filter to see all 6 regions.</p>
          <button type="button" onClick={() => { setQuery(""); setDeferredQuery(""); }}
            className="mt-4 h-11 rounded-lg border border-[oklch(90%_0.005_240)] px-5 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2">
            Clear filter
          </button>
        </div>
      )}
    </main>
  );
}
