/**
 * good-view-transitions.jsx — Gold Standard Example
 * Demonstrates: React View Transition API patterns
 * - Directional page navigation (nav-forward / nav-back)
 * - Shared element morph (card thumbnail → detail hero)
 * - Suspense reveal (skeleton → content)
 * - List reorder morph
 * Stack: React 19 (canary), Next.js 15+ with experimental.viewTransition
 */

'use client'

import * as React from 'react'
import { startTransition, Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'

// React View Transition API ships in the experimental channel; not yet in stable
// @types/react. Narrow shim keeps the compile check strict everywhere else.
//
// Resolve it, don't assume it: on a stable React build both names are absent, and
// destructuring them straight off React yields `undefined` — which React reports
// as "Element type is invalid" the moment the first <ViewTransition> renders. The
// fallback renders children unwrapped, so the navigation still works and simply
// animates nothing, which is the correct degradation for a progressive API.
interface ViewTransitionProps {
  children?: React.ReactNode
  name?: string
  enter?: string | Record<string, string>
  exit?: string | Record<string, string>
  default?: string
  share?: string | Record<string, string>
  update?: string | Record<string, string>
}

const ReactExperimental = React as unknown as {
  ViewTransition?: React.ComponentType<ViewTransitionProps>
  unstable_ViewTransition?: React.ComponentType<ViewTransitionProps>
  addTransitionType?: (type: string) => void
}

const ViewTransition: React.ComponentType<ViewTransitionProps> =
  ReactExperimental.ViewTransition ??
  ReactExperimental.unstable_ViewTransition ??
  function ViewTransitionFallback({ children }: ViewTransitionProps) {
    return <>{children}</>
  }

const addTransitionType = ReactExperimental.addTransitionType ?? (() => {})

// --- PATTERN 1: Directional Navigation ---

export function NavigateButton({ href, direction = 'forward', children }: { href: string; direction?: 'forward' | 'back'; children: React.ReactNode }) {
  const router = useRouter()

  return (
    <button
      onClick={() => {
        startTransition(() => {
          addTransitionType(direction === 'forward' ? 'nav-forward' : 'nav-back')
          router.push(href)
        })
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
    >
      {children}
    </button>
  )
}

// Page wrapper — apply in app/template.tsx
export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ 'nav-forward': 'slide-from-right', 'nav-back': 'slide-from-left', default: 'fade-in' }}
      exit={{ 'nav-forward': 'slide-to-left', 'nav-back': 'slide-to-right', default: 'fade-out' }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}

// --- PATTERN 2: Shared Element Morph (card → detail) ---

const products = [
  { id: '1', name: 'Ceramic Mug', price: '$24', thumbnail: '/mug-thumb.jpg', fullImage: '/mug.jpg', description: 'Hand-thrown stoneware mug. Each piece unique.' },
  { id: '2', name: 'Linen Notebook', price: '$18', thumbnail: '/notebook-thumb.jpg', fullImage: '/notebook.jpg', description: 'A5 ruled pages. Soft linen cover.' },
  { id: '3', name: 'Beeswax Candle', price: '$32', thumbnail: '/candle-thumb.jpg', fullImage: '/candle.jpg', description: '40-hour burn. Cedar and amber scent.' },
]
export type Product = (typeof products)[number]

export function ProductGallery() {
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Shop</h1>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => startTransition(() => setSelected(product))}
            className="text-left rounded-2xl overflow-hidden border border-gray-100 shadow-sm
                       hover:shadow-md transition-shadow min-h-[44px]
                       focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {/* Shared: thumbnail morphs to hero */}
            <ViewTransition name={`product-image-${product.id}`} share="morph">
              <img
                src={product.thumbnail}
                alt={product.name}
                width={320}
                height={240}
                className="w-full h-44 object-cover"
              />
            </ViewTransition>
            <div className="p-4">
              <ViewTransition name={`product-title-${product.id}`} share="text-morph">
                <p className="font-semibold text-gray-900">{product.name}</p>
              </ViewTransition>
              <p className="text-sm text-gray-500 mt-1">{product.price}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Detail overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8"
          onClick={() => startTransition(() => setSelected(null))}
        >
          <div
            className="bg-[oklch(98.4%_0.003_247.9)] rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Same name → morphs from thumbnail */}
            <ViewTransition name={`product-image-${selected.id}`} share="morph">
              <img
                src={selected.fullImage}
                alt={selected.name}
                width={640}
                height={400}
                className="w-full h-64 object-cover"
              />
            </ViewTransition>
            <div className="p-8">
              <ViewTransition name={`product-title-${selected.id}`} share="text-morph">
                <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
              </ViewTransition>
              <p className="text-gray-500 mt-2">{selected.description}</p>
              <div className="flex items-center justify-between mt-6">
                <span className="text-2xl font-bold text-gray-900">{selected.price}</span>
                <button className="h-11 px-6 bg-gray-900 text-white rounded-xl font-medium
                                   hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-700
                                   focus-visible:ring-offset-2 transition-colors">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- PATTERN 3: Suspense Reveal ---

function ArticleContent({ slug }: { slug: string }) {
  // In real app: use() a server data promise
  return (
    <article className="prose max-w-none">
      <h1>Article title for {slug}</h1>
      <p>Content loaded successfully with smooth skeleton→content transition.</p>
    </article>
  )
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
    </div>
  )
}

export function ArticlePage({ slug }: { slug: string }) {
  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Skeleton slides down, content slides up */}
      <Suspense fallback={
        <ViewTransition exit="slide-down">
          <ArticleSkeleton />
        </ViewTransition>
      }>
        <ViewTransition enter="slide-up" default="none">
          <ArticleContent slug={slug} />
        </ViewTransition>
      </Suspense>
    </div>
  )
}

// --- PATTERN 4: List Reorder ---

type SortableItem = { id: string; label: string }

export function SortableList({ initialItems }: { initialItems: SortableItem[] }) {
  const [items, setItems] = useState(initialItems)

  function moveUp(id: string) {
    startTransition(() => {
      setItems((prev: SortableItem[]) => {
        const idx = prev.findIndex(i => i.id === id)
        if (idx === 0) return prev
        const next = [...prev]
        ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
        return next
      })
    })
  }

  return (
    <ul className="space-y-2 max-w-sm">
      {items.map(item => (
        // key → auto-assigned view-transition-name → browser handles morph
        <ViewTransition key={item.id}>
          <li className="flex items-center justify-between p-4 bg-[oklch(98.4%_0.003_247.9)] border border-gray-100 rounded-xl shadow-sm">
            <span className="font-medium text-gray-800">{item.label}</span>
            <button
              onClick={() => moveUp(item.id)}
              className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded"
              aria-label={`Move ${item.label} up`}
            >
              ↑ Up
            </button>
          </li>
        </ViewTransition>
      ))}
    </ul>
  )
}

// --- Default export: Demo page showing all 4 patterns ---

export default function ViewTransitionsDemo() {
  const [demoTab, setDemoTab] = useState('gallery')
  const [error, setError] = useState<string | null>(null)

  const demoItems = [
    { id: '1', label: 'Design tokens' },
    { id: '2', label: 'Component library' },
    { id: '3', label: 'Animation system' },
  ]

  if (error) {
    return (
      <div role="alert" className="min-h-[100dvh] flex items-center justify-center p-8 bg-[oklch(98.4%_0.003_247.9)]">
        <div className="text-center">
          <p className="font-semibold text-gray-900 mb-2">Failed to load demo</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={() => setError(null)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
                       focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                       hover:bg-indigo-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[oklch(98.4%_0.003_247.9)] font-[Manrope,system-ui,sans-serif]">
      <a href="#demo-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
                   focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[oklch(98.4%_0.003_247.9)] focus:ring-2 focus:ring-indigo-500 text-sm">
        Skip to content
      </a>

      {/* Tab switcher */}
      <nav className="sticky top-0 z-10 bg-[oklch(98.4%_0.003_247.9)]/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-1">
          {['gallery', 'list'].map(tab => (
            <button
              key={tab}
              onClick={() => setDemoTab(tab)}
              className={`h-9 px-4 rounded-lg text-sm font-medium capitalize transition-colors
                focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                ${demoTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main id="demo-main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {demoTab === 'gallery' && <ProductGallery />}
        {demoTab === 'list' && <SortableList initialItems={demoItems} />}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
          ::view-transition-old(*),
          ::view-transition-new(*),
          ::view-transition-group(*) {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
          }
        }
      `}</style>
    </div>
  )
}

// --- Required CSS (add to global.css) ---
/*
:root {
  --vt-exit:  150ms;
  --vt-enter: 210ms;
  --vt-move:  400ms;
}

@keyframes vt-fade {
  from { filter: blur(3px); opacity: 0; }
  to   { filter: blur(0);   opacity: 1; }
}
@keyframes vt-slide {
  from { translate: var(--slide-offset); }
  to   { translate: 0; }
}
@keyframes vt-slide-y {
  from { transform: translateY(var(--slide-y-offset, 12px)); }
  to   { transform: translateY(0); }
}

::view-transition-old(.fade-out) {
  animation: var(--vt-exit) ease-in vt-fade reverse;
}
::view-transition-new(.fade-in) {
  animation: var(--vt-enter) ease-out var(--vt-exit) both vt-fade;
}

::view-transition-old(.slide-down) {
  animation: var(--vt-exit) ease-out both vt-fade reverse,
             var(--vt-exit) ease-out both vt-slide-y reverse;
}
::view-transition-new(.slide-up) {
  animation: var(--vt-enter) ease-out var(--vt-exit) both vt-fade,
             var(--vt-move)  ease-out both vt-slide-y;
}

::view-transition-old(.nav-forward) {
  --slide-offset: -60px;
  animation: var(--vt-exit) ease-in both vt-fade reverse,
             var(--vt-move) ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-forward) {
  --slide-offset: 60px;
  animation: var(--vt-enter) ease-out var(--vt-exit) both vt-fade,
             var(--vt-move)  ease-in-out both vt-slide;
}

::view-transition-old(.nav-back) {
  --slide-offset: 60px;
  animation: var(--vt-exit) ease-in both vt-fade reverse,
             var(--vt-move) ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-back) {
  --slide-offset: -60px;
  animation: var(--vt-enter) ease-out var(--vt-exit) both vt-fade,
             var(--vt-move)  ease-in-out both vt-slide;
}

::view-transition-group(.morph) {
  animation-duration: var(--vt-move);
}
::view-transition-image-pair(.morph) {
  animation-name: vt-via-blur;
}
@keyframes vt-via-blur {
  30% { filter: blur(4px); }
}

::view-transition-group(.text-morph) {
  animation-duration: var(--vt-move);
}
::view-transition-old(.text-morph) { display: none; }
::view-transition-new(.text-morph) { animation: none; object-fit: none; object-position: left top; }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
*/
