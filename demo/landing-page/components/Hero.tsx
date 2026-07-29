"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ForwardedRef, ReactElement, Ref } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import {
  alertShell,
  cardShell,
  focusRing,
  fontGeistMono,
  sectionShell,
  skeletonBlock,
  tapTarget,
} from "../lib/tokens";

/** A single reading from the control plane, already formatted for display. */
export interface PlatformMetric {
  id: string;
  label: string;
  value: string;
  caption: string;
}

export interface CtaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `solid` is the page's single primary style; `ghost` is its pair. */
  tone?: "solid" | "ghost";
}

const CTA_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 text-base font-medium transition-colors duration-150 ease-out motion-reduce:transition-none";

const CTA_TONES: Record<"solid" | "ghost", string> = {
  solid: "bg-accent text-accent-ink hover:bg-accent-strong",
  ghost: "border border-hairline-strong text-ink-muted hover:border-accent hover:text-ink",
};

/**
 * The page's primary action. Ref-forwarding is load-bearing here: the shell
 * returns focus to this button when the quickstart disclosure closes.
 */
export const CtaButton = forwardRef(function CtaButton(
  { tone = "solid", className = "", children, type = "button", ...rest }: CtaButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  return (
    <button
      ref={ref}
      type={type}
      className={`${tapTarget} ${focusRing} ${CTA_BASE} ${CTA_TONES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export interface HeroProps {
  /** Live control-plane readings. Empty while the first request is in flight. */
  metrics: PlatformMetric[];
  isLoading: boolean;
  /** Transport-level failure text, or `null` when the last read succeeded. */
  error: string | null;
  onRetry: () => void;
  onQuickstart: () => void;
  quickstartOpen: boolean;
  ctaRef: Ref<HTMLButtonElement>;
}

const WORKFLOW_SOURCE = `import { step, workflow } from "@tracepoint/sdk";

export default workflow("reserve-seat", async (order) => {
  const hold = await step.run("hold-inventory", () =>
    inventory.hold(order.sku, { qty: order.qty }),
  );

  await step.sleep("cool-off", "45s");

  const charge = await step.run(
    "charge-card",
    { retries: 6, backoff: "exponential" },
    () => payments.charge(order.paymentId, hold.amountCents),
  );

  return { holdId: hold.id, chargeId: charge.id };
});`;

export default function Hero({
  metrics,
  isLoading,
  error,
  onRetry,
  onQuickstart,
  quickstartOpen,
  ctaRef,
}: HeroProps): ReactElement {
  return (
    <section
      id="overview"
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-hairline"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(112% 118% at 14% 0%, oklch(25.6% 0.042 186) 0%, oklch(17.4% 0.012 258) 56%)",
        }}
      />
      <div
        className={`${sectionShell} relative grid gap-14 pt-14 pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-28 lg:pb-24`}
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-sunken px-3 py-1 text-xs uppercase tracking-[0.14em] text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            v3.4 · durable execution
          </p>

          <h1
            id="hero-title"
            className="mt-6 text-balance text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]"
          >
            Retries and replay belong to the runtime, not to your handlers.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
            Tracepoint checkpoints every step of a workflow to an append-only log,
            so a worker that dies mid-charge resumes on the next line instead of the
            first one. No queues to babysit, no idempotency keys to invent.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton
              ref={ctaRef}
              onClick={onQuickstart}
              aria-expanded={quickstartOpen}
              aria-controls="quickstart"
            >
              Start building
              <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
            </CtaButton>

            <a
              href="#capabilities"
              className={`${tapTarget} ${focusRing} inline-flex items-center justify-center gap-2 rounded-lg border border-hairline-strong px-6 text-base font-medium text-ink-muted transition-colors duration-150 ease-out hover:border-accent hover:text-ink motion-reduce:transition-none`}
            >
              <BookOpen aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
              How the log works
            </a>
          </div>

          <div
            className="mt-8 border-t border-hairline pt-6"
            aria-live="polite"
            aria-busy={isLoading}
          >
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">
              Live from the control plane
            </p>

            {error !== null ? (
              <div
                role="alert"
                className={`${alertShell} mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}
              >
                <p className="text-sm text-ink-muted">
                  Status feed unreachable — {error}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className={`${tapTarget} ${focusRing} inline-flex items-center justify-center rounded-lg border border-hairline-strong px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
                >
                  Read again
                </button>
              </div>
            ) : isLoading ? (
              <ul className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3">
                {["dispatch", "delivery", "replay"].map((slot: string) => (
                  <li key={slot}>
                    <div className={`${skeletonBlock} h-7 w-24`} />
                    <div className={`${skeletonBlock} mt-2 h-3 w-20`} />
                    <span className="sr-only">Reading {slot} figures…</span>
                  </li>
                ))}
              </ul>
            ) : metrics.length > 0 ? (
              <dl className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3">
                {metrics.map((metric: PlatformMetric) => (
                  <div key={metric.id}>
                    <dt className="sr-only">{metric.label}</dt>
                    <dd
                      data-metric="true"
                      className="text-2xl font-semibold tabular-nums text-ink"
                      style={{ fontFamily: fontGeistMono }}
                    >
                      {metric.value}
                    </dd>
                    <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                      {metric.label} · {metric.caption}
                    </p>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-hairline p-4">
                <p className="text-sm font-medium text-ink">
                  No samples in the last 60 seconds
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  The control plane is idle in this region.{" "}
                  <a
                    href="/status"
                    className={`${focusRing} rounded underline decoration-hairline-strong underline-offset-4 hover:decoration-accent`}
                  >
                    Open the status history
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`${cardShell} h-fit overflow-hidden shadow-[var(--shadow-lift)]`}>
          <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            <span className="text-xs text-ink-muted" style={{ fontFamily: fontGeistMono }}>
              checkout/reserve-seat.ts
            </span>
            <span className="ms-auto text-xs text-ink-faint">
              replayed 3× · 0 duplicate charges
            </span>
          </div>
          <pre
            className="overflow-x-auto px-4 py-5 text-[0.8125rem] leading-relaxed text-ink-muted"
            style={{ fontFamily: fontGeistMono }}
          >
            <code>{WORKFLOW_SOURCE}</code>
          </pre>
          <p className="border-t border-hairline px-4 py-3 text-xs leading-relaxed text-ink-faint">
            <code style={{ fontFamily: fontGeistMono }}>step.sleep</code> survives
            deploys: the worker exits, the log keeps the timer, a fresh worker picks
            the run up at the next line.
          </p>
        </div>
      </div>
    </section>
  );
}
