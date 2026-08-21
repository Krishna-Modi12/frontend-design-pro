# Animation Recipes

Curated, production-ready animation patterns for React/Next.js. Each recipe is complete — copy, paste, tweak values.

> **Cross-reference:** For WHEN to animate and timing rules → `references/animation-framework.md` ([anim])
> For Framer Motion API reference → `references/framer-motion.md` ([framer])
> For GSAP scroll sequences → `references/gsap.md` ([gsap])

---

## Contents

- [1. Staggered List Reveal](#1-staggered-list-reveal)
- [2. Counter Number Ticker](#2-counter-number-ticker)
- [3. Typewriter / Text Scramble](#3-typewriter--text-scramble)
- [4. Page / Route Transition (Fade-Slide)](#4-page--route-transition-fade-slide)
- [5. Shared Element Morph (Card → Detail)](#5-shared-element-morph-card--detail)
- [6. Scroll-Progress Bar](#6-scroll-progress-bar)
- [7. Magnetic Button](#7-magnetic-button)
- [8. Confetti Burst on Action](#8-confetti-burst-on-action)
- [9. Skeleton Loading Shimmer](#9-skeleton-loading-shimmer)
- [10. Hover Lift Card](#10-hover-lift-card)
- [11. Toast Notification (Sonner)](#11-toast-notification-sonner)
- [12. Bottom Sheet / Drawer (Vaul)](#12-bottom-sheet--drawer-vaul)
- [13. Command Palette with Animation](#13-command-palette-with-animation)
- [14. Parallax Hero Image](#14-parallax-hero-image)
- [15. Accordion / Disclosure with Height Animation](#15-accordion--disclosure-with-height-animation)
- [16. Infinite Marquee / Logo Scroll](#16-infinite-marquee--logo-scroll)
- [17. Popover / Tooltip with Scale Origin](#17-popover--tooltip-with-scale-origin)
- [Quick Reference: Timing Cheat Sheet](#quick-reference-timing-cheat-sheet)
- [Anti-patterns to Avoid](#anti-patterns-to-avoid)

---

## 1. Staggered List Reveal

**Use case:** Feature lists, team cards, pricing tiers — elements that appear one-by-one on scroll.

```tsx
import { motion, useReducedMotion } from 'motion/react'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

function StaggerList({ items }: { items: string[] }) {
  const reduce = useReducedMotion()
  return (
    <motion.ul
      variants={reduce ? undefined : container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={reduce ? undefined : item}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

---

## 2. Counter Number Ticker

**Use case:** Metric cards, stat sections — animate from 0 to a target number on mount.

```tsx
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, animate } from 'motion/react'

function AnimatedNumber({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (inView) motionValue.set(value)
  }, [inView, value, motionValue])

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent =
          prefix + Math.round(latest).toLocaleString() + suffix
      }
    })
  }, [spring, prefix, suffix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

// Usage
<AnimatedNumber value={14829} prefix="" suffix="+" />
<AnimatedNumber value={3.47} suffix="%" duration={1.2} />
```

---

## 3. Typewriter / Text Scramble

**Use case:** Hero headlines, loading screens, terminal-style UIs.

```tsx
// CSS-only typewriter (simplest, most accessible)
function Typewriter({ text, duration = 2 }: { text: string; duration?: number }) {
  return (
    <span
      className="typewriter overflow-hidden whitespace-nowrap border-r-2 border-current"
      style={{
        width: `${text.length}ch`,
        animation: `typing ${duration}s steps(${text.length}) forwards,
                    blink 0.7s step-end infinite`,
      }}
    >
      {text}
    </span>
  )
}

// CSS
const typewriterCSS = `
@keyframes typing {
  from { width: 0; }
  to { width: ${text.length}ch; }
}
@keyframes blink {
  50% { border-color: transparent; }
}
@media (prefers-reduced-motion: reduce) {
  .typewriter {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    width: ${text.length}ch;                /* settled state: the full text, typed */
    border-color: transparent !important;   /* and no caret left blinking */
  }
}
`
```

```tsx
// GSAP SplitText version (rich, per-character control)
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

gsap.registerPlugin(SplitText)

function RevealHeadline({ children }: { children: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useGSAP(() => {
    const split = new SplitText(ref.current, { type: 'chars,words' })
    gsap.from(split.chars, {
      opacity: 0,
      y: 40,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' },
    })
  }, { scope: ref })
  return <h2 ref={ref}>{children}</h2>
}
```

---

## 4. Page / Route Transition (Fade-Slide)

**Use case:** App Router route changes — smooth crossfade between pages.

```tsx
// app/layout.tsx — React 19 View Transitions
import { unstable_ViewTransition as ViewTransition } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition>
      <main>{children}</main>
    </ViewTransition>
  )
}
```

```css
/* globals.css */
::view-transition-old(root) {
  animation: 200ms ease-out fade-and-slide-out;
}
::view-transition-new(root) {
  animation: 300ms ease-out fade-and-slide-in;
}

@keyframes fade-and-slide-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-8px); }
}
@keyframes fade-and-slide-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

---

## 5. Shared Element Morph (Card → Detail)

**Use case:** Product grids, photo galleries — image morphs from list item into detail hero.

```tsx
// Framer Motion layoutId approach
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

interface Item { id: string; title: string; image: string }

function Gallery({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<Item | null>(null)

  return (
    <>
      <ul className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <li key={item.id} onClick={() => setSelected(item)}>
            <motion.img
              layoutId={`img-${item.id}`}
              src={item.image}
              className="w-full aspect-square object-cover rounded-xl cursor-pointer"
            />
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-2xl overflow-hidden max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <motion.img
                layoutId={`img-${selected.id}`}
                src={selected.image}
                className="w-full aspect-video object-cover"
              />
              <motion.h2
                layoutId={`title-${selected.id}`}
                className="p-6 text-xl font-bold"
              >
                {selected.title}
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## 6. Scroll-Progress Bar

**Use case:** Article pages, long docs — thin progress bar at the top of the viewport.

```tsx
import { useScroll, useSpring, motion } from 'motion/react'

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-indigo-500 origin-left z-50"
      style={{ scaleX }}
    />
  )
}
```

---

## 7. Magnetic Button

**Use case:** CTA buttons, hero sections — button follows the cursor at reduced velocity.

```tsx
import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from 'motion/react'

function MagneticButton({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const reduce = useReducedMotion()

  function handleMouseMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3
    setPos({ x, y })
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}
```

---

## 8. Confetti Burst on Action

**Use case:** Subscription confirmation, achievement unlock, "first order" moments.

```tsx
// Use canvas-confetti — no Framer/GSAP needed
// npm install canvas-confetti

import confetti from 'canvas-confetti'

function triggerConfetti() {
  // Check reduced motion first
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
  })
}

// Realistic burst — two simultaneous cannons
function triggerBurst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const fire = (opts: confetti.Options) => confetti({ startVelocity: 30, spread: 360, ticks: 60, ...opts })
  fire({ particleCount: 40, origin: { x: 0.3, y: 0.5 } })
  fire({ particleCount: 40, origin: { x: 0.7, y: 0.5 } })
}
```

---

## 9. Skeleton Loading Shimmer

**Use case:** Content loading states — shimmer effect that matches your layout.

```tsx
// CSS shimmer — no library needed
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-slate-200 overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite]
                      bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

// tailwind.config.ts
// theme.extend.keyframes: { shimmer: { '100%': { transform: 'translateX(100%)' } } }

// Usage — mimic your actual layout
function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}
```

---

## 10. Hover Lift Card

**Use case:** Feature cards, product cards — subtle elevation on hover.

```tsx
import { motion } from 'motion/react'

function LiftCard({ children }: React.PropsWithChildren) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

// CSS-only version (zero bundle cost)
// .card {
//   transition: transform 200ms cubic-bezier(0.23,1,0.32,1),
//               box-shadow 200ms cubic-bezier(0.23,1,0.32,1);
// }
// .card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px -8px rgba(0,0,0,0.12); }
```

---

## 11. Toast Notification (Sonner)

**Use case:** Action confirmations, errors, success messages — accessible toast stack.

```tsx
// npm install sonner
import { Toaster, toast } from 'sonner'

// In layout.tsx
<Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontFamily: 'Manrope, system-ui, sans-serif',
    },
  }}
/>

// Trigger anywhere
toast.success('Saved successfully')
toast.error('Something went wrong')
toast.promise(saveData(), {
  loading: 'Saving…',
  success: 'Saved!',
  error: 'Failed to save',
})
toast.custom(() => (
  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-lg">
    <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center">✓</div>
    <div>
      <p className="font-semibold text-sm">Plan upgraded</p>
      <p className="text-xs text-slate-500">You're now on Pro.</p>
    </div>
  </div>
))
```

---

## 12. Bottom Sheet / Drawer (Vaul)

**Use case:** Mobile action sheets, filter panels, quick edit forms.

```tsx
// npm install vaul
import { Drawer } from 'vaul'

function BottomSheet({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl
                                   pb-[env(safe-area-inset-bottom)] focus:outline-none">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-6" />
          <div className="px-4 pb-8 max-h-[85dvh] overflow-y-auto">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

// Usage
<BottomSheet trigger={<button className="btn">Open sheet</button>}>
  <h2 className="text-xl font-bold mb-4">Filter options</h2>
  {/* Sheet content */}
</BottomSheet>
```

---

## 13. Command Palette with Animation

**Use case:** ⌘K menus, search overlays. Never animate the command palette itself — but do animate the trigger button.

```tsx
// RULE: No animation on palette open/close — it's used 100+/day
// DO animate the ⌘K badge on first discovery

import { AnimatePresence, motion } from 'motion/react'
import { useState, useEffect } from 'react'

function CommandBadge() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 2000) // Show after page settle
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs
                     px-2 py-1 rounded-md whitespace-nowrap pointer-events-none"
        >
          Try ⌘K
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## 14. Parallax Hero Image

**Use case:** Marketing heroes, about pages — image moves slower than scroll.

```tsx
import { useScroll, useTransform, motion } from 'motion/react'
import { useRef } from 'react'

function ParallaxHero({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <div ref={ref} className="relative h-[600px] overflow-hidden rounded-3xl">
      <motion.img
        src={src}
        alt=""
        aria-hidden
        style={{ y }}
        className="absolute inset-0 w-full h-[130%] object-cover"
      />
      {/* Overlay content */}
      <div className="relative z-10 p-12 h-full flex items-end">
        <h2 className="text-4xl font-bold text-white">Your headline</h2>
      </div>
    </div>
  )
}
```

---

## 15. Accordion / Disclosure with Height Animation

**Use case:** FAQs, settings sections, expandable content.

```tsx
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-slate-200">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex justify-between items-center py-4 text-left text-sm
                       font-semibold hover:text-slate-900 transition-colors"
            aria-expanded={open === i}
          >
            {item.q}
            <motion.span
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 ml-4 text-slate-400"
            >
              ↓
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <p className="pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
```

---

## 16. Infinite Marquee / Logo Scroll

**Use case:** Social proof logo strips, ticker tapes — endless horizontal scroll.

```tsx
// CSS-only (preferred — zero JS)
function Marquee({ items, speed = 30 }: { items: React.ReactNode[]; speed?: number }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <ul
        className="flex w-max gap-12 items-center"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        {/* Rendered twice so the loop restarts with no visible seam */}
        {[...items, ...items].map((item, i) => (
          <li key={i} className="shrink-0">{item}</li>
        ))}
      </ul>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { ul { animation: none; } }
      `}</style>
    </div>
  )
}
```

---

## 17. Popover / Tooltip with Scale Origin

**Use case:** Tooltips, dropdown menus — scale from the trigger point, not center.

```tsx
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'bottom center' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                       bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
                       whitespace-nowrap pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## Quick Reference: Timing Cheat Sheet

| Element | Enter | Exit | Easing |
|---------|-------|------|--------|
| Button feedback | 100ms | 80ms | ease-out |
| Tooltip | 150ms | 100ms | ease-out |
| Dropdown | 200ms | 150ms | ease-out |
| Toast | 300ms | 200ms | ease-out |
| Modal | 350ms | 250ms | ease-out |
| Bottom sheet | 400ms | 280ms | `cubic-bezier(0.32,0.72,0,1)` |
| Page transition | 300ms | 200ms | ease-out |

**Rule:** Exit ≈ 60–70% of enter duration. Exits get out of the way; enters command attention.

---

## Anti-patterns to Avoid

```
✗ scale(0) → scale(1)         — always scale from 0.95, not 0
✗ ease-in on entering elements — feels sluggish
✗ Animation duration > 500ms on repeated actions
✗ Animating width/height directly — use transform instead
✗ will-change: transform on everything — only on actual animated elements
✗ Framer + GSAP on same element — conflicting transform matrices
✗ Animate command palette / keyboard results — too frequent
```
