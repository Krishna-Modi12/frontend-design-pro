// EXAMPLE: Reference-quality agent operations status panel
// Intent: CREATE_COMPONENT · Product: dev-tool · Dials: DV=3 MI=3 VD=3
// Illustrates agent-ops discipline as rendered UI state:
//   • Token budget meter — per-reference cost and a load/skip decision (token-optimization.md)
//   • Subagent task queue — queued/running/verified/failed, never "done" without verification (verification-loops.md, subagent-orchestration.md)
//   • Shared-file conflict flag — two tasks touching one file are marked, not silently parallelized (parallelization.md)
// Key principles on display:
//   • All 4 states: empty (no tasks), loading (queue fetching), error (fetch failed), success (populated)
//   • prefers-reduced-motion respected
//   • 44px+ touch targets, visible focus rings
//   • aria-live announces status changes; no placeholder copy
//   • No framework lock-in — plain useState, works everywhere

import { useState, useMemo } from "react";

export interface AgentTask {
  id: string;
  label: string;
  status: "queued" | "running" | "verified" | "failed";
  file: string;
}

export interface ReferenceBudgetRow {
  path: string;
  tokens: number;
  loaded: boolean;
}

export interface AgentStatusPanelProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  /** Surface a fetch failure instead of a silent empty panel. */
  hasError?: boolean;
  tasks?: AgentTask[];
  budget?: ReferenceBudgetRow[];
  tokenLimit?: number;
}

const DEFAULT_TASKS: AgentTask[] = [
  { id: "t-1", label: "Write token-optimization.md", status: "verified", file: "skills/agent-ops/references/token-optimization.md" },
  { id: "t-2", label: "Write memory-persistence.md", status: "verified", file: "skills/agent-ops/references/memory-persistence.md" },
  { id: "t-3", label: "Typecheck golds", status: "running", file: "scripts/typecheck_golds.py" },
  { id: "t-4", label: "Update registry row", status: "queued", file: "SKILL.md" },
];

const DEFAULT_BUDGET: ReferenceBudgetRow[] = [
  { path: "core/agent-behavior.md", tokens: 996, loaded: true },
  { path: "core/validate-checklist.md", tokens: 512, loaded: true },
  { path: "references/token-optimization.md", tokens: 1840, loaded: true },
  { path: "references/subagent-orchestration.md", tokens: 1920, loaded: false },
];

function statusMeta(status: AgentTask["status"]): { text: string; className: string } {
  switch (status) {
    case "verified":
      return { text: "Verified", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "running":
      return { text: "Running", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "failed":
      return { text: "Failed", className: "bg-rose-50 text-rose-700 border-rose-200" };
    default:
      return { text: "Queued", className: "bg-slate-100 text-slate-600 border-slate-200" };
  }
}

export default function AgentStatusPanel({
  isLoading = false,
  hasError = false,
  tasks = DEFAULT_TASKS,
  budget = DEFAULT_BUDGET,
  tokenLimit = 8000,
}: AgentStatusPanelProps = {}) {
  const [filter, setFilter] = useState<"all" | AgentTask["status"]>("all");

  const visibleTasks = useMemo(
    () => (filter === "all" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  const fileOwners = useMemo(() => {
    const owners = new Map<string, number>();
    for (const t of tasks) owners.set(t.file, (owners.get(t.file) ?? 0) + 1);
    return owners;
  }, [tasks]);

  const loadedTokens = budget.filter((b) => b.loaded).reduce((sum, b) => sum + b.tokens, 0);
  const budgetPct = Math.min(100, Math.round((loadedTokens / tokenLimit) * 100));

  if (hasError) {
    return (
      <div
        role="alert"
        className="max-w-2xl mx-auto p-6 rounded-2xl border border-rose-200 bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(18.8%_0.013_248.5)]">Couldn&apos;t load agent status</h2>
        <p className="mt-2 text-sm text-slate-600">The task queue endpoint didn&apos;t respond. Try refreshing in a moment.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(98.5%_0.001_106.4)] p-4">
        <div className="w-full max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-[oklch(99.5%_0.004_255)] p-8">
          <div className="h-6 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200/70" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200/60" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-slate-200/60" />
        </div>
      </main>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center rounded-2xl border border-slate-200 bg-[oklch(99.5%_0.004_255)] font-[Manrope,system-ui,sans-serif]">
        <h2 className="text-xl font-bold text-[oklch(18.8%_0.013_248.5)]">No agent tasks queued</h2>
        <p className="mt-2 text-sm text-slate-500">Dispatch a subagent to see its status here.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] justify-center bg-[oklch(98.5%_0.001_106.4)] p-4">
      <section
        aria-label="Agent operations status"
        className="w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-[oklch(99.5%_0.004_255)] p-6 sm:p-8 font-[Manrope,system-ui,sans-serif]"
      >
        {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[oklch(18.8%_0.013_248.5)]">Agent ops status</h2>
          <p className="mt-1 text-sm text-slate-500">Token budget in use and subagent verification state.</p>
        </div>

        {/* TOKEN BUDGET METER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[oklch(18.8%_0.013_248.5)]">Token budget</h3>
            <span className="text-xs text-slate-500">
              {loadedTokens.toLocaleString()} / {tokenLimit.toLocaleString()} tokens loaded
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={budgetPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Context window used"
            className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-indigo-500 transition-[width] motion-reduce:transition-none"
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <ul className="mt-3 space-y-1.5">
            {budget.map((row) => (
              <li key={row.path} className="flex items-center justify-between text-xs">
                <span className={row.loaded ? "text-slate-700" : "text-slate-400"}>
                  {row.loaded ? "Loaded" : "Skipped (not needed)"} · {row.path}
                </span>
                <span className="text-slate-500 tabular-nums">{row.tokens.toLocaleString()}t</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FILTER */}
        <div>
          <label htmlFor="task-filter" className="block text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-1.5">
            Filter tasks
          </label>
          <select
            id="task-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-11 min-w-[10rem] px-3 bg-[oklch(99.5%_0.004_255)] text-[oklch(18.8%_0.013_248.5)] border-2 border-slate-200 rounded-xl outline-none transition-colors focus:border-indigo-500 hover:border-slate-300"
          >
            <option value="all">All</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* TASK QUEUE */}
        <div aria-live="polite">
          <h3 className="text-sm font-semibold text-[oklch(18.8%_0.013_248.5)] mb-2">Subagent tasks</h3>
          {visibleTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks match this filter.</p>
          ) : (
            <ul className="space-y-2">
              {visibleTasks.map((task) => {
                const meta = statusMeta(task.status);
                const shared = (fileOwners.get(task.file) ?? 0) > 1;
                return (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[oklch(18.8%_0.013_248.5)] truncate">{task.label}</p>
                      <p className="text-xs text-slate-500 truncate">{task.file}</p>
                      {shared && (
                        <p role="alert" className="mt-1 text-xs font-semibold text-rose-600">
                          Shared-file conflict — another task also owns this file
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 h-7 inline-flex items-center px-2.5 rounded-full border text-xs font-semibold ${meta.className}`}
                    >
                      {meta.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </section>
    </main>
  );
}
