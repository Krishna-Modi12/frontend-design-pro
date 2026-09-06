/**
 * good-design-md-round-trip.jsx
 *
 * Gold example: SaaS pricing page demonstrating DESIGN.md token injection.
 * Custom design tokens are sourced from a hypothetical DESIGN.md file and
 * injected via the @theme block below.
 *
 * Design tokens sourced from DESIGN.md round-trip:
 *   - Brand palette in OKLCH
 *   - Cabinet Grotesk (display) + Berkeley Mono (code/accent)
 *   - Custom spacing scale and border-radius tokens
 */

// @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap')
// @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400&display=swap')

import { useState } from "react";

/* ── DESIGN.md token injection via @theme ─────────────────────────────────── */
const themeCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,700;1,300&display=swap');

  @theme {
    /* ── Typefaces — from DESIGN.md */
    --font-display: 'Cabinet Grotesk', system-ui, sans-serif;    /* from DESIGN.md */
    --font-serif:   'Fraunces', Georgia, serif;                   /* from DESIGN.md */
    --font-mono:    'Berkeley Mono', 'Fira Code', monospace;      /* from DESIGN.md */

    /* ── Brand palette — from DESIGN.md (OKLCH) */
    --color-brand-50:   oklch(97% 0.02 265);   /* from DESIGN.md */
    --color-brand-100:  oklch(92% 0.05 265);   /* from DESIGN.md */
    --color-brand-300:  oklch(76% 0.14 265);   /* from DESIGN.md */
    --color-brand-500:  oklch(58% 0.22 265);   /* from DESIGN.md */
    --color-brand-600:  oklch(50% 0.22 265);   /* from DESIGN.md */
    --color-brand-700:  oklch(42% 0.20 265);   /* from DESIGN.md */
    --color-brand-900:  oklch(22% 0.12 265);   /* from DESIGN.md */

    /* ── Neutrals — from DESIGN.md (OKLCH) */
    --color-surface:    oklch(98% 0.005 265);  /* from DESIGN.md */
    --color-surface-d:  oklch(14% 0.012 265);  /* from DESIGN.md — dark mode */
    --color-muted:      oklch(55% 0.015 265);  /* from DESIGN.md */
    --color-border:     oklch(88% 0.012 265);  /* from DESIGN.md */
    --color-border-d:   oklch(28% 0.018 265);  /* from DESIGN.md — dark mode */
    --color-ink:        oklch(18% 0.018 265);  /* from DESIGN.md */
    --color-ink-d:      oklch(94% 0.008 265);  /* from DESIGN.md — dark mode */

    /* ── Accent — from DESIGN.md (OKLCH) */
    --color-accent:     oklch(72% 0.18 145);   /* from DESIGN.md */
    --color-warn:       oklch(72% 0.19 60);    /* from DESIGN.md */
    --color-danger:     oklch(62% 0.24 25);    /* from DESIGN.md */

    /* ── Spacing scale — from DESIGN.md */
    --space-xs:  0.25rem;   /* from DESIGN.md */
    --space-sm:  0.5rem;    /* from DESIGN.md */
    --space-md:  1rem;      /* from DESIGN.md */
    --space-lg:  1.5rem;    /* from DESIGN.md */
    --space-xl:  2.5rem;    /* from DESIGN.md */
    --space-2xl: 4rem;      /* from DESIGN.md */

    /* ── Radius tokens — from DESIGN.md */
    --radius-sm:   0.375rem;   /* from DESIGN.md */
    --radius-md:   0.75rem;    /* from DESIGN.md */
    --radius-lg:   1.25rem;    /* from DESIGN.md */
    --radius-pill: 9999px;     /* from DESIGN.md */
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ── Data ─────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo founders moving fast",
    price: 29,
    unit: "/mo",
    highlight: false,
    cta: "Start free trial",
    features: [
      "Up to 3 active projects",
      "5 GB asset storage",
      "DESIGN.md round-trip exports",
      "Community support",
      "1 team seat",
    ],
    limits: "7-day free trial · No card required",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For teams that ship weekly",
    price: 79,
    unit: "/mo",
    highlight: true,
    badge: "Most popular",
    cta: "Start free trial",
    features: [
      "Unlimited active projects",
      "50 GB asset storage",
      "DESIGN.md round-trip exports",
      "Priority support (< 4 h SLA)",
      "Up to 12 team seats",
      "Custom domain publishing",
      "Advanced analytics",
    ],
    limits: "14-day free trial · Cancel anytime",
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For orgs with serious design ops",
    price: 199,
    unit: "/mo",
    highlight: false,
    cta: "Talk to sales",
    features: [
      "Everything in Growth",
      "500 GB asset storage",
      "SSO & SCIM provisioning",
      "Dedicated CSM",
      "Unlimited team seats",
      "SLA 99.9% uptime",
      "Audit logs & SOC 2",
    ],
    limits: "Custom contract available",
  },
];
export type PlansItem = (typeof PLANS)[number]

const FAQS = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades take effect immediately; downgrades apply at the next billing cycle.",
  },
  {
    q: "What counts as a team seat?",
    a: "Any user who logs in within a 30-day window. Guests with comment-only access are free.",
  },
  {
    q: "Is there a discount for annual billing?",
    a: "Annual billing saves 17.3% versus monthly — toggle above to see annual prices.",
  },
];

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function PricingSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse"
      aria-label="Loading pricing plans"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-[1.25rem] bg-[oklch(90%_0.01_265)] h-96"
        />
      ))}
    </div>
  );
}

/* ── Error state ──────────────────────────────────────────────────────────── */
function PricingError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-[1.25rem] border border-[oklch(62%_0.24_25)] bg-[oklch(97%_0.02_25)] p-8 text-center"
    >
      <p className="text-[oklch(62%_0.24_25)] font-semibold mb-3">
        {message || "Unable to load pricing data."}
      </p>
      <button
        onClick={onRetry}
        className="min-h-[44px] px-6 py-3 rounded-full bg-[oklch(62%_0.24_25)] text-white font-medium
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(62%_0.24_25)]
          hover:bg-[oklch(55%_0.24_25)] transition-colors duration-200"
        aria-label="Retry loading pricing plans"
      >
        Try again
      </button>
    </div>
  );
}

/* ── Plan card ────────────────────────────────────────────────────────────── */
function PlanCard({ plan, annual, dark }: { plan: PlansItem; annual: boolean; dark: boolean }) {
  const annualPrice = Math.round(plan.price * 0.827);
  const displayPrice = annual ? annualPrice : plan.price;

  return (
    <article
      aria-label={`${plan.name} plan — $${displayPrice} per month`}
      className={[
        "relative flex flex-col rounded-[1.25rem] border p-7 transition-shadow duration-300",
        plan.highlight
          ? dark
            ? "border-[oklch(58%_0.22_265)] bg-[oklch(20%_0.04_265)] shadow-[0_0_0_1px_oklch(58%_0.22_265)]"
            : "border-[oklch(58%_0.22_265)] bg-[oklch(97%_0.02_265)] shadow-lg"
          : dark
          ? "border-[oklch(28%_0.018_265)] bg-[oklch(17%_0.015_265)]"
          : "border-[oklch(88%_0.012_265)] bg-[oklch(98.4%_0.003_247.9)]",
      ].join(" ")}
    >
      {plan.badge && (
        <span
          className="absolute -top-3 left-6 text-xs font-bold tracking-widest uppercase
            bg-[oklch(58%_0.22_265)] text-white px-3 py-1 rounded-full"
          aria-label={`Badge: ${plan.badge}`}
        >
          {plan.badge}
        </span>
      )}

      <header>
        <h2
          className={[
            "text-xl font-bold",
            dark ? "text-[oklch(94%_0.008_265)]" : "text-[oklch(18%_0.018_265)]",
          ].join(" ")}
        >
          {plan.name}
        </h2>
        <p
          className={[
            "text-sm mt-1",
            dark ? "text-[oklch(72%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
          ].join(" ")}
        >
          {plan.tagline}
        </p>
      </header>

      <div className="mt-5 flex items-end gap-1">
        <span
          className={[
            "text-5xl font-extrabold tracking-tight",
            dark ? "text-[oklch(94%_0.008_265)]" : "text-[oklch(18%_0.018_265)]",
          ].join(" ")}
          aria-label={`$${displayPrice} per month`}
        >
          ${displayPrice}
        </span>
        <span
          className={[
            "text-sm mb-2",
            dark ? "text-[oklch(72%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
          ].join(" ")}
        >
          {plan.unit}
          {annual && (
            <span className="ml-1 line-through text-xs opacity-60">
              ${plan.price}
            </span>
          )}
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-2 flex-1" aria-label="Plan features">
        {plan.features.map((f: string) => (
          <li
            key={f}
            className={[
              "flex items-start gap-2 text-sm",
              dark ? "text-[oklch(85%_0.008_265)]" : "text-[oklch(30%_0.015_265)]",
            ].join(" ")}
          >
            <svg
              aria-hidden="true"
              className="shrink-0 mt-0.5 w-4 h-4 text-[oklch(72%_0.18_145)]"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 111.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <footer className="mt-7 flex flex-col gap-2">
        <button
          className={[
            "min-h-[44px] w-full rounded-full py-3 font-semibold text-sm transition-colors duration-200",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            plan.highlight
              ? "bg-[oklch(58%_0.22_265)] text-white hover:bg-[oklch(50%_0.22_265)] focus-visible:outline-[oklch(58%_0.22_265)]"
              : dark
              ? "bg-[oklch(28%_0.018_265)] text-[oklch(94%_0.008_265)] hover:bg-[oklch(34%_0.018_265)] focus-visible:outline-[oklch(58%_0.22_265)]"
              : "bg-[oklch(18%_0.018_265)] text-white hover:bg-[oklch(28%_0.018_265)] focus-visible:outline-[oklch(18%_0.018_265)]",
          ].join(" ")}
          aria-label={`${plan.cta} for the ${plan.name} plan`}
        >
          {plan.cta}
        </button>
        <p
          className={[
            "text-xs text-center",
            dark ? "text-[oklch(60%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
          ].join(" ")}
        >
          {plan.limits}
        </p>
      </footer>
    </article>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */
function FAQItem({ q, a, dark }: { q: string; a: string; dark: boolean }) {
  const [open, setOpen] = useState(false);
  const id = `faq-${q.replace(/\s+/g, "-").toLowerCase().slice(0, 32)}`;

  return (
    <div
      className={[
        "border-b last:border-b-0",
        dark ? "border-[oklch(28%_0.018_265)]" : "border-[oklch(88%_0.012_265)]",
      ].join(" ")}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={[
          "min-h-[44px] w-full text-left flex justify-between items-center py-4 gap-4",
          "font-medium text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(58%_0.22_265)]",
          dark ? "text-[oklch(94%_0.008_265)]" : "text-[oklch(18%_0.018_265)]",
        ].join(" ")}
      >
        {q}
        <svg
          aria-hidden="true"
          className={`shrink-0 w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6l4 4 4-4"
          />
        </svg>
      </button>
      {open && (
        <div
          id={id}
          className={[
            "pb-4 text-sm",
            dark ? "text-[oklch(72%_0.01_265)]" : "text-[oklch(45%_0.015_265)]",
          ].join(" ")}
        >
          {a}
        </div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [dark, setDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo: toggling dark mode simulates a "reload" with skeleton
  function handleDarkToggle() {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setDark((d) => !d);
      setIsLoading(false);
    }, 420);
  }

  function handleRetry() {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  }

  return (
    <>
      {/* Inject DESIGN.md-sourced @theme tokens */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      <div
        className={dark ? "bg-[oklch(14%_0.012_265)]" : "bg-[oklch(98%_0.005_265)]"}
        style={{ fontFamily: "var(--font-display, 'Cabinet Grotesk', system-ui, sans-serif)" }}
      >
        {/* Skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
            focus:px-4 focus:py-2 focus:bg-[oklch(58%_0.22_265)] focus:text-white focus:rounded-full
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(58%_0.22_265)]"
        >
          Skip to main content
        </a>

        {/* Header / nav */}
        <header
          className={[
            "border-b px-6 py-4 flex items-center justify-between",
            dark
              ? "border-[oklch(28%_0.018_265)] bg-[oklch(14%_0.012_265)]"
              : "border-[oklch(88%_0.012_265)] bg-[oklch(98%_0.005_265)]",
          ].join(" ")}
        >
          <nav aria-label="Main navigation" className="flex items-center gap-6">
            <span
              className={[
                "text-lg font-extrabold tracking-tight",
                dark ? "text-[oklch(94%_0.008_265)]" : "text-[oklch(18%_0.018_265)]",
              ].join(" ")}
              style={{ fontFamily: "var(--font-serif, Fraunces, serif)" }}
            >
              Forma
            </span>
            <a
              href="#pricing"
              className={[
                "text-sm font-medium min-h-[44px] inline-flex items-center",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(58%_0.22_265)] rounded",
                dark
                  ? "text-[oklch(72%_0.01_265)] hover:text-[oklch(94%_0.008_265)]"
                  : "text-[oklch(55%_0.015_265)] hover:text-[oklch(18%_0.018_265)]",
              ].join(" ")}
            >
              Pricing
            </a>
            <a
              href="#faq"
              className={[
                "text-sm font-medium min-h-[44px] inline-flex items-center",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(58%_0.22_265)] rounded",
                dark
                  ? "text-[oklch(72%_0.01_265)] hover:text-[oklch(94%_0.008_265)]"
                  : "text-[oklch(55%_0.015_265)] hover:text-[oklch(18%_0.018_265)]",
              ].join(" ")}
            >
              FAQ
            </a>
          </nav>

          {/* Dark mode toggle */}
          <button
            onClick={handleDarkToggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className={[
              "min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-sm",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(58%_0.22_265)]",
              "transition-colors duration-200",
              dark
                ? "bg-[oklch(28%_0.018_265)] text-[oklch(94%_0.008_265)] hover:bg-[oklch(34%_0.018_265)]"
                : "bg-[oklch(92%_0.05_265)] text-[oklch(18%_0.018_265)] hover:bg-[oklch(85%_0.07_265)]",
            ].join(" ")}
          >
            {dark ? "☀" : "☾"}
          </button>
        </header>

        <main id="main-content">
          {/* Hero */}
          <section
            aria-labelledby="pricing-heading"
            id="pricing"
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center"
          >
            <h1
              id="pricing-heading"
              className={[
                "text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08]",
                dark ? "text-[oklch(94%_0.008_265)]" : "text-[oklch(18%_0.018_265)]",
              ].join(" ")}
            >
              Honest pricing.
              <br />
              <span
                className="text-[oklch(58%_0.22_265)]"
                style={{ fontFamily: "var(--font-serif, Fraunces, serif)", fontStyle: "italic" }}
              >
                No surprises.
              </span>
            </h1>
            <p
              className={[
                "mt-5 max-w-xl mx-auto text-lg",
                dark ? "text-[oklch(72%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
              ].join(" ")}
            >
              All plans include full DESIGN.md round-trip support. Ship design tokens
              from Figma to code in under 60 seconds.
            </p>

            {/* Annual toggle */}
            <div className="mt-8 inline-flex items-center gap-3" role="group" aria-label="Billing period">
              <span
                className={[
                  "text-sm font-medium",
                  dark ? "text-[oklch(72%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
                ].join(" ")}
              >
                Monthly
              </span>
              <button
                role="switch"
                aria-checked={annual}
                onClick={() => setAnnual((a) => !a)}
                className={[
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[oklch(58%_0.22_265)]",
                  annual ? "bg-[oklch(58%_0.22_265)]" : dark ? "bg-[oklch(34%_0.018_265)]" : "bg-[oklch(80%_0.02_265)]",
                ].join(" ")}
                aria-label="Toggle annual billing for 17.3% discount"
              >
                <span
                  className={[
                    "inline-block h-4 w-4 transform rounded-full bg-[oklch(98.4%_0.003_247.9)] shadow transition-transform duration-200",
                    annual ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
              <span
                className={[
                  "text-sm font-medium",
                  dark ? "text-[oklch(72%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
                ].join(" ")}
              >
                Annual
                <span className="ml-1.5 text-xs font-bold text-[oklch(72%_0.18_145)] bg-[oklch(97%_0.04_145)] px-1.5 py-0.5 rounded-full">
                  −17.3%
                </span>
              </span>
            </div>
          </section>

          {/* Pricing cards */}
          <section
            aria-labelledby="plans-heading"
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
          >
            <h2 id="plans-heading" className="sr-only">
              Pricing plans
            </h2>

            {isLoading ? (
              <PricingSkeleton />
            ) : error ? (
              <PricingError message={error} onRetry={handleRetry} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} annual={annual} dark={dark} />
                ))}
              </div>
            )}

            {/* Social proof */}
            <p
              className={[
                "mt-10 text-center text-sm",
                dark ? "text-[oklch(60%_0.01_265)]" : "text-[oklch(55%_0.015_265)]",
              ].join(" ")}
            >
              Trusted by 4,831 design teams · 99.97% uptime last 90 days
            </p>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            aria-labelledby="faq-heading"
            className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
          >
            <h2
              id="faq-heading"
              className={[
                "text-2xl font-bold mb-6",
                dark ? "text-[oklch(94%_0.008_265)]" : "text-[oklch(18%_0.018_265)]",
              ].join(" ")}
            >
              Frequently asked questions
            </h2>
            <div
              className={[
                "rounded-[1.25rem] border divide-y overflow-hidden",
                dark
                  ? "border-[oklch(28%_0.018_265)] divide-[oklch(28%_0.018_265)]"
                  : "border-[oklch(88%_0.012_265)] divide-[oklch(88%_0.012_265)]",
              ].join(" ")}
            >
              {FAQS.map((item) => (
                <FAQItem key={item.q} {...item} dark={dark} />
              ))}
            </div>
          </section>
        </main>

        <footer
          className={[
            "border-t px-6 py-8 text-center text-xs",
            dark
              ? "border-[oklch(28%_0.018_265)] text-[oklch(55%_0.015_265)]"
              : "border-[oklch(88%_0.012_265)] text-[oklch(55%_0.015_265)]",
          ].join(" ")}
        >
          <p>
            © 2026 Forma Inc. · Prices in USD · Revenue is $1,247,392 ARR as of Q1 2026
          </p>
          <p className="mt-1 opacity-70">
            Design tokens injected from DESIGN.md — Cabinet Grotesk + Fraunces typefaces
          </p>
        </footer>
      </div>
    </>
  );
}
