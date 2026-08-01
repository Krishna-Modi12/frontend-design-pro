/**
 * good-mobile.jsx — Gold Standard Example
 * Demonstrates mobile-native patterns:
 * - Bottom tab navigation (iOS/Android-style with safe area)
 * - Bottom sheet (vaul) with snap points
 * - Pull-to-refresh with state machine
 * - Swipe-to-dismiss list item (Framer Motion)
 * Stack: React 19, Next.js, Tailwind v4, vaul, motion
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react'
import { Drawer } from 'vaul'

// --- Bottom Tab Navigation ---

const tabs = [
  { id: 'home',    label: 'Home',    icon: HomeIcon },
  { id: 'search',  label: 'Search',  icon: SearchIcon },
  { id: 'inbox',   label: 'Inbox',   icon: InboxIcon,  badge: 4 },
  { id: 'profile', label: 'Profile', icon: ProfileIcon },
]

type FeedItem = { id: string; name: string; subtitle: string; time: string; initials: string; title?: string; description?: string }

export function BottomTabNav({ activeTab, onChange }: { activeTab: string; onChange: (tab: string) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: 'oklch(14% 0.010 240)',
        borderTop: '1px solid oklch(22% 0.010 240)',
        // Safe area inset for iPhone home bar
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1 relative
                min-h-[56px] touch-manipulation focus-visible:ring-2 focus-visible:ring-inset
                focus-visible:outline-none rounded-none"
              style={{
                // Remove iOS tap flash
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Active indicator pill */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 w-12 h-0.5 rounded-full"
                    style={{ backgroundColor: 'oklch(62% 0.190 255)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </AnimatePresence>

              {/* Badge */}
              {tab.badge && (
                <span className="absolute top-1.5 right-[calc(50%-12px)] w-4 h-4 rounded-full
                  bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                  aria-label={`${tab.badge} unread`}>
                  {tab.badge}
                </span>
              )}

              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{ color: isActive ? 'oklch(62% 0.190 255)' : 'oklch(55% 0.008 240)' }}
                  aria-hidden="true"
                />
              </motion.div>
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? 'oklch(62% 0.190 255)' : 'oklch(55% 0.008 240)' }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// --- Bottom Sheet (vaul) ---

export function ItemDetailSheet({ item, open, onOpenChange }: { item: FeedItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'oklch(0% 0 0 / 0.5)' }}
        />
        <Drawer.Content
          className="overscroll-contain fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl outline-none"
          style={{
            backgroundColor: 'oklch(14% 0.010 240)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
          aria-label="Item details"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full"
              style={{ backgroundColor: 'oklch(35% 0.010 240)' }} />
          </div>

          {/* Snap point content */}
          <Drawer.Title className="px-6 pt-2 pb-1 text-lg font-semibold"
            style={{ color: 'oklch(92% 0.005 240)' }}>
            {item?.title ?? 'Details'}
          </Drawer.Title>

          <div className="px-6 pb-6 space-y-4">
            <p style={{ color: 'oklch(55% 0.008 240)' }} className="text-sm leading-relaxed">
              {item?.description ?? 'No description available.'}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{ backgroundColor: 'oklch(62% 0.190 255)', color: 'white' }}
                onClick={() => onOpenChange(false)}
              >
                Primary action
              </button>
              <button
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{ backgroundColor: 'oklch(22% 0.010 240)', color: 'oklch(92% 0.005 240)' }}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

// --- Pull-to-Refresh ---

const PTR_THRESHOLD = 72  // px to trigger refresh

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void> | void; children: React.ReactNode }) {
  const [state, setState] = useState('idle')  // idle | pulling | triggered | refreshing
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (window.scrollY > 0) return
    startY.current = e.touches[0].clientY
    isPulling.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPulling.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) return
    e.preventDefault()
    const capped = Math.min(delta * 0.6, PTR_THRESHOLD * 1.5)
    setPullDistance(capped)
    setState(capped >= PTR_THRESHOLD ? 'triggered' : 'pulling')
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (state === 'triggered') {
      setState('refreshing')
      setPullDistance(48)
      await onRefresh()
    }

    setState('idle')
    setPullDistance(0)
  }, [state, onRefresh])

  const indicatorOpacity = Math.min(pullDistance / PTR_THRESHOLD, 1)
  const indicatorRotate = (pullDistance / PTR_THRESHOLD) * 180

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden"
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-end justify-center pointer-events-none z-10"
        style={{ height: Math.max(pullDistance, 0), opacity: indicatorOpacity }}
        aria-live="polite"
        aria-label={state === 'refreshing' ? 'Refreshing' : state === 'triggered' ? 'Release to refresh' : 'Pull to refresh'}
      >
        {state === 'refreshing' ? (
          <div className="mb-3 w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div
            className="mb-3 text-indigo-400 transition-transform"
            style={{ transform: `rotate(${indicatorRotate}deg)` }}
          >
            ↓
          </div>
        )}
      </div>

      {/* Content pushed down while pulling */}
      <div style={{ transform: `translateY(${pullDistance}px)`, transition: state === 'idle' ? 'transform 0.3s ease-out' : 'none' }}>
        {children}
      </div>
    </div>
  )
}

// --- Swipe-to-Dismiss List Item ---

export function SwipeableItem({ item, onDismiss }: { item: FeedItem; onDismiss: (id: string) => void }) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-120, -60, 0], [0, 0.5, 1])
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0])

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 flex items-center justify-end pr-6 bg-red-500/90 rounded-2xl"
        aria-hidden="true"
      >
        <span className="text-white text-sm font-semibold">Delete</span>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        style={{ x, opacity, backgroundColor: 'oklch(18% 0.010 240)' }}
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
          if (info.offset.x < -100 || info.velocity.x < -500) {
            onDismiss(item.id)
          }
        }}
        className="relative rounded-2xl p-4 flex items-center gap-4 touch-pan-y"
        role="listitem"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
          style={{ backgroundColor: 'oklch(62% 0.190 255 / 0.15)', color: 'oklch(62% 0.190 255)' }}>
          {item.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" style={{ color: 'oklch(92% 0.005 240)' }}>
            {item.name}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'oklch(55% 0.008 240)' }}>
            {item.subtitle}
          </p>
        </div>
        <span className="text-xs shrink-0" style={{ color: 'oklch(55% 0.008 240)' }}>
          {item.time}
        </span>
      </motion.div>
    </div>
  )
}

// --- Full Demo Page ---

const demoItems = [
  { id: '1', name: 'Ana Ngugi', subtitle: 'Replied to your comment', time: '2m', initials: 'AN' },
  { id: '2', name: 'Kenji Tanaka', subtitle: 'Assigned issue LIN-1247 to you', time: '15m', initials: 'KT' },
  { id: '3', name: 'Priya Shah', subtitle: 'Mentioned you in a doc', time: '1h', initials: 'PS' },
  { id: '4', name: 'Marco DeSouza', subtitle: 'Completed the sprint', time: '3h', initials: 'MD' },
]

export interface MobileAppProps {
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean
}

export default function MobileApp({ isLoading: initialLoading = false }: MobileAppProps = {}) {
  const [activeTab, setActiveTab] = useState('inbox')
  const [items, setItems] = useState(demoItems)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  // Simulate initial data load

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] p-4 space-y-3 md:max-w-sm md:mx-auto"
        style={{ backgroundColor: 'oklch(10% 0.008 240)' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="animate-pulse rounded-2xl h-[72px]"
            style={{ backgroundColor: 'oklch(18% 0.010 240)' }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="min-h-[100dvh] flex items-center justify-center p-8 md:max-w-sm md:mx-auto"
        style={{ backgroundColor: 'oklch(10% 0.008 240)', color: 'oklch(58% 0.200 25)' }}>
        <div className="text-center">
          <p className="font-semibold mb-2">Failed to load notifications</p>
          <p className="text-sm opacity-70">{error}</p>
          <button onClick={() => setError(null)}
            className="mt-4 text-sm underline focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded"
            style={{ color: 'oklch(62% 0.190 255)' }}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1200))
    setRefreshing(false)
  }

  function dismissItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:max-w-sm md:mx-auto md:relative"
      style={{ backgroundColor: 'oklch(10% 0.008 240)', color: 'oklch(92% 0.005 240)',
               fontFamily: 'Manrope, system-ui, sans-serif' }}>

      {/* Skip navigation */}
      <a href="#mobile-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50
                   focus:px-3 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        style={{ backgroundColor: 'oklch(62% 0.190 255)', color: 'white' }}>
        Skip to content
      </a>

      {/* Status bar safe area */}
      <div style={{ paddingTop: 'env(safe-area-inset-top, 44px)' }} />

      {/* Header */}
      <header className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-sm mt-0.5" style={{ color: 'oklch(55% 0.008 240)' }}>
          {items.length} notification{items.length !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Content with pull-to-refresh */}
      <PullToRefresh onRefresh={handleRefresh}>
        <main id="mobile-main" className="flex-1 px-4 space-y-2 pb-32">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -150, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <SwipeableItem
                  item={item}
                  onDismiss={dismissItem}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4" aria-hidden="true">✓</div>
              <p className="font-semibold" style={{ color: 'oklch(92% 0.005 240)' }}>All caught up</p>
              <p className="text-sm mt-1" style={{ color: 'oklch(55% 0.008 240)' }}>
                No new notifications
              </p>
            </div>
          )}
        </main>
      </PullToRefresh>

      {/* Bottom sheet */}
      <ItemDetailSheet
        item={selectedItem}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Bottom tab navigation */}
      <BottomTabNav activeTab={activeTab} onChange={setActiveTab} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}

// --- Style block (font + reduced-motion) ---
// Added via <style> tag inside MobileApp render (see bottom of component)
// @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap')

// --- SVG Icons ---

function HomeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function SearchIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function InboxIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}

function ProfileIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
