# Mobile Patterns Reference

Source: frontend-design-pro skill (internal)
Version: 10.15.0

---

## 1. Mobile-First Principles

Use `min-h-[100dvh]` over `h-screen`. The `dvh` unit accounts for dynamic viewport changes (browser chrome appearing/disappearing). `svh` (small viewport height) is the smallest the viewport will ever be — use it when you need content to never overflow regardless of browser chrome.

```tsx
// WRONG — h-screen clips content behind mobile browser chrome
<div className="h-screen">...</div>

// RIGHT — dvh fills the current dynamic viewport
<div className="min-h-[100dvh]">...</div>

// RIGHT — svh guarantees no overflow even with address bar visible
<div className="min-h-[100svh]">...</div>
```

**Never use hover-only states on mobile.** Guard interactive enhancements behind pointer media queries:

```css
/* Only apply hover styles on devices that support hover */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

/* Large touch targets for coarse pointer (finger) */
@media (pointer: coarse) {
  .btn {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 20px;
  }
}
```

```tsx
// Tailwind equivalent using arbitrary variants
<button className="[@media(hover:hover)]:hover:bg-blue-600 min-h-[44px] px-5 py-3">
  Tap me
</button>
```

---

## 2. Bottom Navigation Bar

iOS/Android-style fixed bottom nav with safe area insets, active indicator, and 5-tab max.

```tsx
// components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home",     href: "/",         icon: Home },
  { label: "Search",   href: "/search",   icon: Search },
  { label: "Create",   href: "/create",   icon: PlusSquare },
  { label: "Activity", href: "/activity", icon: Bell },
  { label: "Profile",  href: "/profile",  icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch h-14">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium transition-colors",
                  "touch-manipulation select-none",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400 active:text-zinc-900 dark:active:text-zinc-100"
                )}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span className="relative">
                  <Icon className={cn("w-6 h-6", active && "stroke-[2.5px]")} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Layout usage — pad content above the nav
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
```

---

## 3. Bottom Sheet / Drawer (vaul)

Install: `npm install vaul`

```tsx
// components/BottomSheet.tsx
"use client";

import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  snapPoints?: (number | string)[];
}

export function BottomSheet({
  trigger,
  title,
  children,
  snapPoints = [0.4, 0.75, 1],
}: BottomSheetProps) {
  return (
    <Drawer.Root snapPoints={snapPoints} fadeFromIndex={snapPoints.length - 1}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />

        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-white dark:bg-zinc-900 rounded-t-[10px]",
            "flex flex-col outline-none"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Drag handle indicator */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          </div>

          {/* Header */}
          <Drawer.Title className="px-4 pb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
            {title}
          </Drawer.Title>

          {/* Scrollable content — vaul handles nested scroll automatically */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Usage
export function FilterSheet() {
  return (
    <BottomSheet
      trigger={<button className="px-4 py-2 bg-blue-600 text-white rounded-full">Filters</button>}
      title="Filter Results"
      snapPoints={[0.5, 1]}
    >
      <div className="space-y-4">
        <p>Filter content here with nested scrolling support.</p>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        ))}
      </div>
    </BottomSheet>
  );
}
```

---

## 4. Pull-to-Refresh

State machine with `idle → pulling → triggered → refreshing → idle` cycle.

```tsx
// components/PullToRefresh.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type PTRState = "idle" | "pulling" | "triggered" | "refreshing";

const THRESHOLD = 72; // px before triggering refresh

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [state, setState] = useState<PTRState>("idle");
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startYRef.current === null || state === "refreshing") return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta < 0) return;

      // Apply resistance curve — harder to pull further
      const resistance = Math.min(delta * 0.5, THRESHOLD * 1.5);
      setPullDistance(resistance);
      setState(resistance >= THRESHOLD ? "triggered" : "pulling");
    },
    [state]
  );

  const handleTouchEnd = useCallback(async () => {
    if (state === "triggered") {
      setState("refreshing");
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setState("idle");
        setPullDistance(0);
      }
    } else {
      setState("idle");
      setPullDistance(0);
    }
    startYRef.current = null;
  }, [state, onRefresh]);

  const indicatorY = state === "refreshing" ? THRESHOLD : pullDistance;
  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center z-10 transition-transform duration-200"
        style={{ transform: `translateY(${indicatorY - 44}px)` }}
      >
        <div
          className={cn(
            "w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-md",
            "flex items-center justify-center",
            state === "refreshing" && "animate-spin"
          )}
        >
          <svg
            className="w-5 h-5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{
              transform: `rotate(${progress * 360}deg)`,
              transition: state === "refreshing" ? "none" : "transform 0.1s",
              opacity: state === "triggered" ? 1 : 0.6,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="overflow-y-auto overscroll-y-none"
        style={{
          transform: `translateY(${indicatorY > 0 ? Math.min(indicatorY, THRESHOLD) : 0}px)`,
          transition: state === "idle" ? "transform 0.3s ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## 5. Swipe Gestures (Framer Motion)

Install: `npm install framer-motion`

### Swipe-to-Delete List Item

```tsx
// components/SwipeToDelete.tsx
"use client";

import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface SwipeItemProps {
  id: string;
  label: string;
  onDelete: (id: string) => void;
}

function SwipeItem({ id, label, onDelete }: SwipeItemProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);
  const itemOpacity = useTransform(x, [-150, -120], [0, 1]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-red-500">
      {/* Delete reveal */}
      <motion.div
        className="absolute right-0 inset-y-0 w-24 flex items-center justify-center"
        style={{ opacity: deleteOpacity }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </motion.div>

      {/* Draggable item */}
      <motion.div
        className="relative bg-white dark:bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ x, opacity: itemOpacity }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120 || info.velocity.x < -500) {
            onDelete(id);
          }
        }}
      >
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      </motion.div>
    </div>
  );
}

export function SwipeToDeleteList() {
  const [items, setItems] = useState([
    { id: "1", label: "Swipe left to delete this item" },
    { id: "2", label: "Another deletable item" },
    { id: "3", label: "One more item" },
  ]);

  return (
    <div className="space-y-2 p-4">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SwipeItem
              id={item.id}
              label={item.label}
              onDelete={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### Swipe-to-Navigate (Left/Right)

```tsx
// components/SwipeNavigator.tsx
"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const SWIPE_VELOCITY_THRESHOLD = 500;
const SWIPE_DISTANCE_THRESHOLD = 100;

interface SwipeNavigatorProps {
  children: React.ReactNode;
  backHref?: string;
  forwardHref?: string;
}

export function SwipeNavigator({ children, backHref, forwardHref }: SwipeNavigatorProps) {
  const router = useRouter();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  return (
    <motion.div
      style={{ x, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        const { offset, velocity } = info;
        const swipedLeft  = offset.x < -SWIPE_DISTANCE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD;
        const swipedRight = offset.x >  SWIPE_DISTANCE_THRESHOLD || velocity.x >  SWIPE_VELOCITY_THRESHOLD;

        if (swipedLeft && forwardHref) {
          animate(x, -window.innerWidth, { duration: 0.25 }).then(() => router.push(forwardHref));
        } else if (swipedRight && backHref) {
          animate(x,  window.innerWidth, { duration: 0.25 }).then(() => router.back());
        } else {
          animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 6. Touch Feedback Patterns

```css
/* globals.css — base mobile resets */

/* Remove iOS blue highlight flash on tap */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent double-tap zoom on interactive elements */
button, a, [role="button"] {
  touch-action: manipulation;
}

/* Ripple effect — pure CSS, 100ms activation matches native feel */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::after {
  content: "";
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  border-radius: inherit;
  transition: opacity 0s;
}

.ripple:active::after {
  opacity: 0.12;
  transition: opacity 0.1s ease-out; /* 100ms — feels native */
}
```

```tsx
// components/TouchButton.tsx — React ripple with coordinates
"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface RipplePoint { x: number; y: number; id: number }

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function TouchButton({ children, className, ...props }: TouchButtonProps) {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);
  const nextId = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    setRipples((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  return (
    <button
      {...props}
      className={cn(
        "relative overflow-hidden rounded-xl px-5 py-3 font-medium",
        "bg-blue-600 text-white select-none touch-manipulation",
        "active:scale-[0.97] transition-transform duration-100",
        className
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
      onPointerDown={handlePointerDown}
    >
      {ripples.map(({ x, y, id }) => (
        <span
          key={id}
          className="absolute pointer-events-none rounded-full bg-white/30 animate-ripple"
          style={{ left: x - 40, top: y - 40, width: 80, height: 80 }}
        />
      ))}
      {children}
    </button>
  );
}

// tailwind.config.ts — add ripple keyframe
// theme.extend.keyframes.ripple = { "0%": { transform: "scale(0)", opacity: "1" }, "100%": { transform: "scale(4)", opacity: "0" } }
// theme.extend.animation.ripple = "ripple 0.6s linear"
```

---

## 7. Safe Area Insets

Require `viewport-fit=cover` in your HTML `<head>` — without it, `env()` values return `0`.

```html
<!-- app/layout.tsx or _document.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

```css
/* Direct CSS usage */
.fixed-header {
  padding-top: env(safe-area-inset-top);
}

.fixed-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.sidebar {
  padding-left: env(safe-area-inset-left);
}

/* With fallback for non-supporting browsers */
.bottom-sheet {
  padding-bottom: max(env(safe-area-inset-bottom), 16px);
}
```

```js
// tailwind.config.ts — pb-safe utility
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      padding: {
        safe: "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
    },
  },
};
export default config;
```

```tsx
// Usage in components
<footer className="pb-safe px-4 pt-3 fixed bottom-0 inset-x-0 bg-white">
  Footer content
</footer>

// Dynamic calculation — nav height + safe area
<main className="pb-[calc(56px+env(safe-area-inset-bottom))]">
  {children}
</main>
```

---

## 8. Mobile Typography

```tsx
// System font stack gives native OS feel — no font download needed
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      fontFamily: {
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
};
```

```css
/* globals.css */

/* Minimum 16px body text — prevents iOS auto-zoom on input focus */
body {
  font-size: 16px;
  -webkit-text-size-adjust: 100%; /* Prevent font scaling in landscape */
}

/* Dynamic type scale with clamp() */
:root {
  --text-xs:   clamp(0.75rem,  2vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 2.5vw, 1rem);
  --text-base: clamp(1rem,     3vw,  1.125rem);
  --text-lg:   clamp(1.125rem, 3.5vw, 1.25rem);
  --text-xl:   clamp(1.25rem,  4vw,  1.5rem);
  --text-2xl:  clamp(1.5rem,   5vw,  2rem);
  --text-3xl:  clamp(1.875rem, 6vw,  2.5rem);
  --text-hero: clamp(2.5rem,   8vw,  4.5rem);
}

/* Optimize for mobile readability */
p {
  line-height: 1.6;
  max-width: 65ch;
}

/* Tighter headings on small screens */
h1, h2, h3 {
  line-height: 1.2;
  letter-spacing: -0.02em;
}
```

```tsx
// Input font size — must be ≥16px to prevent iOS zoom
<input
  type="text"
  className="text-base w-full" /* text-base = 1rem = 16px */
  placeholder="Search..."
/>

// Select elements also need 16px minimum
<select className="text-base" />
```

---

## 9. Mobile Performance

```tsx
// components/MobileImage.tsx — responsive srcset for mobile
import Image from "next/image";

export function HeroImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={800}
      height={600}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
      priority // Above-fold images: priority (disables lazy load)
      className="w-full h-auto object-cover"
    />
  );
}

// Below-fold images: lazy load (default in Next.js Image)
export function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      sizes="(max-width: 640px) 50vw, 33vw"
      className="w-full h-48 object-cover rounded-lg"
      // loading="lazy" is the default
    />
  );
}
```

```tsx
// components/Skeleton.tsx — prevent layout shift with fixed dimensions
export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {/* Match exact dimensions of real content to avoid CLS */}
      <div className="h-48 w-full bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
      <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
    </div>
  );
}

// Defer offscreen content with Intersection Observer
"use client";
import { useRef, useState, useEffect } from "react";

export function LazySection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" } // Start loading 200px before viewport
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[200px]">
      {visible ? children : <CardSkeleton />}
    </div>
  );
}
```

---

## 10. PWA Patterns

```json
// public/manifest.json
{
  "name": "My App",
  "short_name": "MyApp",
  "description": "App description for store listings",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/mobile.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

```tsx
// app/layout.tsx — iOS PWA meta tags
export const metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Allows content under status bar
    title: "MyApp",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-touch-fullscreen": "yes",
  },
};

// Link tags in <head>
// <link rel="apple-touch-icon" href="/icons/icon-192.png" />
// <link rel="apple-touch-startup-image" href="/splash.png" />
```

```tsx
// components/InstallPrompt.tsx — Add-to-Homescreen banner
"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-4 flex items-center gap-3"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex-1">
        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Add to Home Screen</p>
        <p className="text-xs text-zinc-500 mt-0.5">Install for a faster, app-like experience</p>
      </div>
      <button
        onClick={async () => {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === "accepted") setPrompt(null);
        }}
        className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-xl touch-manipulation"
      >
        <Download className="w-4 h-4" /> Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 text-zinc-400 hover:text-zinc-600 touch-manipulation"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

```tsx
// app/offline/page.tsx — Offline fallback (referenced in service worker)
export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <span className="text-3xl">📡</span>
      </div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">You're offline</h1>
      <p className="text-sm text-zinc-500 mt-2 max-w-xs">
        Check your connection and try again. Some content may be available from cache.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium touch-manipulation"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## 11. Mobile Navigation Patterns

```tsx
// components/MobileDrawer.tsx — Hamburger → slide-in drawer
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/",         label: "Home" },
  { href: "/about",    label: "About" },
  { href: "/work",     label: "Work" },
  { href: "/blog",     label: "Blog" },
  { href: "/contact",  label: "Contact" },
];

export function MobileDrawer() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 touch-manipulation"
        aria-label="Open menu"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel */}
            <motion.nav
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 z-50 flex flex-col shadow-2xl"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setOpen(false)} className="p-2 touch-manipulation">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto py-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-6 py-4 text-base font-medium text-zinc-700 dark:text-zinc-300 active:bg-zinc-100 dark:active:bg-zinc-800 touch-manipulation"
                      style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

```tsx
// Back button behavior in SPAs — use router.back() with fallback
"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({ fallbackHref = "/", label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // window.history.length > 2 means there's a page to go back to
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1 text-blue-600 font-medium touch-manipulation py-2 pr-4"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <ChevronLeft className="w-5 h-5" />
      {label}
    </button>
  );
}
```

---

## 12. Pointer Media Queries

```css
/* Touch targets: min 44×44px (Apple HIG) / 48×48dp (Material) on coarse devices */
@media (pointer: coarse) {
  button,
  a,
  [role="button"],
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
  }

  /* Bigger tap zones for icon-only buttons */
  .icon-btn {
    padding: 10px;
  }

  /* Wider spacing between list items to reduce mis-taps */
  li + li {
    margin-top: 4px;
  }
}

/* Remove ALL hover states on touch devices */
@media (hover: none) {
  .card:hover,
  .btn:hover,
  .link:hover {
    /* Reset to default — no visual change on "hover" */
    background-color: unset;
    transform: unset;
    box-shadow: unset;
    text-decoration: unset;
  }
}

/* Combined: fine pointer with hover support = mouse users only */
@media (hover: hover) and (pointer: fine) {
  .interactive:hover {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
}

/* Tailwind arbitrary variant equivalents */
/*
  Mouse hover:  [@media(hover:hover)_and_(pointer:fine)]:hover:bg-zinc-100
  Touch target: [@media(pointer:coarse)]:min-h-[44px]
  No hover:     [@media(hover:none)]:hover:bg-transparent
*/
```

```tsx
// usePointer hook — runtime detection
"use client";
import { useEffect, useState } from "react";

type PointerType = "coarse" | "fine" | "none";

export function usePointer(): PointerType {
  const [pointer, setPointer] = useState<PointerType>("fine");

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) setPointer("coarse");
    else if (window.matchMedia("(pointer: fine)").matches) setPointer("fine");
    else setPointer("none");
  }, []);

  return pointer;
}

// Usage
export function AdaptiveButton({ children }: { children: React.ReactNode }) {
  const pointer = usePointer();

  return (
    <button
      className={
        pointer === "coarse"
          ? "min-h-[44px] px-6 py-3 text-base"  // Touch: larger target
          : "min-h-[32px] px-4 py-1.5 text-sm"  // Mouse: compact
      }
    >
      {children}
    </button>
  );
}
```
