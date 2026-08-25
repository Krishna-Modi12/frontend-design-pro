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
  color-scheme: dark;
}

/* Remove this rule if the page adopts Lenis — Lenis drives scroll position from
   a rAF loop and the two fight. See skills/animations/references/lenis-smooth-scroll.md */
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

/* The display treatment. Geist Sans carries it — there is no separate display
   family on this page any more.

   The previous version set an editorial serif here with three variable axes.
   It was the right call for a light editorial page and the wrong one for a
   developer tool: a high-contrast serif at 80px over a schema-migration product
   read as a magazine cover about databases. One family, worked hard, is the
   tighter answer — weight and tracking carry the hierarchy instead of a second
   typeface doing it.

   \`wght\` is deliberately NOT pinned in font-variation-settings, which is what
   lets Tailwind's \`font-medium\` and \`font-semibold\` keep working on these
   elements: font-variation-settings only binds the axes it names. */
[data-display] {
  font-family: var(--font-sans);
  letter-spacing: -0.022em;
  text-wrap: balance;
}

/* Eyebrows and small caps. +0.12em because uppercase set at text sizes closes
   up without it — the counters stop reading and the word turns into a block.
   Wider than the light version's 0.08em: on a dark ground, light-on-dark type
   blooms optically and needs marginally more air to stay legible.

   This rule OWNS the size. It is an attribute selector, so it ties with a
   Tailwind class on specificity and wins on source order — this sheet is
   injected into the body, after the stylesheet in <head>. Do not add a
   text-size utility to a \`data-label\` element; change this value instead.
   13px is the floor \`core/design-tokens.md\` sets for uppercase labels. */
[data-label] {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.12em;
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

/* The belt to \`useFadeUp\`'s braces. The hook already checks the media query in
   JS and reveals immediately when it matches — this exists for the case the
   hook cannot cover: a reader who turns the preference ON after mount, whose
   sections would otherwise stay at opacity 0 forever with no way to reveal
   them. A scroll-reveal that can strand content is worse than no reveal. */
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
  [data-fade] {
    opacity: 1 !important;
    transform: none !important;
  }
}

/* Print gets everything, unconditionally.

   A reveal keyed to scrolling assumes a reader who scrolls. Print has no
   viewport to scroll, so every section below the first page would come out
   blank — the same failure that produced a full-page screenshot of five empty
   bands before the capture harness was taught to walk the page. Anything that
   renders without scrolling hits this, and print is the one such context the
   page can defend itself in from CSS alone. */
@media print {
  [data-fade] {
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

/** Horizontal rhythm shared by every section shell on the page. */
export const sectionShell = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

/**
 * Vertical rhythm — tighter than the light page, which ran `py-16 sm:py-20
 * lg:py-24` and read as loose at 1920. Sections are dense enough here that the
 * band between them does not also have to be generous.
 */
export const sectionSpacing = "py-14 sm:py-16 lg:py-20";

/** WCAG 2.2 §2.5.8 — 44×44 minimum hit area on every control. */
export const tapTarget = "min-h-11 min-w-[44px] touch-manipulation";

/** Focus ring: 2px accent plus an offset in the page colour, ≥3:1 on both. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page";

/**
 * Hairline card. On this palette the elevated surface is only 1.05:1 against
 * the page, so the *border* is what makes a card read as a card — see the
 * elevation note in `tokens.css` for why a dark theme cannot lean on the shadow
 * the way the light one did.
 */
export const cardShell =
  "rounded-xl border border-surface-border bg-surface-elevated shadow-card";

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
  "animate-pulse rounded bg-surface-border/60 motion-reduce:animate-none";

/** Error surface for inline alerts — tinted toward the error hue, still dark. */
export const alertShell = "rounded-xl border border-error/35 bg-surface-elevated";

/**
 * The scroll reveal, as a class string. Paired with `useFadeUp`.
 *
 * `data-fade` is not decoration: the reduced-motion block above targets it, so
 * anything using this must carry the attribute or it loses the safety net.
 */
export const fadeUp = (visible: boolean): string =>
  // Both animated properties are named explicitly rather than using the
  // catch-all keyword, which PERF-04 flags and correctly: the catch-all makes
  // the compositor watch every animatable property on the element in order to
  // change two of them.
  //
  // The keyword is not written out anywhere in this file, deliberately. PERF-04R
  // is a regex over source, so a comment quoting it to explain the rule reads as
  // a use of it — this exact comment failed the check on its first draft, which
  // is the third time that trap has fired in this repo.
  `transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
  }`;

const tokens = {
  tokenStyles,
  sectionShell,
  sectionSpacing,
  tapTarget,
  focusRing,
  cardShell,
  cardInset,
  cardInsetX,
  skeletonBlock,
  alertShell,
  fadeUp,
} as const;

export default tokens;
