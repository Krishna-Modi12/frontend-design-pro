# Parallelization Patterns for UI

Concurrency in frontend work means doing more things at the same time — fetching data, rendering trees, running computation — so that the critical path to "page is usable" shrinks. This reference covers practical patterns with real TypeScript/React code.

---

## 1. Parallel Data Fetching

### Promise.all vs Promise.allSettled

`Promise.all` fails fast: if any promise rejects, the whole call rejects immediately. Use it when all data is required and a partial result is useless.

```typescript
// All three must succeed or the whole load fails
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId),
]);
```

`Promise.allSettled` always resolves. Use it when partial data is acceptable — show what succeeded, gracefully handle what failed.

```typescript
const results = await Promise.allSettled([
  fetchUser(userId),
  fetchPosts(userId),
  fetchRecommendations(userId), // non-critical
]);

const user = results[0].status === 'fulfilled' ? results[0].value : null;
const posts = results[1].status === 'fulfilled' ? results[1].value : [];
const recs = results[2].status === 'fulfilled' ? results[2].value : [];
// Render even if recommendations failed
```

### Typed helper for allSettled

```typescript
type Settled<T> = { ok: true; value: T } | { ok: false; error: unknown };

async function allSettledTyped<T extends readonly unknown[]>(
  promises: { [K in keyof T]: Promise<T[K]> }
): Promise<{ [K in keyof T]: Settled<T[K]> }> {
  const results = await Promise.allSettled(promises);
  return results.map((r) =>
    r.status === 'fulfilled'
      ? { ok: true, value: r.value }
      : { ok: false, error: r.reason }
  ) as never;
}
```

### Next.js Server Component parallel fetches

In a Server Component, sequential `await` creates a waterfall. Kick off all fetches before awaiting any of them.

```typescript
// app/dashboard/page.tsx — Server Component
export default async function DashboardPage() {
  // Start all fetches at once — no awaits yet
  const userPromise = getUser();
  const metricsPromise = getMetrics();
  const activityPromise = getRecentActivity();

  // Now await in parallel
  const [user, metrics, activity] = await Promise.all([
    userPromise,
    metricsPromise,
    activityPromise,
  ]);

  return <Dashboard user={user} metrics={metrics} activity={activity} />;
}
```

Do NOT do this — sequential waterfall:

```typescript
// BAD: each await blocks the next fetch from starting
const user = await getUser();           // 120 ms
const metrics = await getMetrics();     // 200 ms — started after user done
const activity = await getRecentActivity(); // 80 ms — started last
// Total: ~400 ms instead of ~200 ms
```

### fetch() deduplication in Next.js

Next.js 14+ deduplicates `fetch()` calls with the same URL + options within the same render pass. Two Server Components requesting the same endpoint will only produce one network request.

```typescript
// Both components can call this without doubling the request
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`, { next: { revalidate: 60 } });
  return res.json();
}
```

---

## 2. Concurrent Rendering — React 18

React 18's concurrent renderer can interrupt, pause, and resume renders. This lets urgent updates (typing, clicking) cut in front of expensive renders.

### useTransition

Wraps a state update as non-urgent. React keeps the old UI interactive while preparing the new one.

```typescript
import { useTransition, useState } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value); // urgent — update input immediately

    startTransition(() => {
      // non-urgent — React can defer this if something more urgent arrives
      setResults(filterResults(value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList results={results} />
    </>
  );
}
```

`isPending` is true while the transition is in flight. Use it to show a subtle loading indicator without blocking the input.

### startTransition (standalone)

Use outside a component — in event handlers, route change callbacks, etc.

```typescript
import { startTransition } from 'react';

button.addEventListener('click', () => {
  startTransition(() => {
    setTab('charts'); // renders heavy ChartGrid as non-urgent
  });
});
```

### useDeferredValue

Keeps a stale copy of a value while React works on the fresh one. Ideal for expensive derived renders where you don't control the state setter.

```typescript
import { useDeferredValue, memo } from 'react';

function FilteredList({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.6 : 1 }}>
      {/* ExpensiveList receives the deferred (possibly stale) query */}
      <ExpensiveList query={deferredQuery} />
    </div>
  );
}

// Must be memoized or deferral has no effect
const ExpensiveList = memo(({ query }: { query: string }) => {
  const items = filterHeavyDataset(query); // runs less often
  return <ul>{items.map((i) => <li key={i.id}>{i.label}</li>)}</ul>;
});
```

The visual pattern: dim the list (`opacity: 0.6`) while it's stale so users know a refresh is coming without blocking input.

---

## 3. Parallel Route Segments (Next.js)

Parallel routes let different parts of the layout load and render independently. Each slot has its own `loading.tsx`, `error.tsx`, and can be a fully separate subtree.

### Directory structure

```
app/
  layout.tsx           ← receives @modal and @sidebar as props
  page.tsx
  @modal/
    default.tsx        ← rendered when no modal route is active
    photo/[id]/
      page.tsx
  @sidebar/
    default.tsx
    loading.tsx        ← shown while sidebar data loads
    page.tsx
```

### Layout consuming parallel slots

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
  modal,
  sidebar,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div className="layout">
          <aside>{sidebar}</aside>
          <main>{children}</main>
        </div>
        {modal}
      </body>
    </html>
  );
}
```

### Independent loading states

Because each slot renders independently, the sidebar can show its skeleton while the main content is ready, and the modal can load its own data without blocking either.

```typescript
// app/@sidebar/loading.tsx
export default function SidebarSkeleton() {
  return (
    <div className="sidebar-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-item animate-pulse" />
      ))}
    </div>
  );
}
```

### Intercepted routes with @modal

Parallel routes power intercepted routes — clicking a photo opens a modal while keeping the feed behind it; direct navigation renders the full photo page.

```typescript
// app/@modal/(.)photos/[id]/page.tsx
// "(.) " intercepts the /photos/[id] route only when navigating within the app
export default async function PhotoModal({ params }: { params: { id: string } }) {
  const photo = await getPhoto(params.id);
  return <Modal><PhotoDetail photo={photo} /></Modal>;
}
```

---

## 4. Web Workers for CPU Work

The main thread handles layout, paint, and JS execution. Heavy synchronous work (parsing, sorting, indexing) blocks it. Web Workers run on a separate thread.

### Comlink — ergonomic Worker RPC

Comlink wraps a Worker with a Proxy so you call worker functions as if they were async functions.

```bash
npm install comlink
```

```typescript
// workers/csv-parser.worker.ts
import * as Comlink from 'comlink';

export interface CsvWorker {
  parse(raw: string): Record<string, string>[];
  parseWithSchema<T>(raw: string, schema: (row: Record<string, string>) => T): T[];
}

const worker: CsvWorker = {
  parse(raw) {
    // heavy synchronous CSV parsing — safe here, not on main thread
    return parseCsv(raw);
  },
  parseWithSchema(raw, schema) {
    return parseCsv(raw).map(schema);
  },
};

Comlink.expose(worker);
```

```typescript
// hooks/useCsvWorker.ts
import * as Comlink from 'comlink';
import type { CsvWorker } from '../workers/csv-parser.worker';

let workerInstance: Comlink.Remote<CsvWorker> | null = null;

function getCsvWorker(): Comlink.Remote<CsvWorker> {
  if (!workerInstance) {
    const worker = new Worker(
      new URL('../workers/csv-parser.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerInstance = Comlink.wrap<CsvWorker>(worker);
  }
  return workerInstance;
}

export function useCsvParser() {
  const [isParsing, setIsParsing] = useState(false);

  async function parse(raw: string) {
    setIsParsing(true);
    try {
      const worker = getCsvWorker();
      return await worker.parse(raw); // runs off main thread
    } finally {
      setIsParsing(false);
    }
  }

  return { parse, isParsing };
}
```

### Image processing worker

```typescript
// workers/image.worker.ts
import * as Comlink from 'comlink';

const api = {
  async resize(
    bitmap: ImageBitmap,
    width: number,
    height: number
  ): Promise<ImageBitmap> {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.transferToImageBitmap();
  },
};

Comlink.expose(api);
```

Note: `ImageBitmap` is transferable — pass it via Comlink's `transfer` helper to avoid copying pixel data.

### Search index worker (Fuse.js)

```typescript
// workers/search.worker.ts
import * as Comlink from 'comlink';
import Fuse from 'fuse.js';

let fuse: Fuse<unknown> | null = null;

const api = {
  buildIndex(items: unknown[], keys: string[]) {
    fuse = new Fuse(items, { keys, threshold: 0.3 });
  },
  search(query: string) {
    return fuse?.search(query).map((r) => r.item) ?? [];
  },
};

Comlink.expose(api);
```

Build the index once (on data load), then call `search()` on each keystroke. Both happen off the main thread.

---

## 5. Streaming SSR

React 18 + Next.js App Router streams HTML progressively. The server sends the shell (nav, layout, above-the-fold content) first, then streams deferred content as it resolves. This makes Time to First Byte (TTFB) and First Contentful Paint (FCP) fast even when some data is slow.

### Shell vs content split

```typescript
// app/product/[id]/page.tsx
import { Suspense } from 'react';

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      {/* Shell — rendered immediately, no data needed */}
      <ProductHeader />
      <nav>...</nav>

      {/* Reviews stream in after product details */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail id={params.id} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewList productId={params.id} />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>
    </>
  );
}
```

Each `Suspense` boundary creates an independent streaming chunk. Reviews and Recommendations start streaming as soon as their respective data is ready — they don't wait for each other.

### Deep Suspense nesting for progressive content

```typescript
// Outermost resolves first (critical path), inner resolves later
<Suspense fallback={<PageShell />}>
  <CriticalAboveFold>
    <Suspense fallback={<BelowFoldSkeleton />}>
      <BelowFoldContent>
        <Suspense fallback={<LazyPanelSkeleton />}>
          <LazyAnalyticsPanel />
        </Suspense>
      </BelowFoldContent>
    </Suspense>
  </CriticalAboveFold>
</Suspense>
```

### Progressive hydration

Streaming SSR sends HTML first. React hydrates each Suspense boundary independently as the JS chunk arrives — prioritizing visible, interactive parts.

Use `loading.tsx` at the segment level for route-level streaming:

```typescript
// app/dashboard/loading.tsx
// Shown instantly while the dashboard Server Component awaits data
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
```

---

## 6. Optimistic Parallelism

Fire the mutation and apply the UI update simultaneously. Don't wait for the server round-trip to update local state. Reconcile (rollback or confirm) when the response arrives.

### Manual optimistic update

```typescript
function useToggleLike(postId: string) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  async function toggle() {
    const prevLiked = liked;
    const prevCount = count;

    // Apply optimistically — immediate UI response
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));

    try {
      await toggleLikeApi(postId);
      // Server confirmed — nothing else to do
    } catch {
      // Rollback to previous state
      setLiked(prevLiked);
      setCount(prevCount);
    }
  }

  return { liked, count, toggle };
}
```

### TanStack Query optimistic updates

```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (newTodo: Todo) => postTodo(newTodo),

  onMutate: async (newTodo) => {
    // Cancel any in-flight queries for this key
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot current state for rollback
    const previous = queryClient.getQueryData<Todo[]>(['todos']);

    // Optimistically update cache
    queryClient.setQueryData<Todo[]>(['todos'], (old = []) => [
      ...old,
      { ...newTodo, id: 'temp-' + Date.now() },
    ]);

    return { previous };
  },

  onError: (_err, _newTodo, context) => {
    // Restore snapshot on error
    queryClient.setQueryData(['todos'], context?.previous);
  },

  onSettled: () => {
    // Always refetch to sync with server truth
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### React 19 useOptimistic

```typescript
import { useOptimistic, useTransition } from 'react';

function MessageThread({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );
  const [, startTransition] = useTransition();

  async function send(text: string) {
    const optimistic: Message = {
      id: crypto.randomUUID(),
      text,
      status: 'sending',
    };

    startTransition(async () => {
      addOptimistic(optimistic);
      await sendMessage(text); // server call
    });
  }

  return (
    <>
      {optimisticMessages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <MessageInput onSend={send} />
    </>
  );
}
```

---

## 7. Parallel Asset Loading

### Font preloading

In `<head>`, `rel="preload"` tells the browser to fetch fonts at high priority before they're needed in CSS.

```html
<!-- _document.tsx or layout.tsx <head> -->
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

In Next.js, use the built-in font system which inlines `@font-face` and preloads automatically:

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html className={inter.className}>{children}</html>;
}
```

### Image preloading

```typescript
// Preload the LCP image at the highest priority
<link
  rel="preload"
  as="image"
  href="/hero.webp"
  imageSrcSet="/hero-400.webp 400w, /hero-800.webp 800w"
  imageSizes="100vw"
/>

// In Next.js Image component
<Image src="/hero.webp" priority fetchPriority="high" alt="Hero" fill />
```

### Prefetch on hover

Prefetch page assets when the user hovers a link — by the time they click, the JS chunk and data are already cached.

```typescript
import { useRouter } from 'next/navigation';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();

  return (
    <a
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)} // keyboard users
    >
      {children}
    </a>
  );
}
```

### Programmatic asset preloading

```typescript
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload the next carousel image while displaying the current one
async function handleSlideChange(current: number, images: string[]) {
  const next = images[current + 1];
  if (next) preloadImage(next); // fire and forget
}
```

---

## 8. Intersection Observer Batching

`IntersectionObserver` supports observing multiple elements with one instance. One observer can track hundreds of elements; creating one observer per element wastes memory and adds GC pressure.

### Single shared observer

```typescript
// utils/lazyObserver.ts
type Callback = (entry: IntersectionObserverEntry) => void;

const callbacks = new Map<Element, Callback>();

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      callbacks.get(entry.target)?.(entry);
    }
  },
  { rootMargin: '200px', threshold: 0 }
);

export function observeElement(el: Element, cb: Callback): () => void {
  callbacks.set(el, cb);
  observer.observe(el);
  return () => {
    observer.unobserve(el);
    callbacks.delete(el);
  };
}
```

### React hook using the shared observer

```typescript
import { useEffect, useRef, useState } from 'react';
import { observeElement } from '../utils/lazyObserver';

export function useInView(options?: { once?: boolean }) {
  const ref = useRef<Element>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return observeElement(el, (entry) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (options?.once) {
          observeElement(el, () => {}); // effectively stops after first trigger
        }
      } else if (!options?.once) {
        setInView(false);
      }
    });
  }, [options?.once]);

  return { ref, inView };
}
```

### Batched load triggers

```typescript
// Batch image loads — don't trigger one fetch per intersection event
const pendingLoads = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleLoad(src: string) {
  pendingLoads.add(src);
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      const batch = [...pendingLoads];
      pendingLoads.clear();
      flushTimer = null;
      loadImages(batch); // one batched request or parallel fetches
    }, 50);
  }
}
```

---

## 9. Request Deduplication

Multiple components mounting simultaneously can trigger identical requests. Deduplication ensures only one network round-trip happens regardless of how many subscribers.

### TanStack Query — automatic deduplication

TanStack Query deduplicates by `queryKey`. Any number of `useQuery` calls with the same key share one in-flight request.

```typescript
// Both components mount simultaneously — only one fetch fires
function UserCard({ id }: { id: string }) {
  const { data } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
  return <Card>{data?.name}</Card>;
}

function UserAvatar({ id }: { id: string }) {
  const { data } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
  return <Avatar src={data?.avatar} />;
}
```

### SWR deduplication

SWR deduplicates by key within the `dedupingInterval` window (default 2000 ms).

```typescript
import useSWR from 'swr';

const { data } = useSWR('/api/user', fetcher, { dedupingInterval: 5000 });
```

### Manual deduplication with AbortController

When writing your own fetch layer, cache in-flight promises and cancel stale ones.

```typescript
const inFlight = new Map<string, Promise<unknown>>();

async function deduplicatedFetch<T>(
  url: string,
  signal?: AbortSignal
): Promise<T> {
  if (inFlight.has(url)) {
    return inFlight.get(url) as Promise<T>;
  }

  const promise = fetch(url, { signal })
    .then((r) => r.json())
    .finally(() => inFlight.delete(url));

  inFlight.set(url, promise);
  return promise;
}
```

### AbortController for superseded requests

When a user types quickly, cancel the previous search before firing the new one.

```typescript
function useSearch(query: string) {
  const [results, setResults] = useState<Result[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query) return;

    // Cancel any in-flight request for the previous query
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: abortRef.current.signal,
    })
      .then((r) => r.json())
      .then(setResults)
      .catch((err) => {
        if (err.name !== 'AbortError') throw err;
      });
  }, [query]);

  return results;
}
```

---

## 10. Anti-Patterns

### Waterfall fetches in useEffect

Each useEffect-fetch waits for render, which waits for the previous fetch. Never chain dependent-but-independent fetches this way.

```typescript
// BAD — three sequential round-trips
function Profile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    fetchUser(userId).then(setUser); // starts at mount
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    fetchPosts(userId).then(setPosts); // starts AFTER user resolves
  }, [user]);

  useEffect(() => {
    if (!posts.length) return;
    fetchFollowers(userId).then(setFollowers); // starts AFTER posts resolve
  }, [posts]);
}
```

Fix: fetch in parallel.

```typescript
// GOOD
useEffect(() => {
  Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchFollowers(userId),
  ]).then(([user, posts, followers]) => {
    setUser(user);
    setPosts(posts);
    setFollowers(followers);
  });
}, [userId]);
```

### Sequential await chains for independent data

```typescript
// BAD — 600 ms total when none of these depend on each other
async function loadDashboard() {
  const user = await getUser();       // 200 ms
  const stats = await getStats();     // 200 ms
  const feed = await getFeed();       // 200 ms
  return { user, stats, feed };
}

// GOOD — 200 ms total
async function loadDashboard() {
  return Promise.all([getUser(), getStats(), getFeed()]).then(
    ([user, stats, feed]) => ({ user, stats, feed })
  );
}
```

### Blocking renders on non-critical data

```typescript
// BAD — entire page waits for low-priority recommendations
export default async function Page() {
  const [product, recommendations] = await Promise.all([
    getProduct(),
    getRecommendations(), // slow, non-critical
  ]);
  return <ProductPage product={product} recommendations={recommendations} />;
}

// GOOD — product renders immediately, recommendations stream in
export default async function Page({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return (
    <ProductPage product={product}>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>
    </ProductPage>
  );
}
```

### Creating a new Worker per render

```typescript
// BAD — Worker spawned on every render
function MyComponent() {
  const worker = new Worker('./heavy.worker.js'); // new OS thread each time!
  // ...
}

// GOOD — singleton outside component
const worker = new Worker(new URL('./heavy.worker.ts', import.meta.url));
```

### Observer-per-element instead of shared observer

```typescript
// BAD — 200 observers for 200 list items
function LazyImage({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    });
    obs.observe(ref.current!);
    return () => obs.disconnect();
  }, []);
}

// GOOD — use the shared observer from Section 8
function LazyImage({ src }: { src: string }) {
  const { ref, inView } = useInView({ once: true });
  return <img ref={ref} src={inView ? src : undefined} />;
}
```

### Forgetting to cancel superseded mutations

If a user submits a form, navigates away, and the response arrives after unmount — state updates on an unmounted component. Use AbortController or TanStack Query's `enabled` flag to cancel.

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function load() {
    try {
      const data = await fetchWithSignal(url, controller.signal);
      setState(data); // only runs if not aborted
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError(e);
    }
  }

  load();
  return () => controller.abort(); // cleanup on unmount or dep change
}, [url]);
```

---

## Quick Reference

| Pattern | Saves | Use when |
|---|---|---|
| `Promise.all` parallel fetch | Serial wait time | All data required, any failure is fatal |
| `Promise.allSettled` | Serial wait time | Partial results acceptable |
| Server Component parallel fetch | SSR waterfall | Multiple independent data sources per route |
| `useTransition` | Blocking renders | Filter/sort/tab changes with expensive trees |
| `useDeferredValue` | Main thread blocking | Can't control the state setter |
| Parallel route segments | Slot interdependence | Independent sidebar/modal/panel loading |
| Web Worker + Comlink | Main thread blocking | CSV parse, image resize, search indexing |
| Streaming SSR + Suspense | TTFB / TTI | Slow non-critical data below the fold |
| Optimistic updates | Perceived latency | Mutations with high success rate |
| `rel="preload"` fonts/images | Render-blocking assets | LCP images, critical fonts |
| Prefetch on hover | Navigation latency | Internal links, pagination |
| Shared IntersectionObserver | Observer overhead | Lists with many lazy elements |
| TanStack Query deduplication | Duplicate requests | Multiple components sharing data |
| AbortController | Stale responses | Search inputs, navigating away mid-fetch |
