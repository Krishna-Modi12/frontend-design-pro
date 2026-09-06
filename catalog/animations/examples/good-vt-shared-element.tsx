// GOLD: View Transition patterns — references/view-transitions.md (P-20).
//   • Shared element morph (name) list → detail
//   • Type-keyed directional enter/exit via addTransitionType
//   • default="none" so background revalidations never animate
//   • Reduced-motion CSS disables ::view-transition-* animations (mandatory)
//   • ViewTransition placed before any DOM node, per the placement rule
import * as React from "react";

// The View Transition API ships in React's experimental channel; this narrow shim keeps the
// example strictly typed without pulling in canary type definitions.
const { unstable_ViewTransition: MaybeVT, unstable_addTransitionType: maybeAddType } =
  React as unknown as {
    unstable_ViewTransition?: React.ComponentType<{
      children?: React.ReactNode; name?: string; default?: string;
      enter?: string | Record<string, string>; exit?: string | Record<string, string>;
      share?: string | Record<string, string>;
    }>;
    unstable_addTransitionType?: (type: string) => void;
  };
const ViewTransition = MaybeVT ?? (({ children }: { children?: React.ReactNode }) => <>{children}</>);
const addTransitionType = maybeAddType ?? (() => {});

export interface Release { id: string; title: string; author: string; summary: string; shipped: string }
const RELEASES: Release[] = [
  { id: "r-4471", title: "Edge cache invalidation", author: "Ana Ngugi", shipped: "12 min ago",
    summary: "Purge propagates to 41 PoPs in under 380 ms, down from 2.4 s." },
  { id: "r-4468", title: "Streaming SSR for dashboards", author: "Kenji Tanaka", shipped: "3 hr ago",
    summary: "First byte at 84 ms; charts stream after the shell paints." },
  { id: "r-4463", title: "Typed route params", author: "Priya Shah", shipped: "Yesterday",
    summary: "Route params infer from the file path — 217 call sites migrated." },
];

export interface ReleaseFeedProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  releases?: Release[];
}
export default function ReleaseFeed({ isLoading = false, releases = RELEASES }: ReleaseFeedProps = {}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const selected = releases.find((r) => r.id === selectedId) ?? null;

  function open(id: string) {
    React.startTransition(() => { addTransitionType("nav-forward"); setSelectedId(id); });
  }
  function back() {
    React.startTransition(() => { addTransitionType("nav-back"); setSelectedId(null); });
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
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-8" aria-busy="true">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-[oklch(92%_0.005_240)]" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif]">
      <style>{`
        @keyframes vt-slide-from-right { from { transform: translateX(24px); opacity: 0 } }
        @keyframes vt-slide-to-left { to { transform: translateX(-24px); opacity: 0 } }
        ::view-transition-new(.nav-forward) { animation: vt-slide-from-right 260ms cubic-bezier(0.23,1,0.32,1) both }
        ::view-transition-old(.nav-forward) { animation: vt-slide-to-left 200ms ease-out both }
        @media (prefers-reduced-motion: reduce) {
          ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important }
        }
      `}</style>

      <h1 className="text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        Releases
      </h1>

      {selected ? (
        <ViewTransition default="none"
          enter={{ "nav-forward": "nav-forward", default: "none" }}
          exit={{ "nav-back": "nav-forward", default: "none" }}>
          <article className="mt-6 max-w-3xl rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] p-6">
            <button type="button" onClick={back}
              className="mb-4 inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold text-[oklch(45%_0.010_240)] transition-colors motion-reduce:transition-none hover:text-[oklch(14%_0.012_240)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)]">
              ← Back to releases
            </button>
            <ViewTransition name={`release-title-${selected.id}`} share="morph">
              <h2 className="text-xl font-bold text-[oklch(14%_0.012_240)]">{selected.title}</h2>
            </ViewTransition>
            <p className="mt-1 text-sm text-[oklch(45%_0.010_240)]">
              {selected.author} · shipped {selected.shipped}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[oklch(45%_0.010_240)]">{selected.summary}</p>
          </article>
        </ViewTransition>
      ) : (
        <ul aria-label="Recent releases" className="mt-6 grid max-w-3xl gap-3">
          {releases.map((r) => (
            <ViewTransition key={r.id} default="none" exit={{ "nav-forward": "nav-forward", default: "none" }}>
              <li>
                <button type="button" onClick={() => open(r.id)}
                  className="w-full rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] p-4 text-left transition-colors motion-reduce:transition-none hover:border-[oklch(78%_0.04_276)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)]">
                  <ViewTransition name={`release-title-${r.id}`} share="morph">
                    <span className="block text-sm font-semibold text-[oklch(14%_0.012_240)]">{r.title}</span>
                  </ViewTransition>
                  <span className="mt-1 block text-xs text-[oklch(45%_0.010_240)]">
                    {r.author} · {r.shipped}
                  </span>
                </button>
              </li>
            </ViewTransition>
          ))}
        </ul>
      )}
    </main>
  );
}
