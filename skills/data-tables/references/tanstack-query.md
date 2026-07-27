# TanStack Query Reference

Source: tanstack/query (official docs synthesis)
Version: 10.17.0

---

## 1. Installation + QueryClient Setup

### Install packages

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### QueryClient provider — Next.js App Router

Because `QueryClientProvider` requires React context, it must live in a `'use client'` component. Create a dedicated wrapper so the root `layout.tsx` stays a Server Component.

```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 s — avoids refetch on every mount
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 min before GC
        gcTime: 5 * 60 * 1000,
        // Retry failed requests twice before surfacing error
        retry: 2,
        // Refetch when browser tab regains focus
        refetchOnWindowFocus: true,
      },
    },
  })
}

// Singleton for the server; per-request on the client (avoids shared state)
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return makeQueryClient()
  }
  // Browser: reuse the same client across re-renders
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  // NOTE: do NOT put queryClient in useState — see anti-patterns section
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only ship in dev builds */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

```tsx
// app/layout.tsx  (Server Component — no 'use client')
import { Providers } from './providers'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### DevTools (standalone panel — optional)

```tsx
// Can also be lazy-loaded in production with a feature flag
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Inside <QueryClientProvider>:
<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
```

---

## 2. useQuery

### Basic shape

```tsx
import { useQuery } from '@tanstack/react-query'

type Post = { id: number; title: string; body: string; userId: number }
type ApiError = { message: string; status: number }

const { data, isPending, isError, error } = useQuery<Post, ApiError>({
  queryKey: ['posts', 42],
  queryFn: async () => {
    const res = await fetch('/api/posts/42')
    if (!res.ok) throw new Error('Failed to fetch post')
    return res.json() as Promise<Post>
  },
})
```

### Query key — array syntax

```tsx
// Simple key
queryKey: ['todos']

// Key with a filter object — object order doesn't matter for matching
queryKey: ['todos', { status: 'active', page: 1 }]

// Key with a path segment + param
queryKey: ['users', userId, 'todos']
```

### staleTime vs gcTime

```tsx
useQuery({
  queryKey: ['config'],
  queryFn: fetchConfig,
  // staleTime: how long before data is considered stale and eligible for background refetch
  staleTime: Infinity,        // Never refetch (good for static config)
  // gcTime: how long unused/inactive cache entries survive before being garbage collected
  gcTime: 10 * 60 * 1000,    // 10 minutes
})
```

### enabled — dependent queries

```tsx
function UserTodos({ userId }: { userId: string | null }) {
  const { data: todos } = useQuery({
    queryKey: ['todos', userId],
    queryFn: () => fetchTodosByUser(userId!),
    // Query won't run until userId is truthy
    enabled: !!userId,
  })

  return <div>{todos?.map(t => <div key={t.id}>{t.title}</div>)}</div>
}
```

### select — transform / derive data without an extra memo

```tsx
type ApiResponse = { data: { users: User[] }; meta: { total: number } }

const { data: userNames } = useQuery<ApiResponse, Error, string[]>({
  queryKey: ['users'],
  queryFn: fetchUsers,
  // Third generic is the *selected* return type
  select: (response) => response.data.users.map((u) => u.name),
})
// userNames is string[] | undefined — no raw ApiResponse leaks out
```

### TypeScript generics

```tsx
// useQuery<TData, TError, TSelectData, TQueryKey>
useQuery<Post[], ApiError, Post[]>({
  queryKey: ['posts'],
  queryFn: (): Promise<Post[]> => fetchPosts(),
})

// Narrower: select transforms TData → TSelectData
useQuery<Post[], ApiError, string[]>({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  select: (posts) => posts.map((p) => p.title),
})
```

---

## 3. Query Key Factory Pattern

Centralise query keys to eliminate typos and make invalidation surgical.

```ts
// lib/query-keys.ts

type TodoFilters = {
  status?: 'active' | 'done' | 'all'
  assigneeId?: string
}

export const todoKeys = {
  /** Matches ALL todo queries */
  all: ['todos'] as const,

  /** Matches all list queries regardless of filter */
  lists: () => [...todoKeys.all, 'list'] as const,

  /** Matches a specific filtered list */
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,

  /** Matches all detail queries */
  details: () => [...todoKeys.all, 'detail'] as const,

  /** Matches a single todo */
  detail: (id: string) => [...todoKeys.details(), id] as const,
} as const

// Usage in components:
useQuery({ queryKey: todoKeys.detail(id), queryFn: () => fetchTodo(id) })

// Invalidate everything todo-related:
queryClient.invalidateQueries({ queryKey: todoKeys.all })

// Invalidate only lists (not details):
queryClient.invalidateQueries({ queryKey: todoKeys.lists() })

// Invalidate a specific detail:
queryClient.invalidateQueries({ queryKey: todoKeys.detail(id) })
```

---

## 4. Loading / Error / Skeleton Patterns

### Status flags explained

| Flag | Meaning |
|---|---|
| `isPending` | No data yet (first load or no cache). Use for skeleton / spinner. |
| `isLoading` | Alias: `isPending && isFetching`. Deprecated in v5 — prefer `isPending`. |
| `isFetching` | Any background network request is in-flight (includes refetches). |
| `isError` | Latest fetch failed and there is no cached data. |
| `isSuccess` | Data is available (may be stale while `isFetching`). |

### Switch on `status`

```tsx
function PostDetail({ id }: { id: number }) {
  const { data, status, error, isFetching } = useQuery<Post, Error>({
    queryKey: ['posts', id],
    queryFn: () => fetchPost(id),
  })

  switch (status) {
    case 'pending':
      return <PostSkeleton />
    case 'error':
      return <ErrorBanner message={error.message} />
    case 'success':
      return (
        <article>
          {isFetching && <RefetchIndicator />}
          <h1>{data.title}</h1>
          <p>{data.body}</p>
        </article>
      )
  }
}
```

### Skeleton that mirrors the real layout

```tsx
// components/post-skeleton.tsx
export function PostSkeleton() {
  return (
    <article className="animate-pulse space-y-4">
      {/* Title line */}
      <div className="h-7 w-3/4 rounded bg-muted" />
      {/* Body lines */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
      {/* Meta row */}
      <div className="flex gap-3">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
    </article>
  )
}
```

### Error boundary integration with throwOnError

```tsx
// Let the nearest error boundary catch query errors
useQuery({
  queryKey: ['critical-data'],
  queryFn: fetchCriticalData,
  throwOnError: true,            // throw instead of returning isError
})

// Or conditionally — only throw for server errors, handle 404 inline
useQuery({
  queryKey: ['post', id],
  queryFn: fetchPost,
  throwOnError: (error) => error.status >= 500,
})
```

```tsx
// app/error.tsx  — Next.js App Router error boundary
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  )
}
```

---

## 5. useMutation

### Basic shape

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

type CreateTodoInput = { title: string; assigneeId?: string }
type Todo = { id: string; title: string; done: boolean }

function CreateTodoForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation<Todo, Error, CreateTodoInput>({
    mutationFn: (input) =>
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => {
        if (!r.ok) throw new Error('Failed to create todo')
        return r.json()
      }),

    onSuccess: (newTodo) => {
      // Invalidate the list so it refetches with the new item
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },

    onError: (error) => {
      console.error('Mutation failed:', error.message)
    },

    onSettled: () => {
      // Runs regardless of success/error — good for cleanup
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutation.mutate({ title: fd.get('title') as string })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input name="title" required className="input" placeholder="New todo…" />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="btn-primary disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving…' : 'Add'}
      </button>
      {mutation.isError && (
        <p className="text-destructive text-sm">{mutation.error.message}</p>
      )}
    </form>
  )
}
```

### Toast feedback with Sonner

```tsx
import { toast } from 'sonner'

const mutation = useMutation({
  mutationFn: deleteTodo,
  onMutate: () => {
    // Immediately show a loading toast and save its id for later
    return toast.loading('Deleting…')
  },
  onSuccess: (_data, _vars, toastId) => {
    toast.success('Todo deleted', { id: toastId as string | number })
    queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
  },
  onError: (error, _vars, toastId) => {
    toast.error(error.message, { id: toastId as string | number })
  },
})
```

---

## 6. Optimistic Updates

Full example — toggling a todo's done state with instant UI feedback and rollback on failure.

```tsx
// types.ts
type Todo = { id: string; title: string; done: boolean }

// hooks/use-toggle-todo.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

async function toggleTodoApi(todo: Todo): Promise<Todo> {
  const res = await fetch(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: !todo.done }),
  })
  if (!res.ok) throw new Error('Failed to toggle todo')
  return res.json()
}

export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation<
    Todo,           // TData  — what mutationFn resolves with
    Error,          // TError
    Todo,           // TVariables — what we pass to mutate()
    { previousTodos: Todo[] | undefined }  // TContext — what onMutate returns
  >({
    mutationFn: toggleTodoApi,

    // --- Step 1: optimistically update cache ---
    onMutate: async (toggledTodo) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() })

      // Snapshot the current value so we can roll back
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.list({}))

      // Optimistically flip the done flag
      queryClient.setQueryData<Todo[]>(todoKeys.list({}), (old = []) =>
        old.map((t) =>
          t.id === toggledTodo.id ? { ...t, done: !t.done } : t
        )
      )

      // Return context for onError
      return { previousTodos }
    },

    // --- Step 2: rollback on failure ---
    onError: (_error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.list({}), context.previousTodos)
      }
      toast.error('Could not update todo — changes reverted')
    },

    // --- Step 3: always sync with server truth ---
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}

// Usage in a component:
function TodoItem({ todo }: { todo: Todo }) {
  const { mutate: toggleTodo, isPending } = useToggleTodo()

  return (
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={todo.done}
        disabled={isPending}
        onChange={() => toggleTodo(todo)}
      />
      <span className={todo.done ? 'line-through text-muted-foreground' : ''}>
        {todo.title}
      </span>
    </li>
  )
}
```

---

## 7. Cache Invalidation

```tsx
const queryClient = useQueryClient()

// --- Partial key match (prefix) — invalidates any query whose key starts with ['todos']
queryClient.invalidateQueries({ queryKey: ['todos'] })

// --- Exact key match only
queryClient.invalidateQueries({ queryKey: todoKeys.detail('abc'), exact: true })

// --- Invalidate everything in the cache
queryClient.invalidateQueries()

// --- Invalidate from mutation onSuccess
useMutation({
  mutationFn: updateTodo,
  onSuccess: (_data, variables) => {
    // Invalidate the specific detail that changed
    queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.id) })
    // Also invalidate all lists (count, order may have changed)
    queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
  },
})

// --- Manually set cache data after a mutation (avoids an extra round-trip)
useMutation({
  mutationFn: createTodo,
  onSuccess: (newTodo) => {
    queryClient.setQueryData<Todo[]>(todoKeys.list({}), (old = []) => [
      ...old,
      newTodo,
    ])
  },
})

// --- Remove a query from cache entirely (e.g., after delete)
useMutation({
  mutationFn: deleteTodo,
  onSuccess: (_data, id) => {
    queryClient.removeQueries({ queryKey: todoKeys.detail(id), exact: true })
    queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
  },
})
```

---

## 8. useInfiniteQuery

### Setup

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

type PostsPage = {
  data: Post[]
  nextCursor: string | null
  prevCursor: string | null
}

function useInfinitePosts() {
  return useInfiniteQuery<PostsPage, Error>({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) =>
      fetch(`/api/posts?cursor=${pageParam}&limit=20`).then((r) => r.json()),

    // pageParam starts as this value on the first call
    initialPageParam: '',

    // Return the cursor for the next page; returning undefined stops pagination
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    // Optional: enable bidirectional pagination
    getPreviousPageParam: (firstPage) => firstPage.prevCursor ?? undefined,
  })
}
```

### Render list + flatten pages

```tsx
function PostFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfinitePosts()

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap((page) => page.data) ?? []

  if (isPending) return <PostFeedSkeleton />
  if (isError) return <p>Failed to load posts.</p>

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="btn-secondary w-full"
        >
          {isFetchingNextPage ? 'Loading more…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
```

### Infinite scroll with IntersectionObserver

```tsx
'use client'

import { useEffect, useRef } from 'react'

function InfinitePostFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts()

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }  // start loading 200px before the sentinel is visible
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Invisible div at the bottom — triggers loading when scrolled into view */}
      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && <PostCardSkeleton />}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-muted-foreground py-4">
          You've reached the end
        </p>
      )}
    </div>
  )
}
```

---

## 9. Prefetching in Next.js Server Components

### Server Component prefetch → HydrationBoundary

```tsx
// app/todos/page.tsx  — Server Component
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { TodoList } from './todo-list'
import { todoKeys } from '@/lib/query-keys'
import { fetchTodos } from '@/lib/api'

export default async function TodosPage() {
  const queryClient = new QueryClient()

  // Prefetch runs on the server; data is embedded in the HTML
  await queryClient.prefetchQuery({
    queryKey: todoKeys.list({}),
    queryFn: fetchTodos,
  })

  return (
    // HydrationBoundary rehydrates the cache on the client —
    // useQuery in TodoList sees data immediately with no loading state
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoList />
    </HydrationBoundary>
  )
}
```

```tsx
// app/todos/todo-list.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { todoKeys } from '@/lib/query-keys'
import { fetchTodos } from '@/lib/api'

export function TodoList() {
  // Data is already in the cache — no loading flash
  const { data: todos = [] } = useQuery({
    queryKey: todoKeys.list({}),
    queryFn: fetchTodos,
  })

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### Prefetch multiple queries in parallel on the server

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ['user', 'me'], queryFn: fetchMe }),
    queryClient.prefetchQuery({ queryKey: todoKeys.list({}), queryFn: fetchTodos }),
    queryClient.prefetchQuery({ queryKey: ['stats'], queryFn: fetchStats }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  )
}
```

---

## 10. Parallel + Dependent Queries

### useQueries — parallel with typed results

```tsx
import { useQueries } from '@tanstack/react-query'

type User = { id: string; name: string }
type Repo = { id: number; name: string; stars: number }

function UserDashboard({ userIds }: { userIds: string[] }) {
  // Fire all queries simultaneously
  const userQueries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ['users', id],
      queryFn: (): Promise<User> => fetchUser(id),
      staleTime: 5 * 60 * 1000,
    })),
  })

  const allLoaded = userQueries.every((q) => q.isSuccess)
  const users = userQueries.map((q) => q.data).filter(Boolean) as User[]

  if (!allLoaded) return <Spinner />

  return <UserGrid users={users} />
}
```

### Dependent queries — chain on prior result

```tsx
function UserRepos({ username }: { username: string }) {
  // Step 1 — get user id from username
  const userQuery = useQuery({
    queryKey: ['users', 'byName', username],
    queryFn: () => fetchUserByName(username),
    enabled: !!username,
  })

  // Step 2 — get repos only after we have the user id
  const reposQuery = useQuery({
    queryKey: ['repos', userQuery.data?.id],
    queryFn: () => fetchUserRepos(userQuery.data!.id),
    enabled: !!userQuery.data?.id,  // waits for step 1
  })

  if (userQuery.isPending) return <Skeleton className="h-4 w-32" />
  if (userQuery.isError) return <p>User not found</p>
  if (reposQuery.isPending) return <p>Loading repos…</p>

  return (
    <ul>
      {reposQuery.data?.map((repo) => (
        <li key={repo.id}>{repo.name}</li>
      ))}
    </ul>
  )
}
```

---

## 11. TypeScript Patterns

### queryOptions helper — co-locate key + fn

```ts
// lib/queries/todo-queries.ts
import { queryOptions } from '@tanstack/react-query'
import { fetchTodo, fetchTodos } from '@/lib/api'
import { todoKeys } from '@/lib/query-keys'

export const todoListOptions = (filters: TodoFilters = {}) =>
  queryOptions({
    queryKey: todoKeys.list(filters),
    queryFn: () => fetchTodos(filters),
    staleTime: 30 * 1000,
  })

export const todoDetailOptions = (id: string) =>
  queryOptions({
    queryKey: todoKeys.detail(id),
    queryFn: () => fetchTodo(id),
    enabled: !!id,
  })

// Components use the helper — key + fn can never drift apart
useQuery(todoListOptions({ status: 'active' }))
queryClient.prefetchQuery(todoDetailOptions(id))
```

### Error type narrowing

```tsx
// Define a typed API error class
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Fetch wrapper that throws ApiError
async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.json()
}

// In component — narrow before accessing .status
const { error } = useQuery<Post, Error | ApiError>({
  queryKey: ['post', id],
  queryFn: () => apiFetch<Post>(`/api/posts/${id}`),
})

if (error) {
  if (error instanceof ApiError && error.status === 404) {
    return <NotFound />
  }
  return <p>{error.message}</p>
}
```

### Typed mutation with context

```ts
type MutationContext = { snapshot: Todo[] | undefined }

useMutation<Todo, ApiError, Partial<Todo> & { id: string }, MutationContext>({
  mutationFn: (vars) => apiFetch(`/api/todos/${vars.id}`),
  onMutate: async (vars): Promise<MutationContext> => {
    await queryClient.cancelQueries({ queryKey: todoKeys.lists() })
    const snapshot = queryClient.getQueryData<Todo[]>(todoKeys.list({}))
    // ... optimistic update ...
    return { snapshot }
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.snapshot) {
      queryClient.setQueryData(todoKeys.list({}), ctx.snapshot)
    }
  },
})
```

---

## 12. Common Anti-Patterns

### Anti-pattern 1 — QueryClient inside useState

```tsx
// BAD: creates a new client on every render, resetting the cache
function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(new QueryClient()) // ← subtle bug
  // ...
}

// GOOD: create outside the component or use the getQueryClient() singleton pattern
// shown in section 1
```

### Anti-pattern 2 — Missing queryKey dependencies

```tsx
// BAD: filter changes won't trigger a refetch because the key is static
function TodoList({ filter }: { filter: string }) {
  const { data } = useQuery({
    queryKey: ['todos'],        // ← doesn't include filter
    queryFn: () => fetchTodos(filter),
  })
}

// GOOD: mirror every variable used in queryFn in the queryKey
function TodoList({ filter }: { filter: string }) {
  const { data } = useQuery({
    queryKey: ['todos', filter], // ← key updates with filter
    queryFn: () => fetchTodos(filter),
  })
}
```

### Anti-pattern 3 — Deriving data outside select

```tsx
// BAD: useMemo re-runs outside of React Query's subscription model
const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
const activeTodos = useMemo(() => todos?.filter((t) => !t.done), [todos])

// GOOD: select runs inside the query and memoises automatically
const { data: activeTodos } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.filter((t) => !t.done),
})
```

### Anti-pattern 4 — staleTime: 0 on everything

```tsx
// BAD: every component mount fires a network request
useQuery({
  queryKey: ['user', 'me'],
  queryFn: fetchCurrentUser,
  // staleTime defaults to 0 → refetch on every mount / focus
})

// GOOD: user profile rarely changes; treat it as semi-static
useQuery({
  queryKey: ['user', 'me'],
  queryFn: fetchCurrentUser,
  staleTime: 5 * 60 * 1000,   // only refetch after 5 minutes
})
```

### Anti-pattern 5 — Calling queryClient.fetchQuery inside render

```tsx
// BAD: triggers a fetch synchronously during render, bypasses React lifecycle
function Component() {
  const data = queryClient.fetchQuery({ queryKey: [...], queryFn: ... }) // Promise!
  // ...
}

// GOOD: use useQuery — it handles suspense, lifecycle, and deduplication
function Component() {
  const { data } = useQuery({ queryKey: [...], queryFn: ... })
}

// queryClient.fetchQuery is for imperative contexts (event handlers, server utils)
async function handleClick() {
  const data = await queryClient.fetchQuery({ queryKey: [...], queryFn: ... })
}
```

### Anti-pattern 6 — Ignoring the error state

```tsx
// BAD: silently renders nothing when data is undefined due to an error
function UserCard({ id }: { id: string }) {
  const { data } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) })
  return <div>{data?.name}</div>
}

// GOOD: always handle all three states
function UserCard({ id }: { id: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  })

  if (isPending) return <UserCardSkeleton />
  if (isError) return <p className="text-destructive">{error.message}</p>
  return <div>{data.name}</div>
}
```

---

## Quick Reference

| Hook | Use case |
|---|---|
| `useQuery` | Read data, cache, background sync |
| `useMutation` | Write operations (create / update / delete) |
| `useInfiniteQuery` | Paginated / cursor-based lists |
| `useQueries` | Multiple parallel queries |
| `useQueryClient` | Imperative cache access |
| `useSuspenseQuery` | Suspense-mode read (throw a Promise) |

| Key helper | Purpose |
|---|---|
| `queryOptions()` | Co-locate key + fn with full inference |
| `dehydrate()` | Serialise cache for SSR transport |
| `HydrationBoundary` | Rehydrate dehydrated state on client |
| `queryClient.invalidateQueries` | Mark queries stale + trigger refetch |
| `queryClient.setQueryData` | Write directly to cache |
| `queryClient.prefetchQuery` | Warm cache before component mounts |
