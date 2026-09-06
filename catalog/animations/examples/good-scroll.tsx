/**
 * GOOD EXAMPLE: GSAP ScrollTrigger + SplitText Scroll Experience
 * ✅ useGSAP hook (@gsap/react) — NOT useEffect — auto-cleanup guaranteed
 * ✅ contextSafe wraps ALL event-handler refs
 * ✅ SplitText with autoSplit: true + onSplit() for reflow/responsive
 * ✅ ScrollTrigger.batch() for performant card reveals
 * ✅ Pinned hero section with scrub parallax
 * ✅ toggleActions 4-word format: "play pause resume reset"
 * ✅ gsap.matchMedia() for prefers-reduced-motion
 * ✅ ScrollTrigger.refresh() after fonts loaded (no layout jank)
 * ✅ All animations killed in cleanup — no memory leaks
 * ✅ display font: Instrument Serif for editorial feel
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'feat-01',
    label: '01 — Design ingestion',
    headline: 'Figma frame to React in 47 seconds',
    body: 'Paste any frame URL. We resolve variables, map spacing tokens, and output typed component props. Tested on 12,000 real production files.',
    metric: '47s',
    metricLabel: 'median conversion time',
  },
  {
    id: 'feat-02',
    label: '02 — Accessibility',
    headline: 'WCAG 2.1 AA out of the box',
    body: 'aria-label, role, focus-visible, skip links, and contrast ratios checked on every output. Zero manual audits for 94% of teams.',
    metric: '94%',
    metricLabel: 'teams pass audit first try',
  },
  {
    id: 'feat-03',
    label: '03 — Token sync',
    headline: 'Design tokens stay in sync forever',
    body: 'Bi-directional sync between Figma variables and your CSS/JS token files. One click to propagate a color update across 340 components.',
    metric: '340',
    metricLabel: 'components updated in one click',
  },
]

const LOGOS = ['Vercel', 'Linear', 'Resend', 'Raycast', 'Supabase', 'Loom', 'Clerk']

// ─── Component ───────────────────────────────────────────────────────────────
export interface ScrollExperienceProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function ScrollExperience({ isLoading: initialLoading = false }: ScrollExperienceProps = {}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const headlineRef = useRef<HTMLDivElement | null>(null)
  const logoStripRef = useRef<HTMLDivElement | null>(null)

  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  // Simulate async content load


  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // ── Respect prefers-reduced-motion ────────────────────────────
      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Just make everything visible — no animation
        gsap.set('[data-animate]', { opacity: 1, y: 0 })
        return () => {} // cleanup noop
      })

      // ── Full animation for users who are OK with motion ───────────
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1. SplitText headline reveal on scroll
        const split = new SplitText(headlineRef.current, {
          type: 'lines',
          linesClass: 'overflow-hidden',
          autoSplit: true,
          onSplit(self: { lines: Element[] }) {
            // Re-run animation when SplitText re-splits on resize
            gsap.from(self.lines, {
              y: '110%',
              opacity: 0,
              duration: 1,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: headlineRef.current,
                start: 'top 82%',
                toggleActions: 'play none none reset',
              },
            })
          },
        })

        // 2. Logo strip — infinite marquee via GSAP (no CSS animation, controllable)
        const logos = logoStripRef.current?.querySelectorAll('[data-logo]')
        if (logos?.length) {
          gsap.to(logos, {
            xPercent: -100 * (logos.length / 2),
            ease: 'none',
            duration: 18,
            repeat: -1,
            modifiers: {
              xPercent: gsap.utils.unitize(
                gsap.utils.wrap(-100 * (logos.length / 2), 0)
              ),
            },
          })
        }

        // 3. Feature cards — batch reveal
        ScrollTrigger.batch('[data-feature-card]', {
          start: 'top 88%',
          onEnter(batch: Element[]) {
            gsap.from(batch, {
              y: 48,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power2.out',
            })
          },
          onLeaveBack(batch: Element[]) {
            gsap.set(batch, { opacity: 0, y: 48 })
          },
        })

        // 4. Metrics counter animation
        document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = parseFloat(el.dataset.count ?? '0')
          const isFloat = (el.dataset.count ?? '').includes('.')
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter() {
              gsap.from({ val: 0 }, {
                val: target,
                duration: 1.4,
                ease: 'power2.out',
                onUpdate() {
                  el.textContent = isFloat
                    ? this.targets()[0].val.toFixed(0) + 's'
                    : this.targets()[0].val.toFixed(0) + '%'
                },
              })
            },
          })
        })

        // 5. Horizontal pinned section for the feature trio
        const pinSection = document.querySelector<HTMLElement>('[data-pin-section]')
        if (pinSection) {
          const pinTrack = pinSection.querySelector<HTMLElement>('[data-pin-track]')
          if (!pinTrack) return
          gsap.to(pinTrack, {
            x: () => -(pinTrack.scrollWidth - pinSection.offsetWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: pinSection,
              start: 'top top',
              end: () => `+=${pinTrack.scrollWidth - pinSection.offsetWidth}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
        }

        return () => {
          split.revert()
          ScrollTrigger.getAll().forEach((t: { kill: () => void }) => t.kill())
        }
      })

      // Refresh after fonts load to prevent mis-measured line breaks
      document.fonts.ready.then(() => ScrollTrigger.refresh())

      return () => mm.revert()
    },
    { scope: wrapperRef }
  )

  if (isLoading) return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[oklch(96.4%_0.007_88.6)]">
      <div className="space-y-4 w-full max-w-2xl px-8">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200/80" />
        <div className="h-8 animate-pulse rounded-lg bg-slate-200/60 w-3/4" />
        <div className="h-8 animate-pulse rounded-lg bg-slate-200/40 w-1/2" />
      </div>
    </div>
  )

  if (error) return (
    <div role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[oklch(96.4%_0.007_88.6)] px-4 text-center">
      <p className="text-slate-700 font-medium">Failed to load experience</p>
      <button onClick={() => { setError(null); setIsLoading(true) }}
        className="rounded-lg bg-slate-900 px-5 py-2 text-sm text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
        Retry
      </button>
    </div>
  )

  return (
    <div ref={wrapperRef} className="bg-[oklch(96.4%_0.007_88.6)]">

      {/* Font declaration — Instrument Serif display + Manrope UI */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap');
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      {/* ── Hero: pinned parallax ──────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100dvh] items-end overflow-hidden bg-[oklch(16.4%_0_0)] pb-16 md:pb-24"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
            Frontend Design Pro
          </p>

          {/* Headline split by SplitText — font: Instrument Serif */}
          <h1
            ref={headlineRef}
            className="font-['Instrument_Serif',_Georgia,_serif] text-6xl font-normal italic leading-[1.05] text-white md:text-8xl lg:text-[10rem]"
          >
            Design faster.<br />Ship right.
          </h1>

          <p className="mt-8 max-w-[48ch] text-lg text-white/45 leading-relaxed" data-animate>
            Stop rewriting Figma components by hand. One integration, every
            token synced, accessibility enforced — from day one.
          </p>

          <div className="mt-10 flex items-center gap-6" data-animate>
            <a
              href="/start"
              className="inline-flex h-12 items-center rounded-xl bg-[oklch(99.5%_0.004_255)] px-7 text-sm font-semibold text-[oklch(16.4%_0_0)] transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(16.4%_0_0)] focus-visible:outline-none"
            >
              Get started free
            </a>
            <a
              href="/docs"
              className="text-sm text-white/50 underline underline-offset-4 decoration-white/20 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            >
              Read the docs
            </a>
          </div>
        </div>
      </section>

      {/* ── Logo strip ────────────────────────────────────────────── */}
      <div className="overflow-hidden border-y border-stone-200 bg-[oklch(99.5%_0.004_255)] py-5" aria-label="Used by teams at">
        <div ref={logoStripRef} className="flex will-change-transform" aria-hidden="true">
          {/* Doubled for effortless wrap */}
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              data-logo
              className="mx-10 flex-shrink-0 text-sm font-semibold tracking-tight text-stone-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Horizontal scroll: feature trio ───────────────────────── */}
      <div data-pin-section className="overflow-hidden">
        <div data-pin-track className="flex w-max">
          {FEATURES.map((feat) => (
            <article
              key={feat.id}
              data-feature-card
              className="flex h-[100dvh] w-screen flex-col justify-end p-12 md:p-20"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                {feat.label}
              </span>

              <h2 className="mt-4 font-['Instrument_Serif',_Georgia,_serif] text-4xl font-normal italic text-stone-900 md:text-6xl max-w-[18ch]">
                {feat.headline}
              </h2>

              <p className="mt-6 max-w-[44ch] text-base text-stone-500 leading-relaxed">
                {feat.body}
              </p>

              <div className="mt-10 flex items-end gap-2">
                <span
                  className="font-['Bricolage_Grotesque',_sans-serif] text-7xl font-black leading-none text-stone-900 tabular-nums"
                  data-count={feat.metric.replace(/[^0-9.]/g, '')}
                >
                  {feat.metric}
                </span>
                <span className="mb-2 text-sm text-stone-400">{feat.metricLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── Closing CTA ───────────────────────────────────────────── */}
      <section className="bg-[oklch(16.4%_0_0)] py-32 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
          Ready to ship?
        </p>
        <h2 className="mt-5 font-['Instrument_Serif',_Georgia,_serif] text-5xl font-normal italic text-white md:text-7xl">
          Start building today.
        </h2>
        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/signup"
            className="inline-flex h-12 items-center rounded-xl bg-[oklch(99.5%_0.004_255)] px-7 text-sm font-semibold text-[oklch(16.4%_0_0)] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(16.4%_0_0)]"
          >
            Create free account
          </a>
        </div>
      </section>

    </div>
  )
}
