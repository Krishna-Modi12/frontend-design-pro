"use client";

import type { ReactElement } from "react";
import type { PlatformMetric } from "./Hero";
import { sectionShell, skeletonBlock } from "../lib/tokens";

export interface MetricsStripProps {
  /** Platform-wide counters. Empty while the first request is in flight. */
  metrics: PlatformMetric[];
  isLoading: boolean;
  /** Transport-level failure text, or `null` when the last read succeeded. */
  error: string | null;
}

/**
 * The four counters that describe the platform rather than the reader's account.
 *
 * Widths are deliberately unequal — the lead counter takes twice the track of the
 * other three (`2fr 1fr 1fr 1fr`). An even four-up would read as a card grid, and
 * the first figure is the one the page is actually arguing with.
 *
 * Figures are `[data-metric]`, which `lib/tokens.ts` maps to the mono face with
 * `font-variant-numeric: tabular-nums` — so a digit changing on a re-read cannot
 * reflow the row.
 */
export default function MetricsStrip({
  metrics,
  isLoading,
  error,
}: MetricsStripProps): ReactElement {
  return (
    <section
      aria-labelledby="counters-title"
      className="border-y border-hairline bg-surface-sunken"
    >
      <h2 id="counters-title" className="sr-only">
        Platform counters
      </h2>

      <div className={sectionShell} aria-live="polite" aria-busy={isLoading}>
        {error !== null ? (
          <p className="py-6 text-sm text-ink-faint">
            Platform counters unavailable — {error}
          </p>
        ) : isLoading ? (
          <ul className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            {["committed", "resumed", "regions", "duplicates"].map((slot: string) => (
              <li key={slot}>
                <div className={`${skeletonBlock} h-8 w-28`} />
                <div className={`${skeletonBlock} mt-2 h-3 w-24`} />
                <span className="sr-only">Reading {slot} counter…</span>
              </li>
            ))}
          </ul>
        ) : metrics.length > 0 ? (
          <dl className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            {metrics.map((metric: PlatformMetric) => (
              <div key={metric.id}>
                {/* `<dt>` leads the group even though the figure is what reads
                    first: a term group is one or more <dt> followed by one or
                    more <dd>, and `dd, dt, dd` is not a <dl> any longer. The
                    visible label repeats underneath as a second <dd>, which is
                    how Hero already solves the same ordering problem. */}
                <dt className="sr-only">{metric.label}</dt>
                <dd
                  data-metric="true"
                  className="text-3xl font-semibold tabular-nums text-accent lg:text-4xl"
                >
                  {metric.value}
                </dd>
                <dd className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-faint">
                  {metric.label}
                </dd>
                <dd className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {metric.caption}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="py-6 text-sm text-ink-muted">
            No counters reported for this window.
          </p>
        )}
      </div>
    </section>
  );
}
