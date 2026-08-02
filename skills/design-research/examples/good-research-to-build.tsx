// EXAMPLE: A hero built entirely from extracted research constraints
// Intent: CREATE_PAGE · Product: developer tool · Dials: DV=7 MI=6 VD=3
// This is what the skill should produce AFTER research, not during it.
// Every value below traces to a line in examples/research-to-build-flow.md:
//   • Surface oklch(15% 0.02 260) — dark-mode gallery shot, chroma reduced 12%
//   • Accent oklch(70% 0.25 145) — single accent, sampled then desaturated
//   • Grid 60/40 asymmetric — split ratio taken from the shot, not its pixels
//   • Entrance cubic-bezier(0.16, 1, 0.3, 1) at 0.4s, stagger 0.08s — motion.dev
//   • Card backdrop-blur + hairline border — component-library wrapper technique
//   • Typography Manrope over system-ui — the shot's licensed face was not taken
// Rejected from the sources: the particle field, the marquee logo strip, and the
// shot's 10px caption size, which fails the minimum readable body scale.

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** One constraint extracted from a browsed source, as it reaches the build. */
export interface ExtractedConstraint {
  /** Which reference produced it — always attributed, never anonymous. */
  source: string;
  /** The typed value: an OKLCH token, a grid, a cubic-bezier, a scale step. */
  value: string;
  /** What it governs. */
  label: string;
}

export interface ResearchHeroProps {
  /** Constraints the research pass produced. Empty renders the empty state. */
  constraints?: ExtractedConstraint[];
  /** Drive from the real extraction request — never from an artificial delay. */
  isLoading?: boolean;
}

const EXTRACTED: ExtractedConstraint[] = [
  { source: "gallery shot", value: "oklch(15% 0.02 260)", label: "Page surface" },
  { source: "gallery shot", value: "oklch(70% 0.25 145)", label: "Single accent" },
  { source: "gallery shot", value: "60 / 40, gap 1.5rem", label: "Hero split" },
  { source: "motion.dev", value: "cubic-bezier(0.16, 1, 0.3, 1)", label: "Entrance easing" },
  { source: "motion.dev", value: "0.4s · stagger 0.08s", label: "Entrance timing" },
  { source: "component library", value: "blur(12px) + hairline", label: "Card treatment" },
];

export default function ResearchHero({
  constraints = EXTRACTED,
  isLoading: initialLoading = false,
}: ResearchHeroProps = {}) {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return (
    <div className="min-h-[100dvh] bg-[oklch(15%_0.02_260)] p-8" aria-busy="true">
      <div className="mx-auto max-w-6xl space-y-6 pt-32">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-8 w-2/3 animate-pulse rounded-xl bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div
      role="alert"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[oklch(15%_0.02_260)] px-4 text-center font-[Manrope,system-ui,sans-serif]"
    >
      <p className="font-semibold text-[oklch(92%_0.01_260)]">
        Could not reach the reference sources
      </p>
      <p className="max-w-[46ch] text-sm text-[oklch(70%_0.015_260)]">
        Nothing was extracted, so nothing was assumed. Retry, or paste the values
        you want used and the build continues from those.
      </p>
      <button
        type="button"
        onClick={() => { setError(null); setIsLoading(true); }}
        className="min-h-[44px] rounded-xl bg-[oklch(70%_0.25_145)] px-6 text-sm font-semibold text-[oklch(15%_0.02_260)] transition-colors hover:bg-[oklch(75%_0.23_145)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(70%_0.25_145)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(15%_0.02_260)]"
      >
        Retry extraction
      </button>
    </div>
  );

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[oklch(15%_0.02_260)] font-[Manrope,system-ui,sans-serif] text-[oklch(92%_0.01_260)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-[oklch(22%_0.02_260)] focus:px-4 focus:py-2 focus:ring-2 focus:ring-[oklch(70%_0.25_145)]"
      >
        Skip to content
      </a>

      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}

      <header className="absolute inset-x-0 top-0 z-20">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <span className="font-extrabold tracking-tight">Sightline</span>
          <a
            href="#constraints"
            className="inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[oklch(70%_0.25_145)]"
          >
            See the constraints
          </a>
        </nav>
      </header>

      <section id="main-content" className="relative pt-36 pb-20 lg:pt-48 lg:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* 60/40 asymmetric split — the ratio is the extracted value, not the pixels */}
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.5fr_1fr]">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.p
                variants={item}
                className="mb-6 inline-flex h-8 items-center gap-2 rounded-full bg-[oklch(70%_0.25_145)]/10 px-3 text-xs font-semibold tracking-wide text-[oklch(78%_0.2_145)]"
              >
                <span className="size-1.5 rounded-full bg-[oklch(70%_0.25_145)]" />
                Research pass complete · 6 constraints
              </motion.p>
              <motion.h1
                variants={item}
                className="text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl"
              >
                Every value here
                <br />
                <span className="text-[oklch(70%_0.25_145)]">came from somewhere.</span>
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-6 max-w-[52ch] text-lg leading-relaxed text-[oklch(72%_0.015_260)] md:text-xl"
              >
                Three references went in. What came out is six typed constraints,
                each traceable to the page it was read from — and a written note of
                the 4 things that were deliberately left behind.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#constraints"
                  className="inline-flex h-12 items-center rounded-xl bg-[oklch(70%_0.25_145)] px-6 font-semibold text-[oklch(15%_0.02_260)] transition-colors hover:bg-[oklch(75%_0.23_145)] focus-visible:ring-2 focus-visible:ring-[oklch(70%_0.25_145)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(15%_0.02_260)]"
                >
                  Read the extraction note
                </a>
                <a
                  href="#sources"
                  className="inline-flex h-12 items-center rounded-xl px-6 font-semibold transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[oklch(70%_0.25_145)]"
                >
                  Sources used ↗
                </a>
              </motion.div>
            </motion.div>

            {/* Card treatment lifted as a technique — blur plus hairline, used once */}
            <motion.aside
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT }}
              aria-labelledby="coverage-heading"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md lg:translate-y-4"
            >
              <h2 id="coverage-heading" className="text-sm font-semibold text-[oklch(72%_0.015_260)]">
                Extraction coverage
              </h2>
              <p className="mt-3 font-mono text-4xl font-bold text-[oklch(70%_0.25_145)]">
                47.2%
              </p>
              <p className="mt-2 text-sm text-[oklch(68%_0.015_260)]">
                of the sampled palette survived the chroma reduction. The rest read
                as loud at full-viewport scale and was dropped.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                <div>
                  <dt className="text-[oklch(64%_0.015_260)]">Sources opened</dt>
                  <dd className="mt-1 font-mono text-lg font-semibold">3</dd>
                </div>
                <div>
                  <dt className="text-[oklch(64%_0.015_260)]">Values typed</dt>
                  <dd className="mt-1 font-mono text-lg font-semibold">6</dd>
                </div>
              </dl>
            </motion.aside>
          </div>
        </div>
      </section>

      <section id="constraints" className="pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The constraints, with their provenance
          </h2>
          {constraints.length > 0 ? (
            <motion.ul
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {constraints.map((c) => (
                <motion.li
                  key={c.label}
                  variants={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(64%_0.015_260)]">
                    {c.label}
                  </p>
                  <p className="mt-2 break-words font-mono text-sm text-[oklch(88%_0.01_260)]">
                    {c.value}
                  </p>
                  <p className="mt-3 text-xs text-[oklch(60%_0.015_260)]">
                    from {c.source}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div
              id="sources"
              className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center"
            >
              <p className="font-semibold">Nothing extracted yet</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-sm text-[oklch(66%_0.015_260)]">
                No sources were reachable, so no values were invented. Paste the
                palette, split ratio and easing you want used, and the build picks
                up from there.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
