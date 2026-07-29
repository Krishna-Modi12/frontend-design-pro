"use client";

import { useId, useMemo } from "react";
import type { ReactElement } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, TriangleAlert } from "lucide-react";
import {
  formatCurrencyPrecise,
  formatDay,
  formatPercent,
  skeletonRowCount,
} from "../lib/data";
import type {
  AccountHealth,
  AccountRow,
  AccountSort,
  AccountSortColumn,
} from "../lib/data";

export interface DataTableProps {
  /** `null` until the first response lands; an empty array means no matches. */
  rows: AccountRow[] | null;
  isLoading: boolean;
  error: string | null;
  sort: AccountSort;
  onSortChange: (column: AccountSortColumn) => void;
  onRetry: () => void;
  /** Free-text filter already applied upstream — echoed in the empty state. */
  query: string;
  onClearQuery: () => void;
}

interface ColumnSpec {
  column: AccountSortColumn;
  label: string;
  numeric: boolean;
}

const COLUMNS: ColumnSpec[] = [
  { column: "company", label: "Account", numeric: false },
  { column: "plan", label: "Plan", numeric: false },
  { column: "mrr", label: "MRR", numeric: true },
  { column: "activation", label: "Seat activation", numeric: true },
  { column: "lastActiveIso", label: "Last active", numeric: false },
];

const PLAN_ORDER: Record<AccountRow["plan"], number> = {
  Starter: 0,
  Growth: 1,
  Scale: 2,
  Enterprise: 3,
};

const HEALTH_STYLE: Record<AccountHealth, string> = {
  Healthy: "border-[var(--color-positive)] text-[var(--color-positive)]",
  Watch: "border-[var(--color-caution)] text-[var(--color-caution)]",
  "At risk": "border-[var(--color-danger)] text-[var(--color-danger)]",
};

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]";

const SKELETON = "animate-pulse rounded bg-[var(--color-surface-sunken)] motion-reduce:animate-none";

function compare(a: AccountRow, b: AccountRow, column: AccountSortColumn): number {
  switch (column) {
    case "company":
      return a.company.localeCompare(b.company);
    case "plan":
      return PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan];
    case "mrr":
      return a.mrr - b.mrr;
    case "activation":
      return a.activation - b.activation;
    case "lastActiveIso":
      return a.lastActiveIso.localeCompare(b.lastActiveIso);
  }
}

export default function DataTable({
  rows,
  isLoading,
  error,
  sort,
  onSortChange,
  onRetry,
  query,
  onClearQuery,
}: DataTableProps): ReactElement {
  const uid = useId();
  const headingId = `${uid}-heading`;

  // Sorting 24 rows is cheap, but it runs on every keystroke of the filter above
  // it — memoising keeps that typing at one comparison pass instead of two.
  const sorted = useMemo((): AccountRow[] => {
    if (rows === null) {
      return [];
    }
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a: AccountRow, b: AccountRow) => compare(a, b, sort.column) * factor);
  }, [rows, sort]);

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={isLoading}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[var(--color-border)] p-5">
        <h2 id={headingId} className="text-base font-bold tracking-[-0.01em]">
          Accounts
        </h2>
        <p className="text-xs text-[var(--color-ink-muted)]" aria-live="polite">
          {isLoading || rows === null
            ? "Counting…"
            : `${sorted.length} shown, sorted by ${sort.column === "lastActiveIso" ? "last active" : sort.column}`}
        </p>
      </div>

      {error !== null ? (
        <div role="alert" className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-sm leading-6 text-[var(--color-danger)]">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
            Accounts did not load — {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className={`${FOCUS} inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-danger)] px-4 text-sm font-semibold text-[var(--color-danger)]`}
          >
            Try again
          </button>
        </div>
      ) : !isLoading && sorted.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-semibold">
            {query.length > 0 ? `No account matches “${query}”` : "No accounts yet"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
            {query.length > 0
              ? "Company names and owners are matched, not domains — try the owner's surname."
              : "Accounts appear here within a minute of their first paid invoice."}
          </p>
          {query.length > 0 ? (
            <button
              type="button"
              onClick={onClearQuery}
              className={`${FOCUS} mt-4 inline-flex min-h-11 items-center rounded-lg border border-[var(--color-border-strong)] px-4 text-sm font-semibold`}
            >
              Clear the filter
            </button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">
              Accounts with plan, monthly recurring revenue, seat activation and last activity
            </caption>
            <thead>
              <tr className="text-xs uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
                {COLUMNS.map((spec: ColumnSpec) => {
                  const isSorted = spec.column === sort.column;
                  return (
                    <th
                      key={spec.column}
                      scope="col"
                      aria-sort={
                        isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
                      }
                      className={`border-b border-[var(--color-border)] p-0 font-semibold ${
                        spec.numeric ? "text-end" : "text-start"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSortChange(spec.column)}
                        className={`${FOCUS} inline-flex min-h-11 w-full items-center gap-1.5 px-4 hover:text-[var(--color-ink)] ${
                          spec.numeric ? "justify-end" : "justify-start"
                        }`}
                      >
                        {spec.label}
                        {isSorted ? (
                          sort.direction === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                          ) : (
                            <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                          )
                        ) : (
                          <ArrowUpDown
                            aria-hidden="true"
                            className="size-3.5 shrink-0 opacity-50"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="border-b border-[var(--color-border)] px-4 py-3 text-start font-semibold">
                  Health
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading
                ? Array.from({ length: skeletonRowCount }, (_unused: unknown, index: number) => (
                    <tr key={`skeleton-${index}`} className="border-b border-[var(--color-border)]">
                      {COLUMNS.map((spec: ColumnSpec) => (
                        <td key={spec.column} className="px-4 py-4">
                          <div className={`${SKELETON} h-4 ${spec.numeric ? "ms-auto w-16" : "w-32"}`} />
                        </td>
                      ))}
                      <td className="px-4 py-4">
                        <div className={`${SKELETON} h-6 w-20 rounded-full`} />
                      </td>
                    </tr>
                  ))
                : sorted.map((row: AccountRow) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-sunken)]"
                    >
                      <th scope="row" className="px-4 py-3 text-start font-semibold">
                        {row.company}
                        <span className="block text-xs font-normal text-[var(--color-ink-muted)]">
                          {row.owner}
                        </span>
                      </th>
                      <td className="px-4 py-3 text-[var(--color-ink-muted)]">{row.plan}</td>
                      <td className="px-4 py-3 text-end font-mono tabular-nums">
                        {formatCurrencyPrecise(row.mrr)}
                      </td>
                      <td className="px-4 py-3 text-end font-mono tabular-nums">
                        {formatPercent(row.activation)}
                      </td>
                      <td className="px-4 py-3">
                        <time dateTime={row.lastActiveIso}>{formatDay(row.lastActiveIso)}</time>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${HEALTH_STYLE[row.health]}`}
                        >
                          {row.health}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
