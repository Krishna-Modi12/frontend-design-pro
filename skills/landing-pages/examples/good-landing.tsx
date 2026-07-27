// EXAMPLE: Reference-quality marketing landing page
// Intent: CREATE_PAGE · Product: marketing · Dials: DV=8 MI=6 VD=3
// This is what the skill should produce for "build me a landing page for X."
// Key principles on display:
//   • Hero headline 72px (text-7xl) — never timid
//   • Asymmetric hero layout (text left-weighted, visual right floats offset)
//   • Framer Motion with custom cubic-bezier easing
//   • Staggered reveal pattern with variants
//   • Multi-zone CTAs (hero + post-feature + final)
//   • Social proof strip with REAL company-like names (Linear/Raycast/Vercel tier)
//   • Accent is single indigo — no cliché AI gradients
//   • Organic stats (10.4× faster, 2.3s saved per build)
//   • Realistic testimonial names with country context

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.23, 1, 0.32, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export interface LandingProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function Landing({ isLoading: initialLoading = false }: LandingProps = {}) {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);


  if (isLoading) return (
    <div className="min-h-[100dvh] bg-[oklch(98.5%_0.001_106.4)] p-8">
      <div className="max-w-4xl mx-auto space-y-6 pt-24">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200/80" />
        <div className="h-8 w-2/3 animate-pulse rounded-xl bg-slate-200/60" />
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-300/70" />
          <div className="h-12 w-28 animate-pulse rounded-xl bg-slate-200/60" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[oklch(98.5%_0.001_106.4)] text-center px-4">
      <p className="text-slate-700 font-semibold font-[Manrope,system-ui,sans-serif]">Page failed to load</p>
      <button onClick={() => { setError(null); setIsLoading(true); }}
        className="min-h-[44px] rounded-xl bg-[oklch(18.8%_0.013_248.5)] px-6 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
        Retry
      </button>
    </div>
  );

  return (
    <main className="min-h-[100dvh] bg-[oklch(98.5%_0.001_106.4)] font-[Manrope,system-ui,sans-serif] text-[oklch(18.8%_0.013_248.5)] overflow-x-hidden">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-[oklch(99.5%_0.004_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-indigo-500"
      >
        Skip to content
      </a>

      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}

      <header className="absolute top-0 inset-x-0 z-20">
        <nav
          aria-label="Primary"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-[oklch(18.8%_0.013_248.5)]" />
            <span className="font-extrabold tracking-tight">Veloce</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#docs"
              className="hidden sm:inline-flex h-11 px-4 items-center text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Docs
            </a>
            <a
              href="#start"
              className="h-11 px-5 inline-flex items-center bg-[oklch(18.8%_0.013_248.5)] text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Start free →
            </a>
          </div>
        </nav>
      </header>

      {/* HERO — asymmetric, left-weighted text, floating indicator right */}
      <section id="content" className="relative pt-40 pb-24 lg:pt-52 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="lg:col-span-8"
            >
              <motion.div variants={item} className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide mb-6">
                <span className="size-1.5 rounded-full bg-indigo-600" />
                v2.4 · Now with persistent cache
              </motion.div>
              <motion.h1
                variants={item}
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] font-extrabold tracking-tighter leading-[0.95]"
              >
                Builds that feel
                <br />
                <span className="text-indigo-600">instant.</span>
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-6 text-lg md:text-xl text-slate-600 max-w-[52ch] leading-relaxed"
              >
                Veloce is a build tool that ships 10.4× faster than webpack — without a config
                rewrite. Drop it in, keep your plugins, save 2.3 seconds per hot reload.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#start"
                  className="h-12 px-6 inline-flex items-center bg-[oklch(18.8%_0.013_248.5)] text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  npm i veloce
                </a>
                <a
                  href="#demo"
                  className="h-12 px-6 inline-flex items-center font-semibold rounded-xl hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Watch 90s demo ↗
                </a>
              </motion.div>
            </motion.div>

            {/* Floating visual — asymmetric offset, breaks grid */}
            <motion.div
              initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
              className="lg:col-span-4 lg:translate-y-6"
            >
              <div className="bg-[oklch(18.8%_0.013_248.5)] text-emerald-400 font-mono text-sm rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="size-2.5 rounded-full bg-rose-500/60" />
                  <div className="size-2.5 rounded-full bg-amber-500/60" />
                  <div className="size-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <pre className="leading-relaxed">
{`$ veloce build
→ 847 modules
→ cache hit 92%
✓ done in 0.41s`}
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section aria-label="Companies using Veloce" className="border-y border-slate-200 py-10 bg-[oklch(99.5%_0.004_255)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-6">
            Used by engineering teams at
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {["Linear", "Raycast", "Vercel", "Planetscale", "Liveblocks", "Resend"].map((co) => (
              <li key={co} className="font-bold text-xl tracking-tight text-slate-700">
                {co}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FEATURES — asymmetric 2-col, not 3-equal-grid */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="max-w-2xl mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
              Why teams switch after one afternoon.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {[
              {
                stat: "10.4×",
                title: "Faster cold starts",
                copy: "Rust-based resolver skips the work webpack re-does every time. Startup drops from 4.2s to 0.41s on our 847-module benchmark.",
              },
              {
                stat: "92%",
                title: "Cache hit rate",
                copy: "Per-module content hashing persists across sessions. Close your laptop, open it tomorrow, get the same millisecond rebuilds.",
              },
              {
                stat: "0",
                title: "Config rewrites required",
                copy: "Ships with a webpack-compat layer. Point it at your existing config — most projects build on first try.",
              },
              {
                stat: "2.3s",
                title: "Saved per hot reload",
                copy: "Incremental compilation at the AST level means only the files you touched re-process. Multiplied across 200 saves a day: 7 minutes back.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
              >
                <div className="text-5xl lg:text-6xl font-extrabold tracking-tighter text-indigo-600 mb-3">
                  {f.stat}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-[52ch]">{f.copy}</p>
              </motion.div>
            ))}
          </div>

          {/* Post-feature CTA */}
          <div className="mt-20 text-center">
            <a
              href="#start"
              className="h-12 px-7 inline-flex items-center bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Install in 30 seconds →
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 border-t border-slate-200 bg-[oklch(99.5%_0.004_255)]/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium tracking-tight leading-snug">
            &ldquo;I timed it. Our CI dropped from 3m12s to 41s. Three engineers thought I&apos;d
            misconfigured something — we had to re-run it twice.&rdquo;
          </blockquote>
          <footer className="mt-6 text-sm text-slate-500">
            <span className="font-semibold text-[oklch(18.8%_0.013_248.5)]">Kenji Tanaka</span> · Staff Engineer,
            Osaka · 180-engineer SaaS
          </footer>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="start" className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[oklch(18.8%_0.013_248.5)] text-white rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight max-w-3xl mx-auto">
              Your CI is slower than it has to be.
            </h2>
            <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
              Free for open source. 14-day trial on paid plans. No credit card.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#install"
                className="h-12 px-7 inline-flex items-center bg-[oklch(99.5%_0.004_255)] text-[oklch(18.8%_0.013_248.5)] font-semibold rounded-xl hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(18.8%_0.013_248.5)]"
              >
                Start free →
              </a>
              <a
                href="#github"
                className="h-12 px-6 inline-flex items-center border border-white/20 font-semibold rounded-xl hover:bg-[oklch(99.5%_0.004_255)]/10 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(18.8%_0.013_248.5)]"
              >
                Star on GitHub ★
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-slate-200 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between gap-4">
          <p>© Veloce Labs · Built with public benchmarks</p>
          <ul className="flex gap-6">
            <li>
              <a href="#privacy" className="hover:text-[oklch(18.8%_0.013_248.5)] focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">Privacy</a>
            </li>
            <li>
              <a href="#terms" className="hover:text-[oklch(18.8%_0.013_248.5)] focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">Terms</a>
            </li>
            <li>
              <a href="#changelog" className="hover:text-[oklch(18.8%_0.013_248.5)] focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">Changelog</a>
            </li>
          </ul>
        </div>
      </footer>
    </main>
  );
}
