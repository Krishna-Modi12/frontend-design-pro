import type { ReactElement } from "react";
import { alertShell, sectionShell, skeletonBlock } from "../lib/tokens";

export interface PlatformMetric {
  id: string;
  /** Pre-formatted, because the thousands separator is part of the design. */
  value: string;
  label: string;
  caption: string;
  /** The file this figure was copied from — rendered, so the claim is checkable. */
  source: string;
}

export interface MetricsStripProps {
  metrics: PlatformMetric[];
  isLoading: boolean;
  /** Human-readable reason, or `null` when the request succeeded. */
  error: string | null;
}

/** Stable keys for the loading skeletons — an array index is not a key. */
const SKELETON_SLOTS = ["lead", "second", "third", "fourth"] as const;

/**
 * The figures are the page's entire argument, so they are the one thing it
 * fetches — and the four states are real rather than decorative: this strip is
 * what a reader sees if the endpoint is down.
 *
 * The track is `2fr 1fr 1fr 1fr`, and the type scale is uneven to match. Note
 * the ceiling on the narrow cells: at `lg` a 1fr column is ~192px, and
 * "332,974" set in a monospace face at `text-5xl` is ~202px — the brief's own
 * `text-5xl sm:text-6xl` cannot coexist with the track the brief also specifies,
 * so the narrow cells stop at `text-4xl` and only the lead figure goes large.
 */
export default function MetricsStrip({
  metrics,
  isLoading,
  error,
}: MetricsStripProps): ReactElement {
  const [lead, ...rest] = metrics;

  return (
    <section
      aria-labelledby="metrics-heading"
      className="border-y border-surface-border bg-surface-sunken"
    >
      <div className={`${sectionShell} py-12 lg:py-14`}>
        <h2 id="metrics-heading" className="sr-only">
          What the pack is made of
        </h2>

        <div aria-live="polite" aria-busy={isLoading}>
          {error === null ? null : (
            <p className={`${alertShell} p-4 text-sm text-ink-muted`} role="status">
              <span className="font-medium text-error">Figures unavailable</span> —{" "}
              {error}. They are committed in{" "}
              <code className="font-mono text-ink">screenshot-fixture.json</code> if you
              would rather read them from the repo.
            </p>
          )}

          {error === null && isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
              {SKELETON_SLOTS.map((slot: string) => (
                <div key={slot}>
                  <div className={`${skeletonBlock} h-10 w-32`} />
                  <div className={`${skeletonBlock} mt-3 h-3 w-24`} />
                  <div className={`${skeletonBlock} mt-3 h-3 w-full`} />
                </div>
              ))}
            </div>
          ) : null}

          {error === null && !isLoading && lead === undefined ? (
            <p className="text-sm text-ink-muted">
              The overview endpoint answered, but reported no figures.
            </p>
          ) : null}

          {error === null && !isLoading && lead !== undefined ? (
            <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
              <div>
                {/* `<dt>` leads the group even though the figure is what reads
                    first: a term group is one or more <dt> followed by one or
                    more <dd>, and `dd, dt, dd` is not a <dl> any more. The
                    label is visually reordered, not structurally. */}
                <dt className="sr-only">{lead.label}</dt>
                <dd
                  data-metric="true"
                  className="text-4xl font-semibold text-accent lg:text-6xl"
                >
                  {lead.value}
                </dd>
                <dd className="mt-3 text-xs uppercase tracking-[0.14em] text-ink-faint">
                  {lead.label}
                </dd>
                <dd className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
                  {lead.caption}
                </dd>
                <dd className="mt-2 font-mono text-xs text-ink-faint/80">{lead.source}</dd>
              </div>

              {rest.map((metric: PlatformMetric) => (
                <div key={metric.id}>
                  <dt className="sr-only">{metric.label}</dt>
                  <dd data-metric="true" className="text-3xl font-semibold text-accent lg:text-4xl">
                    {metric.value}
                  </dd>
                  <dd className="mt-3 text-xs uppercase tracking-[0.14em] text-ink-faint">
                    {metric.label}
                  </dd>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {metric.caption}
                  </dd>
                  <dd className="mt-2 font-mono text-xs text-ink-faint/80">{metric.source}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
