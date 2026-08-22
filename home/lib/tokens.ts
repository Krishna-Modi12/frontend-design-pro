/**
 * home/ — the runtime half of the token layer. See `../tokens.css` for the
 * palette itself and why the split exists.
 */

export const tokenStyles = `
:root {
  color-scheme: light;
}

body {
  margin: 0;
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-synthesis-weight: none;
  text-rendering: optimizeLegibility;
}

/* Lenis drives scroll once it boots (see \`components/SmoothScroll.tsx\`), so
   native \`scroll-behavior: smooth\` is deliberately absent here — the two
   fight over the same anchor jump, and a scripted \`scrollTo\` under native
   smooth-scroll animates instead of landing, which is the failure this repo's
   own screenshot harness had to work around once already on a different page.
   Anchor targets still clear the sticky header without it. */
[id] {
  scroll-margin-top: 4.5rem;
}

[data-display] {
  font-family: var(--font-sans);
  letter-spacing: -0.02em;
  text-wrap: balance;
}

[data-label] {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

[data-metric] {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

::selection {
  background-color: var(--color-accent);
  color: var(--color-accent-ink);
}

/* Marquee track. Two copies of the same list sit side by side; translating
   the pair by exactly -50% loops seamlessly because the second copy is
   pixel-identical to the first. Duration is set per-instance from measured
   track width at 40px/s — see \`components/Marquee.tsx\` — never a fixed
   duration, or the loop speed drifts with content length. */
@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

[data-marquee-track] {
  animation: marquee-scroll linear infinite;
  animation-duration: var(--marquee-duration, 30s);
}

[data-marquee]:hover [data-marquee-track] {
  animation-play-state: paused;
}

/* The belt to \`useFadeUp\`'s braces, same reasoning \`demo/landing-page\`
   documents: the hook checks the media query once at mount and reveals
   immediately when it matches, but a reader who turns the preference ON
   after mount would otherwise strand sections at opacity 0 with no way to
   reveal them. A scroll reveal that can strand its own content is worse than
   no reveal. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
  [data-fade] {
    opacity: 1 !important;
    transform: none !important;
  }
  /* The marquee's generic 1ms override above would make it snap-loop rather
     than stop, which reads as a flicker rather than as motion removed —
     paused is the honest state for a decoration whose only job is scrolling. */
  [data-marquee-track] {
    animation-play-state: paused !important;
  }
}

@media print {
  [data-fade] {
    opacity: 1 !important;
    transform: none !important;
  }
  [data-marquee-track] {
    animation: none !important;
  }
  [data-hero-scene] {
    display: none;
  }
}

/* Slop card violation badge (\`ProblemComparison.tsx\`) — purely decorative,
   inside an \`aria-hidden\` subtree, covered by the generic reduced-motion
   rule above like every other keyframe on this page. */
@keyframes pulse-dot {
  0%, 100% {
    opacity: 0.5;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* Kinetic-type gallery card (\`MockUIGallery.tsx\`). */
@keyframes kinetic-rise {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.55;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* 3D-hero gallery card (\`MockUIGallery.tsx\`) — a CSS \`rotate3d\`/\`perspective\`
   illusion, not a second WebGL canvas; Three.js stays confined to the real
   hero background. */
@keyframes card-spin-3d {
  from {
    transform: rotateY(0deg) rotateX(-8deg);
  }
  to {
    transform: rotateY(360deg) rotateX(-8deg);
  }
}
`;

/** Horizontal rhythm shared by every section shell on the page. */
export const sectionShell = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-8";

/** Vertical rhythm — the brief's 128px between sections, tighter on mobile. */
export const sectionSpacing = "py-16 sm:py-24 lg:py-32";

/** WCAG 2.2 §2.5.8 — 44×44 minimum hit area on every control. */
export const tapTarget = "min-h-11 min-w-[44px] touch-manipulation";

/** Focus ring: 2px accent plus an offset in the page colour. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page";

/** Card radius — one value everywhere, per the brief's token spec (16px). */
export const cardShell = "rounded-2xl border border-border bg-bg-elevated";

/** One interior inset for every card on the page. */
export const cardInset = "p-6 lg:p-8";

/**
 * The scroll reveal, as a class string. Paired with `useFadeUp`.
 *
 * Both animated properties are named explicitly — `transition: all` is exactly
 * what constraint `PERF-04R` (and `core/design-tokens.md`'s Motion section)
 * bans, because the catch-all makes the compositor watch every animatable
 * property in order to change two of them. The brief's own entrance easing is
 * kept (`cubic-bezier(0.16, 1, 0.3, 1)`) — still ease-out family, which is the
 * actual constraint (`MOTION-02` / never `ease-in` on an entrance).
 */
export const fadeUp = (visible: boolean): string =>
  `transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
  }`;

const tokens = {
  tokenStyles,
  sectionShell,
  sectionSpacing,
  tapTarget,
  focusRing,
  cardShell,
  cardInset,
  fadeUp,
} as const;

export default tokens;
