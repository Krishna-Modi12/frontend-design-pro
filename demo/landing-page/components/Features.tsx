"use client";

import type { ReactElement } from "react";
import { Activity, Braces, History, Terminal, Timer } from "lucide-react";
import {
  alertShell,
  cardShell,
  focusRing,
  fontGeistMono,
  sectionShell,
  sectionSpacing,
  skeletonBlock,
} from "../lib/tokens";
import type { PlatformMetric } from "./Hero";

export interface FeaturesProps {
  /** Live throughput reading, or `null` when the control plane has not answered. */
  throughput: PlatformMetric | null;
  isLoading: boolean;
  error: string | null;
}

interface RunStep {
  name: string;
  elapsed: string;
  outcome: "replayed" | "resumed" | "failed" | "committed";
  note: string;
}

const RUN_TRACE: RunStep[] = [
  { name: "hold-inventory", elapsed: "42ms", outcome: "replayed", note: "read from the log, not re-executed" },
  { name: "cool-off", elapsed: "45s", outcome: "resumed", note: "timer outlived two deploys" },
  { name: "charge-card", elapsed: "7s", outcome: "failed", note: "gateway 503, attempt 1 of 6" },
  { name: "charge-card", elapsed: "311ms", outcome: "committed", note: "same idempotency scope" },
];

const OUTCOME_INK: Record<RunStep["outcome"], string> = {
  replayed: "text-ink-faint",
  resumed: "text-accent",
  failed: "text-error",
  committed: "text-success",
};

interface BackoffAttempt {
  attempt: string;
  wait: string;
}

const BACKOFF: BackoffAttempt[] = [
  { attempt: "1", wait: "+2s" },
  { attempt: "2", wait: "+7s" },
  { attempt: "3", wait: "+26s" },
  { attempt: "4", wait: "+1m 47s" },
  { attempt: "5", wait: "+6m 12s" },
];

export default function Features({ throughput, isLoading, error }: FeaturesProps): ReactElement {
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className={sectionSpacing}>
      <div className={sectionShell}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">Runtime</p>
            <h2
              id="capabilities-title"
              className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl"
            >
              Four guarantees you would otherwise hand-roll
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-ink-muted">
            Each one is enforced by the log rather than by team convention, which is
            why they survive a rewrite, a new hire and a bad Tuesday.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <article
            className={`${cardShell} flex flex-col justify-between gap-8 p-6 md:col-span-4 md:row-span-2 md:min-h-[23rem] lg:p-8`}
          >
            <div>
              <History aria-hidden="true" className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.01em]">
                Deterministic replay, step by step
              </h3>
              <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-ink-muted">
                Every completed step writes its result once. On replay the runtime
                returns that result instead of calling your code again, so a crash
                after the charge never charges twice.
              </p>
            </div>

            <ol className="flex flex-col gap-3" style={{ fontFamily: fontGeistMono }}>
              {RUN_TRACE.map((step: RunStep, index: number) => (
                <li
                  key={`${step.name}-${index}`}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline pb-3 text-xs last:border-b-0 last:pb-0"
                >
                  <span className="text-ink">{step.name}</span>
                  <span data-metric="true" className="tabular-nums text-ink-faint">
                    {step.elapsed}
                  </span>
                  <span className={`${OUTCOME_INK[step.outcome]} uppercase tracking-[0.08em]`}>
                    {step.outcome}
                  </span>
                  <span className="basis-full text-ink-faint sm:basis-auto">{step.note}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className={`${cardShell} flex flex-col justify-between gap-6 p-6 md:col-span-2`}>
            <div>
              <Activity aria-hidden="true" className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em]">Steps committed now</h3>
            </div>
            <div aria-live="polite" aria-busy={isLoading}>
              {error !== null ? (
                <p role="alert" className={`${alertShell} p-3 text-xs leading-relaxed text-ink-muted`}>
                  Throughput unreadable — {error}
                </p>
              ) : isLoading ? (
                <div className={`${skeletonBlock} h-9 w-28`} />
              ) : throughput !== null ? (
                <div>
                  <p
                    data-metric="true"
                    className="text-3xl font-semibold tabular-nums"
                    style={{ fontFamily: fontGeistMono }}
                  >
                    {throughput.value}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                    {throughput.caption}
                  </p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-ink-muted">
                  Nothing sampled yet. The first workflow you run shows up here within
                  a second.
                </p>
              )}
            </div>
          </article>

          <article className={`${cardShell} flex flex-col gap-4 p-6 md:col-span-2`}>
            <Braces aria-hidden="true" className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <h3 className="text-lg font-semibold tracking-[-0.01em]">Typed step contracts</h3>
            <p className="text-pretty text-sm leading-relaxed text-ink-muted">
              A step&apos;s input and output are inferred from the function you pass.
              Change the shape and the replay of an in-flight run fails at compile
              time, not at 03:14 in production.
            </p>
            <code
              className="rounded-lg border border-hairline bg-surface-sunken px-3 py-2 text-xs text-ink-muted"
              style={{ fontFamily: fontGeistMono }}
            >
              step.run&lt;Hold, Charge&gt;()
            </code>
          </article>

          <article className={`${cardShell} flex flex-col gap-4 p-6 md:col-span-3 md:min-h-[15rem]`}>
            <Timer aria-hidden="true" className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <h3 className="text-lg font-semibold tracking-[-0.01em]">Backoff you can read</h3>
            <p className="text-pretty text-sm leading-relaxed text-ink-muted">
              Exponential with jitter, capped and printed. The schedule below is the
              default for six attempts — override it per step, never per deploy.
            </p>
            <table className="w-full text-xs" style={{ fontFamily: fontGeistMono }}>
              <caption className="sr-only">Default retry schedule for six attempts</caption>
              <thead>
                <tr className="text-ink-faint">
                  <th scope="col" className="py-2 text-start font-normal">
                    attempt
                  </th>
                  <th scope="col" className="py-2 text-end font-normal">
                    waits
                  </th>
                </tr>
              </thead>
              <tbody>
                {BACKOFF.map((row: BackoffAttempt) => (
                  <tr key={row.attempt} className="border-t border-hairline">
                    <td data-metric="true" className="py-2 tabular-nums text-ink">
                      {row.attempt}
                    </td>
                    <td data-metric="true" className="py-2 text-end tabular-nums text-ink-muted">
                      {row.wait}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className={`${cardShell} flex flex-col gap-4 p-6 md:col-span-3`}>
            <Terminal aria-hidden="true" className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <h3 className="text-lg font-semibold tracking-[-0.01em]">The dev loop runs offline</h3>
            <p className="text-pretty text-sm leading-relaxed text-ink-muted">
              The local engine writes the same log format as production, so you can
              kill a worker mid-run, restart it and watch the replay — on a plane, with
              no account.
            </p>
            <pre
              className="overflow-x-auto rounded-lg border border-hairline bg-surface-sunken px-3 py-2 text-xs leading-relaxed text-ink-muted"
              style={{ fontFamily: fontGeistMono }}
            >
              <code>{"npx tracepoint dev --replay ./.tracepoint/runs/4f2a"}</code>
            </pre>
            <a
              href="/docs/local-engine"
              className={`${focusRing} inline-flex w-fit items-center rounded text-sm font-medium text-accent underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent motion-reduce:transition-none`}
            >
              Local engine reference
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
