/**
 * GOOD EXAMPLE: Dark Mode — Full Implementation
 * ✅ next-themes ThemeProvider with attribute="class" + enableSystem
 * ✅ suppressHydrationWarning on <html> (required — prevents React warning)
 * ✅ mounted guard — no hydration mismatch on toggle component
 * ✅ CSS variable token system: :root + .dark, never raw hex in components
 * ✅ Dark surfaces: oklch(11%) / oklch(17%) / oklch(19%) — NOT pure black
 * ✅ Brand shifted lighter in dark (oklch 65% vs 52%) for contrast
 * ✅ Three-way toggle: Light / Dark / System
 * ✅ Image handling: dark:invert for SVG logos
 * ✅ Chart colors fed programmatically (not CSS classes)
 * ✅ prefers-reduced-motion respected on theme transition
 * ✅ All interactive elements have focus-visible rings
 * ✅ aria-live on status announcements
 */

// ─── app/layout.tsx ───────────────────────────────────────────────────────────
// (shown as comment — this is the root layout setup)
/*
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning is REQUIRED — next-themes mutates class on <html>
    // and React would warn about server/client mismatch without it
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"         // applies/removes "dark" class on <html>
          defaultTheme="system"     // first visit matches OS setting
          enableSystem              // watch prefers-color-scheme media query
          disableTransitionOnChange // prevents flash on switch
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
*/

// ─── globals.css ─────────────────────────────────────────────────────────────
// (shown as comment)
/*
@layer base {
  :root {
    --color-bg:           oklch(98.5% 0.005 240);
    --color-bg-raised:    oklch(99.5% 0.004 255);
    --color-bg-subtle:    oklch(96.5% 0.008 240);
    --color-ink:          oklch(13% 0.025 255);
    --color-ink-2:        oklch(44% 0.045 255);
    --color-ink-3:        oklch(62% 0.040 255);
    --color-brand:        oklch(52% 0.19 255);
    --color-brand-subtle: oklch(95% 0.035 255);
    --color-border:       oklch(91% 0.015 255);
    --color-border-strong:oklch(85% 0.022 255);
    --color-success:      oklch(70% 0.14 165);
    --color-error:        oklch(62% 0.20 27);
  }

  .dark {
    --color-bg:           oklch(11% 0.015 255);   (* dark page bg *)
    --color-bg-raised:    oklch(17% 0.025 255);   // card surface — lighter than bg
    --color-bg-subtle:    oklch(14% 0.020 255);
    --color-ink:          oklch(96.5% 0.008 240);
    --color-ink-2:        oklch(62% 0.040 255);
    --color-ink-3:        oklch(44% 0.045 255);
    --color-brand:        oklch(65% 0.18 264);   // lighter in dark for contrast
    --color-brand-subtle: oklch(18% 0.055 265);
    --color-border:       oklch(18% 0.025 255);
    --color-border-strong:oklch(30% 0.035 255);
    --color-success:      oklch(76% 0.14 165);
    --color-error:        oklch(70% 0.17 27);
  }
}
*/

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor, Bell, Settings, TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Never render theme-dependent UI until client-side — prevents hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Stable placeholder matching final size — prevents layout shift
    return <div className="h-9 w-9 rounded-lg" aria-hidden="true" />
  }

  const options = [
    { value: 'light',  icon: Sun,     label: 'Light mode'  },
    { value: 'dark',   icon: Moon,    label: 'Dark mode'   },
    { value: 'system', icon: Monitor, label: 'System theme' },
  ]

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-0.5"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={`
            flex h-7 w-7 items-center justify-center rounded-md transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1
            ${theme === value
              ? 'bg-[var(--color-bg-raised)] text-[var(--color-ink)] shadow-sm'
              : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]'
            }
          `}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

// ─── Chart (colors fed programmatically — not via CSS classes) ────────────────
const CHART_DATA = [
  { month: 'Oct', revenue: 31200 },
  { month: 'Nov', revenue: 38700 },
  { month: 'Dec', revenue: 42100 },
  { month: 'Jan', revenue: 39800 },
  { month: 'Feb', revenue: 51300 },
  { month: 'Mar', revenue: 58247 },
]
export type Chart_dataItem = (typeof CHART_DATA)[number]

function RevenueChart() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-48 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
  }

  const isDark = resolvedTheme === 'dark'

  // All chart colors programmatic — Recharts doesn't read dark: CSS classes
  const colors = {
    grid:    isDark ? 'oklch(18% 0.025 255)' : 'oklch(96.5% 0.008 240)',
    axis:    isDark ? 'oklch(44% 0.045 255)' : 'oklch(62% 0.040 255)',
    stroke:  isDark ? 'oklch(65% 0.18 264)'  : 'oklch(52% 0.19 255)',
    fill:    isDark ? 'oklch(65% 0.18 264)'  : 'oklch(52% 0.19 255)',
    tooltip: {
      bg:     isDark ? 'oklch(17% 0.025 255)' : 'oklch(99.5% 0.004 255)',
      border: isDark ? 'oklch(18% 0.025 255)' : 'oklch(91% 0.015 255)',
      text:   isDark ? 'oklch(96.5% 0.008 240)' : 'oklch(13% 0.025 255)',
    },
  }

  return (
    <ResponsiveContainer width="100%" height={192}>
      <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={colors.fill} stopOpacity={0.15} />
            <stop offset="95%" stopColor={colors.fill} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: colors.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: colors.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: colors.tooltip.bg,
            border:     `1px solid ${colors.tooltip.border}`,
            borderRadius: '8px',
            color:      colors.tooltip.text,
            fontSize:   '12px',
          }}
          formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={colors.stroke}
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: colors.stroke, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, delta, positive,
}: { label: string; value: string; delta: string; positive: boolean }) {
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-3)]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">{value}</p>
      <p className={`mt-1.5 flex items-center gap-1 text-sm font-medium ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {delta}
        <span className="text-[var(--color-ink-3)] font-normal">vs last month</span>
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DarkModeDemo() {
  const [toastVisible, setToastVisible] = useState(false)

  function showToast() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  return (
    // Uses CSS variables — works in both light and dark without any dark: classes on layout
    <div className="min-h-[100dvh] bg-[var(--color-bg)] text-[var(--color-ink)] transition-colors duration-150">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Manrope:wght@400;500&display=swap');
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
      `}</style>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded">Skip to main content</a>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-raised)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Logo SVG — dark:invert flips black logo to white in dark mode */}
            <img
              src="/logo.svg"
              alt="Ridgeline"
              className="h-6 w-auto dark:invert" width={40} height={40} />
            <span className="text-sm font-semibold text-[var(--color-ink)]">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={showToast}
              aria-label="View notifications"
              className="rounded-lg p-2 text-[var(--color-ink-2)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1 transition-colors"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              aria-label="Open settings"
              className="rounded-lg p-2 text-[var(--color-ink-2)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1 transition-colors"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Three-way theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            Overview
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-2)]">
            March 2026 · All figures in USD
          </p>
        </div>

        {/* Stats — asymmetric grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Revenue"      value="$58,247"  delta="↑ 13.6%"  positive={true}  />
          <StatCard label="Active users" value="4,217"    delta="↑ 8.2%"   positive={true}  />
          <StatCard label="Churn rate"   value="2.3%"     delta="↓ 0.4pp"  positive={false} />
        </div>

        {/* Chart card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 shadow-sm mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Revenue — last 6 months</h2>
            <span className="text-xs text-[var(--color-ink-3)]">Oct → Mar 2026</span>
          </div>
          <RevenueChart />
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] shadow-sm overflow-hidden">
          <div className="border-b border-[var(--color-border)] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Recent activity</h2>
          </div>
          <ul role="list" className="divide-y divide-[var(--color-border)]">
            {[
              { name: 'Ana Ngugi',        action: 'merged PR feature/dark-tokens',    time: '2 min ago',  initials: 'AN', from: 'violet-500', to: 'indigo-500' },
              { name: 'Kenji Tanaka',     action: 'closed 3 tickets',  time: '14 min ago', initials: 'KT', from: 'emerald-400', to: 'teal-500' },
              { name: 'Priya Shah',       action: 'deployed v2.4.1',   time: '1 hr ago',   initials: 'PS', from: 'orange-400', to: 'rose-500' },
              { name: 'Diego Reyes',      action: 'left a comment',    time: '3 hrs ago',  initials: 'DR', from: 'sky-400', to: 'blue-600' },
            ].map(item => (
              <li key={item.name} className="flex items-center gap-3 px-5 py-3.5">
                <div
                  role="img"
                  aria-label={item.name}
                  className={`h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-${item.from} to-${item.to} flex items-center justify-center text-xs font-semibold text-white`}
                >
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-ink)]">
                    <span className="font-medium">{item.name}</span>
                    {' '}{item.action}
                  </p>
                </div>
                <time className="text-xs text-[var(--color-ink-3)] flex-shrink-0">{item.time}</time>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* ── Toast — aria-live so screen readers announce it ── */}
      {/* Element stays in DOM always; content changes trigger announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50"
      >
        {toastVisible && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-4 py-3 shadow-lg text-sm text-[var(--color-ink)] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
            You have 3 new notifications
          </div>
        )}
      </div>

    </div>
  )
}
