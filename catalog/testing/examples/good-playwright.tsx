// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')
// Playwright Test Results Dashboard — gold standard component

// ─── Playwright spec template embedded for copy-paste by developers ───────────
const PLAYWRIGHT_SPEC = `
import { test, expect } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'
// Also works with: import axe from '@axe-core/playwright'
import { getByRole, getByLabel, getByText, getByTestId } from '@testing-library/dom'

test.use({ viewport: { width: 1280, height: 720 } })

beforeEach(async ({ page }) => {
  await page.goto('/dashboard')
  await page.route('**/api/tests', route => route.fulfill({
    status: 200,
    body: JSON.stringify({ total: 264, passing: 247, failing: 14, flaky: 3 })
  }))
})

test('should be fully accessible', async ({ page }) => {
  await injectAxe(page)
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  })
})

test('keyboard navigation works correctly', async ({ page }) => {
  await page.keyboard.press('Tab')
  const focused = await page.locator(':focus')
  await expect(focused).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
})

test('filters work correctly', async ({ page }) => {
  const searchBox = page.getByRole('searchbox', { name: /search tests/i })
  await searchBox.fill('authentication')
  const results = page.getByTestId('test-row')
  await expect(results).toHaveCount(3)
  const label = page.getByLabel('Status filter')
  await label.selectOption('failing')
})

it('handles network errors gracefully', async ({ page }) => {
  await page.route('**/api/**', route => route.abort())
  await page.goto('/dashboard')
  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  const errorText = page.getByText('Failed to load test results')
  await expect(errorText).toBeVisible()
})

test('copy spec button works', async ({ page }) => {
  const btn = page.getByRole('button', { name: /copy spec/i })
  await btn.click()
  const toast = page.getByText(/copied/i)
  await expect(toast).toBeVisible()
})
`
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

const TEST_SUITES = [
  {
    id: 'auth',
    name: 'User authentication flow',
    file: 'tests/auth.spec.ts',
    status: 'passing',
    tests: 38,
    passing: 38,
    failing: 0,
    duration: '7.2s',
    lastRun: '3 min ago',
  },
  {
    id: 'checkout',
    name: 'Payment checkout E2E',
    file: 'tests/checkout.spec.ts',
    status: 'failing',
    tests: 24,
    passing: 21,
    failing: 3,
    duration: '12.8s',
    lastRun: '3 min ago',
  },
  {
    id: 'dashboard',
    name: 'Dashboard data loading',
    file: 'tests/dashboard.spec.ts',
    status: 'flaky',
    tests: 19,
    passing: 17,
    failing: 0,
    flaky: 2,
    duration: '9.1s',
    lastRun: '3 min ago',
  },
  {
    id: 'a11y',
    name: 'Accessibility audit',
    file: 'tests/a11y.spec.ts',
    status: 'passing',
    tests: 31,
    passing: 31,
    failing: 0,
    duration: '5.6s',
    lastRun: '3 min ago',
  },
  {
    id: 'search',
    name: 'Search and filter UX',
    file: 'tests/search.spec.ts',
    status: 'failing',
    tests: 17,
    passing: 12,
    failing: 5,
    duration: '6.3s',
    lastRun: '3 min ago',
  },
  {
    id: 'notifications',
    name: 'Notifications pipeline',
    file: 'tests/notifications.spec.ts',
    status: 'passing',
    tests: 22,
    passing: 22,
    failing: 0,
    duration: '4.9s',
    lastRun: '3 min ago',
  },
]
export type Test_suitesItem = (typeof TEST_SUITES)[number]

const STATUS_BADGE = {
  passing: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  failing: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  flaky: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
}

const STATUS_DOT = {
  passing: 'bg-emerald-400',
  failing: 'bg-red-400',
  flaky: 'bg-amber-400',
}

export default function PlaywrightDashboard() {
  const [view, setView] = useState('success') // 'loading' | 'error' | 'empty' | 'success'
  const [selected, setSelected] = useState(TEST_SUITES[1])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [searchError, setSearchError] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(PLAYWRIGHT_SPEC).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (val.length === 1) {
      setSearchError('Enter at least 2 characters to filter')
    } else {
      setSearchError('')
    }
  }

  const filtered = TEST_SUITES.filter((s) => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || search.length < 2
    return matchFilter && matchSearch
  })

  if (view === 'loading') {
    return (
      <main
        className="min-h-[100dvh] bg-[oklch(0.14_0.02_264)] font-[Manrope,system-ui] p-6"
        aria-busy="true"
        aria-label="Loading test results"
      >
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-10 w-64 rounded-lg animate-pulse bg-[oklch(0.22_0.02_264)]" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-[oklch(0.22_0.02_264)]" />
            ))}
          </div>
          <div className="h-64 rounded-xl animate-pulse bg-[oklch(0.22_0.02_264)]" />
        </div>
      </main>
    )
  }

  if (view === 'error') {
    return (
      <main className="min-h-[100dvh] bg-[oklch(0.14_0.02_264)] font-[Manrope,system-ui] flex items-center justify-center p-6">
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; }
          }
        `}</style>
        <div role="alert" className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg aria-hidden="true" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.27 16A2 2 0 005.07 19z" />
            </svg>
          </div>
          <p className="text-red-400 font-semibold text-lg mb-1">Failed to load test results</p>
          <p className="text-[oklch(0.6_0.01_264)] text-sm mb-6">The CI runner is not responding. Check your network connection or retry.</p>
          <button
            onClick={() => setView('loading')}
            className="h-11 min-w-[44px] px-6 rounded-lg bg-[oklch(0.55_0.18_264)] text-white font-semibold focus-visible:ring-2 focus-visible:ring-[oklch(0.75_0.18_264)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.14_0.02_264)] transition-colors duration-200 ease-out hover:bg-[oklch(0.62_0.18_264)]"
            aria-label="Retry loading test results"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  if (view === 'empty') {
    return (
      <main className="min-h-[100dvh] bg-[oklch(0.14_0.02_264)] font-[Manrope,system-ui] flex items-center justify-center p-6">
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; }
          }
        `}</style>
        <div className="text-center max-w-sm">
          <svg aria-hidden="true" className="w-16 h-16 mx-auto mb-4 text-[oklch(0.4_0.02_264)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-[oklch(0.85_0.01_264)] font-semibold text-lg mb-1">No test results yet</p>
          <p className="text-[oklch(0.55_0.01_264)] text-sm">Run your Playwright suite to see results here.</p>
        </div>
      </main>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-[100dvh] bg-[oklch(0.14_0.02_264)] font-[Manrope,system-ui] text-[oklch(0.92_0.01_264)]"
      id="main-content"
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Skip link */}
      <a
        href="#test-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[oklch(0.55_0.18_264)] focus:text-white focus:font-semibold"
      >
        Skip to test list
      </a>

      {/* Header */}
      <header className="border-b border-[oklch(0.22_0.02_264)] px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.18_264)] flex items-center justify-center" aria-hidden="true">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Playwright CI Dashboard</h1>
              <p className="text-xs text-[oklch(0.55_0.01_264)] mt-0.5">main branch · run #1,847 · Apr 24 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View state switcher for demo */}
            {['loading', 'error', 'empty', 'success'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className="h-8 min-w-[44px] px-3 rounded-md text-xs font-medium transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[oklch(0.75_0.18_264)] focus-visible:ring-offset-1 focus-visible:ring-offset-[oklch(0.14_0.02_264)] aria-pressed:bg-[oklch(0.55_0.18_264)] aria-pressed:text-white text-[oklch(0.55_0.01_264)] hover:text-[oklch(0.85_0.01_264)]"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* Stats row */}
        <section aria-label="Test run summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Tests', value: '264', sub: '+17 since last run', color: 'text-[oklch(0.85_0.01_264)]' },
              { label: 'Passing', value: '247', sub: '93.6% pass rate', color: 'text-emerald-400' },
              { label: 'Failing', value: '14', sub: '5.3% of suite', color: 'text-red-400' },
              { label: 'Avg Duration', value: '8.4s', sub: '↓ 0.7s vs baseline', color: 'text-[oklch(0.75_0.18_264)]' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-[oklch(0.19_0.02_264)] border border-[oklch(0.26_0.02_264)] p-4"
              >
                <p className="text-xs text-[oklch(0.55_0.01_264)] font-medium uppercase tracking-wide">{stat.label}</p>
                <p className={`text-3xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[oklch(0.5_0.01_264)] mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Filters + search */}
        <section aria-label="Filter and search tests">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="test-search" className="sr-only">Search tests</label>
              <input
                id="test-search"
                type="search"
                role="searchbox"
                value={search}
                onChange={handleSearch}
                placeholder="Search test suites…"
                aria-describedby={searchError ? 'search-error' : undefined}
                className="w-full h-11 min-w-[44px] px-4 rounded-lg bg-[oklch(0.19_0.02_264)] border border-[oklch(0.28_0.02_264)] text-sm placeholder-[oklch(0.45_0.01_264)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.18_264)] focus-visible:border-transparent transition-colors duration-200 ease-out"
              />
              {searchError && (
                <p id="search-error" role="alert" className="mt-1 text-xs text-amber-400">
                  {searchError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <label htmlFor="status-filter" className="sr-only">Status filter</label>
              <select
                id="status-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter by status"
                className="h-11 min-w-[44px] px-3 rounded-lg bg-[oklch(0.19_0.02_264)] border border-[oklch(0.28_0.02_264)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.18_264)] transition-colors duration-200 ease-out"
              >
                <option value="all">All status</option>
                <option value="passing">Passing</option>
                <option value="failing">Failing</option>
                <option value="flaky">Flaky</option>
              </select>
              <button
                onClick={handleCopy}
                aria-label="Copy Playwright spec template to clipboard"
                className="h-11 min-w-[44px] px-4 rounded-lg bg-[oklch(0.55_0.18_264)] text-white text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[oklch(0.75_0.18_264)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.14_0.02_264)] transition duration-200 ease-out hover:bg-[oklch(0.62_0.18_264)] whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy spec'}
              </button>
            </div>
          </div>
        </section>

        {copied && (
          <div role="alert" aria-live="polite" className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 font-medium">
            Spec template copied — paste into your project to get started.
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Suite list */}
          <section
            id="test-list"
            aria-label="Test suites"
            className="lg:col-span-2 rounded-xl bg-[oklch(0.19_0.02_264)] border border-[oklch(0.26_0.02_264)] overflow-hidden"
          >
            <header className="px-4 py-3 border-b border-[oklch(0.26_0.02_264)]">
              <h2 className="text-sm font-semibold">Test Suites</h2>
              <p className="text-xs text-[oklch(0.5_0.01_264)] mt-0.5">{filtered.length} of {TEST_SUITES.length} shown</p>
            </header>
            <nav aria-label="Test suite navigation">
              <ul role="list">
                {filtered.map((suite) => (
                  <li key={suite.id}>
                    <button
                      onClick={() => setSelected(suite)}
                      aria-current={selected?.id === suite.id ? 'true' : undefined}
                      aria-label={`View ${suite.name} — ${suite.status}`}
                      className="w-full text-left px-4 py-3 min-h-[44px] flex items-center gap-3 border-b border-[oklch(0.22_0.02_264)] last:border-b-0 transition-colors duration-150 ease-out hover:bg-[oklch(0.22_0.02_264)] aria-[current=true]:bg-[oklch(0.55_0.18_264)]/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[oklch(0.55_0.18_264)]"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[suite.status as keyof typeof STATUS_DOT]}`} aria-hidden="true" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{suite.name}</span>
                        <span className="block text-xs text-[oklch(0.5_0.01_264)] mt-0.5">{suite.file}</span>
                      </span>
                      <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[suite.status as keyof typeof STATUS_BADGE]}`}>
                        {suite.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Suite detail */}
          <article
            aria-label={`Details for ${selected?.name}`}
            className="lg:col-span-3 rounded-xl bg-[oklch(0.19_0.02_264)] border border-[oklch(0.26_0.02_264)] overflow-hidden"
          >
            {selected ? (
              <>
                <header className="px-5 py-4 border-b border-[oklch(0.26_0.02_264)] flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold">{selected.name}</h2>
                    <p className="text-xs text-[oklch(0.5_0.01_264)] mt-1 font-mono">{selected.file}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold ${STATUS_BADGE[selected.status as keyof typeof STATUS_BADGE]}`}>
                    {selected.status}
                  </span>
                </header>

                <div className="px-5 py-4 space-y-5">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total', value: selected.tests },
                      { label: 'Passing', value: selected.passing, cls: 'text-emerald-400' },
                      { label: 'Failing', value: selected.failing ?? 0, cls: selected.failing ? 'text-red-400' : 'text-[oklch(0.55_0.01_264)]' },
                      { label: 'Duration', value: selected.duration, cls: 'text-[oklch(0.75_0.18_264)]' },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg bg-[oklch(0.22_0.02_264)] px-3 py-3">
                        <p className="text-xs text-[oklch(0.5_0.01_264)] font-medium">{m.label}</p>
                        <p className={`text-xl font-bold mt-0.5 ${m.cls ?? ''}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Failure notice */}
                  {selected.failing > 0 && (
                    <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-300">
                      <strong className="font-semibold">Failures detected:</strong> {selected.failing} test{selected.failing !== 1 ? 's' : ''} in this suite require attention.
                    </div>
                  )}

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-[oklch(0.5_0.01_264)] mb-1.5">
                      <span>Pass rate</span>
                      <span>{((selected.passing / selected.tests) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[oklch(0.26_0.02_264)]" role="progressbar" aria-valuenow={Math.round((selected.passing / selected.tests) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Pass rate">
                      <div
                        className="h-2 rounded-full bg-emerald-500 transition duration-500 ease-out"
                        style={{ width: `${(selected.passing / selected.tests) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Spec preview */}
                  <div>
                    <h3 className="text-xs font-semibold text-[oklch(0.55_0.01_264)] uppercase tracking-wide mb-2">Embedded Spec Template</h3>
                    <pre className="rounded-lg bg-[oklch(0.12_0.02_264)] border border-[oklch(0.22_0.02_264)] p-4 text-xs text-[oklch(0.72_0.01_264)] overflow-x-auto leading-relaxed max-h-56" tabIndex={0} aria-label="Playwright spec template code">
                      <code>{PLAYWRIGHT_SPEC.trim().slice(0, 480)}…</code>
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-12 text-[oklch(0.45_0.01_264)] text-sm">
                Select a suite to view details
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  )
}
