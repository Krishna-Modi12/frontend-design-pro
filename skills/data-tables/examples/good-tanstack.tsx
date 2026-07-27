// EXAMPLE: Reference-quality TanStack Query v5 Blog Feed
// Intent: CREATE_PAGE · Product: blog · Dials: DV=4 MI=5 VD=8
// Demonstrates: useQuery, useMutation, useInfiniteQuery, optimistic updates,
// infinite scroll, loading skeletons, error handling with retry, cache invalidation.

// @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap')

import { useState, useEffect, useRef, useCallback } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

// ─── Query Client Setup ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
    },
  },
});

// ─── Realistic seed data ──────────────────────────────────────────────────────
const SEED_POSTS = [
  {
    id: 1,
    title: "How Rust's Borrow Checker Reshaped My Mental Model",
    excerpt:
      "After six months writing Rust professionally, the ownership system stopped feeling restrictive and started feeling like a superpower. Here's what finally clicked.",
    author: { name: "Amara Osei", avatar: "AO", role: "Staff Engineer" },
    topic: "Rust",
    readMinutes: 8,
    likes: 247,
    comments: 34,
    publishedAt: "2026-04-17T09:14:00Z",
    liked: false,
  },
  {
    id: 2,
    title: "SQLite in 2026: The Quiet Database Running Everything",
    excerpt:
      "SQLite processes over 1 trillion queries per day across phones, planes, and browsers. Yet most engineers only think about it as a dev-environment toy.",
    author: { name: "Yuki Haramoto", avatar: "YH", role: "Database Architect" },
    topic: "Databases",
    readMinutes: 11,
    likes: 389,
    comments: 51,
    publishedAt: "2026-04-16T14:30:00Z",
    liked: true,
  },
  {
    id: 3,
    title: "React Server Components: Nine Months of Production Lessons",
    excerpt:
      "We moved our 340k-user SaaS entirely to RSC last July. The wins were real, the footguns were real, and the mental model shift was harder than anyone warned us.",
    author: { name: "Fatima Al-Rashid", avatar: "FR", role: "Frontend Lead" },
    topic: "React",
    readMinutes: 14,
    likes: 512,
    comments: 87,
    publishedAt: "2026-04-15T11:00:00Z",
    liked: false,
  },
  {
    id: 4,
    title: "Building an Observability Pipeline on $40/month",
    excerpt:
      "Vector, ClickHouse, and Grafana gave us Datadog-level visibility at a fraction of the cost. Full architecture walkthrough included.",
    author: { name: "Tomás Guerrero", avatar: "TG", role: "SRE" },
    topic: "DevOps",
    readMinutes: 16,
    likes: 178,
    comments: 22,
    publishedAt: "2026-04-14T08:45:00Z",
    liked: false,
  },
  {
    id: 5,
    title: "Why I Stopped Using ORMs (and What I Use Instead)",
    excerpt:
      "Raw SQL felt like a step backward until I realised ORMs were hiding complexity I needed to understand. This is the story of a 3-year journey.",
    author: { name: "Priya Nair", avatar: "PN", role: "Backend Engineer" },
    topic: "Databases",
    readMinutes: 9,
    likes: 304,
    comments: 63,
    publishedAt: "2026-04-13T15:20:00Z",
    liked: false,
  },
  {
    id: 6,
    title: "Edge Functions vs Serverless: A Real Cost Comparison",
    excerpt:
      "We ran both in parallel for 90 days across the same workload. The numbers surprised us — especially at the 99th percentile latency.",
    author: { name: "Devon Clarke", avatar: "DC", role: "Cloud Architect" },
    topic: "Infrastructure",
    readMinutes: 12,
    likes: 421,
    comments: 48,
    publishedAt: "2026-04-12T10:05:00Z",
    liked: false,
  },
  {
    id: 7,
    title: "TypeScript Strict Mode: A Migration Retrospective",
    excerpt:
      "Enabling strict mode on a 180k-line codebase revealed 1,247 previously hidden type errors. Here's how we triaged and fixed them without stopping feature work.",
    author: { name: "Chidi Okafor", avatar: "CO", role: "Senior Engineer" },
    topic: "TypeScript",
    readMinutes: 10,
    likes: 193,
    comments: 29,
    publishedAt: "2026-04-11T13:40:00Z",
    liked: false,
  },
  {
    id: 8,
    title: "The Hidden Costs of Microservices Nobody Talks About",
    excerpt:
      "Network overhead, distributed tracing, and cross-team coordination don't show up in the architecture diagram. After two years with 47 services, here's the honest accounting.",
    author: { name: "Nneka Adeyemi", avatar: "NA", role: "Principal Architect" },
    topic: "Architecture",
    readMinutes: 18,
    likes: 634,
    comments: 112,
    publishedAt: "2026-04-10T16:55:00Z",
    liked: true,
  },
  {
    id: 9,
    title: "CSS Container Queries Finally Changed How I Write Components",
    excerpt:
      "After two years of using container queries in production, the mental shift from viewport-based to component-based thinking is complete — and there's no going back.",
    author: { name: "Soren Lindqvist", avatar: "SL", role: "UI Engineer" },
    topic: "CSS",
    readMinutes: 7,
    likes: 267,
    comments: 38,
    publishedAt: "2026-04-09T09:30:00Z",
    liked: false,
  },
];
export type Post = (typeof SEED_POSTS)[number]
export type Seed_postsItem = Post

const PAGE_SIZE = 4;

// ─── Mock API helpers ─────────────────────────────────────────────────────────
let postsStore = [...SEED_POSTS];

async function fetchPostsPage({ pageParam = 0 }) {
  await new Promise((r) => setTimeout(r, 380));
  const start = pageParam * PAGE_SIZE;
  const items = postsStore.slice(start, start + PAGE_SIZE);
  return {
    posts: items,
    nextCursor: start + PAGE_SIZE < postsStore.length ? pageParam + 1 : undefined,
    totalCount: postsStore.length,
  };
}

async function fetchFeaturedPost() {
  await new Promise((r) => setTimeout(r, 250));
  return postsStore[0];
}

async function likePost(postId: number) {
  await new Promise((r) => setTimeout(r, 200));
  postsStore = postsStore.map((p) =>
    p.id === postId ? { ...p, likes: p.likes + (p.liked ? -1 : 1), liked: !p.liked } : p
  );
  return postsStore.find((p) => p.id === postId);
}

async function createPost(data: { title: string; excerpt: string; topic: string }) {
  await new Promise((r) => setTimeout(r, 500));
  const newPost = {
    id: Date.now(),
    title: data.title,
    excerpt: data.excerpt,
    author: { name: "Kenji Watanabe", avatar: "KW", role: "Guest Author" },
    topic: data.topic || "General",
    readMinutes: Math.ceil(data.excerpt.split(" ").length / 200) + 2,
    likes: 0,
    comments: 0,
    publishedAt: new Date().toISOString(),
    liked: false,
  };
  postsStore = [newPost, ...postsStore];
  return newPost;
}

// ─── Utility helpers ──────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TOPIC_COLORS = {
  Rust: "oklch(62% 0.18 25)",
  Databases: "oklch(58% 0.16 250)",
  React: "oklch(65% 0.19 210)",
  DevOps: "oklch(60% 0.17 145)",
  Infrastructure: "oklch(56% 0.15 280)",
  TypeScript: "oklch(62% 0.2 235)",
  Architecture: "oklch(58% 0.14 320)",
  CSS: "oklch(66% 0.18 185)",
  General: "oklch(58% 0.12 60)",
};

function topicColor(topic: string) {
  return TOPIC_COLORS[topic as keyof typeof TOPIC_COLORS] ?? "oklch(58% 0.12 60)";
}

// ─── Skeleton components ──────────────────────────────────────────────────────
function PostCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-[oklch(99%_0.003_255)] dark:bg-[oklch(18%_0.01_255)] p-6 space-y-3"
    >
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4 w-24" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-6 w-full" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4 w-5/6" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4 w-4/6" />
      <div className="flex gap-3 mt-4">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full size-8" />
        <div className="flex-1 space-y-1.5">
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-3 w-32" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-3 w-20" />
        </div>
      </div>
    </article>
  );
}

function FeaturedSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-[oklch(99%_0.003_255)] dark:bg-[oklch(18%_0.01_255)] p-8 lg:p-10 space-y-4"
    >
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-4 w-28" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-9 w-4/5" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-9 w-3/5" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-5 w-full mt-2" />
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-5 w-5/6" />
    </div>
  );
}

// ─── Featured post (useQuery) ─────────────────────────────────────────────────
function FeaturedPost() {
  const qc = useQueryClient();
  const { data: post, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["featuredPost"],
    queryFn: fetchFeaturedPost,
  });

  const likeMutation = useMutation({
    mutationFn: likePost,
    onMutate: async (postId: number) => {
      await qc.cancelQueries({ queryKey: ["featuredPost"] });
      const previousData = qc.getQueryData(["featuredPost"]);
      // optimistic update
      qc.setQueryData(["featuredPost"], (old: Post | undefined) =>
        old
          ? { ...old, likes: old.likes + (old.liked ? -1 : 1), liked: !old.liked }
          : old
      );
      return { previousData };
    },
    onError: (_err: unknown, _postId: number, context: { previousData?: Post } | undefined) => {
      if (context?.previousData) {
        qc.setQueryData(["featuredPost"], context.previousData);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["featuredPost"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (isLoading) return <FeaturedSkeleton />;

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-3xl border border-rose-200 dark:border-rose-800/50 bg-[oklch(98%_0.01_15)] dark:bg-[oklch(16%_0.02_15)] p-8 flex flex-col items-start gap-4"
      >
        <p className="text-rose-700 dark:text-rose-400 font-semibold">
          Failed to load featured post: {error.message}
        </p>
        <button
          onClick={() => refetch()}
          aria-label="Retry loading featured post"
          className="min-h-[44px] px-5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <article
      aria-label={`Featured post: ${post.title}`}
      className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-[oklch(99%_0.003_255)] dark:bg-[oklch(18%_0.01_255)] p-8 lg:p-10 group relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 20%, ${topicColor(post.topic)}, transparent 65%)` }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: topicColor(post.topic) }}
          >
            {post.topic}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Featured</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[oklch(15%_0.015_255)] dark:text-[oklch(94%_0.008_255)] leading-tight mb-4">
          {post.title}
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-2xl">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: topicColor(post.topic) }}
              aria-hidden="true"
            >
              {post.author.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-[oklch(20%_0.01_255)] dark:text-[oklch(90%_0.008_255)]">
                {post.author.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {post.author.role} · {post.readMinutes} min read · {timeAgo(post.publishedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => likeMutation.mutate(post.id)}
              disabled={likeMutation.isPending}
              aria-label={post.liked ? "Unlike this post" : "Like this post"}
              aria-pressed={post.liked}
              className={`min-h-[44px] inline-flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.18_25)] ${
                post.liked
                  ? "bg-[oklch(60%_0.18_25)] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              ♥ {post.likes.toLocaleString()}
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
              {post.comments} comments
            </span>
          </div>
        </div>
        {isFetching && !isLoading && (
          <div className="absolute top-4 right-4 size-2 rounded-full bg-[oklch(62%_0.18_250)] animate-pulse" aria-hidden="true" />
        )}
      </div>
    </article>
  );
}

// ─── Post card (used in infinite list) ───────────────────────────────────────
type PostsPage = { posts: Post[]; nextCursor: number | null }
type PostsInfinite = { pages: PostsPage[]; pageParams: unknown[] }

function PostCard({ post }: { post: Post }) {
  const qc = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: likePost,
    onMutate: async (postId: number) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const previousData = qc.getQueryData(["posts"]);
      // optimistic update across infinite pages
      qc.setQueryData(["posts"], (old: PostsInfinite | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: PostsPage) => ({
            ...page,
            posts: page.posts.map((p) =>
              p.id === postId
                ? { ...p, likes: p.likes + (p.liked ? -1 : 1), liked: !p.liked }
                : p
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (_err: unknown, _postId: number, context: { previousData?: unknown } | undefined) => {
      if (context?.previousData) {
        qc.setQueryData(["posts"], context.previousData);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <article
      aria-label={`Post: ${post.title}`}
      className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-[oklch(99%_0.003_255)] dark:bg-[oklch(18%_0.01_255)] p-6 flex flex-col gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shrink-0"
          style={{ background: topicColor(post.topic) }}
        >
          {post.topic}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{post.readMinutes} min</span>
      </div>
      <div>
        <h3 className="text-base font-bold text-[oklch(15%_0.015_255)] dark:text-[oklch(94%_0.008_255)] leading-snug mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: topicColor(post.topic) }}
            aria-hidden="true"
          >
            {post.author.avatar}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{post.author.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(post.publishedAt)}</p>
          </div>
        </div>
        <button
          onClick={() => likeMutation.mutate(post.id)}
          disabled={likeMutation.isPending}
          aria-label={post.liked ? "Unlike this post" : "Like this post"}
          aria-pressed={post.liked}
          className={`min-h-[44px] inline-flex items-center gap-1 px-3 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_25)] focus-visible:ring-offset-1 ${
            post.liked
              ? "text-[oklch(50%_0.2_25)] dark:text-[oklch(70%_0.2_25)]"
              : "text-slate-500 dark:text-slate-400 hover:text-[oklch(50%_0.2_25)]"
          }`}
        >
          ♥ {post.likes.toLocaleString()}
        </button>
      </div>
    </article>
  );
}

// ─── Compose modal ────────────────────────────────────────────────────────────
function ComposeModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [topic, setTopic] = useState("General");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["featuredPost"] });
      onClose();
    },
    onError: (err: unknown) => {
      setSubmitError((err instanceof Error ? err.message : "") || "Failed to publish post. Please try again.");
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    createMutation.mutate({ title, excerpt, topic });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Write a new post"
      className="overscroll-contain fixed inset-0 z-50 flex items-center justify-center p-4 bg-[oklch(10%_0.01_255)]/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-[oklch(99%_0.003_255)] dark:bg-[oklch(18%_0.01_255)] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[oklch(15%_0.015_255)] dark:text-[oklch(94%_0.008_255)]">
            New Post
          </h2>
          <button
            onClick={onClose}
            aria-label="Close compose modal"
            className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="post-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn or build?"
              required
              className="w-full min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-[oklch(97%_0.004_255)] dark:bg-[oklch(14%_0.01_255)] text-[oklch(15%_0.015_255)] dark:text-[oklch(92%_0.008_255)] placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_250)] focus-visible:border-transparent transition-shadow text-sm"
              aria-describedby={submitError ? "compose-error" : undefined}
            />
          </div>

          <div>
            <label htmlFor="post-excerpt" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Summary
            </label>
            <textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise description of the post's key insight…"
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-[oklch(97%_0.004_255)] dark:bg-[oklch(14%_0.01_255)] text-[oklch(15%_0.015_255)] dark:text-[oklch(92%_0.008_255)] placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_250)] focus-visible:border-transparent transition-shadow text-sm resize-none"
              aria-describedby={submitError ? "compose-error" : undefined}
            />
          </div>

          <div>
            <label htmlFor="post-topic" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Topic
            </label>
            <select
              id="post-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-[oklch(97%_0.004_255)] dark:bg-[oklch(14%_0.01_255)] text-[oklch(15%_0.015_255)] dark:text-[oklch(92%_0.008_255)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_250)] text-sm"
            >
              {Object.keys(TOPIC_COLORS).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {submitError && (
            <p id="compose-error" role="alert" className="text-sm text-rose-600 dark:text-rose-400 font-medium">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending || !title.trim() || !excerpt.trim()}
            aria-label="Publish new post"
            className="w-full min-h-[44px] rounded-xl bg-[oklch(58%_0.18_250)] hover:bg-[oklch(54%_0.18_250)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(58%_0.18_250)] focus-visible:ring-offset-2"
          >
            {createMutation.isPending ? "Publishing…" : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Infinite post list ───────────────────────────────────────────────────────
function PostFeed() {
  const sentinelRef = useRef(null);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPostsPage,
    initialPageParam: 0,
    getNextPageParam: (lastPage: PostsPage) => lastPage.nextCursor,
  });

  const onRetry = useCallback(() => refetch(), [refetch]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-[oklch(98%_0.01_15)] dark:bg-[oklch(16%_0.02_15)] p-8 flex flex-col items-start gap-4"
      >
        <p className="text-rose-700 dark:text-rose-400 font-semibold">
          Could not load posts: {error.message}
        </p>
        <button
          onClick={onRetry}
          aria-label="Retry loading posts"
          className="min-h-[44px] px-5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const allPosts = data.pages.flatMap((p: PostsPage) => p.posts);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {allPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={`sk-${i}`} />)}
      </div>

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} className="h-1 mt-6" aria-hidden="true" />

      {!hasNextPage && allPosts.length > 0 && (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8 py-4">
          You&apos;ve read all {allPosts.length} posts — well done.
        </p>
      )}

      {isFetching && !isFetchingNextPage && !isLoading && (
        <div className="flex justify-center mt-4" aria-live="polite" aria-label="Refreshing posts">
          <div className="size-5 rounded-full border-2 border-[oklch(60%_0.18_250)] border-t-transparent animate-spin" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

// ─── Root app (wrapped in QueryClientProvider) ────────────────────────────────
function BlogFeedApp() {
  const [showCompose, setShowCompose] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[oklch(97%_0.004_255)] dark:bg-[oklch(11%_0.01_255)] font-[Geist,system-ui,sans-serif] text-[oklch(15%_0.015_255)] dark:text-[oklch(94%_0.008_255)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[oklch(99%_0.003_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-[oklch(60%_0.18_250)] focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap') */}

      <header className="sticky top-0 z-10 border-b border-slate-200/80 dark:border-slate-700/60 bg-[oklch(97%_0.004_255)]/80 dark:bg-[oklch(11%_0.01_255)]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="size-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "oklch(58% 0.18 250)" }}
              aria-hidden="true"
            >
              D
            </div>
            <span className="font-extrabold tracking-tight text-lg">DevLog</span>
          </div>
          <nav aria-label="Site navigation" className="hidden sm:flex items-center gap-6">
            <a href="#main-content" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[oklch(15%_0.015_255)] dark:hover:text-[oklch(94%_0.008_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_250)] rounded">
              Feed
            </a>
            <a href="#main-content" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[oklch(15%_0.015_255)] dark:hover:text-[oklch(94%_0.008_255)] transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_250)] rounded">
              Topics
            </a>
          </nav>
          <button
            onClick={() => setShowCompose(true)}
            aria-label="Write a new post"
            className="min-h-[44px] px-5 rounded-xl bg-[oklch(58%_0.18_250)] hover:bg-[oklch(54%_0.18_250)] text-white text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.18_250)] focus-visible:ring-offset-2"
          >
            Write
          </button>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Featured post via useQuery */}
        <section aria-labelledby="featured-heading" className="mb-10">
          <h2
            id="featured-heading"
            className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
          >
            Featured
          </h2>
          <FeaturedPost />
        </section>

        {/* Infinite scroll feed via useInfiniteQuery */}
        <section aria-labelledby="feed-heading">
          <h2
            id="feed-heading"
            className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
          >
            Latest Posts
          </h2>
          <PostFeed />
        </section>
      </main>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Default export wrapped in QueryClientProvider ────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BlogFeedApp />
    </QueryClientProvider>
  );
}
