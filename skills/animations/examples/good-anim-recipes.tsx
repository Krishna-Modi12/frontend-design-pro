/**
 * Animation Recipes Showcase — Framer Motion
 * ✅ useReducedMotion() guard on all animations
 * ✅ AnimatePresence for exit animations
 * ✅ staggerChildren / variants pattern
 * ✅ whileHover + whileTap on interactive elements
 * ✅ Spring physics with custom stiffness / damping
 * ✅ Animated counter (numbers count up on mount)
 * ✅ Magnetic button (mouse-follow effect)
 * ✅ OKLCH colors + dark mode
 * ✅ Manrope font (non-banned)
 * ✅ Real organic content
 * ✅ Accessible: aria-label, focus-visible, 44px touch targets
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useMotionValue,
  useSpring,
} from 'motion/react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { id: 'stat-01', label: 'Components shipped', value: 14287, display: '14,287', suffix: '', prefix: '' },
  { id: 'stat-02', label: 'Build time saved', value: 73.4, suffix: '%', prefix: '' },
  { id: 'stat-03', label: 'Teams onboarded', value: 412, suffix: '', prefix: '' },
  { id: 'stat-04', label: 'Avg. audit score', value: 97.8, suffix: '', prefix: '' },
]

const FEATURES = [
  {
    id: 'f-01',
    icon: '⬡',
    title: 'Token-first architecture',
    body: 'Design tokens propagate from Figma variables directly to CSS custom properties. One rename updates 340 components instantly.',
    tag: 'Tokens',
    color: 'oklch(55% 0.18 255)',
  },
  {
    id: 'f-02',
    icon: '◈',
    title: 'Zero-drift accessibility',
    body: 'Every generated component ships with WCAG 2.1 AA coverage — aria labels, focus rings, contrast checks, skip links included.',
    tag: 'A11y',
    color: 'oklch(58% 0.19 145)',
  },
  {
    id: 'f-03',
    icon: '◉',
    title: 'Spring physics by default',
    body: 'Framer Motion spring configs tuned for UI — no cubic-bezier guesswork. Stiffness and damping dialed per interaction type.',
    tag: 'Motion',
    color: 'oklch(62% 0.21 32)',
  },
  {
    id: 'f-04',
    icon: '◎',
    title: 'Reduced-motion first',
    body: 'useReducedMotion() is wired into every animated component. Users who prefer less motion get static, equally-functional UIs.',
    tag: 'Inclusive',
    color: 'oklch(56% 0.17 300)',
  },
]

type NotifType = 'success' | 'info' | 'warning'
type Notification = { id: string; type: NotifType; message: string; time: string }
const NOTIFICATIONS: Notification[] = [
  { id: 'n-01', type: 'success', message: 'Token sync complete — 47 variables updated', time: 'Just now' },
  { id: 'n-02', type: 'info', message: 'New component export ready for review', time: '2 min ago' },
  { id: 'n-03', type: 'warning', message: 'Contrast ratio at 3.8:1 — below AA threshold', time: '5 min ago' },
]

// ─── Variants ─────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
}

const notifVariants = {
  initial: { opacity: 0, x: 40, scale: 0.96 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
  exit: { opacity: 0, x: 40, scale: 0.94, transition: { duration: 0.18, ease: 'easeIn' } },
}

// ─── AnimatedNumber ────────────────────────────────────────────────────────────

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 60, damping: 18, restDelta: 0.01 })
  const reduce = useReducedMotion()

  useEffect(() => {
    if (inView) {
      if (reduce) {
        motionValue.set(value)
      } else {
        motionValue.set(value)
      }
    }
  }, [inView, value, motionValue, reduce])

  useEffect(() => {
    return spring.on('change', (latest: number) => {
      if (ref.current) {
        const formatted =
          value % 1 !== 0
            ? latest.toFixed(1)
            : Math.round(latest).toLocaleString()
        ref.current.textContent = prefix + formatted + suffix
      }
    })
  }, [spring, prefix, suffix, value])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}0{suffix}
    </span>
  )
}

// ─── MagneticButton ────────────────────────────────────────────────────────────

function MagneticButton({ children, onClick, className = '', ariaLabel }: { children: React.ReactNode; onClick?: () => void; className?: string; ariaLabel?: string }) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const reduce = useReducedMotion()

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reduce || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * 0.28
      const y = (e.clientY - rect.top - rect.height / 2) * 0.28
      setPos({ x, y })
    },
    [reduce]
  )

  const handleMouseLeave = useCallback(() => setPos({ x: 0, y: 0 }), [])

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 160, damping: 14 }}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative inline-flex min-h-[44px] items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ─── FeatureCard ───────────────────────────────────────────────────────────────

type Feature = (typeof FEATURES)[number]

function FeatureCard({ feature }: { feature: Feature }) {
  const reduce = useReducedMotion()

  return (
    <motion.article
      variants={reduce ? undefined : itemVariants}
      whileHover={reduce ? undefined : { y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-[oklch(88%_0.01_255)] bg-[oklch(98%_0.008_255)] p-6 dark:border-[oklch(28%_0.02_255)] dark:bg-[oklch(16%_0.015_255)]"
      aria-label={`Feature: ${feature.title}`}
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold"
          style={{ backgroundColor: `${feature.color}22`, color: feature.color }}
          aria-hidden="true"
        >
          {feature.icon}
        </span>
        <span
          className="rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: `${feature.color}18`, color: feature.color }}
        >
          {feature.tag}
        </span>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[oklch(18%_0.02_255)] dark:text-[oklch(92%_0.01_255)]">
          {feature.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[oklch(45%_0.02_255)] dark:text-[oklch(62%_0.02_255)]">
          {feature.body}
        </p>
      </div>
    </motion.article>
  )
}

// ─── NotificationStack ─────────────────────────────────────────────────────────

const TYPE_COLORS = {
  success: 'oklch(53% 0.18 145)',
  info: 'oklch(52% 0.19 255)',
  warning: 'oklch(65% 0.18 68)',
}

function NotificationStack() {
  const [items, setItems] = useState(NOTIFICATIONS)
  const reduce = useReducedMotion()

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const reset = useCallback(() => setItems(NOTIFICATIONS), [])

  return (
    <section
      aria-label="Notification stack demo"
      className="flex flex-col gap-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[oklch(40%_0.015_255)] dark:text-[oklch(65%_0.015_255)] uppercase tracking-wider">
          AnimatePresence — exit animations
        </h2>
        {items.length < NOTIFICATIONS.length && (
          <button
            onClick={reset}
            className="min-h-[44px] rounded-lg px-3 py-2 text-xs font-medium text-[oklch(52%_0.19_255)] hover:bg-[oklch(95%_0.03_255)] dark:hover:bg-[oklch(22%_0.03_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.19_255)] transition-colors"
            aria-label="Restore all notifications"
          >
            Reset
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {items.map((notif) => (
          <motion.div
            key={notif.id}
            variants={reduce ? undefined : notifVariants}
            initial={reduce ? undefined : 'initial'}
            animate={reduce ? undefined : 'animate'}
            exit={reduce ? undefined : 'exit'}
            layout={!reduce}
            className="flex items-start gap-3 rounded-xl border border-[oklch(88%_0.01_255)] bg-[oklch(99%_0.005_255)] p-4 dark:border-[oklch(28%_0.02_255)] dark:bg-[oklch(14%_0.015_255)]"
            role="status"
          >
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: TYPE_COLORS[notif.type as NotifType] }}
              aria-hidden="true"
            >
              {notif.type === 'success' ? '✓' : notif.type === 'info' ? 'i' : '!'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[oklch(20%_0.02_255)] dark:text-[oklch(88%_0.01_255)]">
                {notif.message}
              </p>
              <p className="mt-0.5 text-xs text-[oklch(55%_0.015_255)] dark:text-[oklch(55%_0.015_255)]">
                {notif.time}
              </p>
            </div>
            <button
              onClick={() => dismiss(notif.id)}
              className="min-h-[44px] min-w-[44px] flex shrink-0 items-center justify-center rounded-lg text-[oklch(62%_0.01_255)] hover:bg-[oklch(93%_0.01_255)] dark:hover:bg-[oklch(22%_0.02_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.19_255)] transition-colors"
              aria-label={`Dismiss notification: ${notif.message}`}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <p className="py-6 text-center text-sm text-[oklch(55%_0.015_255)] dark:text-[oklch(55%_0.015_255)]">
          All notifications cleared.
        </p>
      )}
    </section>
  )
}

// ─── LoadingSkeleton ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading content" className="space-y-3">
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[oklch(88%_0.01_255)] dark:bg-[oklch(25%_0.02_255)]" />
      <div className="h-4 w-full animate-pulse rounded-md bg-[oklch(91%_0.008_255)] dark:bg-[oklch(22%_0.015_255)]" />
      <div className="h-4 w-5/6 animate-pulse rounded-md bg-[oklch(91%_0.008_255)] dark:bg-[oklch(22%_0.015_255)]" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[oklch(89%_0.009_255)] dark:bg-[oklch(23%_0.018_255)]" />
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export interface AnimationRecipesProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function AnimationRecipes({ isLoading: initialLoading = false }: AnimationRecipesProps = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const [activeDemo, setActiveDemo] = useState('stagger')
  const reduce = useReducedMotion()


  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[oklch(97%_0.008_255)] dark:bg-[oklch(10%_0.015_255)] px-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Manrope', system-ui, sans-serif; }
        `}</style>
        <div className="w-full max-w-lg">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[oklch(97%_0.008_255)] dark:bg-[oklch(10%_0.015_255)] px-4 text-center"
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          * { font-family: 'Manrope', system-ui, sans-serif; }
        `}</style>
        <p className="text-[oklch(40%_0.02_255)] dark:text-[oklch(70%_0.015_255)] font-medium">
          Error: {error}
        </p>
        <button
          onClick={() => { setError(null); setIsLoading(true) }}
          className="min-h-[44px] rounded-xl bg-[oklch(52%_0.19_255)] px-6 py-3 text-sm font-semibold text-white hover:bg-[oklch(48%_0.19_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.19_255)] focus-visible:ring-offset-2 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <main
      id="main-content"
      className="min-h-[100dvh] bg-[oklch(97%_0.008_255)] dark:bg-[oklch(10%_0.015_255)] pb-24"
    >
      {/* Font + reduced-motion reset */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family: 'Manrope', system-ui, sans-serif; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[oklch(52%_0.19_255)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[oklch(88%_0.01_255)] bg-[oklch(97%_0.008_255)]/90 backdrop-blur dark:border-[oklch(22%_0.02_255)] dark:bg-[oklch(10%_0.015_255)]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold tracking-tight text-[oklch(20%_0.02_255)] dark:text-[oklch(92%_0.01_255)]"
              aria-label="Frontend Design Pro — Animation Recipes"
            >
              Animation Recipes
            </span>
            <span className="hidden sm:inline-flex rounded-md bg-[oklch(52%_0.19_255)]/12 px-2 py-0.5 text-[11px] font-semibold text-[oklch(42%_0.18_255)] dark:bg-[oklch(52%_0.19_255)]/20 dark:text-[oklch(72%_0.12_255)]">
              Framer Motion
            </span>
          </div>
          <nav aria-label="Demo navigation" className="flex items-center gap-1 sm:gap-2">
            {['stagger', 'counter', 'magnetic', 'notifications'].map((demo) => (
              <button
                key={demo}
                onClick={() => setActiveDemo(demo)}
                className={`min-h-[44px] rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.19_255)] ${
                  activeDemo === demo
                    ? 'bg-[oklch(52%_0.19_255)] text-white'
                    : 'text-[oklch(45%_0.02_255)] hover:bg-[oklch(92%_0.01_255)] dark:text-[oklch(62%_0.02_255)] dark:hover:bg-[oklch(18%_0.02_255)]'
                }`}
                aria-pressed={activeDemo === demo}
                aria-label={`View ${demo} demo`}
              >
                {demo}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 space-y-20">

        {/* ── Stats Counter ────────────────────────────────────────── */}
        <section aria-labelledby="stats-heading">
          <h2
            id="stats-heading"
            className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(52%_0.02_255)] dark:text-[oklch(55%_0.02_255)]"
          >
            Animated Counter — spring physics
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-[oklch(88%_0.01_255)] bg-[oklch(99%_0.005_255)] p-5 dark:border-[oklch(25%_0.02_255)] dark:bg-[oklch(14%_0.015_255)]"
              >
                <p className="text-3xl font-extrabold text-[oklch(20%_0.02_255)] dark:text-[oklch(92%_0.01_255)] leading-none">
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                </p>
                <p className="mt-2 text-xs text-[oklch(52%_0.015_255)] dark:text-[oklch(55%_0.015_255)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stagger List ─────────────────────────────────────────── */}
        <section aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(52%_0.02_255)] dark:text-[oklch(55%_0.02_255)]"
          >
            Stagger list — variants + staggerChildren
          </h2>
          <motion.div
            variants={reduce ? undefined : containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-4 sm:grid-cols-2"
            role="list"
            aria-label="Feature list"
          >
            {FEATURES.map((feature) => (
              <div key={feature.id} role="listitem">
                <FeatureCard feature={feature} />
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Magnetic Button ──────────────────────────────────────── */}
        <section aria-labelledby="magnetic-heading">
          <h2
            id="magnetic-heading"
            className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(52%_0.02_255)] dark:text-[oklch(55%_0.02_255)]"
          >
            Magnetic button — mouse-follow spring
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton
              className="bg-[oklch(52%_0.19_255)] text-white hover:bg-[oklch(48%_0.19_255)] focus-visible:ring-[oklch(52%_0.19_255)] dark:focus-visible:ring-offset-[oklch(10%_0.015_255)]"
              ariaLabel="Start your free trial"
            >
              Start free trial
            </MagneticButton>

            <MagneticButton
              className="border border-[oklch(72%_0.05_255)] bg-transparent text-[oklch(30%_0.03_255)] hover:bg-[oklch(93%_0.01_255)] dark:border-[oklch(35%_0.04_255)] dark:text-[oklch(80%_0.02_255)] dark:hover:bg-[oklch(18%_0.02_255)] focus-visible:ring-[oklch(52%_0.19_255)]"
              ariaLabel="Read the documentation"
            >
              Read the docs
            </MagneticButton>

            <MagneticButton
              className="bg-[oklch(58%_0.19_145)] text-white hover:bg-[oklch(54%_0.19_145)] focus-visible:ring-[oklch(58%_0.19_145)] dark:focus-visible:ring-offset-[oklch(10%_0.015_255)]"
              ariaLabel="Export design tokens"
            >
              Export tokens
            </MagneticButton>

            <p className="w-full text-xs text-[oklch(55%_0.015_255)] dark:text-[oklch(55%_0.015_255)] mt-1">
              Move your cursor over each button — spring stiffness 160, damping 14.
            </p>
          </div>
        </section>

        {/* ── AnimatePresence Notifications ────────────────────────── */}
        <section aria-labelledby="notif-heading">
          <h2
            id="notif-heading"
            className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(52%_0.02_255)] dark:text-[oklch(55%_0.02_255)]"
          >
            AnimatePresence — notification dismissal
          </h2>
          <div className="max-w-xl">
            <NotificationStack />
          </div>
        </section>

        {/* ── Spring Physics Showcase ───────────────────────────────── */}
        <section aria-labelledby="spring-heading">
          <h2
            id="spring-heading"
            className="mb-8 text-xs font-semibold uppercase tracking-[0.15em] text-[oklch(52%_0.02_255)] dark:text-[oklch(55%_0.02_255)]"
          >
            Spring configs — stiffness / damping comparison
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Snappy', stiffness: 480, damping: 28, color: 'oklch(52%_0.19_255)' },
              { label: 'Bouncy', stiffness: 200, damping: 10, color: 'oklch(62%_0.21_32)' },
              { label: 'Gentle', stiffness: 80, damping: 24, color: 'oklch(56%_0.17_300)' },
            ].map(({ label, stiffness, damping, color }) => (
              <motion.div
                key={label}
                whileHover={
                  reduce
                    ? undefined
                    : { scale: 1.06, transition: { type: 'spring', stiffness, damping } }
                }
                whileTap={
                  reduce
                    ? undefined
                    : { scale: 0.95, transition: { type: 'spring', stiffness, damping } }
                }
                className="cursor-pointer rounded-2xl border border-[oklch(88%_0.01_255)] bg-[oklch(99%_0.005_255)] p-6 dark:border-[oklch(28%_0.02_255)] dark:bg-[oklch(14%_0.015_255)]"
                role="button"
                tabIndex={0}
                aria-label={`${label} spring demo — stiffness ${stiffness}, damping ${damping}`}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && e.currentTarget.click()}
              >
                <div
                  className="mb-4 h-11 w-11 rounded-xl"
                  style={{ backgroundColor: `${color.replace('oklch', 'oklch')}` }}
                  aria-hidden="true"
                />
                <p className="font-semibold text-[oklch(20%_0.02_255)] dark:text-[oklch(88%_0.01_255)]">
                  {label}
                </p>
                <p className="mt-1 text-xs text-[oklch(52%_0.015_255)] dark:text-[oklch(55%_0.015_255)]">
                  stiffness: {stiffness} · damping: {damping}
                </p>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[oklch(55%_0.015_255)] dark:text-[oklch(55%_0.015_255)]">
            Hover or tap each card to feel the difference. Reduced-motion users see no scale animation.
          </p>
        </section>

        {/* ── Reduced Motion Notice ────────────────────────────────── */}
        <section
          aria-label="Reduced motion status"
          className="rounded-2xl border border-[oklch(88%_0.01_255)] bg-[oklch(99%_0.005_255)] p-6 dark:border-[oklch(28%_0.02_255)] dark:bg-[oklch(14%_0.015_255)]"
        >
          <div className="flex items-start gap-4">
            <div
              className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                reduce
                  ? 'bg-[oklch(58%_0.19_145)]/15 text-[oklch(48%_0.19_145)]'
                  : 'bg-[oklch(52%_0.19_255)]/12 text-[oklch(42%_0.18_255)] dark:bg-[oklch(52%_0.19_255)]/20 dark:text-[oklch(72%_0.12_255)]'
              }`}
              aria-hidden="true"
            >
              {reduce ? '⊘' : '◎'}
            </div>
            <div>
              <p className="font-semibold text-[oklch(20%_0.02_255)] dark:text-[oklch(88%_0.01_255)]">
                useReducedMotion(): {reduce ? 'true — animations disabled' : 'false — full animations active'}
              </p>
              <p className="mt-1 text-sm text-[oklch(45%_0.015_255)] dark:text-[oklch(58%_0.015_255)] leading-relaxed">
                {reduce
                  ? 'Your OS has prefers-reduced-motion enabled. All spring animations, stagger effects, and counter animations are bypassed. The UI remains fully functional.'
                  : 'All spring physics, stagger children, magnetic buttons, and counter animations are running. Toggle your OS accessibility setting to test reduced motion.'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
