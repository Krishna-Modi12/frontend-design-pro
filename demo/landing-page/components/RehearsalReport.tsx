import type { ReactElement } from "react";
import type { ReportRow, Verdict } from "../lib/content";
import { cardShell } from "../lib/tokens";

export interface RehearsalReportProps {
  id: string;
  verdict: Verdict;
  verdictLabel: string;
  statement: string;
  target: string;
  rows: readonly ReportRow[];
  finding: string;
  trafficByHour: readonly number[];
  quietWindow: { from: number; to: number };
}

/**
 * The hero artifact: one rehearsal, reported.
 *
 * This replaces a terminal panel. A fake terminal is the default visual for a
 * developer-tool landing page, and it shows the wrong thing — a command being
 * typed, which is the part the reader already knows how to do. What they are
 * buying is the answer that comes back, so the answer is what the hero renders.
 * It is also a `<div>`-built screenshot either way, and the anti-slop wall bans
 * those specifically; the difference is that this one is real markup carrying
 * real text, not a picture of an interface drawn in boxes.
 */
const VERDICT_STYLE: Record<Verdict, string> = {
  pass: "border-positive/35 bg-positive/10 text-positive",
  hold: "border-caution/35 bg-caution/10 text-caution",
  refuse: "border-critical/35 bg-critical/10 text-critical",
};

export default function RehearsalReport({
  id,
  verdict,
  verdictLabel,
  statement,
  target,
  rows,
  finding,
  trafficByHour,
  quietWindow,
}: RehearsalReportProps): ReactElement {
  return (
    <figure className={`${cardShell} m-0 overflow-hidden`}>
      <figcaption className="flex items-center justify-between gap-4 border-b border-surface-border px-5 py-4 sm:px-6">
        <span data-metric className="text-sm font-medium text-ink-secondary">
          {id}
        </span>
        <span
          className={`${VERDICT_STYLE[verdict]} inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]`}
        >
          {verdictLabel}
        </span>
      </figcaption>

      {/* The statement under rehearsal. Sunken rather than raised: this is the
          input the reader handed over, not something the product produced. */}
      <div className="border-b border-surface-border bg-surface-sunken px-5 py-4 sm:px-6">
        <code
          data-metric
          className="block text-[0.8125rem] leading-relaxed text-ink [overflow-wrap:anywhere]"
        >
          {statement}
        </code>
        <p data-metric className="mt-2 text-xs text-ink-muted">
          {target}
        </p>
      </div>

      <dl className="divide-y divide-surface-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-5 px-5 py-4 sm:px-6"
          >
            <dt data-label className="col-start-1 text-xs text-ink-muted">
              {row.label}
            </dt>
            <dd
              data-metric
              className="col-start-2 row-start-1 text-lg font-semibold text-ink"
            >
              {row.value}
            </dd>
            <dd className="col-start-1 mt-1.5 text-sm leading-relaxed text-ink-secondary text-pretty">
              {row.note}
            </dd>
          </div>
        ))}
      </dl>

      <HourlyLoad trafficByHour={trafficByHour} quietWindow={quietWindow} />

      {/* The verdict in prose. A rule in the caution hue rather than a tinted
          panel — a full colour wash behind a paragraph on a light ground turns
          the text's effective contrast into a second thing to verify, and this
          says the same thing with an edge. */}
      <div className="border-t border-surface-border px-5 py-5 sm:px-6">
        <p className="border-s-2 border-caution ps-4 text-sm leading-relaxed text-ink-secondary text-pretty">
          {finding}
        </p>
      </div>
    </figure>
  );
}

/**
 * Twenty-four bars, midnight to 23:00, with the recommended window marked.
 *
 * Deliberately not a chart library: it is one array of numbers rendered as
 * heights, and pulling in a charting dependency to draw twenty-four rectangles
 * is the kind of reach for a package the pack argues against. It carries a
 * text alternative rather than `aria-hidden`, because the shape *is* the
 * evidence for the recommendation above it — hiding it would leave a screen
 * reader with the advice and none of the reason for it.
 */
function HourlyLoad({
  trafficByHour,
  quietWindow,
}: Pick<RehearsalReportProps, "trafficByHour" | "quietWindow">): ReactElement {
  const peakHour = trafficByHour.indexOf(Math.max(...trafficByHour));
  const pad = (h: number): string => String(h).padStart(2, "0");

  return (
    <div className="border-t border-surface-border px-5 py-4 sm:px-6">
      <div className="flex items-baseline justify-between gap-4">
        <span data-label className="text-xs text-ink-muted">
          Writes by hour
        </span>
        <span data-metric className="text-xs text-ink-muted">
          quiet {pad(quietWindow.from)}:00–{pad(quietWindow.to)}:00
        </span>
      </div>

      <div
        role="img"
        aria-label={`Write volume by hour. Busiest at ${pad(peakHour)}:00; quietest between ${pad(quietWindow.from)}:00 and ${pad(quietWindow.to)}:00, which is the window this rehearsal recommends.`}
        className="mt-3 flex h-12 items-end gap-px"
      >
        {trafficByHour.map((load, hour) => {
          const quiet = hour >= quietWindow.from && hour < quietWindow.to;
          return (
            <span
              key={hour}
              // Height is the datum, so it is an inline style rather than a
              // class: twenty-four arbitrary Tailwind heights would be twenty-four
              // classes generated from data, and Tailwind cannot see values that
              // only exist at runtime.
              style={{ height: `${Math.max(load, 4)}%` }}
              className={`flex-1 rounded-t-[2px] ${quiet ? "bg-accent" : "bg-surface-border-strong/45"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
