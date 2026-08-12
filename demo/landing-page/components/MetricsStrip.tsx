import type { ReactElement } from "react";
import { alertShell, sectionShell, skeletonBlock } from "../lib/tokens";

export interface PlatformMetric {
  id: string;
  value: string;
  label: string;
  caption: string;
}

export interface MetricsStripProps {
  metrics: PlatformMetric[];
  status: "loading" | "error" | "ready";
  /** Shown in the error branch. Never a raw exception string. */
  errorMessage?: string;
}

/**
 * Asymmetric track: the first column takes twice the width of the other three.
 * Four equal columns is the arrangement that makes a metric strip look
 * generated — it implies the four numbers are interchangeable, and they are
 * not. The first one is the headline; the rest qualify it.
 *
 * Every number carries `data-metric`, which is what `lib/tokens.ts` hangs the
 * monospace + `tabular-nums` rule on. Proportional figures are different widths
 * per glyph, so a column of them fails to line up and a value that updates in
 * place shifts the layout under the reader.
 */
const TRACK = "grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-10";

export default function MetricsStrip({
  metrics,
  status,
  errorMessage,
}: MetricsStripProps): ReactElement {
  return (
    <section
      id="numbers"
      aria-label="Operating figures"
      className="border-y border-surface-border bg-surface-elevated"
    >
      <div className={`${sectionShell} py-12 lg:py-16`}>
        <MetricsBody metrics={metrics} status={status} errorMessage={errorMessage} />
      </div>
    </section>
  );
}

/**
 * The four states live in their own component so each one is a return rather
 * than a nested ternary. `&&` is not used to gate JSX anywhere in this app: it
 * renders `0` when the left side is a number, and it hides the fact that the
 * empty case was never designed.
 */
function MetricsBody({
  metrics,
  status,
  errorMessage,
}: MetricsStripProps): ReactElement {
  if (status === "loading") {
    return (
      <div className={TRACK} aria-busy="true" aria-live="polite">
        {["a", "b", "c", "d"].map((key) => (
          <div key={key}>
            <div className={`${skeletonBlock} h-10 w-28`} />
            <div className={`${skeletonBlock} mt-3 h-3 w-20`} />
            <div className={`${skeletonBlock} mt-3 h-3 w-full max-w-[16rem]`} />
          </div>
        ))}
        <span className="sr-only">Loading operating figures</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`${alertShell} p-5`} role="alert">
        <p className="text-sm font-medium text-ink">Figures are not available.</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {errorMessage ?? "The overview endpoint did not answer. Everything else on this page is unaffected."}
        </p>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className={`${alertShell} p-5`}>
        <p className="text-sm font-medium text-ink">No figures yet.</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          A yard reports once it has moved something. Run a rollout and this
          strip fills in.
        </p>
      </div>
    );
  }

  return (
    // One <div> per group, each holding its <dt> and its <dd>s and nothing
    // else. A flat run of dt, dd, dt, dd is valid but ungroupable; a <div> in
    // a <dl> may only wrap a complete term group, which is what this is.
    <dl className={TRACK}>
      {metrics.map((metric) => (
        <div key={metric.id}>
          <dd
            data-metric
            className="text-4xl font-semibold tracking-tight text-accent lg:text-5xl"
          >
            {metric.value}
          </dd>
          <dt className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
            {metric.label}
          </dt>
          <dd className="mt-3 text-sm leading-relaxed text-ink-faint">
            {metric.caption}
          </dd>
        </div>
      ))}
    </dl>
  );
}
