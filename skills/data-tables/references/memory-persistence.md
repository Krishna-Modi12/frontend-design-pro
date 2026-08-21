# Memory & State Persistence Patterns

Reference for AI agents building React/Next.js UIs. Covers every layer of the persistence stack — from ephemeral in-memory state to server DB — with runnable patterns.

---

## Contents

- [1. State Persistence Tiers](#1-state-persistence-tiers)
- [2. URL State Patterns](#2-url-state-patterns)
- [3. localStorage Patterns](#3-localstorage-patterns)
- [4. sessionStorage — Tab-Scoped Persistence](#4-sessionstorage--tab-scoped-persistence)
- [5. Form State Persistence — Draft Recovery](#5-form-state-persistence--draft-recovery)
- [6. Cross-Tab Sync](#6-cross-tab-sync)
- [7. Server State Memory — TanStack Query](#7-server-state-memory--tanstack-query)
- [8. Zustand Persist Middleware](#8-zustand-persist-middleware)
- [9. Cookie Patterns](#9-cookie-patterns)
- [10. Anti-Patterns](#10-anti-patterns)
- [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## 1. State Persistence Tiers

Choose the narrowest scope that satisfies the requirement.

| Tier | Lifespan | Scope | Use When |
|---|---|---|---|
| `useState` / `useReducer` | Until unmount | Component | UI toggles, local loading states, transient input |
| `useRef` | Until unmount | Component | Values that don't drive re-renders (timers, DOM refs) |
| Context / Zustand (memory) | Page session | App | Shared UI state (modals, sidebar open, theme) |
| URL params / hash | Until navigation away | Tab + shareable | Filters, pagination, search query, active tab |
| `sessionStorage` | Until tab closes | Tab | Wizard step, temp form draft, scroll position |
| `localStorage` | Until cleared | Origin + all tabs | User preferences, auth tokens, offline cache |
| Cookie | Configurable | Origin (+ server) | Auth sessions, feature flags, A/B test buckets |
| Server DB | Permanent | User account | Saved work, settings synced across devices |

**Decision rule:** start at `useState`. Only escalate when you need a larger scope or longer lifespan.

---

## 2. URL State Patterns

URL is the most underused persistence tier. It's free, shareable, and back-button safe.

### Native `useSearchParams` (Next.js App Router)

```tsx
'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function useUrlState<T extends string>(
  key: string,
  defaultValue: T
): [T, (val: T) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const value = (searchParams.get(key) ?? defaultValue) as T

  const setValue = useCallback(
    (val: T) => {
      const params = new URLSearchParams(searchParams.toString())
      if (val === defaultValue) {
        params.delete(key)
      } else {
        params.set(key, val)
      }
      // Replace keeps the back button working correctly
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname, key, defaultValue]
  )

  return [value, setValue]
}

// Usage
function ProductFilters() {
  const [sort, setSort] = useUrlState('sort', 'newest')
  const [page, setPage] = useUrlState('page', '1')

  return (
    <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
    </select>
  )
}
```

### `nuqs` — Type-Safe URL State (recommended)

```bash
npm i nuqs
```

```tsx
// app/layout.tsx — wrap once at root
import { NuqsAdapter } from 'nuqs/adapters/next/app'
export default function RootLayout({ children }) {
  return <NuqsAdapter>{children}</NuqsAdapter>
}

// Component
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs'

function SearchPage() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value || null) // null removes the param
        setPage(1) // reset page on new search
      }}
    />
  )
}
```

**Back-button safety:** always use `router.replace` (not `push`) for filter/sort changes. Use `push` only for intentional navigation steps the user should be able to back out of.

**Serialization pitfalls:**
- Arrays: `?tags=a&tags=b` (repeated params) or `?tags=a,b` (comma-join) — pick one and encode consistently
- Dates: ISO string (`2024-01-15`), never `Date.toLocaleDateString()` (locale-dependent)
- Objects: JSON + `encodeURIComponent`, but prefer flattening to individual params

---

## 3. localStorage Patterns

### Hydration-Safe `useLocalStorage` Hook

SSR renders without `window`. Always guard.

```tsx
import { useState, useEffect, useCallback } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize from localStorage only on client after hydration
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T)
      }
    } catch (err) {
      console.warn(`useLocalStorage: failed to read key "${key}"`, err)
    }
    setHydrated(true)
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch (err) {
          console.warn(`useLocalStorage: failed to write key "${key}"`, err)
        }
        return next
      })
    },
    [key]
  )

  return [storedValue, setValue, hydrated] as const
}
```

**SSR guard — simpler version for one-off reads:**

```tsx
const isBrowser = typeof window !== 'undefined'

function getLocalItem<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
```

### Schema Versioning

When your stored data shape changes, migrate rather than crash.

```tsx
const STORAGE_VERSION = 2
const STORAGE_KEY = 'app-preferences'

interface PrefsV2 {
  _version: 2
  theme: 'light' | 'dark' | 'system'
  density: 'compact' | 'comfortable'
}

function loadPrefs(): PrefsV2 {
  const defaultPrefs: PrefsV2 = { _version: 2, theme: 'system', density: 'comfortable' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPrefs
    const parsed = JSON.parse(raw)

    // Migrate v1 → v2
    if (!parsed._version || parsed._version < 2) {
      return {
        _version: 2,
        theme: parsed.darkMode ? 'dark' : 'system',  // v1 had boolean darkMode
        density: 'comfortable',
      }
    }

    return parsed as PrefsV2
  } catch {
    return defaultPrefs
  }
}
```

---

## 4. sessionStorage — Tab-Scoped Persistence

Same API as localStorage. Cleared when the tab closes. Never shared between tabs.

**Best use cases:**
- Multi-step wizard progress
- Temporary form data (user hasn't submitted yet)
- Preserving scroll position on back-navigation
- One-time onboarding dismissal (per-session)

```tsx
function useSessionStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback((next: T) => {
    setValue(next)
    try {
      sessionStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }, [key])

  const clear = useCallback(() => {
    setValue(initial)
    sessionStorage.removeItem(key)
  }, [key, initial])

  return [value, set, clear] as const
}

// Wizard example
function OnboardingWizard() {
  const [step, setStep, clearStep] = useSessionStorage('onboarding-step', 0)

  const advance = () => setStep(step + 1)
  const finish = () => {
    submitOnboarding()
    clearStep() // clean up after completion
  }
}
```

---

## 5. Form State Persistence — Draft Recovery

Use React Hook Form + localStorage to auto-save drafts.

```tsx
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'

const DRAFT_KEY = 'post-editor-draft'

interface PostForm {
  title: string
  body: string
  tags: string[]
}

function PostEditor() {
  const { register, handleSubmit, watch, reset } = useForm<PostForm>({
    defaultValues: () => {
      // Load saved draft on mount
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        return saved ? JSON.parse(saved) : { title: '', body: '', tags: [] }
      } catch {
        return { title: '', body: '', tags: [] }
      }
    },
  })

  // Auto-save on every change (debounced)
  const formValues = watch()
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formValues))
    }, 500) // 500ms debounce
    return () => clearTimeout(timer)
  }, [formValues])

  const onSubmit = (data: PostForm) => {
    publishPost(data)
    localStorage.removeItem(DRAFT_KEY) // clear draft after publish
    reset()
  }

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    reset({ title: '', body: '', tags: [] })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      <textarea {...register('body')} />
      <button type="submit">Publish</button>
      <button type="button" onClick={discardDraft}>Discard Draft</button>
    </form>
  )
}
```

---

## 6. Cross-Tab Sync

### `storage` Event (localStorage changes from other tabs)

```tsx
import { useEffect, useState } from 'react'

function useCrossTabState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initial
  })

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return
      setValue(e.newValue ? JSON.parse(e.newValue) : initial)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, initial])

  const set = (next: T) => {
    localStorage.setItem(key, JSON.stringify(next))
    setValue(next) // storage event does NOT fire in the originating tab
  }

  return [value, set] as const
}
```

### `BroadcastChannel` API (same-origin, more reliable)

```tsx
import { useEffect, useRef, useState } from 'react'

type Message<T> = { type: 'sync'; payload: T } | { type: 'request-sync' }

function useBroadcastState<T>(channelName: string, initial: T) {
  const [state, setState] = useState<T>(initial)
  const channel = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    channel.current = new BroadcastChannel(channelName)

    channel.current.onmessage = (e: MessageEvent<Message<T>>) => {
      if (e.data.type === 'sync') {
        setState(e.data.payload)
      }
      if (e.data.type === 'request-sync') {
        // New tab asking for current state
        channel.current?.postMessage({ type: 'sync', payload: state })
      }
    }

    // Ask existing tabs for their state on mount
    channel.current.postMessage({ type: 'request-sync' })

    return () => channel.current?.close()
  }, [channelName])

  const broadcast = (next: T) => {
    setState(next)
    channel.current?.postMessage({ type: 'sync', payload: next })
  }

  return [state, broadcast] as const
}

// Usage: sync cart count across tabs
function CartIcon() {
  const [count, setCount] = useBroadcastState('cart', 0)
  return <span>{count} items</span>
}
```

**BroadcastChannel vs storage event:**
- `BroadcastChannel`: explicit API, structured data, works with Workers, requires close() cleanup
- `storage` event: only fires from *other* tabs, doesn't fire for the current tab, simpler setup

---

## 7. Server State Memory — TanStack Query

TanStack Query is the de-facto server cache layer. Configure caching deliberately.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // Data is fresh for 5 minutes — no refetch
      gcTime: 1000 * 60 * 10,     // Cache entry lives 10 min after last observer unmounts
      refetchOnWindowFocus: true,  // Refetch when user returns to tab
      refetchOnReconnect: true,    // Refetch after network reconnects
      retry: 2,
    },
  },
})
```

**Key timing concepts:**

```
staleTime=0 (default)      → Always refetch on mount / window focus
staleTime=Infinity         → Never background-refetch (good for static data)
gcTime=0                   → Evict from cache immediately when unused
gcTime=Infinity            → Keep in memory forever (risky for large datasets)
```

**Stale-while-revalidate pattern:**

```tsx
// Data shows immediately from cache, refreshes in background
function UserProfile({ userId }: { userId: string }) {
  const { data, isFetching } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 1000 * 30, // Show cached for 30s, then background-refresh
  })

  return (
    <div>
      {isFetching && <span>Updating...</span>}
      <Avatar src={data?.avatar} />
      <h1>{data?.name}</h1>
    </div>
  )
}
```

**Prefetch on hover:**

```tsx
function UserLink({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  return (
    <a
      href={`/users/${userId}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ['user', userId],
          queryFn: () => fetchUser(userId),
          staleTime: 1000 * 60, // don't prefetch if cached within 1min
        })
      }}
    >
      View Profile
    </a>
  )
}
```

---

## 8. Zustand Persist Middleware

```bash
npm i zustand
```

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  recentSearches: string[]
  // Server data — DO NOT persist
  userProfile: User | null
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      recentSearches: [],
      userProfile: null, // will be excluded from storage

      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      addSearch: (q: string) =>
        set({ recentSearches: [q, ...get().recentSearches].slice(0, 10) }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),

      // Only persist UI preferences, not server data
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        recentSearches: state.recentSearches,
      }),

      // Handle schema changes across versions
      version: 2,
      migrate: (persisted: any, version: number) => {
        if (version === 1) {
          // v1 stored theme as boolean isDark
          return {
            ...persisted,
            theme: persisted.isDark ? 'dark' : 'light',
          }
        }
        return persisted
      },
    }
  )
)
```

**Hydration in Next.js — avoid SSR mismatch:**

```tsx
// Wrap components that read persisted state
import { useEffect, useState } from 'react'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render with default until hydrated to avoid mismatch
  return (
    <div data-theme={mounted ? theme : 'light'}>
      {children}
    </div>
  )
}
```

---

## 9. Cookie Patterns

### HttpOnly vs JS-readable

| Type | Readable by JS | Use Case |
|---|---|---|
| `HttpOnly` | No | Auth tokens, session IDs — secure from XSS |
| JS-readable | Yes | Feature flags, locale, non-sensitive preferences |

### Next.js Middleware Cookies (server-side reads)

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value

  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Set a cookie in middleware
  const res = NextResponse.next()
  res.cookies.set('last-visited', req.nextUrl.pathname, {
    httpOnly: false, // JS-readable for analytics
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })
  return res
}

export const config = { matcher: ['/dashboard/:path*'] }
```

### Server Action Cookie (Next.js App Router)

```ts
// app/actions.ts
'use server'
import { cookies } from 'next/headers'

export async function setUserPreference(theme: string) {
  const cookieStore = cookies()
  cookieStore.set('theme', theme, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function getUserPreference() {
  return cookies().get('theme')?.value ?? 'system'
}
```

### Client-side cookie read (JS-readable only)

```tsx
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}
```

---

## 10. Anti-Patterns

### Storing server data in localStorage

```tsx
// BAD — stale data, no invalidation, security risk for sensitive data
useEffect(() => {
  localStorage.setItem('user-profile', JSON.stringify(user))
}, [user])

// GOOD — use TanStack Query cache, let it manage staleness
const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser })
```

### Breaking the back button

```tsx
// BAD — pushes a history entry for every filter change
const setFilter = (val: string) => {
  router.push(`?filter=${val}`) // User must click back 10x to leave the page
}

// GOOD — replace for filter state, push only for real navigation
const setFilter = (val: string) => {
  router.replace(`?filter=${val}`, { scroll: false })
}
```

### Memory leaks from uncleared intervals/subscriptions

```tsx
// BAD — interval keeps running after unmount
useEffect(() => {
  setInterval(() => refetch(), 5000)
}, [])

// GOOD — always return cleanup
useEffect(() => {
  const id = setInterval(() => refetch(), 5000)
  return () => clearInterval(id) // cleanup on unmount
}, [refetch])

// BAD — event listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// GOOD
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [handleResize])
```

### Serializing non-serializable values

```tsx
// BAD — functions and class instances don't survive JSON round-trips
localStorage.setItem('state', JSON.stringify({
  callback: () => console.log('hi'), // becomes undefined
  date: new Date(),                  // becomes string, loses Date methods
  map: new Map([['a', 1]]),          // becomes {}
}))

// GOOD — serialize primitives only, reconstruct complex types on load
localStorage.setItem('state', JSON.stringify({
  dueDate: new Date().toISOString(), // store as string
  selectedIds: [...mySet],           // spread Set to array
}))
// On read:
const { dueDate, selectedIds } = JSON.parse(localStorage.getItem('state')!)
const date = new Date(dueDate)      // reconstruct Date
const idSet = new Set(selectedIds)  // reconstruct Set
```

### Synchronous localStorage on every render

```tsx
// BAD — localStorage.getItem is synchronous and blocks the main thread
function Component() {
  // This runs every render
  const pref = localStorage.getItem('pref')
  return <div>{pref}</div>
}

// GOOD — read once in useEffect or useState initializer
function Component() {
  const [pref] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('pref')
  })
  return <div>{pref}</div>
}
```

### Over-persisting wizard state

```tsx
// BAD — storing entire multi-step form in localStorage when tab-scope is enough
localStorage.setItem('checkout-step', JSON.stringify(formData))

// GOOD — sessionStorage clears automatically, no manual cleanup needed
sessionStorage.setItem('checkout-step', JSON.stringify(formData))
```

---

## Quick Reference Cheat Sheet

```
Need to share between page refreshes?
  No  → useState / useRef
  Yes → URL? shareable/bookmarkable?
    Yes → useSearchParams / nuqs
    No  → Needs to survive tab close?
      No  → sessionStorage
      Yes → Needs to sync across devices?
        No  → localStorage / Zustand persist
        Yes → Server (DB) + TanStack Query
```

**Rule of thumb for auth tokens:** always `HttpOnly` cookies. Never localStorage.

**Rule of thumb for UI preferences:** localStorage with schema versioning.

**Rule of thumb for async server data:** TanStack Query cache only — never duplicate into localStorage.
