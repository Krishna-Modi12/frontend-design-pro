# Next.js Patterns (App Router / React 19)

## Contents

- [Project structure](#project-structure)
- [Font loading — always next/font](#font-loading--always-nextfont)
- [Images — always next/image](#images--always-nextimage)
- [Server vs Client Components](#server-vs-client-components)
- [Data fetching patterns](#data-fetching-patterns)
- [Server Actions — mutations](#server-actions--mutations)
- [Metadata](#metadata)
- [Route handlers (API)](#route-handlers-api)
- [Lazy loading heavy components](#lazy-loading-heavy-components)
- [Environment variables](#environment-variables)
- [Common performance patterns](#common-performance-patterns)
- [Caching Deep Dive](#caching-deep-dive)
- [Streaming with loading.tsx](#streaming-with-loadingtsx)
- [Parallel Routes](#parallel-routes)
- [Intercepting Routes](#intercepting-routes)
- [Server Actions — Production Patterns](#server-actions--production-patterns)
- [`generateStaticParams` — Static Dynamic Routes](#generatestaticparams--static-dynamic-routes)
- [Middleware](#middleware)
- [RSC Architecture Rules](#rsc-architecture-rules)
- [Turbopack (Next.js 16+)](#turbopack-nextjs-16)

---

## Project structure

```
app/
├── layout.tsx          ← Root layout, fonts, global metadata
├── page.tsx            ← Home route (Server Component by default)
├── globals.css         ← Tailwind + CSS custom properties
├── (marketing)/        ← Route groups — don't affect URL
│   ├── about/page.tsx
│   └── pricing/page.tsx
└── dashboard/
    ├── layout.tsx      ← Nested layout with sidebar
    └── page.tsx

components/
├── ui/                 ← Pure presentational, no data fetching
└── features/           ← Connected components with data

lib/
├── actions.ts          ← Server Actions
└── data.ts             ← Data fetching functions
```

## Font loading — always next/font

```tsx
// app/layout.tsx
import { Manrope, Playfair_Display } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",          // REQUIRED — prevents FOIT
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
/* globals.css */
@theme {
  --font-sans: var(--font-sans), system-ui, sans-serif;
  --font-display: var(--font-display), Georgia, serif;
}
```

## Images — always next/image

```tsx
import Image from "next/image";

// Known dimensions
<Image
  src="/hero.jpg"
  alt="Hero image showing product dashboard"
  width={1200}
  height={630}
  priority                    // Add for above-fold images
  className="rounded-2xl object-cover"
/>

// Fill container
<div className="relative h-64 w-full">
  <Image
    src="/bg.jpg"
    alt=""                     // Empty alt for decorative images
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover"
    loading="lazy"
  />
</div>
```

## Server vs Client Components

```tsx
// SERVER COMPONENT (default) — no interactivity, data at build/request time
// app/page.tsx
async function HomePage() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 3600 }   // ISR: revalidate every hour
  });
  const { items } = await data.json();

  return <ItemList items={items} />;  // Pass serializable props only
}

// CLIENT COMPONENT — interactivity, hooks, browser APIs
// components/ui/Counter.tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Data fetching patterns

```tsx
// Parallel fetching — no waterfall
async function Dashboard() {
  const [user, metrics, activity] = await Promise.all([
    getUser(),
    getMetrics(),
    getRecentActivity(),
  ]);
  return <DashboardLayout user={user} metrics={metrics} activity={activity} />;
}

// Streaming with Suspense
export default function Page() {
  return (
    <>
      <StaticHeader />   {/* renders immediately */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsWidget />   {/* streams in when ready */}
      </Suspense>
    </>
  );
}
```

## Server Actions — mutations

```tsx
// lib/actions.ts
"use server";
import { revalidatePath } from "next/cache";

export async function submitForm(formData: FormData) {
  const name = formData.get("name") as string;
  // validate, write to DB...
  revalidatePath("/dashboard");
}

// Component
<form action={submitForm}>
  <input name="name" required />
  <button type="submit">Save</button>
</form>
```

## Metadata

```tsx
// Static
export const metadata: Metadata = {
  title: "Product Name — Tagline",
  description: "...",
  openGraph: { images: ["/og.jpg"] },
};

// Dynamic
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

## Route handlers (API)

```tsx
// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  // validate...
  return NextResponse.json({ success: true }, { status: 201 });
}
```

## Lazy loading heavy components

```tsx
import dynamic from "next/dynamic";

// Three.js / charts / rich text editors — always dynamic
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-slate-200 rounded-xl" />,
});

const RichEditor = dynamic(() => import("@/components/RichEditor"), {
  loading: () => <div className="h-48 animate-pulse bg-slate-100 rounded-lg" />,
});
```

## Environment variables

```ts
// Server-only
process.env.DATABASE_URL

// Client-accessible (prefix NEXT_PUBLIC_)
process.env.NEXT_PUBLIC_API_URL
```

## Common performance patterns

- Use `generateStaticParams` for known dynamic routes → static HTML
- `cache()` from React to deduplicate requests in Server Components
- `fetch` is uncached by default (Next 15+); opt into caching per call, or use
  `'use cache'` (Next 16 Cache Components)
- Avoid `"use client"` at layout level — keep interactivity at leaf components
- `<link rel="preload">` for critical fonts/images above fold via metadata

---

## Caching Deep Dive

**Default changed in Next.js 15:** `fetch()` is **no longer cached by default**
(nor are GET Route Handlers). Every `fetch` is dynamic unless you opt in with
`cache: 'force-cache'` or `next: { revalidate }`. Code written for Next 14 that
relied on the implicit cache now hits the network on every request.

**Next.js 16 direction — Cache Components.** With `cacheComponents: true` in
`next.config`, caching moves to the [`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache)
directive: mark an async function or component `'use cache'`, give it a lifetime
with `cacheLife('hours')`, and tag it with `cacheTag('posts')` for on-demand
revalidation. `unstable_cache` still works in the previous model; `use cache` is
its successor and the two are not mixed in one codebase.

```tsx
import { cacheLife, cacheTag } from 'next/cache'

async function BlogPosts() {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return <PostList posts={posts} />
}
// Fresh-every-request data: don't cache it — wrap the component in <Suspense>.
```

### `cache()` — Deduplicate in-request fetches (React)

```tsx
// lib/data.ts
import { cache } from 'react'

// Memoized per request — calling getUser(id) 3× in one render = 1 DB query
export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

// ✅ Safe to call in multiple Server Components — no waterfall, no duplicate hits
async function ProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id)   // hit 1
  return (
    <>
      <ProfileHeader userId={params.id} />  {/* calls getUser(id) → cached */}
      <ProfileBody user={user} />
    </>
  )
}
```

### `unstable_cache` — Persist across requests (previous model)

Use this when the project is **not** on Cache Components. On Next 16 with
`cacheComponents: true`, the equivalent is a `'use cache'` function with
`cacheLife` / `cacheTag` (see the top of this section).

```tsx
import { unstable_cache } from 'next/cache'

// Cached across requests, tagged for targeted revalidation
export const getTopPosts = unstable_cache(
  async (limit: number) => {
    return db.post.findMany({ take: limit, orderBy: { views: 'desc' } })
  },
  ['top-posts'],          // cache key segments
  {
    revalidate: 3600,     // revalidate every hour
    tags: ['posts'],      // revalidate with revalidateTag('posts')
  }
)

// Next 16 / Cache Components equivalent:
import { cacheLife, cacheTag } from 'next/cache'
export async function getTopPosts(limit: number) {
  'use cache'
  cacheLife('hours')
  cacheTag('posts')
  return db.post.findMany({ take: limit, orderBy: { views: 'desc' } })
}
```

### `revalidatePath` vs `revalidateTag`

```tsx
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate a specific URL — use after mutations affecting that page
export async function updatePost(id: string, data: PostData) {
  await db.post.update({ where: { id }, data })
  revalidatePath(`/blog/${id}`)        // exact path
  revalidatePath('/blog', 'page')      // all /blog pages
  revalidatePath('/blog', 'layout')    // /blog + all children layouts
}

// Revalidate by tag — more surgical, tag set at fetch time
export async function publishPost(id: string) {
  await db.post.update({ where: { id }, data: { published: true } })
  revalidateTag('posts')               // clears all unstable_cache with tag 'posts'
  revalidateTag(`post-${id}`)          // clears cache for specific post
}

// Tag fetch() calls:
await fetch('/api/posts', { next: { tags: ['posts'] } })
```

### Fetch cache config cheat sheet

```tsx
// Dynamic — fresh on every request. THIS IS THE DEFAULT since Next 15.
fetch(url)
fetch(url, { cache: 'no-store' })   // explicit, same effect

// Static (CDN-cached, never changes) — opt in
fetch(url, { cache: 'force-cache' })

// ISR — revalidate every N seconds — opt in
fetch(url, { next: { revalidate: 60 } })
```

`unstable_noStore()` is legacy (still supported) — a bare `fetch` is already
uncached, and `connection()` from `next/server` is the recommended way to force
request-time rendering.

---

## Streaming with loading.tsx

```
app/
└── dashboard/
    ├── layout.tsx       ← wraps page + loading
    ├── loading.tsx      ← shown instantly while page.tsx loads
    └── page.tsx         ← async Server Component (may be slow)
```

```tsx
// app/dashboard/loading.tsx — auto-wrapped in <Suspense> by Next.js
export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-6">
      {/* Skeleton that matches real layout */}
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
    </div>
  )
}
```

### Granular streaming with nested Suspense

```tsx
// app/dashboard/page.tsx — stream slow parts independently
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Fast: no data needed */}
      <PageHeader title="Dashboard" />

      {/* Medium: cached metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsSection />
      </Suspense>

      {/* Slow: real-time feed */}
      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed />
      </Suspense>
    </div>
  )
}

// Each async SC fetches independently — no one blocks another
async function MetricsSection() {
  const metrics = await getMetrics()     // ~200ms, cached
  return <MetricsGrid metrics={metrics} />
}

async function ActivityFeed() {
  const events = await getActivity()    // ~800ms, real-time
  return <EventList events={events} />
}
```

---

## Parallel Routes

Render multiple pages simultaneously in the same layout — each can independently stream.

```
app/
└── dashboard/
    ├── layout.tsx        ← receives @team and @analytics as props
    ├── page.tsx
    ├── @team/
    │   └── page.tsx      ← slot rendered at layout level
    └── @analytics/
        └── page.tsx      ← slot rendered at layout level
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  team,
  analytics,
}: {
  children:  React.ReactNode
  team:      React.ReactNode   // @team slot
  analytics: React.ReactNode   // @analytics slot
}) {
  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <main>
        {children}
        {analytics}
      </main>
      <aside>{team}</aside>
    </div>
  )
}
```

**Use cases:** split dashboards, side panels, modals that are bookmarkable.

---

## Intercepting Routes

Show a route in a modal while keeping the background page — photo galleries, quick-view modals.

```
app/
└── photos/
    ├── page.tsx            ← grid of photos
    ├── [id]/
    │   └── page.tsx        ← full-screen photo page (direct navigation)
    └── (.)photos/          ← (.) = same level interception
        └── [id]/
            └── page.tsx    ← modal overlay (soft navigation)
```

```tsx
// app/@modal/(.)photos/[id]/page.tsx — shown as modal when navigating from /photos
import { PhotoModal } from '@/components/PhotoModal'

export default function PhotoIntercepted({ params }: { params: { id: string } }) {
  return <PhotoModal id={params.id} />
}

// Intercepting route conventions:
// (.)   — same level
// (..)  — one level up
// (..)(..) — two levels up
// (...)    — from root
```

---

## Server Actions — Production Patterns

### With `useActionState` + optimistic UI

```tsx
'use client'
import { useActionState, useOptimistic, useTransition } from 'react'
import { deleteComment } from '@/app/actions/comments'

export function CommentList({ comments: initialComments }: { comments: Comment[] }) {
  const [comments, setOptimistic] = useOptimistic(
    initialComments,
    (current, deletedId: string) => current.filter(c => c.id !== deletedId)
  )
  const [, startTransition] = useTransition()

  async function handleDelete(id: string) {
    startTransition(async () => {
      setOptimistic(id)        // remove from UI instantly
      await deleteComment(id)  // server confirms
    })
  }

  return (
    <ul>
      {comments.map(c => (
        <li key={c.id}>
          <span>{c.body}</span>
          <button onClick={() => handleDelete(c.id)} aria-label={`Delete comment by ${c.author}`}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
```

### Progressive enhancement — works without JS

```tsx
// form + server action degrades gracefully to traditional POST
export function ContactForm() {
  return (
    <form action={sendContactEmail}>
      <input  name="email"   type="email"    required />
      <textarea name="message" required />
      {/* Works without JS — no onClick, no e.preventDefault() */}
      <button type="submit">Send</button>
    </form>
  )
}
```

---

## `generateStaticParams` — Static Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
  // Returns: [{ slug: 'hello-world' }, { slug: 'nextjs-guide' }, ...]
}

// With partial pre-rendering — pre-generate popular posts, ISR the rest
export const dynamicParams = true  // (default) — generate missing ones on demand
// export const dynamicParams = false — 404 for unknown slugs

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()
  return <Article post={post} />
}
```

---

## Middleware

```tsx
// middleware.ts — runs at the edge before every matching request
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value

  // Auth guard
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // A/B testing header
  const res = NextResponse.next()
  res.headers.set('x-ab-variant', Math.random() > 0.5 ? 'A' : 'B')
  return res
}

export const config = {
  // Only run on specific paths — skip static files
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

---

## RSC Architecture Rules

1. **Server first** — default to RSC, add `'use client'` only when you need hooks/events
2. **Leaf components are clients** — `'use client'` should live at the bottom of the tree
3. **Pass Server data as props** — RSC renders first, passes serializable props to Client Components
4. **Async in RSC only** — `await` inside a Server Component; Client Components can't be `async`
5. **Colocate mutations** — Server Actions in the same file or `lib/actions.ts`, never in RSC directly

```tsx
// ✅ Correct RSC → Client boundary
// page.tsx (Server)
export default async function Page() {
  const user = await getUser()          // RSC fetches
  return <ProfileCard user={user} />    // passes to client
}

// profile-card.tsx (Client)
'use client'
export function ProfileCard({ user }: { user: User }) {
  const [editing, setEditing] = useState(false)   // client state
  return <div onClick={() => setEditing(true)}>{user.name}</div>
}

// ❌ Wrong — can't import Server Component into Client Component
'use client'
import { ServerOnlyComp } from './server-only'  // ERROR at runtime
```

---

## Turbopack (Next.js 16+)

Next.js 16+ uses **Turbopack by default** for local development — an incremental Rust-based bundler that dramatically speeds up cold start and HMR.

### When to use what

| Scenario | Use |
|---|---|
| Day-to-day development | Turbopack (default — just run `next dev`) |
| Hit a Turbopack bug / webpack-only plugin needed | `next dev --webpack` to opt out |
| Production build | `next build` (check your Next.js version docs for Turbopack prod support status) |

### Key Turbopack features

```bash
# Turbopack is the default — no flag needed
next dev

# File-system caching under .next/ — restarts reuse prior work
# 5–14× faster cold starts on large projects vs webpack

# Bundle Analyzer (Next.js 16.1+ experimental)
# Add to next.config.ts:
```

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Enable bundle analyzer — generates reports in .next/analyze/
    bundleAnalyzer: process.env.ANALYZE === 'true',
  },
}
export default nextConfig
```

```bash
# Run bundle analysis
ANALYZE=true next build
```

### Turbopack performance tips

- Stay on the latest Next.js 16.x for stable Turbopack and caching behavior
- Don't clear `.next/` cache unnecessarily — it stores Turbopack's incremental work
- Use App Router + Server Components where possible — Turbopack optimizes them best
- Code-split with `dynamic()` / `lazy()` — Turbopack handles these efficiently
- If dev server is slow, confirm Turbopack is active (`next dev` output shows "Turbopack")
