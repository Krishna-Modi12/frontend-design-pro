# Scroll-Driven Experiences

## Approach decision tree

```
Scroll animation needed?
├── Section reveals (fade in on scroll) → Framer Motion + viewport detection
├── Scroll-scrubbed timeline (element moves with scroll) → GSAP ScrollTrigger
├── Parallax depth layers → GSAP ScrollTrigger or CSS scroll-timeline
├── Sticky pin sequence (step-through storytelling) → GSAP pin + scrub
├── Cinematic fly-through hero → scroll-scrubbed video (see below)
└── CSS-only scroll progress → CSS scroll-timeline (modern browsers)
```

## Framer Motion — viewport reveal (most common)

The numbers below are the canonical reveal, defined once in
`animation-framework.md` § *The canonical scroll reveal*. This is a whole section
block, so it takes the section tier — `y: 48`, `duration: 0.6`. An item inside a
list takes `y: 24`, `duration: 0.5`. Change them there, not here.

```tsx
import { motion, useInView } from "motion/react";
import { useRef } from "react";

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## Framer Motion — staggered children

```tsx
// Canonical reveal — animation-framework.md § The canonical scroll reveal.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
};

// `margin` is part of the config, not optional: without it the first item fires
// at the viewport edge and the cascade starts late.
<motion.ul
  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-80px" }}
>
  {items.map((item) => (
    <motion.li key={item.id} variants={item}>{item.label}</motion.li>
  ))}
</motion.ul>
```

## Framer Motion — scroll progress bar

```tsx
import { useScroll, useSpring, motion } from "motion/react";

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-50"
    />
  );
}
```

## Framer Motion — parallax layers

```tsx
import { useScroll, useTransform, motion } from "motion/react";

function ParallaxHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);    // background moves slower
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);   // fades out

  return (
    <div ref={ref} className="relative h-[100svh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src="/hero-bg.jpg" alt="" className="w-full h-[150%] object-cover" />
      </motion.div>
      <motion.div style={{ opacity }} className="relative z-10 flex items-center h-full">
        <h1 className="text-7xl font-black text-white">Hero</h1>
      </motion.div>
    </div>
  );
}
```

## GSAP ScrollTrigger — section reveal

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

gsap.from(".section-content", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 75%",
    toggleActions: "play none none reverse",
  },
  opacity: 0,
  y: 48,
  stagger: 0.12,
  duration: 0.7,
  ease: "power3.out",
});
```

## GSAP ScrollTrigger — scrubbed counter

```js
gsap.to(".counter", {
  scrollTrigger: {
    trigger: ".stats-section",
    start: "top center",
    end: "bottom center",
    scrub: true,
  },
  innerText: 1000,
  snap: { innerText: 1 },
  duration: 2,
  ease: "none",
});
```

## GSAP — Pinned storytelling sequence

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".story",
    start: "top top",
    end: "+=400%",
    pin: true,
    scrub: 1,
  }
});

// Steps — each panel fades in/out as user scrolls
tl.fromTo(".step-1", { opacity: 0 }, { opacity: 1, duration: 0.25 })
  .fromTo(".step-1", { opacity: 1 }, { opacity: 0, duration: 0.25 })
  .fromTo(".step-2", { opacity: 0 }, { opacity: 1, duration: 0.25 })
  .fromTo(".step-2", { opacity: 1 }, { opacity: 0, duration: 0.25 });
```

## CSS scroll-timeline (native, no JS)

```css
/* Scroll progress bar */
@property --scroll {
  syntax: "<number>";
  initial-value: 0;
  inherits: false;
}

@keyframes grow-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  transform-origin: left;
  animation: grow-bar linear both;
  animation-timeline: scroll(root);
}

/* Reveal on scroll — CSS only */
@keyframes reveal {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

.reveal-on-scroll {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
```

## Scroll-scrubbed video

Driving `video.currentTime` from scroll position — the cinematic "fly through" hero. Reach for
it when the shot exceeds a WebGL budget. Three details decide whether it locks to the finger:

- **Seek a blob, not the network.** A streamed `<video>` seeks to whatever keyframe it has
  buffered, so scrubbing stalls or snaps. Fetch once, seek an object URL.
- **Never assign `currentTime` from the scroll event.** Lerp toward it in a RAF loop — the
  discipline `lenis-smooth-scroll.md` applies to scroll position, applied to time.
- **Keyframe density is a device tier, not a constant.** A decoder's seek cost scales with how
  many frames it must decode from the nearest keyframe, so a master that scrubs cleanly on a
  laptop stutters on a phone. Encode twice — desktop `-g 8` at 1080p/CRF 20, mobile `-g 4` at
  720p/CRF 23: twice the keyframes for roughly half the seek-decode work, and half the bytes on
  cellular. `-g 1` (all-intra) buys instant seeks at a large size cost, for when scrubbing still
  stutters. Ship separate 16:9 and 9:16 encodes rather than `object-cover` cropping one.

The tier numbers come from `oso95/scroll-world`, whose pipeline scrubs commissioned video. Its
asset procurement does not transfer to generated code; the encoding discipline does, and it turns
"short GOPs" — which cannot be followed — into a number that can.

```tsx
function ScrubVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const target = useRef(0);

  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let url = "";
    fetch(src).then(r => r.blob()).then(b => { url = URL.createObjectURL(b); v.src = url; });

    const onScroll = () => {
      const { top, height } = v.parentElement!.getBoundingClientRect();
      target.current = Math.min(Math.max(-top / (height - innerHeight), 0), 1);
    };
    addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const tick = () => {
      if (v.duration) v.currentTime += (target.current * v.duration - v.currentTime) * 0.1;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); URL.revokeObjectURL(url); };
  }, [src]);

  return (
    <div className="relative h-[400vh]">
      <video ref={ref} muted playsInline preload="auto" poster="/hero-poster.jpg"
             className="sticky top-0 h-[100svh] w-full object-cover" />
    </div>
  );
}
```

`muted` and `playsInline` are load-bearing — iOS refuses programmatic seeking without them.
Under reduced motion the effect returns early and `poster` stands in.

**Cut the poster from the encode, one per orientation.** The single `poster` above is landscape
and the section ships two encodes, so a portrait phone paints a poster the first video frame then
replaces — a visible flash. Extract each poster from frame 0 of the encode it fronts rather than
authoring it separately: when two artifacts have to agree, derive one from the other instead of
maintaining both. Same argument as deriving this pack's documented figures from a gate run.

## prefers-reduced-motion — scroll animations

```tsx
// Framer Motion
const shouldReduce = useReducedMotion();
const y = useTransform(scrollYProgress, [0, 1], shouldReduce ? ["0%", "0%"] : ["0%", "50%"]);

// GSAP
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced) {
  gsap.from(".reveal", { scrollTrigger: { trigger: ".section" }, opacity: 0, y: 40 });
}

// CSS
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll { animation: none; opacity: 1; transform: none; }
}
```

## Performance

- Never scroll-animate `width`, `height`, `top`, `left` — transforms only
- `ScrollTrigger.refresh()` after dynamic content loads or font swap
- Batch multiple scroll triggers — one `gsap.context()` per page section
- Use `once: true` in Framer Motion viewport for elements that shouldn't re-animate
- Throttle JS scroll listeners: `requestAnimationFrame` or `passive: true` event
- Test scroll jank with Chrome DevTools Performance tab — 60fps target
