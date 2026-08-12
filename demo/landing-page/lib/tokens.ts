/**
 * Switchyard — the runtime half of the token layer.
 *
 * Everything here is plain CSS a browser can act on directly, injected once by
 * the page shell so it resolves for every <section>, <header> and <footer>
 * beneath it. The design tokens themselves live in `../tokens.css`, because
 * they are declared with `@theme`, and `@theme` is a Tailwind compiler
 * directive rather than CSS: shipped in a runtime <style> it is dropped as an
 * unknown at-rule, taking every utility built from it down with it.
 *
 * The `var(--color-*)` / `var(--font-*)` references below are answered by the
 * variables Tailwind emits from that file, so the values are declared once and
 * read here — never restated.
 */

/**
 * Runtime sheet — the page shell injects this through a <style> tag.
 */
export const tokenStyles = `
:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background-color: var(--color-surface-page);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-synthesis-weight: none;
  text-rendering: optimizeLegibility;
}

/* Anchor targets clear the sticky header instead of hiding under it. */
[id] {
  scroll-margin-top: 5.5rem;
}

/* Figures that update in place must not reflow: monospaced, tabular figures.
   This is the rule behind every number on the page lining up in its column. */
[data-metric] {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

::selection {
  background-color: var(--color-accent);
  color: var(--color-accent-ink);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
`;

/** Horizontal rhythm shared by every section shell on the page. */
export const sectionShell = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

/** Vertical rhythm: 64px on mobile, 96px from lg up. */
export const sectionSpacing = "py-16 sm:py-20 lg:py-24";

/** WCAG 2.2 §2.5.8 — 44×44 minimum hit area on every control. */
export const tapTarget = "min-h-11 min-w-[44px] touch-manipulation";

/** Focus ring: 2px accent plus an offset in the page colour, ≥3:1 on both. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page";

/** Hairline card. Depth comes from the surface step, not from a blurry shadow. */
export const cardShell = "rounded-2xl border border-surface-border bg-surface-elevated";

/** Skeleton block. The pulse is dropped when the reader asks for less motion. */
export const skeletonBlock =
  "animate-pulse rounded bg-surface-border-strong motion-reduce:animate-none";

/** Error surface for inline alerts — tinted toward the error hue, still dark. */
export const alertShell = "rounded-lg border border-error/45 bg-surface-sunken";

const tokens = {
  tokenStyles,
  sectionShell,
  sectionSpacing,
  tapTarget,
  focusRing,
  cardShell,
  skeletonBlock,
  alertShell,
} as const;

export default tokens;
