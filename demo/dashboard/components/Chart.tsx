"use client";

import { useId } from "react";
import type { ReactElement } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTokens, formatCurrencyCompact, formatCurrencyPrecise } from "../lib/data";
import type { RevenuePoint } from "../lib/data";

export interface ChartProps {
  /** `null` until the window resolves; an empty array means the range held nothing. */
  points: RevenuePoint[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SKELETON = "animate-pulse rounded bg-[var(--color-surface-sunken)] motion-reduce:animate-none";

/**
 * Revenue against the same month a year earlier.
 *
 * The chart is decorative for a screen reader — the `<table>` beneath it carries
 * the same numbers, which is why the SVG is `aria-hidden` rather than given a
 * label it cannot honour. Loaded through `next/dynamic` by the page: recharts is
 * ~90 KB gzipped and nothing above the fold needs it.
 */
export default function Chart({ points, isLoading, error, onRetry }: ChartProps): ReactElement {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const tableId = `${uid}-table`;

  return (
    <section
      aria-labelledby={headingId}
      aria-busy={isLoading}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={headingId} className="text-base font-bold tracking-[-0.01em]">
          Recurring revenue, year over year
        </h2>
        <p className="text-xs text-[var(--color-ink-muted)]">Booked, net of refunds</p>
      </div>

      {error !== null ? (
        <div
          role="alert"
          className="mt-5 flex flex-col gap-3 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm leading-6 text-[var(--color-danger)]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-danger)] px-4 text-sm font-semibold text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="mt-5">
          <div className={`${SKELETON} h-64 w-full`} />
          <span className="sr-only">Loading the revenue series…</span>
        </div>
      ) : points !== null && points.length > 0 ? (
        <>
          {/* The chart is decorative — the same series is published as a real
              table below, which is what assistive technology should read. But
              `aria-hidden` alone is a trap here: Recharts puts a focusable
              surface in its SVG, so the subtree stayed in the tab order while
              being hidden from the accessibility tree, which is an axe
              violation and a genuine dead keyboard stop. `inert` removes it
              from focus as well, so hidden means hidden. */}
          <div aria-hidden="true" inert className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={chartTokens.grid} strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: chartTokens.axisText, fontSize: 12, fontFamily: chartTokens.fontFamily }}
                />
                <YAxis
                  width={56}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => formatCurrencyCompact(value)}
                  tick={{ fill: chartTokens.axisText, fontSize: 12, fontFamily: chartTokens.fontFamily }}
                />
                <Tooltip
                  // Recharts hands a tooltip formatter `ValueType | undefined`, not a
                  // number: a series can be string- or array-valued, and the payload is
                  // optional. Declaring `value: number` compiles only while `recharts`
                  // is an ambient `any` — against the real typings it is rejected.
                  // Widening to `unknown` and narrowing here keeps this series (always
                  // numeric) formatted exactly as before, without asserting a shape the
                  // library does not promise.
                  formatter={(value: unknown) =>
                    typeof value === "number" ? formatCurrencyPrecise(value) : String(value ?? "")
                  }
                  contentStyle={{
                    background: "var(--color-surface-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    fontFamily: chartTokens.fontFamily,
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: chartTokens.fontFamily, fontSize: 12 }}
                  iconType="plainline"
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="This year"
                  stroke={chartTokens.current}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="priorYear"
                  name="Prior year"
                  stroke={chartTokens.prior}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <details className="mt-4">
            <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-lg text-sm font-semibold text-[var(--color-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
              Read the series as a table
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table id={tableId} className="w-full min-w-[28rem] text-sm">
                <caption className="sr-only">
                  Monthly recurring revenue compared with the same month a year earlier
                </caption>
                <thead>
                  <tr className="text-xs uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
                    <th scope="col" className="py-2 text-start font-semibold">
                      Month
                    </th>
                    <th scope="col" className="py-2 text-end font-semibold">
                      This year
                    </th>
                    <th scope="col" className="py-2 text-end font-semibold">
                      Prior year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point: RevenuePoint) => (
                    <tr key={point.isoMonth} className="border-t border-[var(--color-border)]">
                      <th scope="row" className="py-2 text-start font-medium">
                        {point.month}
                      </th>
                      <td className="py-2 text-end font-mono tabular-nums">
                        {formatCurrencyPrecise(point.revenue)}
                      </td>
                      <td className="py-2 text-end font-mono tabular-nums text-[var(--color-ink-muted)]">
                        {formatCurrencyPrecise(point.priorYear)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-[var(--color-border-strong)] p-8 text-center">
          <p className="text-sm font-semibold">Nothing booked in this window</p>
          <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-6 text-[var(--color-ink-muted)]">
            Widen the range, or check that invoices for the period have been finalised.
          </p>
        </div>
      )}
    </section>
  );
}
