/**
 * Bellwether — the runtime half of the token layer.
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
  color-scheme: light;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background-color: var(--color-surface-page);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-synthesis-weight: none;
  text-rendering: optimizeLegibility;
}

/* Anchor targets clear the sticky header instead of hiding under it. */
[id] {
  scroll-margin-top: 5.5rem;
}

/* The display face, and the three axes that make Fraunces worth choosing.

   \`font-optical-sizing: auto\` is deliberately left to do its job: it drives the
   \`opsz\` axis from the rendered font size, so a 96px headline is drawn with the
   thin hairlines and tight spacing a display cut wants, and a 20px subhead in
   the same family is drawn with the sturdier stems a text cut wants. Setting
   \`opsz\` by hand in font-variation-settings would switch that off — per spec,
   an explicit \`opsz\` wins over \`auto\` — and freeze one optical size across
   every size on the page, which is the thing optical sizing exists to prevent.

   SOFT and WONK are pinned to 0 on purpose. They are Fraunces' personality
   axes: SOFT rounds the terminals and WONK swaps in the splayed, canted
   alternates. Dialled up they are charming and unmistakably novelty; at 0 the
   face is a high-contrast editorial serif that can carry a product page. The
   axes are the reason to use this font — a decision to leave them at zero is
   still a decision, and it is only available because they are addressable.

   \`wght\` is NOT set here, which is what lets Tailwind's \`font-medium\` and
   \`font-semibold\` keep working on these elements: font-variation-settings only
   binds the axes it names, so \`font-weight\` still maps to \`wght\` by itself. */
[data-display] {
  font-family: var(--font-display);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 0, "WONK" 0;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

/* Eyebrows and small caps. +0.08em because uppercase set at text sizes closes
   up without it — the counters stop reading and the word turns into a block.

   This rule OWNS the size. It is an attribute selector, so it ties with a
   Tailwind class on specificity and wins on source order — this sheet is
   injected into the body, after the stylesheet in <head>. Every \`data-label\`
   element carried a \`text-xs\` that did nothing: they all rendered at 14px, and
   the class said 12px. Measured, then deleted. Do not add a text-size utility
   to a \`data-label\` element; change this value instead. 14px is also the floor
   \`core/design-tokens.md\` sets for labels, so the accident happened to be
   compliant and the class would have been the violation. */
[data-label] {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

/**
 * Hairline card. On this palette the raised surface is *lighter* than the page
 * and carries a two-layer shadow — see the elevation note in `tokens.css` for
 * why a light theme has to reach for the shadow where the dark one did not.
 */
export const cardShell =
  "rounded-2xl border border-surface-border bg-surface-raised shadow-card";

/**
 * One interior inset for every card on the page — 24px, 32px from `lg`.
 *
 * These were three different values before they were measured: the bento cards
 * sat at 28px, the testimonials at 32px and the report's rows at 24px. Nothing
 * reads as *wrong* on its own, but content in adjacent cards started at three
 * different distances from its own edge, which is what makes a page feel
 * slightly out of true without any single element looking broken.
 *
 * `cardInsetX` is the horizontal half, for cards whose internal dividers run
 * edge to edge and therefore need their padding on the rows rather than the
 * shell.
 */
export const cardInset = "p-6 lg:p-8";
export const cardInsetX = "px-6 lg:px-8";

/** Skeleton block. The pulse is dropped when the reader asks for less motion. */
export const skeletonBlock =
  "animate-pulse rounded bg-surface-sunken motion-reduce:animate-none";

/** Error surface for inline alerts — tinted toward the error hue, still light. */
export const alertShell = "rounded-xl border border-error/35 bg-surface-raised";

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
