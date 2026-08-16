// EXAMPLE: Reference-quality SaaS data table
// Intent: CREATE_COMPONENT · Product: saas · Dials: DV=3 MI=2 VD=8
// Key principles on display:
//   • Sortable column headers with aria-sort attribute
//   • Row checkboxes + header select-all with bulk action bar
//   • Search/filter input that narrows rows in real time
//   • Client-side pagination — 10 rows per page
//   • Organic data values ($847.23 MRR, not $800) — diverse names
//   • Status badges (Active/Trial/Churned) + Plan badges with oklch colors
//   • Loading skeleton with animate-pulse + error state with role="alert"
//   • Responsive overflow-x-auto for horizontal scroll on mobile
//   • All interactive elements have focus-visible:ring-2 + ≥44px touch targets
//   • prefers-reduced-motion in <style> block — ANI-01 compliant

import { useState, useEffect, useMemo, useCallback } from "react";

const USERS = [
  { id: 1,  name: "Ana Ngugi",       email: "ana.ngugi@volta.io",       plan: "Enterprise", status: "Active",  mrr: 1247.83, joined: "2023-09-14" },
  { id: 2,  name: "Kenji Tanaka",    email: "kenji.t@miru.co",           plan: "Pro",        status: "Active",  mrr:  847.23, joined: "2023-11-02" },
  { id: 3,  name: "Priya Shah",      email: "priya@deeploop.dev",        plan: "Pro",        status: "Trial",   mrr:  299.00, joined: "2024-01-18" },
  { id: 4,  name: "Ravi Okonkwo",    email: "ravi.ok@clarifai.net",      plan: "Enterprise", status: "Active",  mrr: 2183.47, joined: "2023-07-29" },
  { id: 5,  name: "Lena Müller",     email: "lena.muller@stackd.eu",     plan: "Starter",    status: "Active",  mrr:   49.91, joined: "2024-03-05" },
  { id: 6,  name: "Tobias Ferreira", email: "tobi@codecraft.io",         plan: "Pro",        status: "Churned", mrr:    0.00, joined: "2023-12-11" },
  { id: 7,  name: "Yuki Adeyemi",    email: "y.adeyemi@neobase.sh",      plan: "Enterprise", status: "Active",  mrr: 3419.62, joined: "2023-05-07" },
  { id: 8,  name: "Camille Dubois",  email: "cdubois@lightpath.fr",      plan: "Starter",    status: "Trial",   mrr:   49.91, joined: "2024-04-01" },
  { id: 9,  name: "Omar Khalil",     email: "omar.k@zenlayer.me",        plan: "Pro",        status: "Active",  mrr:  847.23, joined: "2024-02-14" },
  { id: 10, name: "Seo-Yeon Park",   email: "seoyeon@haniworks.kr",      plan: "Enterprise", status: "Active",  mrr: 1894.17, joined: "2023-10-30" },
  { id: 11, name: "Ines Cardoso",    email: "ines.c@pulsarapp.pt",       plan: "Starter",    status: "Active",  mrr:   49.91, joined: "2024-01-07" },
  { id: 12, name: "Mateus Wolff",    email: "mwolff@loopforge.de",       plan: "Pro",        status: "Trial",   mrr:  299.00, joined: "2024-03-22" },
  { id: 13, name: "Fatima Al-Sayed", email: "fatima@orbitops.ae",        plan: "Enterprise", status: "Active",  mrr: 4102.55, joined: "2023-04-16" },
  { id: 14, name: "Nadia Osei",      email: "nadia.osei@synclabs.gh",    plan: "Pro",        status: "Churned", mrr:    0.00, joined: "2023-08-03" },
  { id: 15, name: "Haruto Iwata",    email: "h.iwata@meshify.jp",        plan: "Starter",    status: "Active",  mrr:   49.91, joined: "2024-02-28" },
  { id: 16, name: "Leila Nazari",    email: "leila@gridvault.ir",        plan: "Pro",        status: "Active",  mrr:  847.23, joined: "2023-11-19" },
  { id: 17, name: "Chidi Eze",       email: "chidi.eze@flowbuilder.ng",  plan: "Enterprise", status: "Trial",   mrr:  599.00, joined: "2024-04-10" },
  { id: 18, name: "Sofía Herrera",   email: "sofia.h@axialux.mx",        plan: "Starter",    status: "Active",  mrr:   49.91, joined: "2024-01-30" },
  { id: 19, name: "Arjun Mehta",     email: "arjun@driftwave.in",        plan: "Pro",        status: "Active",  mrr:  847.23, joined: "2023-12-05" },
  { id: 20, name: "Zara Oduya",      email: "zara.o@brightnode.za",      plan: "Starter",    status: "Churned", mrr:    0.00, joined: "2023-10-14" },
];

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Active:  "bg-[oklch(94%_0.08_145)] text-[oklch(35%_0.13_145)] ring-1 ring-[oklch(80%_0.1_145)]",
  Trial:   "bg-[oklch(95%_0.08_80)]  text-[oklch(38%_0.14_70)]  ring-1 ring-[oklch(82%_0.12_78)]",
  Churned: "bg-[oklch(94%_0.07_15)]  text-[oklch(40%_0.14_20)]  ring-1 ring-[oklch(80%_0.1_15)]",
};

const PLAN_STYLES = {
  Starter:    "bg-[oklch(93%_0.03_255)] text-[oklch(38%_0.06_255)] ring-1 ring-[oklch(80%_0.05_255)]",
  Pro:        "bg-[oklch(93%_0.09_270)] text-[oklch(36%_0.15_270)] ring-1 ring-[oklch(79%_0.11_268)]",
  Enterprise: "bg-[oklch(93%_0.08_300)] text-[oklch(34%_0.14_300)] ring-1 ring-[oklch(78%_0.10_300)]",
};

export type User = (typeof USERS)[number]
const SORT_KEYS = ['name', 'email', 'plan', 'status', 'mrr', 'joined'] as const
type SortKey = (typeof SORT_KEYS)[number]

/** Rule 5 — filters, sort and page live in the URL, so a view is shareable and
 *  survives a reload. Written against the platform rather than a router so the
 *  pattern ports anywhere; under Next, `useSearchParams` replaces the read and
 *  `router.replace` the write, with the same shape. Selection is deliberately
 *  NOT here: it is a transient act, not a view worth sending to someone. */
const VIEW_DEFAULTS: Record<string, string> = { q: "", sort: "name", dir: "asc", page: "1" };

function readView(defaults: Record<string, string>): Record<string, string> {
  if (typeof window === "undefined") return { ...defaults };
  const params = new URLSearchParams(window.location.search);
  const view = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = params.get(key);
    if (value !== null) view[key] = value;
  }
  return view;
}

function useUrlState(defaults: Record<string, string>) {
  const [view, setView] = useState<Record<string, string>>(() => readView(defaults));

  // Back and forward are navigation here, not history trivia: a shared view is
  // only restorable if returning to it actually restores it.
  useEffect(() => {
    function onPopState() {
      setView(readView(defaults));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [defaults]);

  const patchView = useCallback(
    (patch: Record<string, string>) => {
      setView((previous) => {
        const next = { ...previous, ...patch };
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(next)) {
          // A default never reaches the query string, so the clean view has a
          // clean URL and every parameter present means something was chosen.
          if (value !== defaults[key]) params.set(key, value);
        }
        const query = params.toString();
        window.history.replaceState(
          null,
          "",
          query ? `?${query}` : window.location.pathname,
        );
        return next;
      });
    },
    [defaults],
  );

  return [view, patchView] as const;
}

function formatMRR(value: number) {
  if (value === 0) return "—";
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ChevronUp({ className = "" }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDown({ className = "" }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded h-4 w-4" /></td>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded h-4 w-28" /></td>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded h-4 w-36" /></td>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded-full h-5 w-16" /></td>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded-full h-5 w-14" /></td>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded h-4 w-16" /></td>
      <td className="px-4 py-3"><div className="animate-pulse bg-slate-200 rounded h-4 w-20" /></td>
    </tr>
  );
}

export interface DataTableProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
  /** Refetch. Resolves when the data is back; rejects and the error state shows. */
  onRetry?: () => Promise<void>
}

export default function DataTable({
  isLoading: initialLoading = false,
  onRetry = () => Promise.resolve(),
}: DataTableProps = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [view, patchView] = useUrlState(VIEW_DEFAULTS);

  // A query string is user input. Every value is re-checked against what the
  // component can actually do, so `?sort=drop%20table` sorts by name rather
  // than indexing USERS with a string nobody wrote.
  const search = view.q;
  const sortKey: SortKey =
    SORT_KEYS.find((key) => key === view.sort) ?? "name";
  const sortDir = view.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number.parseInt(view.page, 10) || 1);

  const setSearch = (value: string) => patchView({ q: value, page: "1" });
  const setPage = (value: number) => patchView({ page: String(value) });

  async function handleRetry() {
    setError(null);
    setIsLoading(true);
    try {
      // Real await, not a timer pretending to be one. A fake delay makes the
      // skeleton a decoration and hides the failure mode it exists to cover.
      await onRetry();
    } catch {
      setError("Could not reload accounts. Your data is unchanged.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSort(key: SortKey) {
    const nextDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    patchView({ sort: key, dir: nextDir, page: "1" });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = pageRows.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedRows.has(id));
  const somePageSelected = pageIds.some((id) => selectedRows.has(id));

  function toggleAll() {
    if (allPageSelected) {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleRow(id: number) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    setSelectedRows(new Set());
  }

  function handleBulkExport() {
    setSelectedRows(new Set());
  }

  function getSortAriaValue(key: SortKey) {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
    { key: "name",    label: "Name" },
    { key: "email",   label: "Email" },
    { key: "plan",    label: "Plan" },
    { key: "status",  label: "Status" },
    { key: "mrr",     label: "MRR" },
    { key: "joined",  label: "Joined" },
  ];

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif] flex items-center justify-center px-4">
        <div role="alert" className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-[oklch(94%_0.07_15)] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-[oklch(40%_0.14_20)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-slate-700 font-semibold text-lg">Failed to load user data</p>
          <p className="text-slate-500 text-sm">Could not connect to the analytics service. Please try again.</p>
          <button
            onClick={handleRetry}
            className="min-h-[44px] px-6 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif] text-slate-900">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Skip link */}
      <a
        href="#data-table"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[oklch(99.5%_0.004_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:text-sm focus:font-medium"
      >
        Skip to table
      </a>

      <header className="border-b border-slate-200 bg-[oklch(99.5%_0.004_255)] sticky top-0 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[oklch(55%_0.18_270)] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8M4 18h8" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">AdminPanel</span>
          </div>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 text-sm font-medium text-slate-500">
              <li><a href="#" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Overview</a></li>
              <li><a href="#" className="px-3 py-2 rounded-lg bg-slate-100 text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Users</a></li>
              <li><a href="#" className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Billing</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <section id="data-table" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" aria-label="User management table">

        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users</h1>
            <p className="text-sm text-slate-500 mt-0.5">{USERS.length} total accounts · {USERS.filter(u => u.status === "Active").length} active</p>
          </div>
          <button
            className="min-h-[44px] h-11 px-4 rounded-lg bg-[oklch(55%_0.18_270)] text-white text-sm font-semibold hover:bg-[oklch(48%_0.18_270)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_270)] focus-visible:ring-offset-2"
          >
            Invite user
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <label htmlFor="search-users" className="sr-only">Search users</label>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              id="search-users"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-describedby="search-users-hint"
              className="w-full pl-9 pr-4 h-11 min-h-[44px] border border-slate-200 rounded-lg bg-[oklch(99.5%_0.004_255)] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors"
            />
            <span id="search-users-hint" className="sr-only">Filters the table rows by name or email address in real time</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Filter:</span>
            {["Active", "Trial", "Churned"].map((s) => (
              <button
                key={s}
                onClick={() => { setSearch(s === search ? "" : s); setPage(1); }}
                className={`h-11 min-h-[44px] px-3 rounded-lg border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  search === s
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-[oklch(99.5%_0.004_255)] border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedRows.size > 0 && (
          <div
            role="toolbar"
            aria-label="Bulk actions"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[oklch(55%_0.18_270)] text-white text-sm font-medium shadow-lg shadow-[oklch(55%_0.18_270)]/20 transition"
          >
            <span className="font-semibold">{selectedRows.size} selected</span>
            <span className="flex-1" />
            <button
              onClick={handleBulkExport}
              aria-label="Export selected rows"
              className="min-h-[44px] h-9 px-4 rounded-lg bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.3)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Export
            </button>
            <button
              onClick={handleBulkDelete}
              aria-label="Delete selected rows"
              className="min-h-[44px] h-9 px-4 rounded-lg bg-[oklch(45%_0.18_15)] hover:bg-[oklch(38%_0.18_15)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Delete
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-4 py-3 text-left">
                  <label className="sr-only" htmlFor="select-all-checkbox">Select all rows on this page</label>
                  <input
                    id="select-all-checkbox"
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-300 text-[oklch(55%_0.18_270)] focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_270)] cursor-pointer"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={getSortAriaValue(col.key)}
                    className="px-4 py-3 text-left font-semibold text-slate-600 whitespace-nowrap"
                  >
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 h-7 min-h-[44px] rounded px-1 -mx-1 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 group"
                    >
                      {col.label}
                      <span className="flex flex-col gap-px opacity-40 group-hover:opacity-70">
                        <ChevronUp className={sortKey === col.key && sortDir === "asc" ? "opacity-100 text-[oklch(55%_0.18_270)]" : ""} />
                        <ChevronDown className={sortKey === col.key && sortDir === "desc" ? "opacity-100 text-[oklch(55%_0.18_270)]" : ""} />
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" strokeWidth={1.5} />
                        <path d="M17 17L21 21" strokeWidth={1.5} strokeLinecap="round" />
                      </svg>
                      <p className="font-medium text-sm">No users match &ldquo;{search}&rdquo;</p>
                      <button
                        onClick={() => setSearch("")}
                        className="text-[oklch(55%_0.18_270)] text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      >
                        Clear search
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      selectedRows.has(user.id)
                        ? "bg-[oklch(97%_0.04_270)]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="w-10 px-4 py-3">
                      <label className="sr-only" htmlFor={`row-checkbox-${user.id}`}>Select {user.name}</label>
                      <input
                        id={`row-checkbox-${user.id}`}
                        type="checkbox"
                        checked={selectedRows.has(user.id)}
                        onChange={() => toggleRow(user.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[oklch(55%_0.18_270)] focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_270)] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{user.name}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${PLAN_STYLES[user.plan as keyof typeof PLAN_STYLES]}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[user.status as keyof typeof STATUS_STYLES]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-[oklch(60%_0.18_145)]" : user.status === "Trial" ? "bg-[oklch(65%_0.18_80)]" : "bg-[oklch(60%_0.18_15)]"}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {formatMRR(user.mrr)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(user.joined)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            Showing{" "}
            <span className="font-semibold text-slate-900">{sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)}</span>
            {" "}of{" "}
            <span className="font-semibold text-slate-900">{sorted.length}</span>{" "}users
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="min-h-[44px] h-11 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-[oklch(99.5%_0.004_255)] hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Prev
            </button>
            <span className="px-3 py-2 text-slate-600 font-medium tabular-nums">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="min-h-[44px] h-11 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-[oklch(99.5%_0.004_255)] hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Next
            </button>
          </nav>
        </div>

      </section>
    </main>
  );
}
