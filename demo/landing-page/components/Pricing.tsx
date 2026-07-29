"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Check } from "lucide-react";
import { CtaButton } from "./Hero";
import {
  alertShell,
  cardShell,
  focusRing,
  fontGeistMono,
  sectionShell,
  sectionSpacing,
  skeletonBlock,
  tapTarget,
} from "../lib/tokens";

/** One row of the price book, as served by the billing API for this region. */
export interface PlanPrice {
  id: string;
  monthlyCents: number;
  annualCents: number;
  unit: string;
}

export interface PricingProps {
  /** `null` until the price book arrives; an empty array means none is published. */
  plans: PlanPrice[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

type BillingPeriod = "monthly" | "annual";

interface PlanCopy {
  id: string;
  name: string;
  tagline: string;
  includes: string[];
  action: string;
  reassurance: string;
  featured: boolean;
}

const PLAN_COPY: PlanCopy[] = [
  {
    id: "hobby",
    name: "Hobby",
    tagline: "One region, one worker pool, no card.",
    includes: [
      "25,000 step executions each month",
      "7-day replay window",
      "Local engine, unlimited runs",
      "Community Slack, best effort",
    ],
    action: "Create a workspace",
    reassurance: "Hard-stops at the cap. It cannot bill you by accident.",
    featured: false,
  },
  {
    id: "team",
    name: "Team",
    tagline: "Per developer, for services that page someone.",
    includes: [
      "1,250,000 step executions included",
      "30-day replay window, exportable",
      "A worker pool per preview branch",
      "p99 dispatch SLO of 45ms",
      "Audit log streamed to your sink",
    ],
    action: "Start 14-day trial",
    reassurance: "No card for the trial. Overage is quoted before it is charged.",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Your VPC, your retention policy, our on-call.",
    includes: [
      "Single-tenant control plane in your VPC",
      "Replay retention up to 7 years",
      "SOC 2 Type II report and pen-test letter",
      "Named support engineer, 15-minute page",
    ],
    action: "Talk to an engineer",
    reassurance: "Contract review starts with a real architecture call, not a form.",
    featured: false,
  },
];

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatPrice(cents: number): string {
  return USD.format(cents / 100);
}

export default function Pricing({ plans, isLoading, error, onRetry }: PricingProps): ReactElement {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  function priceFor(planId: string): PlanPrice | null {
    if (plans === null) {
      return null;
    }
    return plans.find((entry: PlanPrice) => entry.id === planId) ?? null;
  }

  const periods: BillingPeriod[] = ["monthly", "annual"];

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className={`${sectionSpacing} border-y border-hairline bg-surface-sunken`}
    >
      <div className={sectionShell}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">Pricing</p>
            <h2
              id="pricing-title"
              className="mt-3 max-w-xl text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl"
            >
              Billed on steps committed, not on seats idling
            </h2>
          </div>

          <div
            role="group"
            aria-label="Billing period"
            className="flex gap-1 self-start rounded-xl border border-hairline bg-surface p-1"
          >
            {periods.map((option: BillingPeriod) => (
              <button
                key={option}
                type="button"
                aria-pressed={period === option}
                onClick={() => setPeriod(option)}
                className={`${tapTarget} ${focusRing} rounded-lg px-4 text-sm font-medium capitalize transition-colors duration-150 ease-out motion-reduce:transition-none ${
                  period === option
                    ? "bg-accent text-accent-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error !== null ? (
          <div
            role="alert"
            className={`${alertShell} mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}
          >
            <p className="text-sm text-ink-muted">
              The price book did not load — {error}. The figures below are hidden
              rather than guessed.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className={`${tapTarget} ${focusRing} inline-flex items-center justify-center rounded-lg border border-hairline-strong px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
            >
              Fetch again
            </button>
          </div>
        ) : null}

        {error === null && !isLoading && plans !== null && plans.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-hairline p-4 text-sm leading-relaxed text-ink-muted">
            No price book is published for this region yet.{" "}
            <a
              href="/contact/sales"
              className={`${focusRing} rounded underline decoration-hairline-strong underline-offset-4 hover:decoration-accent`}
            >
              Ask for current figures
            </a>{" "}
            and an engineer replies with the regional rate card.
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:items-start">
          {PLAN_COPY.map((plan: PlanCopy) => {
            const price = priceFor(plan.id);
            return (
              <article
                key={plan.id}
                aria-labelledby={`plan-${plan.id}`}
                className={`${cardShell} flex flex-col gap-6 p-6 lg:p-7 ${
                  plan.featured
                    ? "border-accent/55 ring-1 ring-accent/35 lg:-mt-6 lg:pb-10"
                    : ""
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 id={`plan-${plan.id}`} className="text-lg font-semibold tracking-[-0.01em]">
                      {plan.name}
                    </h3>
                    {plan.featured ? (
                      <span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
                        Most teams land here
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{plan.tagline}</p>
                </div>

                <div className="min-h-[4.5rem]">
                  {error !== null ? (
                    <p className="text-sm text-ink-faint">Figure withheld until the API answers.</p>
                  ) : isLoading ? (
                    <div>
                      <div className={`${skeletonBlock} h-10 w-28`} />
                      <span className="sr-only">Reading the price book…</span>
                    </div>
                  ) : price === null ? (
                    <div>
                      <p className="text-3xl font-semibold tracking-[-0.02em]">Custom</p>
                      <p className="mt-1 text-xs text-ink-faint">Annual contract, invoiced</p>
                    </div>
                  ) : (
                    <div>
                      <p className="flex items-baseline gap-2">
                        <span
                          data-metric="true"
                          className="text-4xl font-semibold tabular-nums tracking-[-0.02em]"
                          style={{ fontFamily: fontGeistMono }}
                        >
                          {formatPrice(period === "annual" ? price.annualCents : price.monthlyCents)}
                        </span>
                        <span className="text-sm text-ink-faint">{price.unit}</span>
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {period === "annual"
                          ? "Billed yearly, cancel inside the term"
                          : "Billed monthly, cancel any time"}
                      </p>
                    </div>
                  )}
                </div>

                <ul className="flex flex-col gap-3 border-t border-hairline pt-6 text-sm">
                  {plan.includes.map((item: string) => (
                    <li key={item} className="flex items-start gap-3 leading-relaxed text-ink-muted">
                      <Check
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-accent"
                        strokeWidth={2}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <CtaButton
                    tone={plan.featured ? "solid" : "ghost"}
                    className="w-full"
                    aria-describedby={`reassurance-${plan.id}`}
                  >
                    {plan.action}
                  </CtaButton>
                  <p
                    id={`reassurance-${plan.id}`}
                    className="mt-3 text-xs leading-relaxed text-ink-faint"
                  >
                    {plan.reassurance}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
