# Framer Motion Reference

Source: framer/motion (official docs synthesis)

---

## Contents

- [1. When to Use Framer Motion vs GSAP](#1-when-to-use-framer-motion-vs-gsap)
- [2. Core motion.* Components](#2-core-motion-components)
- [3. AnimatePresence](#3-animatepresence)
- [4. Variants System](#4-variants-system)
- [5. Spring Physics Table](#5-spring-physics-table)
- [6. Layout Animations](#6-layout-animations)
- [7. Gesture Animations](#7-gesture-animations)
- [8. Scroll-Driven Animations](#8-scroll-driven-animations)
- [9. Drag](#9-drag)
- [10. Performance](#10-performance)
- [11. React / Next.js Gotchas](#11-react--nextjs-gotchas)
- [12. Exit Animation Patterns](#12-exit-animation-patterns)
- [13. Common Component Recipes](#13-common-component-recipes)

---

## 1. When to Use Framer Motion vs GSAP

| Criterion | Framer Motion | GSAP |
|---|---|---|
| Component enter/exit transitions | ✅ First choice | Overkill |
| Layout morphs (size/position shift) | ✅ `layout` prop handles automatically | Manual with Flip plugin |
| Drag-and-drop interactions | ✅ Built-in `drag` prop | Manual setup |
| Micro-interactions (hover, tap, focus) | ✅ `whileHover`, `whileTap` etc. | Verbose |
| Scroll-driven sequences (pinning, scrubbing) | Partial (`useScroll`) | ✅ ScrollTrigger |
| Complex SVG path animations | Limited | ✅ DrawSVG, MorphSVG |
| Multi-step coordinated timelines | Possible but awkward | ✅ Native timeline API |
| SplitText / character animations | Not built-in | ✅ SplitText plugin |
| React/Next.js integration | ✅ First-class | Third-party wrappers |
| Bundle size sensitivity | LazyMotion ~18KB | ~27KB (core) |
| Server Components compatibility | ❌ Client-only | ❌ Client-only |

**Decision rule:** If you are animating React component lifecycle (mount/unmount/reorder), reach for Framer Motion. If you are orchestrating a cinematic scroll experience or need fine-grained SVG control, reach for GSAP.

---

## 2. Core motion.* Components

Every HTML and SVG element has a `motion.*` equivalent. The `motion` object proxies the element and injects animation capabilities.

```tsx
// Basic usage
import { motion } from "motion/react";

export function BasicMotion() {
  return (
    <motion.div
      // Starting state (before animation)
      initial={{ opacity: 0, y: 24 }}
      // Target animated state
      animate={{ opacity: 1, y: 0 }}
      // State when component is removed (requires AnimatePresence)
      exit={{ opacity: 0, y: -24 }}
      // Controls the physics/duration of the animation
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ padding: "1rem", background: "#f0f0f0", borderRadius: 8 }}
    >
      Hello World
    </motion.div>
  );
}

// motion.span — inline elements
export function HighlightText() {
  return (
    <p>
      This word is{" "}
      <motion.span
        initial={{ color: "#000" }}
        animate={{ color: "#6366f1" }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        animated
      </motion.span>
      .
    </p>
  );
}

// motion.img — images
export function AnimatedImage({ src }: { src: string }) {
  return (
    <motion.img
      src={src}
      alt=""
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ width: "100%", borderRadius: 12 }}
    />
  );
}

// motion.button — interactive elements
export function AnimatedButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ padding: "0.5rem 1.25rem", borderRadius: 6, cursor: "pointer" }}
    >
      {children}
    </motion.button>
  );
}

// Custom components: use motion() factory
import { forwardRef } from "react";

const Card = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div ref={ref} style={{ padding: "1rem", borderRadius: 12, background: "#fff" }}>
      {children}
    </div>
  )
);

const MotionCard = motion(Card);

export function AnimatedCard() {
  return (
    <MotionCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      Content
    </MotionCard>
  );
}
```

### Transition prop reference

```tsx
// Tween
transition={{ duration: 0.3, ease: "easeInOut" }}
transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Custom cubic-bezier

// Spring (physics-based, ignores duration)
transition={{ type: "spring", stiffness: 300, damping: 25, mass: 1 }}

// Inertia (for drag release)
transition={{ type: "inertia", velocity: 200 }}

// Per-property
transition={{
  opacity: { duration: 0.2 },
  y: { type: "spring", stiffness: 200, damping: 20 },
}}
```

---

## 3. AnimatePresence

`AnimatePresence` enables exit animations when components unmount. Without it, components disappear instantly and `exit` props are ignored.

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// --- mode="wait" (default-ish): exit finishes before next enters ---
export function WaitMode() {
  const [page, setPage] = useState(0);

  return (
    <>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>

      {/* key change forces re-mount, triggering initial + exit */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          Page {page}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// --- mode="sync": enter and exit happen simultaneously ---
export function SyncMode() {
  const [show, setShow] = useState(true);

  return (
    <>
      <button onClick={() => setShow((s) => !s)}>Toggle</button>

      <AnimatePresence mode="sync">
        {show && (
          <motion.div
            key="box"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            Visible
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- mode="popLayout": exiting element is popped out of layout flow ---
// Use for lists where remaining items should fill space immediately
export function PopLayoutList() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  return (
    <AnimatePresence mode="popLayout">
      {items.map((item) => (
        <motion.div
          key={item}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => setItems((prev) => prev.filter((i) => i !== item))}
          style={{ padding: "0.5rem", margin: "0.25rem", background: "#e0e7ff", cursor: "pointer" }}
        >
          Item {item} (click to remove)
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// --- key prop forces re-mount on change ---
// Even if the component type is the same, changing key resets initial/exit cycle
export function KeyBasedReset({ userId }: { userId: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={userId}   // <-- changing this causes exit + fresh enter
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Profile for {userId}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 4. Variants System

Variants let you define named animation states and propagate them to children automatically.

```tsx
"use client";

import { motion, Variants } from "motion/react";

// --- Basic variants ---
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

export function VariantCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ padding: "1rem", background: "#fff", borderRadius: 12 }}
    >
      Card content
    </motion.div>
  );
}

// --- Stagger children: parent controls child orchestration ---
const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,    // seconds between each child starting
      delayChildren: 0.1,        // delay before first child starts
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export function StaggerList({ items }: { items: string[] }) {
  return (
    // Parent propagates "visible"/"hidden" down — children inherit variant names
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      style={{ listStyle: "none", padding: 0 }}
    >
      {items.map((item) => (
        // Child only declares variants — NO initial/animate needed here
        <motion.li
          key={item}
          variants={itemVariants}
          style={{ padding: "0.5rem 0", borderBottom: "1px solid #eee" }}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// --- staggerDirection: -1 to stagger in reverse ---
const reverseStagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,   // last child animates first
    },
  },
};

// --- when: "beforeChildren" | "afterChildren" ---
const orchestrated: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",   // parent finishes before children start
      staggerChildren: 0.1,
    },
  },
};

// --- Dynamic variants using a function ---
const dynamicItem: Variants = {
  hidden: (i: number) => ({ opacity: 0, y: i * 10 }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

export function DynamicStagger({ items }: { items: string[] }) {
  return (
    <motion.div initial="hidden" animate="visible">
      {items.map((item, i) => (
        <motion.p
          key={item}
          custom={i}               // passed as argument to variant function
          variants={dynamicItem}
        >
          {item}
        </motion.p>
      ))}
    </motion.div>
  );
}
```

---

## 5. Spring Physics Table

| Preset | stiffness | damping | mass | Feel |
|---|---|---|---|---|
| Snappy | 400 | 30 | 1 | Quick snap, minimal overshoot — good for UI controls |
| Bouncy | 300 | 10 | 1 | Visible bounce — good for playful elements |
| Gentle | 120 | 20 | 1 | Smooth, natural — good for content reveals |
| Slow | 80 | 20 | 1 | Deliberate, heavy — good for large layout shifts |
| No-overshoot | 300 | 35 | 1 | Settles without crossing the target — repeated interactions |

### The number that decides whether it bounces

The presets are a shortcut for one relationship, and knowing it beats memorising
the table:

**critical damping = 2 × √(stiffness × mass)**

Below that value the spring overshoots and comes back; at it, the spring reaches
the target in the shortest time possible without ever crossing it; above it,
there is still no overshoot but the settle is slower. Every row above follows
from that one line — Bouncy sits at 10 against a critical value of ~35, and
Snappy at 30 against ~40, which is why it is described as *minimal* overshoot
rather than none.

The no-overshoot row matters more than it looks. `platform/references/desktop-patterns.md`
argues that motion on a repeated interaction is judged on its hundredth
repetition, and overshoot is the part that wears out — but the pack had no preset
that satisfied its own rule. For `stiffness: 300, mass: 1` the critical value is
`2 × √300 ≈ 34.6`, so **35 is the cheapest damping that never crosses the
target**. Going much higher only makes it sluggish.

*(Prompted by `199-biotechnologies/motion-dev-animations-skill` (MIT), which ships
a no-bounce preset the pack was missing. Its `stiffness: 300, damping: 50` is
labelled "critically damped" and is overdamped by the formula above — it does
avoid overshoot, which is usually the actual goal, at the cost of a slower
settle. The row above is derived from the formula rather than copied.)*

```tsx
import { motion } from "motion/react";

// Snappy — buttons, toggles, chips
<motion.div transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }} />

// Bouncy — badges, tooltips, fun micro-interactions
<motion.div transition={{ type: "spring", stiffness: 300, damping: 10, mass: 1 }} />

// Gentle — cards, modals, drawers, page transitions
<motion.div transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }} />

// Slow — sidebars, full-panel transitions, large hero elements
<motion.div transition={{ type: "spring", stiffness: 80, damping: 20, mass: 1 }} />

// Quick reference: higher stiffness = faster; lower damping = more bounce
// restDelta and restSpeed control when spring is "done" (default: 0.01)
<motion.div
  transition={{
    type: "spring",
    stiffness: 200,
    damping: 20,
    restDelta: 0.001,  // finer resolution before stopping
  }}
/>
```

---

## 6. Layout Animations

Layout animations automatically interpolate between an element's old and new size/position when its layout changes.

```tsx
"use client";

import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import { useState } from "react";

// --- layout prop: auto-animates size and position changes ---
export function ExpandableCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout                            // animates all layout changes
      onClick={() => setExpanded(!expanded)}
      style={{
        padding: "1rem",
        background: "#6366f1",
        color: "#fff",
        borderRadius: 12,
        cursor: "pointer",
        width: expanded ? 320 : 160,
      }}
    >
      <motion.h2 layout="position">Title</motion.h2>   {/* only position, not size */}
      {expanded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Expanded content here.
        </motion.p>
      )}
    </motion.div>
  );
}

// --- layoutId: shared element morphing between two components ---
// The element visually "moves" between mounting/unmounting instances with the same layoutId
export function SharedElementMorph() {
  const [selected, setSelected] = useState<string | null>(null);

  const items = ["A", "B", "C"];

  return (
    <>
      <div style={{ display: "flex", gap: "1rem" }}>
        {items.map((id) => (
          <motion.div
            key={id}
            layoutId={`card-${id}`}        // must be globally unique
            onClick={() => setSelected(id)}
            style={{
              width: 80,
              height: 80,
              background: "#818cf8",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {id}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            layoutId={`card-${selected}`}  // matches the grid item's layoutId
            onClick={() => setSelected(null)}
            style={{
              position: "fixed",
              inset: "10%",
              background: "#818cf8",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "3rem",
              fontWeight: 700,
            }}
          >
            {selected}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- LayoutGroup: synchronize layout animations across separate components ---
// Without LayoutGroup, sibling layout animations don't know about each other
export function SynchronizedList() {
  const [items, setItems] = useState(["Item 1", "Item 2", "Item 3"]);

  return (
    <LayoutGroup>
      {items.map((item) => (
        <motion.div
          key={item}
          layout
          style={{ padding: "0.5rem", background: "#f1f5f9", marginBottom: 4 }}
          onClick={() => setItems((prev) => prev.filter((i) => i !== item))}
        >
          {item}
        </motion.div>
      ))}
    </LayoutGroup>
  );
}

// NOTE: AnimateSharedLayout is DEPRECATED since Framer Motion 5.
// Replace with LayoutGroup + layoutId. Remove any AnimateSharedLayout imports.
```

---

## 7. Gesture Animations

```tsx
"use client";

import { motion } from "motion/react";

// --- whileHover ---
export function HoverCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ padding: "1.5rem", background: "#fff", borderRadius: 12, cursor: "pointer" }}
    >
      Hover me
    </motion.div>
  );
}

// --- whileTap ---
export function TapButton() {
  return (
    <motion.button
      whileTap={{ scale: 0.95, background: "#4f46e5" }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ padding: "0.5rem 1.5rem", background: "#6366f1", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
    >
      Click me
    </motion.button>
  );
}

// --- whileFocus: accessibility-friendly focus indicator ---
export function FocusInput() {
  return (
    <motion.input
      whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px #6366f1" }}
      transition={{ duration: 0.15 }}
      placeholder="Focus me"
      style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6, outline: "none" }}
    />
  );
}

// --- whileDrag ---
export function DraggableChip() {
  return (
    <motion.div
      drag
      whileDrag={{ scale: 1.1, boxShadow: "0 12px 40px rgba(0,0,0,0.2)", cursor: "grabbing" }}
      dragSnapToOrigin                  // snaps back to start position on release
      style={{
        display: "inline-block",
        padding: "0.5rem 1rem",
        background: "#e0e7ff",
        borderRadius: 999,
        cursor: "grab",
        userSelect: "none",
      }}
    >
      Drag me
    </motion.div>
  );
}

// --- whileInView: triggers once when element enters viewport ---
// GOTCHA: By default, whileInView animates to the "animate" state once and STAYS there.
// It does NOT reverse when the element leaves the viewport unless you set amount or use onViewportLeave.
export function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      // viewport: once (default true — fires once and stays animated)
      // To reset on leave: viewport={{ once: false }}
      viewport={{ once: true, amount: 0.3 }}  // 30% visible before triggering
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// --- whileInView that RESETS on leave ---
export function RepeatingReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}          // re-triggers every time element enters
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 8. Scroll-Driven Animations

```tsx
"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
} from "motion/react";

// --- Progress bar: page scroll indicator ---
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  // Apply spring smoothing to raw scroll value
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "#6366f1",
        transformOrigin: "0%",
        zIndex: 100,
      }}
    />
  );
}

// --- Parallax: element moves at a different rate than scroll ---
export function ParallaxSection() {
  const ref = useRef<HTMLDivElement>(null);

  // scrollYProgress tracks 0→1 as this element scrolls through viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],  // [when target bottom hits viewport bottom, when target top hits viewport top]
  });

  // Map scroll 0→1 to y -100→100 pixels
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <div ref={ref} style={{ overflow: "hidden", height: 400, position: "relative" }}>
      <motion.img
        src="/hero-bg.jpg"
        alt=""
        style={{
          y,                          // applied as CSS transform translateY
          width: "100%",
          height: "120%",             // taller than container to allow movement
          objectFit: "cover",
          position: "absolute",
          top: "-10%",
        }}
      />
    </div>
  );
}

// --- useTransform: map one value range to another ---
export function OpacityOnScroll() {
  const { scrollY } = useScroll();
  // Fade header out as user scrolls down from 0→200px
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <motion.header style={{ opacity, position: "sticky", top: 0, background: "#fff" }}>
      Header
    </motion.header>
  );
}

// --- useMotionValue + useVelocity: scroll velocity for tilt effect ---
export function VelocityCard() {
  const x = useMotionValue(0);
  const xVelocity = useVelocity(x);
  const rotateY = useTransform(xVelocity, [-2000, 0, 2000], [-15, 0, 15]);

  return (
    <motion.div
      style={{ x, rotateY, perspective: 800 }}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDrag={() => {}}
    >
      Drag horizontally
    </motion.div>
  );
}

// --- Scroll-linked scale ---
export function ScaleOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <motion.div ref={ref} style={{ scale, opacity, padding: "2rem", background: "#f8fafc", borderRadius: 16 }}>
      Scales in as it enters viewport
    </motion.div>
  );
}
```

---

## 9. Drag

```tsx
"use client";

import { useRef } from "react";
import { motion, useDragControls } from "motion/react";

// --- Basic drag ---
export function BasicDrag() {
  return (
    <motion.div
      drag                            // drag in both x and y
      dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
      dragElastic={0.2}               // 0 = hard stop, 1 = full elasticity (default 0.5)
      dragMomentum={true}             // continue moving on release (default true)
      whileDrag={{ scale: 1.05 }}
      style={{
        width: 80,
        height: 80,
        background: "#6366f1",
        borderRadius: 12,
        cursor: "grab",
      }}
    />
  );
}

// --- Constrained to a container ref ---
export function ConstrainedDrag() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: 300, height: 200, background: "#f1f5f9", borderRadius: 12 }}
    >
      <motion.div
        drag
        dragConstraints={containerRef}  // pass a ref — Framer calculates bounds automatically
        dragElastic={0.05}
        style={{
          position: "absolute",
          width: 60,
          height: 60,
          background: "#818cf8",
          borderRadius: 8,
          top: 70,
          left: 120,
          cursor: "grab",
        }}
      />
    </div>
  );
}

// --- useDragControls: trigger drag from a separate handle element ---
export function DragHandle() {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}           // IMPORTANT: disable default drag listening on the element itself
      style={{
        width: 200,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Drag only starts from this handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        style={{ padding: "0.5rem 1rem", background: "#6366f1", cursor: "grab", color: "#fff" }}
      >
        ⠿ Drag Handle
      </div>
      <div style={{ padding: "1rem" }}>Panel content</div>
    </motion.div>
  );
}

// --- dragSnapToOrigin: snaps back on release ---
export function SnapBackChip() {
  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragElastic={0.5}
      whileDrag={{ scale: 1.1 }}
      style={{
        display: "inline-block",
        padding: "0.4rem 0.9rem",
        background: "#e0e7ff",
        borderRadius: 999,
        cursor: "grab",
      }}
    >
      Snap back
    </motion.div>
  );
}
```

---

## 10. Performance

```tsx
"use client";

import {
  motion,
  MotionConfig,
  LazyMotion,
  domAnimation,
  m,
} from "motion/react";

// --- MotionConfig: global animation settings ---
// Wrap your app or a section to apply defaults to all motion.* children
export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      reducedMotion="user"   // respects prefers-reduced-motion OS setting
    >
      {children}
    </MotionConfig>
  );
}

// --- LazyMotion + domAnimation: reduces bundle size by ~18KB ---
// Replace motion.* with m.* when inside a LazyMotion boundary
// domAnimation includes: animations, variants, gestures, drag, layout
// domMax adds: projecting layout, LayoutGroup (additional ~6KB)

export function LazyApp({ children }: { children: React.ReactNode }) {
  return (
    // features prop accepts a function or the imported feature set
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

export function LazyCard() {
  return (
    // Use m.* instead of motion.* inside LazyMotion
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Lazy loaded animations
    </m.div>
  );
}

// --- Why Framer uses CSS transforms (no layout thrash) ---
// Framer Motion animates transform (translateX, translateY, scale, rotate) and opacity.
// These properties run on the compositor thread — no layout recalculation, no paint.
// Avoid animating: width, height, top, left, margin, padding — these trigger layout.

// GOOD: composited, no layout thrash
<m.div animate={{ x: 100, scale: 1.1, opacity: 0.5 }} />

// BAD: triggers layout recalculation on every frame
// <m.div animate={{ width: 200, marginLeft: 50 }} />  ← avoid

// --- will-change WARNING ---
// Framer Motion automatically adds will-change: transform during animations and removes it after.
// Do NOT manually add will-change: transform to static elements "just in case" —
// it forces GPU layer promotion permanently, consuming extra VRAM and causing visual artifacts.
// Only use it if you know an animation is about to start (e.g. on hover).
```

---

## 11. React / Next.js Gotchas

```tsx
// 1. "use client" is REQUIRED — motion.* components use React hooks internally
// Server Components cannot use motion.* — Next.js will throw at build time.

// ✅ Correct: mark the file as client component
"use client";
import { motion } from "motion/react";

// ❌ Wrong: using motion.* in a Server Component
// app/page.tsx without "use client" will fail

// ---

// 2. AnimatePresence MUST directly wrap conditional renders
// The children should be conditionally rendered, not hidden with CSS

// ✅ Correct
<AnimatePresence>
  {isOpen && <motion.div key="modal" exit={{ opacity: 0 }}>...</motion.div>}
</AnimatePresence>

// ❌ Wrong: AnimatePresence can't detect the exit if hidden via style
<AnimatePresence>
  <motion.div style={{ display: isOpen ? "block" : "none" }}>...</motion.div>
</AnimatePresence>

// ---

// 3. layoutId must be globally unique and stable across renders
// Duplicate layoutIds cause elements to "steal" each other's positions

// ✅ Use a prefixed + data-derived ID
<motion.div layoutId={`card-${item.id}`} />

// ❌ Non-unique
<motion.div layoutId="card" />   // breaks when multiple instances exist

// ---

// 4. Server Components cannot render motion.* directly
// Solution: extract animated parts into a separate Client Component

// app/page.tsx (Server Component — fine)
import { AnimatedHero } from "@/components/AnimatedHero";
export default function Page() {
  return <AnimatedHero />;  // server passes static props to client component
}

// components/AnimatedHero.tsx (Client Component)
"use client";
import { motion } from "motion/react";
export function AnimatedHero() {
  return <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Hello</motion.h1>;
}

// ---

// 5. In Next.js App Router, AnimatePresence for page transitions must be in a layout
// because page.tsx re-renders on navigation but layout.tsx persists

// app/layout.tsx
"use client";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <html>
      <body>
        <AnimatePresence mode="wait">
          <div key={pathname}>{children}</div>
        </AnimatePresence>
      </body>
    </html>
  );
}
```

---

## 12. Exit Animation Patterns

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// --- Page transitions with usePathname ---
export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

// --- Modal with exit animation ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 40,
            }}
          />

          {/* Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              borderRadius: 16,
              padding: "2rem",
              zIndex: 50,
              minWidth: 320,
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- List item removal ---
export function RemovableList() {
  const [items, setItems] = useState(["Buy groceries", "Review PR", "Write tests", "Ship feature"]);

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item}
            layout                           // remaining items slide to fill gap
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, x: -40, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.6rem 0.8rem",
              borderBottom: "1px solid #f1f5f9",
              overflow: "hidden",
            }}
          >
            <span>{item}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((i) => i !== item))}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
            >
              ✕
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

---

## 13. Common Component Recipes

```tsx
"use client";

import { AnimatePresence, motion, Variants } from "motion/react";
import { useRef, useState } from "react";

// --- FadeIn wrapper ---
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.4, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- SlideUp entrance ---
interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}

export function SlideUp({ children, delay = 0, distance = 32 }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// --- StaggerList: renders a staggered list of items ---
const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

interface StaggerListProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}

export function StaggerList({ items, className, itemClassName }: StaggerListProps) {
  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      style={{ listStyle: "none", padding: 0 }}
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={staggerItem} className={itemClassName}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// --- ScaleOnHover card ---
interface ScaleCardProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function ScaleOnHoverCard({ children, onClick }: ScaleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      style={{
        padding: "1.5rem",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </motion.div>
  );
}

// --- PresenceModal: self-contained modal with AnimatePresence ---
interface PresenceModalProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function PresenceModal({ trigger, title, children }: PresenceModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(2px)",
                zIndex: 50,
              }}
            />

            <motion.dialog
              key="dialog"
              open
              initial={{ opacity: 0, scale: 0.9, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 32 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 51,
                border: "none",
                borderRadius: 20,
                padding: "2rem",
                maxWidth: "90vw",
                width: 480,
                boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{title}</h2>
              {children}
              <button
                onClick={() => setOpen(false)}
                style={{
                  marginTop: "1.5rem",
                  padding: "0.5rem 1.25rem",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Usage example combining recipes ---
export function RecipesDemo() {
  const items = ["Design system audit", "Component library", "Animation tokens", "Motion guidelines"];

  return (
    <FadeIn>
      <SlideUp delay={0.1}>
        <h1>My Dashboard</h1>
      </SlideUp>

      <StaggerList
        items={items.map((item) => (
          <ScaleOnHoverCard key={item}>
            <p style={{ margin: 0 }}>{item}</p>
          </ScaleOnHoverCard>
        ))}
      />

      <PresenceModal
        trigger={<button style={{ marginTop: "1rem" }}>Open Modal</button>}
        title="Settings"
      >
        <p>Modal content goes here.</p>
      </PresenceModal>
    </FadeIn>
  );
}
```
