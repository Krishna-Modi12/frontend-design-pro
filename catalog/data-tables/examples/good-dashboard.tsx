// EXAMPLE: Reference-quality SaaS Dashboard
// Intent: CREATE_PAGE · Product: saas · Dials: DV=4 MI=4 VD=7
// This is what the skill should produce. Use as gold-standard reference.
// Key principles on display:
//   • Premium font (Manrope) declared via @import — NOT Inter as display
//   • Organic data values ($82,417 not $80,000 — 12.3% not 10%)
//   • Non-equal card layout (2-col hero + 3 stat strip, not 4-equal grid)
//   • Skeleton loading state with animate-pulse
//   • Realistic diverse names (Ana Ngugi, Kenji Tanaka) — no generic placeholders
//   • aria-label on icon buttons, focus rings, semantic HTML
//   • prefers-reduced-motion via CSS @media block
//   • No AI-slop copy ("improve", "unlock", "effortless" all absent)

import { useState, useEffect } from "react";

export interface DashboardProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function Dashboard({ isLoading: initialLoading = false }: DashboardProps = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");


  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse bg-slate-200 rounded-lg h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-pulse bg-slate-200 rounded-2xl h-48" />
            <div className="animate-pulse bg-slate-200 rounded-2xl h-48" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-slate-200 rounded-xl h-28" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Monthly Revenue", value: "$82,417", change: "+12.3%", trend: "up" },
    { label: "Active Users", value: "14,829", change: "+4.1%", trend: "up" },
    { label: "Conversion Rate", value: "3.47%", change: "-0.8%", trend: "down" },
    { label: "Churn (30d)", value: "2.14%", change: "+0.3%", trend: "down" },
  ];

  const activity = [
    { name: "Ana Ngugi", action: "upgraded to Team plan", time: "8m ago" },
    { name: "Kenji Tanaka", action: "invited 3 members", time: "23m ago" },
    { name: "Priya Shah", action: "exported Q4 report", time: "41m ago" },
    { name: "Marco Silva", action: "connected Stripe account", time: "1h ago" },
  ];

  if (error) return (
    <div role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[oklch(98.4%_0.003_247.9)] text-center px-4">
      <p className="text-slate-700 font-semibold font-[Manrope,system-ui,sans-serif]">Dashboard failed to load</p>
      <button onClick={() => { setError(null); setIsLoading(true); }}
        className="min-h-[44px] rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
        Retry
      </button>
    </div>
  );

  return (
    <main className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] font-[Manrope,system-ui,sans-serif] text-[oklch(18.8%_0.013_248.5)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-[oklch(99.5%_0.004_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        Skip to main content
      </a>

      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}

      <header className="border-b border-slate-200/80 bg-[oklch(99.5%_0.004_255)]/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600" />
            <span className="font-bold tracking-tight text-lg">Atlas</span>
          </div>
          <button
            aria-label="Open user menu"
            className="size-11 rounded-full bg-slate-100 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors flex items-center justify-center"
          >
            <span className="text-sm font-medium">AN</span>
          </button>
        </div>
      </header>

      <section id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05]">
              Good morning, Ana.
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              You&apos;re up 12.3% this month — steady growth on the Team plan.
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Dashboard sections"
            className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl"
          >
            {["overview", "analytics", "settings"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`h-11 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                  tab === t
                    ? "bg-[oklch(99.5%_0.004_255)] text-[oklch(18.8%_0.013_248.5)] shadow-sm"
                    : "text-slate-600 hover:text-[oklch(18.8%_0.013_248.5)]"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric hero: big revenue card (2/3) + activity feed (1/3) — NOT equal grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <article className="lg:col-span-2 bg-[oklch(99.5%_0.004_255)] rounded-3xl p-8 border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Monthly Revenue
                </p>
                <p className="mt-2 text-5xl font-extrabold tracking-tighter">$82,417</p>
                <p className="mt-1 text-sm text-emerald-600 font-medium">
                  +12.3% vs last month
                </p>
              </div>
              <button
                aria-label="Download revenue report"
                className="size-11 rounded-xl bg-slate-100 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
              >
                ↓
              </button>
            </div>
            <div
              className="h-40 flex items-end gap-2 rounded-xl"
              role="img"
              aria-label="Revenue trend over last 12 weeks, steady growth pattern"
            >
              {[32, 48, 41, 56, 62, 58, 71, 68, 76, 82, 78, 89].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </article>

          <aside className="bg-[oklch(99.5%_0.004_255)] rounded-3xl p-6 border border-slate-200/80">
            <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
            <ul className="space-y-4">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-700 shrink-0">
                    {a.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug">
                      <span className="font-semibold">{a.name}</span>{" "}
                      <span className="text-slate-500">{a.action}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Secondary metrics — 3-col to break grid rhythm vs 4-equal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.slice(1).map((m) => (
            <div key={m.label} className="bg-[oklch(99.5%_0.004_255)] rounded-2xl p-5 border border-slate-200/80">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {m.label}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{m.value}</p>
              <p
                className={`mt-1 text-sm font-medium ${
                  m.trend === "up" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {m.change}
              </p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
