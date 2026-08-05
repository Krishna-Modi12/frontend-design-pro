/**
 * Tracepoint — design tokens.
 *
 * One material, one hue: every surface step holds H≈258 and moves only in
 * lightness, which is what keeps a dark shell from reading as five unrelated
 * greys stacked on each other. `tokenStyles` is injected once by the page shell
 * so the variables resolve for every <section>, <header> and <footer> beneath
 * it. OKLCH only — no hex anywhere — and the deepest surface is
 * oklch(13.8% 0.010 258) rather than pure black, so elevation stays legible on
 * OLED and the hairlines do not disappear.
 */

/** Display + UI face. Geist carries the brand; Manrope covers the swap window. */
export const fontGeistSans = '"Geist", "Manrope", ui-sans-serif, system-ui, sans-serif';

/** Data, code, identifiers — anything that has to align in a column. */
export const fontGeistMono = '"Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, monospace';

/**
 * Runtime sheet — the page shell injects this through a <style> tag.
 *
 * It holds only what a browser can act on directly. The design tokens themselves
 * live in `../tokens.css`, because they are declared with `@theme`, and `@theme`
 * is a Tailwind compiler directive rather than CSS: shipped in a runtime <style>
 * it is dropped as an unknown at-rule, taking every utility built from it
 * (`bg-surface`, `text-ink-muted`, `border-hairline`) down with it. That is where
 * `bg-surface` stopped resolving.
 *
 * The `var(--color-*)` / `var(--font-*)` references below are answered by the
 * variables Tailwind emits from that file, so the values are declared once and
 * read here — never restated.
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
  background-color: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-synthesis-weight: none;
  text-rendering: optimizeLegibility;
}

/* Anchor targets clear the sticky header instead of hiding under it. */
[id] {
  scroll-margin-top: 5.5rem;
}

/* Figures that update in place must not reflow: monospaced, tabular figures. */
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

/** Focus ring: 2px accent plus an offset in the surface colour, ≥3:1 on both. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** Hairline card. Depth comes from the surface step, not from a blurry shadow. */
export const cardShell = "rounded-2xl border border-hairline bg-surface-raised";

/** Skeleton block. The pulse is dropped when the reader asks for less motion. */
export const skeletonBlock = "animate-pulse rounded bg-hairline motion-reduce:animate-none";

/** Error surface for inline alerts — tinted toward the error hue, still dark. */
export const alertShell = "rounded-lg border border-error/45 bg-surface-sunken";

const tokens = {
  fontGeistSans,
  fontGeistMono,
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
