/**
 * GOOD EXAMPLE: Spline 3D Hero Section
 * ✅ Lazy-loaded Spline scene (never in main bundle)
 * ✅ Gradient fallback while scene loads (not a spinner)
 * ✅ Framer Motion staggered text reveal over 3D
 * ✅ Proper accessibility: role="img" + aria-label on canvas container
 * ✅ prefers-reduced-motion: static fallback image if motion disabled
 * ✅ Mobile-first responsive (scene hidden on xs, shown md+)
 * ✅ Self-hosted scene path pattern (/scenes/ not prod.spline.design)
 * ✅ Display font: Bricolage Grotesque, NOT Inter/Poppins
 * ✅ Copy: concrete value prop, no "Improve your workflow"
 * ✅ CTA: dark bg with white ring, specific label
 */

'use client'

import { Suspense, lazy, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Detect reduced-motion preference up front — do this once, not in render
const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
}

function SplineFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
  )
}

function StaticFallback() {
  // Shown when prefers-reduced-motion is true — plain gradient, no animation
  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
  )
}

export interface HeroSectionProps {
  /** Self-hosted .splinecode path (never hotlink prod.spline.design). */
  scenePath?: string
}

export default function HeroSection({ scenePath = '/scenes/hero-orb.splinecode' }: HeroSectionProps = {}) {
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)


  if (error) return (
    <div role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[oklch(15.4%_0.019_263.2)] text-center px-4">
      <p className="text-white/60 font-medium">Failed to initialize scene</p>
      <button onClick={() => setError(null)}
        className="min-h-[44px] rounded-xl border border-white/20 px-6 text-sm text-white/80 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
        Retry
      </button>
    </div>
  )

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[oklch(15.4%_0.019_263.2)]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Manrope:wght@400;500&display=swap'); @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }`}</style>

      {/* ── 3D background layer ─────────────────────────────────────── */}
      {prefersReducedMotion ? (
        <StaticFallback />
      ) : (
        <div
          className="absolute inset-0 z-0 hidden md:block"
          role="img"
          aria-label="Abstract 3D morphing sphere with particle trails — decorative"
        >
          <Suspense fallback={<SplineFallback />}>
            <Spline
              scene={scenePath}
              className="w-full h-full"
              renderOnDemand={true}
              onLoad={() => setSceneLoaded(true)}
            />
          </Suspense>

          {/* Gradient overlay so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(15.4%_0.019_263.2)] via-[oklch(15.4%_0.019_263.2)]/60 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Mobile: plain gradient bg (no Spline — perf) */}
      <div className="absolute inset-0 z-0 md:hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />

      {/* ── Content layer ───────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-[640px]">

            <motion.div
              variants={containerVariants}
              initial={prefersReducedMotion ? 'visible' : 'hidden'}
              animate="visible"
            >
              {/* Eyebrow */}
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[oklch(99.5%_0.004_255)]/5 px-3.5 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Now in public beta
                </span>
              </motion.div>

              {/* Headline — Bricolage Grotesque, NOT Inter */}
              <motion.h1
                variants={itemVariants}
                className="mt-6 font-['Bricolage_Grotesque',_sans-serif] text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Ship design-ready{' '}
                <span className="text-indigo-400">components</span>
                {' '}in minutes
              </motion.h1>

              {/* Sub — specific, no fluffy adjectives */}
              <motion.p
                variants={itemVariants}
                className="mt-6 text-lg leading-relaxed text-white/55 max-w-[46ch]"
              >
                Paste a Figma frame. Get production React + Tailwind — tokens
                mapped, ARIA wired, dark mode included. No manual conversion.
              </motion.p>

              {/* CTA row */}
              <motion.div
                variants={itemVariants}
                className="mt-9 flex flex-wrap items-center gap-4"
              >
                <a
                  href="/signup"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[oklch(99.5%_0.004_255)] px-7 text-sm font-semibold text-[oklch(15.4%_0.019_263.2)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(15.4%_0.019_263.2)]"
                >
                  Start free — no card required
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>

                <a
                  href="/demo"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-7 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Watch 2-min demo
                </a>
              </motion.div>

              {/* Social proof numbers — real-feeling, not round */}
              <motion.div
                variants={itemVariants}
                className="mt-10 flex items-center gap-6 text-sm text-white/40"
              >
                <span>
                  <strong className="text-white/70">4,217</strong> teams using it
                </span>
                <span className="h-4 w-px bg-[oklch(99.5%_0.004_255)]/10" aria-hidden="true" />
                <span>
                  <strong className="text-white/70">93%</strong> ship in first session
                </span>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Scroll nudge */}
      <AnimatePresence>
        {sceneLoaded && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
            aria-hidden="true"
          >
            <span className="text-[10px] font-medium tracking-widest text-white/30 uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="h-5 w-px bg-[oklch(99.5%_0.004_255)]/20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
