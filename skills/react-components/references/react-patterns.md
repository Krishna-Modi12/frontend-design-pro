# React Patterns Reference
# frontend-design-pro-v10 | v1.0.0
# ─────────────────────────────────────────────────────────────────────────────
# React 19 modern patterns: compound components, hooks, performance,
# Server Actions, concurrent features, error boundaries, and custom hook recipes.
# ─────────────────────────────────────────────────────────────────────────────

## React 19 Quick Cheat Sheet

```tsx
// React 19 new hooks
import {
  use,             // unwrap Promises/Context anywhere
  useOptimistic,   // optimistic UI before server confirms
  useActionState,  // form action state + pending
  useFormStatus,   // pending state from nearest <form>
  useDeferredValue,// defer expensive derived value
  useTransition,   // non-urgent state update
  useId,           // stable SSR-safe ID
} from 'react'
```

---

## 1. Compound Components

### Pattern
Share implicit state via Context — no prop drilling, clean consumer API.

```tsx
// ─── compound-tabs.tsx ───────────────────────────────────────────────────────
import { createContext, useContext, useState, ReactNode, ComponentProps } from 'react'

interface TabsContextValue {
  active: string
  setActive: (id: string) => void
}
const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used inside <Tabs>')
  return ctx
}

// Root
function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

// Sub-components attached to root
function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist" className="flex gap-1 border-b border-[var(--color-border)]">{children}</div>
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs()
  const isActive = active === id
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      onClick={() => setActive(id)}
      className={`px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded-t-md
        ${isActive
          ? 'border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]'
          : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'}`}
    >
      {children}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs()
  if (active !== id) return null
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} className="pt-4">
      {children}
    </div>
  )
}

// Attach sub-components
Tabs.List  = TabList
Tabs.Tab   = Tab
Tabs.Panel = TabPanel

// ─── Usage ───────────────────────────────────────────────────────────────────
// <Tabs defaultTab="overview">
//   <Tabs.List>
//     <Tabs.Tab id="overview">Overview</Tabs.Tab>
//     <Tabs.Tab id="activity">Activity</Tabs.Tab>
//   </Tabs.List>
//   <Tabs.Panel id="overview"><OverviewContent /></Tabs.Panel>
//   <Tabs.Panel id="activity"><ActivityFeed /></Tabs.Panel>
// </Tabs>
```

### Rules
- Context throw on missing provider — fails loudly during development
- Sub-components as named exports OR attached to root (`Tabs.Tab`) — both fine
- Never pass the active setter as a prop — that defeats the pattern

---

## 2. useReducer for Complex State (Wizards, Multi-Step Forms)

```tsx
// ─── wizard-reducer.ts ───────────────────────────────────────────────────────
type Step = 'account' | 'profile' | 'billing' | 'confirm'

interface WizardState {
  step:    Step
  account: { email: string; password: string }
  profile: { name: string; role: string }
  billing: { plan: 'free' | 'pro' | 'enterprise' }
  errors:  Record<string, string>
}

type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ACCOUNT'; payload: WizardState['account'] }
  | { type: 'SET_PROFILE'; payload: WizardState['profile'] }
  | { type: 'SET_BILLING'; payload: WizardState['billing'] }
  | { type: 'SET_ERRORS';  payload: Record<string, string> }
  | { type: 'RESET' }

const STEPS: Step[] = ['account', 'profile', 'billing', 'confirm']

const initialState: WizardState = {
  step:    'account',
  account: { email: '', password: '' },
  profile: { name: '', role: '' },
  billing: { plan: 'free' },
  errors:  {},
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT_STEP': {
      const idx = STEPS.indexOf(state.step)
      return { ...state, step: STEPS[Math.min(idx + 1, STEPS.length - 1)], errors: {} }
    }
    case 'PREV_STEP': {
      const idx = STEPS.indexOf(state.step)
      return { ...state, step: STEPS[Math.max(idx - 1, 0)], errors: {} }
    }
    case 'SET_ACCOUNT':  return { ...state, account: action.payload }
    case 'SET_PROFILE':  return { ...state, profile: action.payload }
    case 'SET_BILLING':  return { ...state, billing: action.payload }
    case 'SET_ERRORS':   return { ...state, errors: action.payload }
    case 'RESET':        return initialState
    default:             return state
  }
}

// ─── Usage ───────────────────────────────────────────────────────────────────
function SignupWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  const stepIndex = STEPS.indexOf(state.step)

  return (
    <div>
      {/* Progress indicator */}
      <div aria-label="Setup progress" className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            aria-current={s === state.step ? 'step' : undefined}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]'
            }`}
          />
        ))}
      </div>

      {state.step === 'account' && (
        <AccountStep
          data={state.account}
          errors={state.errors}
          onSubmit={data => {
            dispatch({ type: 'SET_ACCOUNT', payload: data })
            dispatch({ type: 'NEXT_STEP' })
          }}
        />
      )}
      {/* ... other steps */}
    </div>
  )
}
```

### When to use `useReducer` vs `useState`
| Scenario | Use |
|---|---|
| ≤3 independent boolean flags | `useState` (one each) |
| Related fields that update together | `useReducer` |
| Transitions depend on previous state | `useReducer` |
| Step/wizard flow | `useReducer` |
| Undo/redo | `useReducer` |

---

## 3. React 19 Concurrent Features

### `useDeferredValue` — Defer expensive derived computation

```tsx
// ✅ Correct use: filter/sort large list without blocking input
import { useDeferredValue, useMemo } from 'react'

function ProductSearch({ items }: { items: Product[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)   // deferred — may lag behind

  // This expensive filter runs with the deferred value — won't block typing
  const filtered = useMemo(
    () => items.filter(p =>
      p.name.toLowerCase().includes(deferredQuery.toLowerCase())
    ),
    [items, deferredQuery]
  )

  const isStale = query !== deferredQuery          // show loading indicator

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search products"
      />
      <div aria-busy={isStale} className={isStale ? 'opacity-60 transition-opacity' : ''}>
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  )
}
```

### `useTransition` — Non-urgent state updates

```tsx
// ✅ Correct use: tab switch that loads heavy content
import { useTransition, useState } from 'react'

function Dashboard() {
  const [tab, setTab] = useState<'overview' | 'analytics' | 'reports'>('overview')
  const [isPending, startTransition] = useTransition()

  function switchTab(next: typeof tab) {
    startTransition(() => {
      setTab(next)   // React may defer this render if urgent work exists
    })
  }

  return (
    <>
      <nav className="flex gap-2">
        {(['overview', 'analytics', 'reports'] as const).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            aria-selected={tab === t}
            disabled={isPending}   // optional — prevents double-click
          >
            {t}
          </button>
        ))}
      </nav>
      {isPending ? <div aria-live="polite" className="sr-only">Loading…</div> : null}
      <TabContent tab={tab} />
    </>
  )
}
```

### `useOptimistic` — Optimistic UI before server confirms

```tsx
// ✅ Correct use: like/unlike that feels instant
import { useOptimistic, useTransition } from 'react'

interface Post { id: string; likes: number; liked: boolean }

function LikeButton({ post }: { post: Post }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPost, addOptimistic] = useOptimistic(
    post,
    (current, liked: boolean) => ({
      ...current,
      liked,
      likes: liked ? current.likes + 1 : current.likes - 1,
    })
  )

  async function handleLike() {
    const nextLiked = !optimisticPost.liked
    startTransition(async () => {
      addOptimistic(nextLiked)           // UI updates immediately
      await toggleLike(post.id, nextLiked) // server call — may fail
    })
  }

  return (
    <button
      onClick={handleLike}
      aria-pressed={optimisticPost.liked}
      aria-label={optimisticPost.liked ? 'Unlike post' : 'Like post'}
    >
      ♥ {optimisticPost.likes}
    </button>
  )
}
```

### `use()` — Unwrap Promises and Context

```tsx
// React 19: use() can call inside conditionals (unlike hooks)
import { use, Suspense } from 'react'

// Unwrap a Promise passed as a prop
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)   // suspends until resolved
  return <h1>{user.name}</h1>
}

// Usage with Suspense
<Suspense fallback={<Skeleton />}>
  <UserProfile userPromise={fetchUser(id)} />
</Suspense>

// Unwrap Context conditionally
function ConditionalThemed({ show }: { show: boolean }) {
  if (!show) return null
  const theme = use(ThemeContext)   // ✅ valid — use() can be conditional
  return <div style={{ color: theme.brand }}>{/*...*/}</div>
}
```

---

## 4. Server Actions (React 19 / Next.js App Router)

```tsx
// ─── app/actions/user.ts ─────────────────────────────────────────────────────
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(64),
  bio:  z.string().max(280).optional(),
})

export async function updateProfile(
  prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get('name'),
    bio:  formData.get('bio'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  await db.user.update({ data: parsed.data })
  revalidatePath('/profile')
  return { error: null }
}
```

```tsx
// ─── app/profile/edit-form.tsx ────────────────────────────────────────────────
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateProfile } from '@/app/actions/user'

function SubmitButton() {
  const { pending } = useFormStatus()  // reads nearest <form> action status
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="btn-primary"
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  )
}

export function EditProfileForm({ user }: { user: User }) {
  const [state, action, isPending] = useActionState(
    updateProfile,
    { error: null }
  )

  return (
    <form action={action}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div>
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" defaultValue={user.bio ?? ''} />
      </div>

      {state.error && (
        <p role="alert" className="text-[var(--color-error)] text-sm">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
```

### Server Action Rules
- `'use server'` at top of file OR on individual async function — not both
- Always validate with Zod inside the action — never trust FormData shapes
- Return serializable data only (no class instances, no functions)
- Use `revalidatePath()` / `revalidateTag()` after mutations
- For optimistic UI + server action: combine `useOptimistic` + `useTransition`

---

## 5. Custom Hook Recipes

### `useLocalStorage<T>` — Persistent state with SSR safety

```tsx
import { useState, useEffect, useCallback } from 'react'

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      try { window.localStorage.setItem(key, JSON.stringify(resolved)) } catch {}
      return resolved
    })
  }, [key])

  return [value, set] as const
}

// Usage: const [theme, setTheme] = useLocalStorage<'light'|'dark'>('theme', 'light')
```

### `useDebounce<T>` — Debounce rapidly-changing values

```tsx
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

// Usage: const debouncedQuery = useDebounce(query, 300)
// Then send API request when debouncedQuery changes — not on every keystroke
```

### `useIntersectionObserver` — Lazy load / scroll-triggered

```tsx
import { useEffect, useRef, useState } from 'react'

interface Options extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

function useIntersectionObserver(options: Options = {}) {
  const { threshold = 0.1, root = null, rootMargin = '0px', freezeOnceVisible = true } = options
  const ref = useRef<Element | null>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()

  const frozen = entry?.isIntersecting && freezeOnceVisible

  useEffect(() => {
    const el = ref.current
    if (!el || frozen) return

    const observer = new IntersectionObserver(
      ([e]) => setEntry(e),
      { threshold, root, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, root, rootMargin, frozen])

  return { ref, entry, isVisible: !!entry?.isIntersecting }
}

// Usage:
// const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 })
// <section ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
```

### `useMediaQuery` — Responsive logic in JS

```tsx
import { useEffect, useState } from 'react'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Usage:
// const isMobile  = useMediaQuery('(max-width: 639px)')
// const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
```

### `useClickOutside` — Close dropdowns/modals

```tsx
import { useEffect, RefObject } from 'react'

function useClickOutside(ref: RefObject<Element>, handler: () => void) {
  useEffect(() => {
    function listener(e: MouseEvent | TouchEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// Usage:
// const ref = useRef<HTMLDivElement>(null)
// useClickOutside(ref, () => setOpen(false))
// <div ref={ref}><Dropdown open={open} /></div>
```

### `useCopyToClipboard` — Copy with feedback

```tsx
import { useState, useCallback } from 'react'

function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), resetAfter)
    } catch {
      setCopied(false)
    }
  }, [resetAfter])

  return { copy, copied }
}

// Usage:
// const { copy, copied } = useCopyToClipboard()
// <button onClick={() => copy(apiKey)}>{copied ? 'Copied!' : 'Copy'}</button>
```

---

## 6. Performance Patterns

### `memo` — Prevent re-renders on unchanged props

```tsx
import { memo, useMemo, useCallback } from 'react'

// ✅ Wrap component — only re-renders if props change (shallow compare)
const UserCard = memo(function UserCard({ user, onSelect }: {
  user: User
  onSelect: (id: string) => void
}) {
  return (
    <button onClick={() => onSelect(user.id)}>
      {user.name}
    </button>
  )
})

// ✅ In parent: stable callback reference — prevents UserCard re-render
function UserList({ users }: { users: User[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Without useCallback: new function reference every render → UserCard always re-renders
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  // Without useMemo: new array reference every render
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  )

  return sortedUsers.map(u => (
    <UserCard key={u.id} user={u} onSelect={handleSelect} />
  ))
}
```

### Rules for `memo` / `useMemo` / `useCallback`
| Tool | Use when |
|---|---|
| `memo` | Component re-renders with same props AND render is expensive |
| `useMemo` | Computation is slow (>1ms), OR result is used as dep in another hook |
| `useCallback` | Function passed as prop to `memo`-wrapped child, OR as dep to `useEffect` |
| Nothing | Simple components, primitives — optimization noise outweighs benefit |

**Never** add `useMemo`/`useCallback` to everything by default — profile first.

### `lazy` + `Suspense` — Code split by route/feature

```tsx
import { lazy, Suspense } from 'react'

// Heavy feature split out — not bundled in main chunk
const DataTableView = lazy(() => import('./DataTableView'))
const ChartDashboard = lazy(() => import('./ChartDashboard'))

function App() {
  const [view, setView] = useState<'table' | 'chart'>('table')

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />}>
      {view === 'table'  && <DataTableView />}
      {view === 'chart' && <ChartDashboard />}
    </Suspense>
  )
}
```

### Virtual lists — Render only visible rows

```tsx
// For lists >100 items, use TanStack Virtual
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Row[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count:          items.length,
    getScrollElement: () => parentRef.current,
    estimateSize:   () => 56,     // estimated row height in px
    overscan:       5,            // render 5 extra rows above/below
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <RowComponent item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 7. Error Boundaries

```tsx
// ─── error-boundary.tsx ──────────────────────────────────────────────────────
// React error boundaries must still be class components (no hook equivalent)
import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    // Log to Sentry/Datadog:
    // captureException(error, { extra: info })
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      const { fallback } = this.props
      if (typeof fallback === 'function') return fallback(error, this.reset)
      return fallback ?? (
        <div role="alert" className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-6">
          <p className="font-semibold text-[var(--color-error)]">Something went wrong</p>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">{error.message}</p>
          <button onClick={this.reset} className="mt-3 text-sm text-[var(--color-brand)] underline">
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Usage ───────────────────────────────────────────────────────────────────
// <ErrorBoundary onError={(e, info) => Sentry.captureException(e)}>
//   <DataTable />
// </ErrorBoundary>

// Custom fallback with reset:
// <ErrorBoundary fallback={(err, reset) => (
//   <EmptyState title="Failed to load" action={{ label: 'Retry', onClick: reset }} />
// )}>
//   <HeavyFeature />
// </ErrorBoundary>
```

### Next.js App Router `error.tsx`

```tsx
// app/dashboard/error.tsx — auto-wraps route segment in ErrorBoundary
'use client'   // REQUIRED — error.tsx must be a Client Component

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-center py-20">
      <p className="text-lg font-semibold text-[var(--color-ink)]">Something went wrong</p>
      <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]"
      >
        Try again
      </button>
    </div>
  )
}
```

---

## 8. Context + Zustand Decision Matrix

| Scenario | Solution |
|---|---|
| Theme, locale, auth user | React Context (read-mostly, infrequent updates) |
| Client-side UI state (sidebar, modals, notifications) | Zustand |
| Server state (API data, caching, refetching) | TanStack Query |
| Form state | React Hook Form |
| URL state (filters, pagination) | `useSearchParams` (Next.js) |
| Heavy local computation | `useReducer` |

### Zustand TypeScript (canonical pattern)

```tsx
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void
  markRead: (id: string) => void
  clearAll: () => void
}

const useNotificationStore = create<NotificationStore>()(
  devtools(
    immer((set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (n) => set((state) => {
        state.notifications.unshift({ ...n, id: crypto.randomUUID(), read: false })
        state.unreadCount++
      }),

      markRead: (id) => set((state) => {
        const notif = state.notifications.find(n => n.id === id)
        if (notif && !notif.read) {
          notif.read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    })),
    { name: 'notifications' }
  )
)

// ✅ Select slice — only re-renders when unreadCount changes
const unreadCount = useNotificationStore(s => s.unreadCount)

// ❌ Never select whole store — re-renders on any change
const store = useNotificationStore()
```

---

## 9. Render Props Pattern

*Source: affaan-m/everything-claude-code skills/frontend-patterns*

Render props pass a function as a prop — the component calls it with data, giving the consumer full control over rendering. Less common than compound components or hooks, but powerful for truly flexible data providers.

```tsx
// ─── data-fetcher.tsx ─────────────────────────────────────────────────────────
interface RenderProps<T> {
  data:    T | null
  loading: boolean
  error:   Error | null
  refetch: () => void
}

interface DataFetcherProps<T> {
  url:      string
  children: (props: RenderProps<T>) => React.ReactNode
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [state, setState] = useState<RenderProps<T>>({
    data: null, loading: true, error: null, refetch: fetch_,
  })

  async function fetch_() {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as T
      setState({ data, loading: false, error: null, refetch: fetch_ })
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error, refetch: fetch_ })
    }
  }

  useEffect(() => { fetch_() }, [url])

  return <>{children(state)}</>
}

// ─── Usage ────────────────────────────────────────────────────────────────────
<DataFetcher<User[]> url="/api/users">
  {({ data, loading, error, refetch }) => {
    if (loading) return <Skeleton />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    return <UserList users={data!} />
  }}
</DataFetcher>
```

### When to use Render Props vs other patterns

| Pattern | Best for |
|---|---|
| Render Props | Sharing stateful logic where the consumer controls the entire render output |
| Custom Hook | Sharing stateful logic where the consumer controls everything (most flexible) |
| Compound Component | When child components need to be composed with layout control |
| `children` prop | When the render output doesn't depend on parent state |

> **Modern preference:** Custom hooks cover most render props use cases with cleaner syntax. Use render props when you need to pass render-time data to a component that can't use hooks (e.g. class component consumers, or when the parent must control exactly how each data variant renders).

---

## 10. Anti-patterns to Avoid

```tsx
// ❌ Derive state from props in useState
const [fullName, setFullName] = useState(`${user.firstName} ${user.lastName}`)
// ✅ Compute during render
const fullName = `${user.firstName} ${user.lastName}`

// ❌ useEffect for derived state
useEffect(() => {
  setFiltered(items.filter(i => i.active))
}, [items])
// ✅ useMemo or plain variable
const filtered = useMemo(() => items.filter(i => i.active), [items])

// ❌ Mutating state directly
state.items.push(newItem)
// ✅ Return new reference
setState(prev => ({ ...prev, items: [...prev.items, newItem] }))

// ❌ Missing cleanup in useEffect
useEffect(() => {
  window.addEventListener('resize', handler)
  // forgot cleanup!
}, [])
// ✅ Always return cleanup
useEffect(() => {
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])

// ❌ Passing object literals as props to memo children
<MemoChild config={{ debug: true }} />   // new reference every render
// ✅ useMemo or extract to module scope
const CONFIG = { debug: true }
<MemoChild config={CONFIG} />

// ❌ Index as key for reorderable lists
{items.map((item, i) => <Card key={i} {...item} />)}
// ✅ Stable ID
{items.map(item => <Card key={item.id} {...item} />)}
```

---

## 10. TypeScript Patterns for React

```tsx
// Component with required + optional props
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  // Omit native prop if you're overriding it
}

// Polymorphic component (render as any element)
type AsProp<T extends ElementType> = { as?: T }
type PropsWithAs<T extends ElementType, P> = P & AsProp<T> &
  Omit<ComponentPropsWithRef<T>, keyof P | 'as'>

// Generic list component
function List<T extends { id: string }>({
  items,
  renderItem,
}: {
  items: T[]
  renderItem: (item: T) => ReactNode
}) {
  return <ul>{items.map(item => <li key={item.id}>{renderItem(item)}</li>)}</ul>
}

// Discriminated union props
type AlertProps =
  | { variant: 'success'; onDismiss?: () => void }
  | { variant: 'error';   onRetry: () => void }   // onRetry required for errors
  | { variant: 'info' }

// useRef types
const divRef  = useRef<HTMLDivElement>(null)       // DOM element
const timerRef = useRef<ReturnType<typeof setTimeout>>()  // timer ID
const valueRef = useRef<string>('')                // mutable non-DOM value
```
