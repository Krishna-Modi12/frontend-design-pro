# Vercel UI + Performance Rules

Source: vercel-labs/agent-skills (web-design-guidelines + react-best-practices skills)

Rules not covered elsewhere in this skill. Load alongside ux-guidelines.md for full coverage.

---

## Contents

- [Web Interface Rules (Unique to This File)](#web-interface-rules-unique-to-this-file)
  - [Typography Precision](#typography-precision)
  - [Scroll Anchoring](#scroll-anchoring)
  - [Touch Interaction](#touch-interaction)
  - [URL Reflects State](#url-reflects-state)
  - [Form Refinements](#form-refinements)
  - [Dark Mode + Color Scheme](#dark-mode--color-scheme)
  - [Locale and i18n](#locale-and-i18n)
  - [Hydration Safety](#hydration-safety)
  - [Flex Text Truncation](#flex-text-truncation)
  - [Performance Micro-Rules](#performance-micro-rules)
- [React Performance Rules](#react-performance-rules)
  - [CRITICAL: Eliminating Waterfalls](#critical-eliminating-waterfalls)
  - [CRITICAL: Bundle Size](#critical-bundle-size)
  - [HIGH: Server-Side Performance](#high-server-side-performance)
  - [MEDIUM: Re-render Optimization](#medium-re-render-optimization)
  - [Performance Anti-Patterns Quick-Reference](#performance-anti-patterns-quick-reference)
- [UX Anti-Patterns Quick-Reference](#ux-anti-patterns-quick-reference)

---

## Web Interface Rules (Unique to This File)

*Source: vercel-labs/web-interface-guidelines*

### Typography Precision

```css
/* Use text-wrap for headings — prevents orphaned single words */
h1, h2, h3 { text-wrap: balance; }

/* For long paragraph text — smarter last-line breaks */
p { text-wrap: pretty; }

/* Tabular numbers in any data column */
.data { font-variant-numeric: tabular-nums; }
```

**Typography characters:**
- `…` (ellipsis entity `&hellip;`) not `...` (3 dots)
- `"` `"` (curly quotes) not `"` (straight) in visible copy
- Non-breaking space in measurements: `10&nbsp;MB`, `⌘&nbsp;K`
- Loading states end with `…`: `"Saving…"` not `"Saving..."`

### Scroll Anchoring

Heading anchors need `scroll-margin-top` to account for sticky navigation:

```css
:target {
  scroll-margin-top: calc(var(--nav-height, 64px) + 16px);
}
/* or per-heading */
h2[id], h3[id] { scroll-margin-top: 80px; }
```

### Touch Interaction

```css
/* Eliminate double-tap zoom delay on all interactive elements */
button, a, [role="button"] {
  touch-action: manipulation;
}

/* Intentionally set tap highlight — don't let browser default */
button {
  -webkit-tap-highlight-color: transparent;     /* remove default */
  /* or */
  -webkit-tap-highlight-color: rgba(0,0,0,0.1); /* subtle branded */
}

/* Prevent scroll bleeding from modals/drawers into page */
.modal-content, .drawer-content {
  overscroll-behavior: contain;
}

/* Prevent text selection during drag operations */
.draggable {
  user-select: none;
}
```

### URL Reflects State

Stateful UI must be deep-linkable. Store these in query params:
- Filters and search queries
- Active tab or section
- Pagination (page, offset)
- Expanded/collapsed panels
- Dialog open state (for shareable states)

```tsx
// ✅ — filter state in URL
const searchParams = useSearchParams()
const filter = searchParams.get('filter') ?? 'all'

// ✅ — update URL without full navigation
const router = useRouter()
router.replace(`?filter=${value}`, { scroll: false })
```

Links must use `<a>`/`<Link>` (not `onClick` + `router.push`) to support Cmd/Ctrl+click, middle-click, and right-click → "Open in new tab".

### Form Refinements

```tsx
// ✅ Disable spellcheck on technical fields
<input type="email" spellCheck={false} />
<input type="text" name="username" spellCheck={false} />
<input type="text" name="apiKey" spellCheck={false} autoCorrect="off" autoCapitalize="off" />

// ✅ Submit button stays ENABLED until request starts (not until form is valid)
// Disabling on invalid = bad UX (users can't see why)
// Disable only AFTER submit click, re-enable on response
const [isPending, setIsPending] = useState(false)
<button type="submit" disabled={isPending}>Save</button>

// ✅ Never block paste — users paste passwords, tokens, emails
// Never: onPaste={(e) => e.preventDefault()}

// ✅ Placeholders should show format, end with …
<input placeholder="name@company.com" type="email" />
<input placeholder="YYYY-MM-DD…" type="text" />
```

### Dark Mode + Color Scheme

```html
<!-- Set color-scheme on root for browser chrome consistency -->
<html class="dark" style="color-scheme: dark;">
```

```jsx
// next-themes sets this automatically, but for manual control:
document.documentElement.style.colorScheme = 'dark'
```

```html
<!-- Match browser address bar + PWA toolbar to your background -->
<meta name="theme-color" content="#0F1419" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
```

```css
/* Force explicit colors on <select> in Windows dark mode */
select {
  color: var(--color-text);
  background-color: var(--color-surface);
}
```

### Locale and i18n

```tsx
// ✅ Always use Intl — never hardcode formats
const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)

const formatPrice = (amount: number, currency: string, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)

// ✅ Detect locale
const locale = navigator.language // client
// or from Accept-Language header (server)

// ✅ Prevent translation of brand names, technical identifiers
<span translate="no">Vercel</span>
<code translate="no">useEffect</code>
```

### Hydration Safety

```tsx
// ✅ Guard date/time rendering against hydration mismatch
// (server and client render different times)
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return <Skeleton />
return <time>{formatDate(date, locale)}</time>

// ✅ suppressHydrationWarning for intentionally server/client-different content
<div suppressHydrationWarning>{new Date().getFullYear()}</div>

// ✅ Controlled inputs need onChange
<input value={value} onChange={(e) => setValue(e.target.value)} />
// or use defaultValue for uncontrolled
<input defaultValue={initialValue} />
```

### Flex Text Truncation

```css
/* The most common flexbox truncation bug */
.flex-container { display: flex; }
.flex-child-with-text {
  min-width: 0;       /* Required! flex default is min-width: auto which prevents shrink */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

```tsx
// Tailwind
<div className="flex">
  <span className="min-w-0 truncate">{longTextContent}</span>
</div>
```

### Performance Micro-Rules

- `autoFocus` only on desktop, never on mobile (triggers keyboard, disrupts UX)
- `loading="lazy"` on all images not in initial viewport
- Critical images: `priority` (Next.js) or `fetchpriority="high"` (HTML)
- `<img>` always needs explicit `width` and `height` (prevents CLS)
- `<link rel="preconnect">` for external CDN domains in `<head>`
- Critical fonts: `<link rel="preload" as="font" crossorigin>` + `font-display: swap`

---

## React Performance Rules

*Source: vercel-labs/react-best-practices (70 rules, 8 categories)*

### CRITICAL: Eliminating Waterfalls

**Anti-pattern — sequential awaits:**
```tsx
// ❌ 3 serial round-trips = slow
async function loadPage() {
  const user = await fetchUser()
  const posts = await fetchPosts(user.id)
  const comments = await fetchComments(posts[0].id)
}
```

**Fix — parallel with `Promise.all`:**
```tsx
// ✅ 1 parallel round-trip = 2-10× faster
async function loadPage(userId: string) {
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
  ])
}
```

**Defer await to latest possible point:**
```tsx
// ❌ await blocks all subsequent work
const data = await fetchSomething()
doUnrelatedWork()

// ✅ start fetch, do work, then await
const dataPromise = fetchSomething()
doUnrelatedWork()
const data = await dataPromise
```

**Suspense boundaries for UI waterfalls:**
```tsx
// Parallel data fetching with independent loading states
<Suspense fallback={<Sidebar.Skeleton />}>
  <Sidebar />
</Suspense>
<Suspense fallback={<Content.Skeleton />}>
  <Content />
</Suspense>
```

### CRITICAL: Bundle Size

**Barrel imports kill bundle splitting:**
```tsx
// ❌ imports the ENTIRE lodash bundle
import { debounce } from 'lodash'

// ✅ tree-shakeable — only debounce
import debounce from 'lodash/debounce'
```

**Dynamic imports for heavy components:**
```tsx
// ❌ MonacoEditor adds ~400KB to initial bundle
import { MonacoEditor } from './monaco-editor'

// ✅ lazy-loaded, doesn't affect initial TTI
import dynamic from 'next/dynamic'
const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
)
```

**Defer third-party scripts:**
```tsx
// Use next/script with strategy="lazyOnload" for non-critical scripts
import Script from 'next/script'
<Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />
```

**Conditional imports:**
```tsx
// Only import heavy polyfill when needed
if (typeof Intl.Segmenter === 'undefined') {
  const { Segmenter } = await import('./segmenter-polyfill')
}
```

### HIGH: Server-Side Performance

**Hoist expensive operations above sequential awaits:**
```tsx
// ❌ auth check blocks DB query
export default async function Page({ params }) {
  const session = await getSession()
  const data = await db.query(params.id)
  return <UI session={session} data={data} />
}

// ✅ parallel auth + data fetch
export default async function Page({ params }) {
  const [session, data] = await Promise.all([
    getSession(),
    db.query(params.id),
  ])
  return <UI session={session} data={data} />
}
```

**Cache expensive computations in Server Components:**
```tsx
import { cache } from 'react'

// Deduplicates across multiple components in same render
const getUser = cache(async (id: string) => {
  return db.users.findUnique({ where: { id } })
})
```

**Parallel independent Server Component fetches:**
```tsx
// In parent, kick off all fetches — children receive promises
export default async function DashboardPage() {
  const statsPromise = getStats()
  const recentPromise = getRecentActivity()
  return (
    <>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats statsPromise={statsPromise} />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity promise={recentPromise} />
      </Suspense>
    </>
  )
}

// Children use() the promise
async function Stats({ statsPromise }: { statsPromise: Promise<Stats> }) {
  const stats = use(statsPromise)  // or: await statsPromise
  return <StatsDisplay stats={stats} />
}
```

### MEDIUM: Re-render Optimization

**Stable references prevent unnecessary re-renders:**
```tsx
// ❌ new array on every render
<List items={[...baseItems, newItem]} />

// ✅ memoized
const items = useMemo(() => [...baseItems, newItem], [baseItems, newItem])
<List items={items} />
```

**useCallback for event handlers passed as props:**
```tsx
// ❌ new function reference each render → child re-renders
<Button onClick={() => handleSubmit(id)} />

// ✅ stable reference
const handleClick = useCallback(() => handleSubmit(id), [id, handleSubmit])
<Button onClick={handleClick} />
```

**useDeferredValue for search-as-you-type:**
```tsx
const [query, setQuery] = useState('')
const deferredQuery = useDeferredValue(query)
// query updates instantly (input stays responsive)
// deferredQuery updates in idle time (expensive search is non-blocking)
return (
  <>
    <SearchInput value={query} onChange={setQuery} />
    <SearchResults query={deferredQuery} />  {/* can be slow — deferred */}
  </>
)
```

**Virtualize large lists (>50 items):**
```tsx
import { Virtuoso } from 'react-virtuoso'
// or
import { useVirtualizer } from '@tanstack/react-virtual'

// ❌ renders all 1000 rows in DOM
{items.map(item => <Row key={item.id} item={item} />)}

// ✅ renders only ~15 visible rows
<Virtuoso
  data={items}
  itemContent={(index, item) => <Row item={item} />}
  style={{ height: '600px' }}
/>
```

### Performance Anti-Patterns Quick-Reference

| Anti-Pattern | Fix |
|---|---|
| Sequential `await` for independent requests | `Promise.all()` |
| `import { x } from 'lib'` barrel imports | `import x from 'lib/x'` direct |
| Static import of Monaco/PDF/chart libs | `dynamic(() => import(...), { ssr: false })` |
| `map()` + `find()` in render (O(n²)) | Precompute `Map()` in `useMemo` |
| `getBoundingClientRect` during render | `useEffect` or `ResizeObserver` |
| Global state for everything | Local → Context → Zustand by scope |
| Anonymous functions in JSX props | `useCallback` |
| Large list DOM rendering | `react-virtuoso` or `@tanstack/react-virtual` |
| No `React.memo` on heavy pure components | Wrap with `memo()`, measure first |

---

## UX Anti-Patterns Quick-Reference

*From vercel-labs/web-interface-guidelines*

| Anti-Pattern | Fix |
|---|---|
| `user-scalable=no` / `maximum-scale=1` | Remove — blocks accessibility zoom |
| `onPaste={e => e.preventDefault()}` | Remove — users paste passwords/tokens |
| `transition: all` | List specific properties: `transition: opacity 200ms, transform 200ms` |
| `outline-none` without focus-visible | Add `:focus-visible { outline: 2px solid ... }` |
| `onClick` on `<div>` for navigation | Use `<a href>` or `<Link>` |
| `<div onClick>` for buttons | Use `<button>` |
| `<img>` without width + height | Always set dimensions (prevents CLS) |
| Icon button without `aria-label` | `<button aria-label="Close dialog">` |
| Form input without label | `<label htmlFor="email">` + matching `id` |
| Hardcoded date/number formats | `Intl.DateTimeFormat` / `Intl.NumberFormat` |
| `autoFocus` on mobile | `if (typeof window !== 'undefined' && !isMobile)` |
| Disabled submit before user tries | Keep enabled; show errors on submit |
