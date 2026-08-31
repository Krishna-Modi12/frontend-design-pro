# Continuous Learning Patterns in UI

How components adapt and improve from user behavior, feedback loops, and runtime data.
React/Next.js — TypeScript throughout. No filler.

---

## Contents

- [1. User Preference Learning](#1-user-preference-learning)
- [2. A/B Testing in UI](#2-ab-testing-in-ui)
- [3. Error Telemetry Feedback](#3-error-telemetry-feedback)
- [4. Usage Analytics for UI Decisions](#4-usage-analytics-for-ui-decisions)
- [5. Adaptive Defaults](#5-adaptive-defaults)
- [6. Feedback Widgets](#6-feedback-widgets)
- [7. Model-in-the-Loop UI](#7-model-in-the-loop-ui)
- [8. Rollout Strategies](#8-rollout-strategies)
- [9. Personalization Tokens](#9-personalization-tokens)
- [10. Anti-Patterns](#10-anti-patterns)
- [Quick-Reference: Learning Loop Lifecycle](#quick-reference-learning-loop-lifecycle)

---

## 1. User Preference Learning

### Zustand store with localStorage persistence

```ts
// store/uiPreferences.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Density = 'compact' | 'comfortable' | 'spacious'

interface UIPreferences {
  density: Density
  fontSize: number                   // base rem multiplier: 0.875 | 1 | 1.125
  collapsedPanels: Set<string>
  columnOrder: Record<string, string[]>
  sidebarWidth: number
  // actions
  setDensity: (d: Density) => void
  setFontSize: (n: number) => void
  togglePanel: (id: string) => void
  setColumnOrder: (tableId: string, cols: string[]) => void
  setSidebarWidth: (w: number) => void
}

export const useUIPreferences = create<UIPreferences>()(
  persist(
    (set, get) => ({
      density: 'comfortable',
      fontSize: 1,
      collapsedPanels: new Set(),
      columnOrder: {},
      sidebarWidth: 240,

      setDensity: (density) => set({ density }),
      setFontSize: (fontSize) => set({ fontSize }),
      togglePanel: (id) =>
        set((s) => {
          const next = new Set(s.collapsedPanels)
          next.has(id) ? next.delete(id) : next.add(id)
          return { collapsedPanels: next }
        }),
      setColumnOrder: (tableId, cols) =>
        set((s) => ({ columnOrder: { ...s.columnOrder, [tableId]: cols } })),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
    }),
    {
      name: 'ui-preferences-v2',
      storage: createJSONStorage(() => localStorage),
      // Sets aren't JSON-serializable — handle manually
      partialize: (s) => ({
        ...s,
        collapsedPanels: Array.from(s.collapsedPanels),
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        collapsedPanels: new Set(persisted.collapsedPanels ?? []),
      }),
    }
  )
)
```

### Applying preferences to the component tree

```tsx
// components/PreferenceProvider.tsx
'use client'
import { useUIPreferences } from '@/store/uiPreferences'
import { useEffect } from 'react'

export function PreferenceProvider({ children }: { children: React.ReactNode }) {
  const { density, fontSize, sidebarWidth } = useUIPreferences()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--density-scale', densityScale[density])
    root.style.setProperty('--font-scale', String(fontSize))
    root.style.setProperty('--sidebar-width', `${sidebarWidth}px`)
  }, [density, fontSize, sidebarWidth])

  return <>{children}</>
}

const densityScale: Record<string, string> = {
  compact: '0.75',
  comfortable: '1',
  spacious: '1.25',
}
```

### Draggable column order with persistence

```tsx
// hooks/usePersistedColumns.ts
import { useUIPreferences } from '@/store/uiPreferences'

export function usePersistedColumns(tableId: string, defaultCols: string[]) {
  const { columnOrder, setColumnOrder } = useUIPreferences()
  const cols = columnOrder[tableId] ?? defaultCols

  const reorder = (from: number, to: number) => {
    const next = [...cols]
    next.splice(to, 0, next.splice(from, 1)[0])
    setColumnOrder(tableId, next)
  }

  return { cols, reorder }
}
```

---

## 2. A/B Testing in UI

### Feature flags with Vercel Flags SDK

```ts
// flags.ts  (Next.js App Router)
import { flag } from '@vercel/flags/next'

export const newCheckoutFlow = flag<boolean>({
  key: 'new-checkout-flow',
  defaultValue: false,
  decide: async () => {
    // called server-side; can read cookies, headers, user context
    return false
  },
})

export const dashboardLayout = flag<'grid' | 'list'>({
  key: 'dashboard-layout',
  defaultValue: 'grid',
  options: ['grid', 'list'],
  decide: async () => 'grid',
})
```

```tsx
// app/dashboard/page.tsx
import { newCheckoutFlow, dashboardLayout } from '@/flags'
import { GridDashboard, ListDashboard } from '@/components/Dashboard'

export default async function DashboardPage() {
  const [useNewCheckout, layout] = await Promise.all([
    newCheckoutFlow(),
    dashboardLayout(),
  ])

  return layout === 'grid'
    ? <GridDashboard newCheckout={useNewCheckout} />
    : <ListDashboard newCheckout={useNewCheckout} />
}
```

### GrowthBook client-side variant with metric collection

```tsx
// components/ExperimentWrapper.tsx
'use client'
import { useGrowthBook } from '@growthbook/growthbook-react'
import { useEffect } from 'react'
import { track } from '@/lib/analytics'

interface Props {
  experimentId: string
  variants: Record<string, React.ReactNode>
  fallback: React.ReactNode
}

export function Experiment({ experimentId, variants, fallback }: Props) {
  const gb = useGrowthBook()
  const result = gb?.evalFeature<string>(experimentId)

  useEffect(() => {
    if (result?.on) {
      track('experiment_exposure', {
        experiment_id: experimentId,
        variant: result.value,
        variation_id: result.variationId,
      })
    }
  }, [experimentId, result?.variationId])

  if (!result?.on || !result.value) return <>{fallback}</>
  return <>{variants[result.value] ?? fallback}</>
}
```

```tsx
// Usage
<Experiment
  experimentId="cta-button-color"
  fallback={<Button variant="default">Get started</Button>}
  variants={{
    blue:   <Button variant="blue">Get started</Button>,
    orange: <Button variant="orange">Get started</Button>,
  }}
/>
```

### Metric collection — conversion event shape

```ts
// lib/analytics.ts
export type ExperimentEvent =
  | { name: 'experiment_exposure'; experiment_id: string; variant: string; variation_id: number }
  | { name: 'experiment_conversion'; experiment_id: string; goal: string; value?: number }

export function trackExperimentConversion(
  experimentId: string,
  goal: string,
  value?: number
) {
  track('experiment_conversion', { experiment_id: experimentId, goal, value })
  // Mirror to GrowthBook for automatic stat-sig calculation
  window.growthbook?.trackExperiment({ experimentId, goal, value } as any)
}
```

---

## 3. Error Telemetry Feedback

### Sentry setup with Next.js App Router

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: false,
    }),
  ],
  beforeSend(event) {
    // strip PII from breadcrumbs
    event.breadcrumbs?.values?.forEach((b) => {
      if (b.data?.email) b.data.email = '[redacted]'
    })
    return event
  },
})
```

### Error boundary that logs rich UI context

```tsx
// components/SentryErrorBoundary.tsx
'use client'
import * as Sentry from '@sentry/nextjs'
import React from 'react'

interface Props {
  componentName: string
  fallback?: React.ReactNode
  children: React.ReactNode
  // extra context pushed to Sentry scope
  context?: Record<string, unknown>
}

interface State { hasError: boolean; eventId?: string }

export class SentryErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: { componentStack: info.componentStack },
        ui: {
          componentName: this.props.componentName,
          ...this.props.context,
        },
      },
      tags: { component: this.props.componentName },
    })
    this.setState({ eventId })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      this.props.fallback ?? (
        <div role="alert" className="error-boundary-fallback">
          <p>Something went wrong in {this.props.componentName}.</p>
          {this.state.eventId && (
            <button
              onClick={() =>
                Sentry.showReportDialog({ eventId: this.state.eventId! })
              }
            >
              Send feedback
            </button>
          )}
        </div>
      )
    )
  }
}
```

### Surfacing error patterns back to UI (admin panel)

```ts
// lib/sentryInsights.ts — server-only
import * as Sentry from '@sentry/node'

export async function fetchTopErrorsByComponent(days = 7) {
  // Uses Sentry Issues API; replace with your org/project slugs
  const url = `https://sentry.io/api/0/projects/${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT}/issues/`
  const res = await fetch(
    `${url}?query=is:unresolved&groupBy=tag:component&limit=20&statsPeriod=${days}d`,
    { headers: { Authorization: `Bearer ${process.env.SENTRY_AUTH_TOKEN}` } }
  )
  const issues: SentryIssue[] = await res.json()
  return issues.map((i) => ({
    component: i.tags.find((t) => t.key === 'component')?.value ?? 'unknown',
    count: i.count,
    title: i.title,
    firstSeen: i.firstSeen,
  }))
}
```

---

## 4. Usage Analytics for UI Decisions

### PostHog setup with Next.js App Router

```tsx
// components/PostHogProvider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',          // proxied — avoids adblockers
      capture_pageview: false,      // manual pageviews in Next.js router
      capture_pageleave: true,
      autocapture: true,            // clicks, input changes, form submits
      session_recording: {
        maskAllInputs: true,
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

```tsx
// app/layout.tsx — pageview tracking for App Router
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

export function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}
```

### Custom event tracking with typed event catalog

```ts
// lib/events.ts
import { usePostHog } from 'posthog-js/react'

// Exhaustive event catalog — add new events here only
export type UIEvent =
  | { event: 'filter_applied';      props: { filter_key: string; value: string; table: string } }
  | { event: 'column_reordered';    props: { table: string; from: number; to: number } }
  | { event: 'panel_toggled';       props: { panel_id: string; open: boolean } }
  | { event: 'search_performed';    props: { query_length: number; results: number } }
  | { event: 'export_triggered';    props: { format: 'csv' | 'xlsx' | 'pdf'; row_count: number } }

export function useTrack() {
  const posthog = usePostHog()
  return function track<E extends UIEvent['event']>(
    event: E,
    props: Extract<UIEvent, { event: E }>['props']
  ) {
    posthog.capture(event, props)
  }
}
```

### Heatmap-friendly className conventions

PostHog, Hotjar, and FullStory identify elements by CSS selectors. Use stable, semantic class names — never Tailwind utility classes — as heatmap targets:

```tsx
// Bad: PostHog can't aggregate clicks across deployments
<button className="px-4 py-2 bg-blue-500 text-white rounded-md">

// Good: stable selector + Tailwind for styling
<button
  className="ph-btn-primary px-4 py-2 bg-blue-500 text-white rounded-md"
  data-ph-capture-attribute-location="header-cta"
>

// Convention: ph-{component}-{role} for anything you want to heatmap
// ph-table-filter, ph-sidebar-nav-item, ph-modal-confirm
```

```ts
// tailwind.config.ts — safelist heatmap classes so they survive purge
export default {
  safelist: [{ pattern: /^ph-/ }],
}
```

---

## 5. Adaptive Defaults

Aggregate real usage to compute better initial state for new users or new sessions.

### Architecture

1. Raw events land in PostHog / your warehouse.
2. A nightly job (Vercel Cron / GitHub Actions) aggregates into a `ui_defaults` table.
3. Next.js server component reads defaults at request time and seeds the store.

### Aggregation query (PostHog SQL Insights or warehouse)

```sql
-- Most-used filters across all users (last 30 days)
SELECT
  props->>'filter_key'   AS filter_key,
  props->>'value'        AS value,
  COUNT(*)               AS usage_count,
  COUNT(DISTINCT person_id) AS user_count
FROM events
WHERE event = 'filter_applied'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 10;
```

### Server component seeding adaptive defaults

```tsx
// app/dashboard/page.tsx
import { fetchAdaptiveDefaults } from '@/lib/adaptiveDefaults'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  // Per-user if authed, else population-level defaults
  const defaults = await fetchAdaptiveDefaults()
  return <DashboardClient defaultFilters={defaults.filters} defaultSort={defaults.sort} />
}
```

```ts
// lib/adaptiveDefaults.ts
import { auth } from '@/auth'
import { db } from '@/db'

export async function fetchAdaptiveDefaults() {
  const session = await auth()
  const userId = session?.user?.id

  // User-specific overrides win; fall back to global defaults
  const rows = await db.query(`
    SELECT filter_key, value, score
    FROM ui_defaults
    WHERE (user_id = $1 OR user_id IS NULL)
    ORDER BY user_id NULLS LAST, score DESC
  `, [userId ?? null])

  return {
    filters: Object.fromEntries(rows.map((r) => [r.filter_key, r.value])),
    sort: rows.find((r) => r.filter_key === '__sort')?.value ?? 'created_at:desc',
  }
}
```

---

## 6. Feedback Widgets

Pure React — no third-party widget library. State stays local; side-effect is a POST.

### Thumbs up/down

```tsx
// components/feedback/ThumbsFeedback.tsx
'use client'
import { useState } from 'react'

type Sentiment = 'up' | 'down' | null

interface Props {
  targetId: string     // e.g. page path or feature key
  targetType: string   // 'feature' | 'response' | 'page'
}

export function ThumbsFeedback({ targetId, targetType }: Props) {
  const [sentiment, setSentiment] = useState<Sentiment>(null)
  const [submitted, setSubmitted] = useState(false)

  async function submit(value: Sentiment) {
    setSentiment(value)
    setSubmitted(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, targetType, sentiment: value }),
    })
  }

  if (submitted) return <span className="feedback-thanks text-sm text-muted">Thanks!</span>

  return (
    <div className="feedback-thumbs flex gap-2" role="group" aria-label="Was this helpful?">
      <button
        aria-label="Yes, helpful"
        aria-pressed={sentiment === 'up'}
        onClick={() => submit('up')}
        className="ph-feedback-up"
      >
        👍
      </button>
      <button
        aria-label="Not helpful"
        aria-pressed={sentiment === 'down'}
        onClick={() => submit('down')}
        className="ph-feedback-down"
      >
        👎
      </button>
    </div>
  )
}
```

### Star rating

```tsx
// components/feedback/StarRating.tsx
'use client'
import { useState } from 'react'

interface Props {
  max?: number
  onRate: (rating: number) => void
}

export function StarRating({ max = 5, onRate }: Props) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)

  function choose(n: number) {
    setSelected(n)
    onRate(n)
  }

  return (
    <div
      className="feedback-stars flex gap-1"
      role="radiogroup"
      aria-label="Rate this"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={selected === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onClick={() => choose(n)}
          className={`ph-star-btn text-xl transition-colors ${
            n <= (hovered || selected) ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
```

### Inline correction UI (for LLM-generated content)

```tsx
// components/feedback/InlineCorrection.tsx
'use client'
import { useState, useRef } from 'react'

interface Props {
  original: string
  sourceId: string     // e.g. message id or suggestion id
}

export function InlineCorrection({ original, sourceId }: Props) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  async function save() {
    const correction = ref.current?.value
    if (!correction || correction === original) { setEditing(false); return }
    await fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, original, correction }),
    })
    setSaved(true)
    setEditing(false)
  }

  if (saved) return <span className="text-sm text-green-600">Correction saved — thank you</span>

  return (
    <div className="inline-correction-widget">
      {editing ? (
        <>
          <textarea
            ref={ref}
            defaultValue={original}
            rows={3}
            className="w-full rounded border p-2 text-base"
          />
          <div className="mt-1 flex gap-2">
            <button onClick={save} className="ph-correction-save text-sm text-blue-600">Save</button>
            <button onClick={() => setEditing(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="ph-correction-trigger text-xs text-gray-400 underline decoration-dotted"
        >
          Suggest correction
        </button>
      )}
    </div>
  )
}
```

---

## 7. Model-in-the-Loop UI

### Streaming LLM responses with Vercel AI SDK

```ts
// app/api/chat/route.ts
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-5'),
    messages: convertToModelMessages(messages),
    system: 'You are a helpful UI assistant.',
  })

  return result.toUIMessageStreamResponse()
}
```

```tsx
// components/ChatAssistant.tsx
'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState } from 'react'

export function ChatAssistant() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const [input, setInput] = useState('')
  const busy = status === 'submitted' || status === 'streaming'

  return (
    <div className="chat-assistant flex flex-col gap-2">
      <div className="chat-messages flex-1 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className={`chat-message chat-message--${m.role}`}>
            <MessageContent
              text={m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('')}
              isStreaming={busy && m.role === 'assistant'}
            />
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage({ text: input }); setInput('') } }}
        className="chat-input-row flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          className="flex-1 rounded border px-3 py-2 text-base"
        />
        <button type="submit" disabled={busy} className="ph-chat-submit">
          {busy ? 'Thinking…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
```

### Progressive disclosure as confidence grows

Stream structured JSON tool calls and reveal UI panels as confidence accumulates:

```tsx
// components/ProgressiveInsight.tsx
'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useState } from 'react'

interface Insight {
  label: string
  confidence: number   // 0–1
  detail: string
}

export function ProgressiveInsight({ prompt }: { prompt: string }) {
  const [insights, setInsights] = useState<Insight[]>([])
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/insight' }),
  })
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    sendMessage({ text: prompt })
  }, [prompt])

  // Parse streamed tool outputs from the last assistant message
  useEffect(() => {
    const last = messages.findLast((m) => m.role === 'assistant')
    if (!last) return
    const parsed = last.parts
      .filter((p) => p.type.startsWith('tool-') && p.state === 'output-available')
      .map((p) => p.output as Insight)
    setInsights(parsed)
  }, [messages])

  return (
    <ul className="progressive-insight-list space-y-2">
      {insights
        .filter((i) => i.confidence >= 0.4)       // hide low-confidence items
        .sort((a, b) => b.confidence - a.confidence)
        .map((insight) => (
          <li
            key={insight.label}
            className="rounded border p-3"
            style={{ opacity: 0.4 + insight.confidence * 0.6 }}  // visual confidence signal
          >
            <strong>{insight.label}</strong>
            {insight.confidence >= 0.75 && (                     // detail only when confident
              <p className="mt-1 text-sm text-muted">{insight.detail}</p>
            )}
          </li>
        ))}
      {isLoading && <li className="text-sm text-muted animate-pulse">Analyzing…</li>}
    </ul>
  )
}
```

---

## 8. Rollout Strategies

### Next.js middleware for percentage rollouts

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const ROLLOUT_PERCENTAGE = 20   // 20% of users see new experience

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // Only act on dashboard routes
  if (!url.pathname.startsWith('/dashboard')) return NextResponse.next()

  // Stable per-user bucketing via cookie
  let bucket = req.cookies.get('rollout-bucket')?.value
  if (!bucket) {
    bucket = String(Math.floor(Math.random() * 100))
    const res = NextResponse.next()
    res.cookies.set('rollout-bucket', bucket, { maxAge: 60 * 60 * 24 * 30 })
    return res
  }

  const inRollout = Number(bucket) < ROLLOUT_PERCENTAGE
  const res = NextResponse.next()
  res.headers.set('x-new-dashboard', inRollout ? '1' : '0')
  return res
}

export const config = { matcher: ['/dashboard/:path*'] }
```

```tsx
// app/dashboard/layout.tsx — reads rollout header
import { headers } from 'next/headers'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers()
  const isNewDashboard = hdrs.get('x-new-dashboard') === '1'

  return isNewDashboard
    ? <NewDashboardShell>{children}</NewDashboardShell>
    : <LegacyDashboardShell>{children}</LegacyDashboardShell>
}
```

### Canary deploys with Vercel

```json
// vercel.json — skew protection + canary alias
{
  "skewProtection": {
    "maxAge": 300
  }
}
```

Canary flow:
1. Deploy to a preview URL with env `FEATURE_VARIANT=canary`.
2. Route internal users (by email domain) to canary in middleware:

```ts
// middleware.ts — internal canary routing
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isInternal = token?.email?.endsWith('@yourcompany.com')

  if (isInternal) {
    const res = NextResponse.next()
    res.cookies.set('variant', 'canary', { path: '/' })
    return res
  }
  return NextResponse.next()
}
```

### Feature flag gradients with GrowthBook

```ts
// lib/growthbook.server.ts
import { GrowthBook } from '@growthbook/growthbook'

export function createServerGrowthBook(userId: string) {
  const gb = new GrowthBook({
    apiHost: 'https://cdn.growthbook.io',
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY!,
    attributes: {
      id: userId,
      // GrowthBook hashes id + experiment key → stable bucket
    },
  })
  return gb
}
```

In GrowthBook's UI: set rollout % to 5 → 10 → 25 → 50 → 100 with automated rollback rules tied to error-rate metrics from Sentry.

---

## 9. Personalization Tokens

CSS custom properties keyed to user segment — set once server-side or via JS, consumed everywhere.

### Token definitions

```css
/* styles/personalization.css */

/* Compact (power users, dense data views) */
[data-segment="power"] {
  --spacing-unit:    4px;
  --font-size-base:  13px;
  --row-height:      32px;
  --sidebar-width:   200px;
  --line-height:     1.4;
  --card-padding:    12px;
}

/* Comfortable (default) */
[data-segment="standard"] {
  --spacing-unit:    6px;
  --font-size-base:  14px;
  --row-height:      40px;
  --sidebar-width:   240px;
  --line-height:     1.5;
  --card-padding:    16px;
}

/* Spacious (accessibility / first-time users) */
[data-segment="casual"] {
  --spacing-unit:    8px;
  --font-size-base:  16px;
  --row-height:      48px;
  --sidebar-width:   260px;
  --line-height:     1.6;
  --card-padding:    24px;
}
```

### Segment resolution (server component)

```tsx
// app/layout.tsx
import { auth } from '@/auth'
import { resolveUserSegment } from '@/lib/segment'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const segment = session ? await resolveUserSegment(session.user.id) : 'standard'

  return (
    <html lang="en" data-segment={segment}>
      <body>{children}</body>
    </html>
  )
}
```

```ts
// lib/segment.ts
type Segment = 'power' | 'standard' | 'casual'

export async function resolveUserSegment(userId: string): Promise<Segment> {
  // Could read from DB, feature flags, or a user-set preference
  const prefs = await db.userPreferences.findUnique({ where: { userId } })
  if (prefs?.densityOverride) return prefs.densityOverride as Segment

  // Derive from usage signals: login frequency, avg rows viewed, etc.
  const signals = await db.usageSignals.findUnique({ where: { userId } })
  if (!signals) return 'standard'
  if (signals.avgSessionActions > 80) return 'power'
  if (signals.avgSessionActions < 15) return 'casual'
  return 'standard'
}
```

### Using tokens in Tailwind via CSS vars

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontSize: {
        base: 'var(--font-size-base)',
      },
      spacing: {
        unit: 'var(--spacing-unit)',
        'row-height': 'var(--row-height)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
    },
  },
}
```

```tsx
<tr className="h-row-height border-b text-base">…</tr>
<aside className="w-sidebar shrink-0">…</aside>
```

---

## 10. Anti-Patterns

### Collecting data but never acting on it

Symptom: PostHog dashboards exist. No ticket has ever referenced them. Engineers debate gut-feel decisions.

Fix: Gate every new analytics event on a question. "What decision will change if this number is X vs Y?" If no answer, skip the event. Run a monthly "data → decision" review: for each tracked metric, confirm it drove at least one UI change in the past quarter, or remove it.

### Over-personalizing until UX breaks

Symptom: Users can't share links because state is trapped in their localStorage. Support can't reproduce bugs because every user sees a different UI. Onboarding fails because the UI the doc screenshots showed no longer matches.

Rules:
- Personalization is always an override on top of a well-defined default. The default must be shareable and screenshottable.
- Never persist layout state that affects routing. Column order: fine. Which tab is "active" on page load: dangerous.
- Provide a one-click "Reset to defaults" on any settings panel. Persist its timestamp so you can measure how often users bail on personalization.

```tsx
function ResetPreferences() {
  const reset = useUIPreferences((s) => s.reset)  // add reset action to store
  return (
    <button
      onClick={() => { reset(); track('preferences_reset', {}) }}
      className="ph-preferences-reset text-sm text-destructive"
    >
      Reset to defaults
    </button>
  )
}
```

### A/B tests that never conclude

Symptom: 12 active experiments. None have a planned end date. Traffic is so split that none reach significance. New features block on "we need to wait for results."

Fix:
- Set a hard end date at experiment creation (typically 2–4 weeks).
- Require a primary metric and a minimum detectable effect before launch.
- Cap concurrent experiments at 3–5 for a given surface (overlapping experiments muddy signals).
- If significance isn't reached by the end date, declare no winner and ship the default. Document it.

```ts
// lib/experimentRegistry.ts — enforce metadata at creation
interface Experiment {
  id: string
  primaryMetric: string
  mde: number           // minimum detectable effect (e.g. 0.05 = 5% lift)
  startDate: string     // ISO
  endDate: string       // ISO — required, no open-ended experiments
  variants: string[]
  owner: string         // team or individual accountable for conclusion
}
```

### Adaptive defaults that homogenize UX

Symptom: The "smart default" is the most common behavior across all users, which means power users and edge-case users always fight the system.

Fix: Adaptive defaults should adapt *per user segment*, not globally. A new user gets population-level defaults; a power user who has expressed preferences gets their own history. Never overwrite a user's explicit setting with a "smart" default.

```ts
// Layered default resolution — most specific wins
function resolveDefault<T>(key: string, layers: {
  userExplicit?: T      // user manually set this
  userDerived?: T       // inferred from their history
  segmentDefault?: T    // their segment's aggregate
  globalDefault: T      // hardcoded baseline
}): T {
  return (
    layers.userExplicit ??
    layers.userDerived ??
    layers.segmentDefault ??
    layers.globalDefault
  )
}
```

### Feature flags that become permanent config

Symptom: `isNewCheckoutFlow` has been `true` for 18 months. The old code path still exists. Nobody dares delete it.

Fix: Every flag must have a removal ticket created at flag creation. Once a rollout hits 100% and has been stable for 30 days, the flag is tech debt. Add a lint rule:

```ts
// eslint-plugin-local/no-stale-flags.ts — pseudocode
// Parse flags.ts, check createdAt metadata, warn if > 60 days at 100% rollout
```

---

## Quick-Reference: Learning Loop Lifecycle

```
1. Instrument   →  typed events, heatmap classNames, error boundaries
2. Collect      →  PostHog, Sentry, correction widgets, thumbs/stars
3. Aggregate    →  nightly jobs, SQL insights, Sentry issue grouping
4. Decide       →  data review, A/B conclusion, adaptive default update
5. Ship         →  feature flag gradient, middleware rollout, token change
6. Validate     →  confirm metric moved, remove old flag, update defaults
7. Repeat
```

Every section in this document maps to a step. The loop only creates value if step 4 (Decide) is a real recurring ritual — not a dashboard someone checks once.
