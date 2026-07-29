"use client";

import { useState } from "react";

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface PricingProps {
  tiers: PricingTier[];
}

type Cadence = "monthly" | "annual";

export function Pricing({ tiers }: PricingProps) {
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const isAnnual = cadence === "annual";

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing cadence"
          className="inline-flex rounded-full border border-border bg-bg-surface p-1"
        >
          <button
            type="button"
            aria-pressed={!isAnnual}
            onClick={() => setCadence("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              !isAnnual ? "bg-bg-raised text-text-primary" : "text-text-muted"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={isAnnual}
            onClick={() => setCadence("annual")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              isAnnual ? "bg-bg-raised text-text-primary" : "text-text-muted"
            }`}
          >
            Annual
            <span className="ml-1.5 font-mono text-xs tabular-nums text-accent">−17%</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          return (
            <div
              key={tier.id}
              className={`flex flex-col rounded-2xl border p-6 sm:p-8 ${
                tier.highlighted
                  ? "border-accent bg-bg-surface shadow-[0_0_0_1px_var(--color-accent),0_0_40px_var(--color-accent-glow)]"
                  : "border-border bg-bg-surface"
              }`}
            >
              <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{tier.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-mono text-4xl tabular-nums text-text-primary">
                  ${price}
                </span>
                <span className="text-sm text-text-faint">/mo</span>
              </div>
              {isAnnual ? (
                <span className="mt-1 text-xs text-text-faint">billed annually</span>
              ) : null}

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-text-muted">
                    <span aria-hidden="true" className="text-accent">
                      ＋
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-8 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                  tier.highlighted
                    ? "bg-accent text-bg-base hover:bg-accent-dim"
                    : "border border-border text-text-primary hover:border-accent"
                }`}
              >
                Choose {tier.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
