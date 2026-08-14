import type { ReactElement } from "react";
import { alertShell, fadeUp, sectionShell, skeletonBlock } from "../lib/tokens";
import { useFadeUp } from "../lib/useFadeUp";

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
 * not. The first one is the headline; the rest qualify it. The same reasoning
 * puts the accent on that first value alone: colour here is hierarchy, and four
 * cobalt numbers in a row would flatten the thing the width is trying to say.
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
  const { ref, visible } = useFadeUp();

  return (
    <section
      id="numbers"
      aria-label="Operating figures"
      className="border-y border-surface-border bg-surface-raised"
    >
      {/* py-12 flat, with no lg step. The light version ran `py-12 lg:py-16`,
          and at 1920 the extra band read as the section having nothing to say. */}
      <div ref={ref} data-fade className={`${sectionShell} py-12 ${fadeUp(visible)}`}>
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
        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
          {errorMessage ??
            "The overview endpoint did not answer. Everything else on this page is unaffected."}
        </p>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className={`${alertShell} p-5`}>
        <p className="text-sm font-medium text-ink">Nothing rehearsed yet.</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
          These figures start once the first pull request opens against a watched
          database. Point Bellwether at a replica and this strip fills in.
        </p>
      </div>
    );
  }

  return (
    // One <div> per group, each holding its <dt> and its <dd>s and nothing
    // else. A flat run of dt, dd, dt, dd is valid but ungroupable; a <div> in
    // a <dl> may only wrap a complete term group, which is what this is.
    <dl className={TRACK}>
      {metrics.map((metric, index) => (
        <div key={metric.id}>
          <dd
            data-metric
            className={`text-4xl font-semibold tracking-tight lg:text-5xl ${
              index === 0 ? "text-accent-text" : "text-ink"
            }`}
          >
            {metric.value}
          </dd>
          <dt data-label className="mt-3 text-ink-muted">
            {metric.label}
          </dt>
          <dd className="mt-3 text-sm leading-relaxed text-ink-secondary text-pretty">
            {metric.caption}
          </dd>
        </div>
      ))}
    </dl>
  );
}
