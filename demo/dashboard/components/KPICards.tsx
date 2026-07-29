"use client";

import type { ReactElement } from "react";
import { ArrowDownRight, ArrowUpRight, TriangleAlert } from "lucide-react";
import {
  formatCount,
  formatCurrencyPrecise,
  formatPercent,
} from "../lib/data";
import type { KpiMetric } from "../lib/data";

export interface KPICardsProps {
  /** `null` until the first response lands; an empty array means none configured. */
  metrics: KpiMetric[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const CARD =
  "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5";

const SKELETON = "animate-pulse rounded bg-[var(--color-surface-sunken)] motion-reduce:animate-none";

function formatMetric(metric: KpiMetric): string {
  switch (metric.format) {
    case "currency":
      return formatCurrencyPrecise(metric.value);
    case "count":
      return formatCount(metric.value);
    case "percent":
      return formatPercent(metric.value);
  }
}

export default function KPICards({
  metrics,
  isLoading,
  error,
  onRetry,
}: KPICardsProps): ReactElement {
  if (error !== null) {
    return (
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key figures
        </h2>
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-surface)] p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-3 text-sm leading-6 text-[var(--color-danger)]">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
            Key figures did not load — {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-danger)] px-4 text-sm font-semibold text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="kpi-heading" aria-busy={isLoading}>
      <h2 id="kpi-heading" className="sr-only">
        Key figures
      </h2>

      {isLoading ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["revenue", "seats", "activation", "churn"].map((slot: string) => (
            <li key={slot} className={CARD}>
              <div className={`${SKELETON} h-3 w-28`} />
              <div className={`${SKELETON} mt-4 h-8 w-32`} />
              <div className={`${SKELETON} mt-4 h-3 w-24`} />
              <span className="sr-only">Loading {slot}…</span>
            </li>
          ))}
        </ul>
      ) : metrics !== null && metrics.length > 0 ? (
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric: KpiMetric) => {
            const rising = metric.direction === "up";
            const ink = metric.isImprovement ? "text-[var(--color-positive)]" : "text-[var(--color-danger)]";
            return (
              <div key={metric.id} className={CARD}>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                  {metric.label}
                </dt>
                <dd className="mt-3 font-mono text-3xl font-semibold tabular-nums tracking-[-0.02em]">
                  {formatMetric(metric)}
                </dd>
                <dd className={`mt-3 flex items-center gap-1.5 text-sm font-semibold ${ink}`}>
                  {rising ? (
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
                  ) : (
                    <ArrowDownRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
                  )}
                  <span className="tabular-nums">
                    {rising ? "+" : ""}
                    {formatPercent(metric.deltaPct)}
                  </span>
                  <span className="font-normal text-[var(--color-ink-muted)]">
                    {metric.comparison}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] p-8 text-center">
          <p className="text-sm font-semibold">No figures pinned to this workspace</p>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
            Pin up to four metrics and they appear here for everyone on the team.
          </p>
          <a
            href="/settings/metrics"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[var(--color-brand)] underline decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Choose metrics
          </a>
        </div>
      )}
    </section>
  );
}
