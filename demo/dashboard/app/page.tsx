"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import dynamic from "next/dynamic";
import { Menu, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import type { DashboardView } from "../components/Sidebar";
import KPICards from "../components/KPICards";
import DataTable from "../components/DataTable";
import { fetchAccountRows, fetchKpiMetrics, fetchRevenueSeries } from "../lib/data";
import type {
  AccountRow,
  AccountSort,
  AccountSortColumn,
  KpiMetric,
  RevenuePoint,
} from "../lib/data";

/**
 * recharts is the heaviest dependency on the page and nothing above the fold
 * needs it, so the chart is a separate chunk with a reserved-height fallback —
 * the KPI row and the table never move when it arrives.
 */
const Chart = dynamic(() => import("../components/Chart"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-live="polite"
      className="h-[23rem] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5"
    >
      <div className="h-full w-full animate-pulse rounded bg-[var(--color-surface-sunken)] motion-reduce:animate-none" />
      <span className="sr-only">Loading the revenue chart…</span>
    </div>
  ),
});

const REVENUE_MONTHS = 12;

/** The rail switches the heading; the panels below are shared across views. */
const VIEW_TITLES: Record<DashboardView, string> = {
  overview: "Overview",
  accounts: "Accounts",
  revenue: "Revenue",
  billing: "Billing",
  settings: "Settings",
};

interface Snapshot {
  kpis: KpiMetric[];
  revenue: RevenuePoint[];
  accounts: AccountRow[];
}

type LoadState =
  | { readonly phase: "loading" }
  | { readonly phase: "ready"; readonly snapshot: Snapshot }
  | { readonly phase: "failed"; readonly reason: string };

export default function DashboardPage(): ReactElement {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [view, setView] = useState<DashboardView>("overview");
  const [query, setQuery] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [sort, setSort] = useState<AccountSort>({ column: "mrr", direction: "desc" });

  const navTriggerRef = useRef<HTMLButtonElement | null>(null);
  const navCloseRef = useRef<HTMLButtonElement | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setState({ phase: "loading" });
    try {
      const [kpis, revenue, accounts] = await Promise.all([
        fetchKpiMetrics(),
        fetchRevenueSeries(REVENUE_MONTHS),
        fetchAccountRows(),
      ]);
      setState({ phase: "ready", snapshot: { kpis, revenue, accounts } });
    } catch (cause: unknown) {
      const reason = cause instanceof Error ? cause.message : "the request failed with no detail.";
      setState({ phase: "failed", reason });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Opening the drawer moves focus into it; closing hands focus back to the
  // trigger, so a keyboard user is never dropped at the top of the document.
  useEffect(() => {
    if (isNavOpen) {
      navCloseRef.current?.focus();
    }
  }, [isNavOpen]);

  const closeNav = useCallback((): void => {
    setIsNavOpen(false);
    navTriggerRef.current?.focus();
  }, []);

  const isLoading = state.phase === "loading";
  const error = state.phase === "failed" ? state.reason : null;
  const snapshot = state.phase === "ready" ? state.snapshot : null;

  const filtered = useMemo((): AccountRow[] | null => {
    if (snapshot === null) {
      return null;
    }
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) {
      return snapshot.accounts;
    }
    return snapshot.accounts.filter(
      (row: AccountRow) =>
        row.company.toLowerCase().includes(needle) || row.owner.toLowerCase().includes(needle),
    );
  }, [snapshot, query]);

  function handleSortChange(column: AccountSortColumn): void {
    setSort((current: AccountSort) =>
      current.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: column === "company" || column === "plan" ? "asc" : "desc" },
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface)] font-[Manrope,ui-sans-serif,system-ui] text-[var(--color-ink)] antialiased lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <Sidebar
        ref={navCloseRef}
        current={view}
        onNavigate={(next: DashboardView) => {
          setView(next);
          setIsNavOpen(false);
        }}
        isOpen={isNavOpen}
        onClose={closeNav}
      />

      <div className="flex min-w-0 flex-col">
        <a
          href="#dashboard-main"
          className="sr-only rounded-lg bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-semibold focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          Skip to dashboard
        </a>

        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur sm:px-6">
          <button
            ref={navTriggerRef}
            type="button"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isNavOpen}
            className="grid size-11 shrink-0 place-items-center rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] lg:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <label htmlFor="account-filter" className="sr-only">
              Filter accounts by company or owner
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-muted)]"
              strokeWidth={1.75}
            />
            <input
              id="account-filter"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter accounts"
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] ps-9 pe-3 text-sm outline-none placeholder:text-[var(--color-ink-muted)] focus-visible:border-[var(--color-focus)] focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            />
          </div>

          <p className="ms-auto hidden text-xs text-[var(--color-ink-muted)] sm:block">
            Rolling 30 days · UTC
          </p>
        </header>

        <main id="dashboard-main" className="flex flex-col gap-6 p-4 sm:p-6">
          <div>
            <h1 className="text-balance text-2xl font-extrabold tracking-[-0.02em]">
              {VIEW_TITLES[view]}
            </h1>
            <p className="mt-1 text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
              Every figure below is booked revenue, net of refunds, against the same window
              a year earlier.
            </p>
          </div>

          <KPICards
            metrics={snapshot === null ? null : snapshot.kpis}
            isLoading={isLoading}
            error={error}
            onRetry={() => void load()}
          />

          <Chart
            points={snapshot === null ? null : snapshot.revenue}
            isLoading={isLoading}
            error={error}
            onRetry={() => void load()}
          />

          <DataTable
            rows={filtered}
            isLoading={isLoading}
            error={error}
            sort={sort}
            onSortChange={handleSortChange}
            onRetry={() => void load()}
            query={query}
            onClearQuery={() => setQuery("")}
          />
        </main>
      </div>

      <style>{`
        :root {
          --color-surface: oklch(97.8% 0.004 264);
          --color-surface-raised: oklch(99.4% 0.002 264);
          --color-surface-sunken: oklch(94.6% 0.007 264);
          --color-ink: oklch(22.4% 0.021 264);
          --color-ink-muted: oklch(50.6% 0.017 264);
          --color-border: oklch(90.2% 0.008 264);
          --color-border-strong: oklch(80.4% 0.012 264);
          --color-brand: oklch(47.8% 0.112 258);
          --color-focus: oklch(56.4% 0.132 258);
          --color-positive: oklch(46.2% 0.116 152);
          --color-caution: oklch(52.8% 0.124 76);
          --color-danger: oklch(51.4% 0.182 26);
          --color-danger-surface: oklch(96.4% 0.024 26);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --color-surface: oklch(17.8% 0.016 264);
            --color-surface-raised: oklch(22.2% 0.018 264);
            --color-surface-sunken: oklch(27.4% 0.020 264);
            --color-ink: oklch(96.2% 0.005 264);
            --color-ink-muted: oklch(74.2% 0.014 264);
            --color-border: oklch(32.4% 0.018 264);
            --color-border-strong: oklch(43.2% 0.024 264);
            --color-brand: oklch(76.4% 0.098 258);
            --color-focus: oklch(80.2% 0.108 258);
            --color-positive: oklch(78.6% 0.124 152);
            --color-caution: oklch(82.4% 0.132 76);
            --color-danger: oklch(74.2% 0.142 26);
            --color-danger-surface: oklch(28.8% 0.062 26);
          }
        }

        /* The table can run long; skipping offscreen row layout keeps scrolling cheap. */
        tbody tr {
          content-visibility: auto;
          contain-intrinsic-size: auto 3.25rem;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
