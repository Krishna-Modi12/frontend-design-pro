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
}

@media print {
  [data-fade] {
    opacity: 1 !important;
    transform: none !important;
  }
  [data-hero-scene],
  [data-hero-scene-canvas],
  [data-hero-fallback] {
    display: none;
  }
  /* The pinned hero sequence never runs on paper, so the caption its
     ScrollTrigger would otherwise reveal has to be visible unconditionally —
     it carries the only prose naming what the object shows. */
  [data-hero-caption] {
    opacity: 1 !important;
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

/*
 * \`<details data-disclosure>\` — the one on-demand-reveal primitive used by
 * \`SectionHow\` and \`SectionInstall\`. A native \`<details>\`
 * is keyboard- and touch-operable for free (no ARIA, no React state), which
 * is why it replaced an earlier hover-only sketch for the same cards — this
 * repo's own renderer harness has caught a hover-only interaction defect on
 * this page before (see CLAUDE.md's \`pages:verify\` findings), so a reveal
 * that only opens on \`:hover\` never shipped here a second time. The marker
 * triangle is removed in favour of the chevron each caller renders itself.
 */
[data-disclosure] > summary {
  list-style: none;
  cursor: pointer;
}
[data-disclosure] > summary::-webkit-details-marker {
  display: none;
}
[data-disclosure] > summary::marker {
  content: "";
}
[data-disclosure] [data-disclosure-chevron] {
  transition: transform 200ms ease-out;
}
[data-disclosure][open] [data-disclosure-chevron] {
  transform: rotate(180deg);
}

/* Card motifs (\`SectionHow.tsx\`) — small, continuous, two-property loops,
   same economy as the keyframes above and covered by the same
   reduced-motion override. */
@keyframes chip-cycle {
  0%, 100% {
    background-color: var(--color-bg-page);
    color: var(--color-text-muted);
  }
  50% {
    background-color: var(--color-accent);
    color: var(--color-accent-ink);
  }
}

@keyframes dim-to-bright {
  0%, 100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

@keyframes crossfade-swap {
  0%, 45% {
    opacity: 1;
  }
  50%, 95% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Hero \`mesh\` world only (\`components/backgrounds/MeshGradient.tsx\`) — a slow
   \`background-position\` drift across the layered radial gradients, covered
   by the global \`prefers-reduced-motion: reduce\` rule above (line ~92),
   which clamps every animation's duration and iteration-count to a single
   1ms frame. No separate reduced-motion branch needed in the component
   itself for that reason — same economy as \`pulse-dot\`/\`chip-cycle\` above. */
@keyframes mesh-drift {
  0%, 100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 12%;
  }
}

/*
 * World system — a per-section "surface texture", layered on top of a
 * section's own EXISTING, UNCHANGED background-color rather than replacing
 * it. This is the reason full-page world variation stays tractable: the
 * part of every section that already clears axe contrast (solid colour
 * behind text) never moves, only a low-opacity image sits on top of it.
 * \`[data-world]\` is set on \`<html>\` by the blocking script in
 * \`app/layout.tsx\` (or by \`WorldProvider\`'s reroll); every section adds
 * one \`data-section-surface\` attribute alongside its existing className —
 * see \`home/lib/worlds.ts\` for the catalog and the verification-scope note.
 *
 * \`signature\` — the default and the deterministic \`?world=signature\` world
 * every automated check and screenshot recapture uses — carries a static
 * grain texture of its own (below). It is the quietest of the four: a
 * desaturated \`feTurbulence\` at 3.5% alpha, no colour, no motion. Paired
 * with the 1px section seams (also below) and the deeper \`bg-surface\` cream
 * (\`../tokens.css\`), it gives the ~7,000px below-hero region a felt surface
 * and legible section boundaries without a gradient, a shadow, or a second
 * hue. Re-verified against \`pages:verify\`'s axe pass.
 *
 * All four textures are intentionally low-opacity (~3.5-6%): the goal is a
 * felt texture, not a colour shift large enough to move an already-computed
 * contrast ratio. \`mesh\`'s three radial gradients read the CURRENT
 * \`--color-accent\` via \`color-mix()\` rather than a hardcoded colour, so it
 * always matches whichever world set that variable — no hex, no rgba(),
 * OKLCH throughout.
 */
[data-section-surface] {
  background-image: var(--world-texture, none);
}

/* Section seams — a single 1px hairline between each pair of consecutive
   below-hero sections. Not on the first one (\`#problem\` follows the Hero,
   which carries no \`data-section-surface\`, so its soft glow bottom blends
   into the section below it untouched). \`--color-border\` carries no WCAG
   floor — it is the decorative-divider treatment \`DESIGN.md\` §6 already
   names. Horizontal only; a vertical rule here would read as the anti-slop
   wall's "broadsheet hairline columns". */
[data-section-surface] + [data-section-surface] {
  border-top: 1px solid var(--color-border);
}

/* \`signature\`'s own grain — same alpha-only desaturated \`feTurbulence\`
   technique as \`grain\` below, tuned down to 3.5% because this one is a
   permanent default rather than an opt-in world, and it is paired with the
   \`bg-surface\` warmth and the seams above. Painted through the same
   \`--world-texture\` channel every other world uses. Applies to the dark
   \`#install\` footer too (as \`grain\` already does) — 3.5% neutral noise
   over an L=18% ground is a barely-there lift. */
[data-world="signature"] [data-section-surface] {
  --world-texture: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.035'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

[data-world="mesh"] [data-section-surface] {
  --world-texture:
    radial-gradient(38% 42% at 15% 20%, color-mix(in oklch, var(--color-accent) 14%, transparent), transparent 70%),
    radial-gradient(32% 36% at 88% 12%, color-mix(in oklch, var(--color-accent) 9%, transparent), transparent 70%),
    radial-gradient(45% 40% at 60% 92%, color-mix(in oklch, var(--color-accent) 7%, transparent), transparent 70%);
}

/* feTurbulence grain, alpha-only (feColorMatrix desaturates it first) so it
   reads as neutral texture on any of the three light grounds rather than a
   colour of its own — \`feFuncA\` caps it at 5% opacity. */
[data-world="grain"] [data-section-surface] {
  --world-texture: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.05'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

/* A quiet, hue-independent dot grid — deliberately not tinted to the
   accent, since it only ever renders under \`data-world="grid"\`, so it
   doesn't need to react to a different world's colour. */
[data-world="grid"] [data-section-surface] {
  --world-texture: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='2' cy='2' r='1.1' fill='%23000' fill-opacity='0.05'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 28px 28px;
}

/* Headline weight per world — see \`home/lib/worlds.ts\`'s \`WorldDef.headlineWeight\`.
   Scoped to \`[data-hero-headline]\` specifically, not the shared \`[data-display]\`
   attribute every section heading also carries, so this never touches a
   heading outside the Hero. \`signature\` restates today's existing 500
   weight explicitly, since the Tailwind \`font-medium\` utility class was
   removed from the element in favour of driving it from here. */
[data-hero-headline] {
  font-weight: 500;
}
[data-world="mesh"] [data-hero-headline] {
  font-weight: 600;
}
[data-world="grain"] [data-hero-headline] {
  font-weight: 400;
}
[data-world="grid"] [data-hero-headline] {
  font-weight: 600;
}

/* \`WorldProvider\`'s reroll sets this attribute on \`<html>\` for ~300ms
   around a swap, giving the accent/texture change a soft cross-fade — four
   properties named explicitly below, per PERF-04R's ban on the catch-all
   shorthand — and scoped to the attribute's brief lifetime so it's never a
   standing cost on every element. Absent entirely under reduced motion —
   the swap applies with no transition rule active, matching every other
   reduced-motion behaviour already in the Hero (freeze, don't mount, skip —
   never slow down). */
@media (prefers-reduced-motion: no-preference) {
  [data-world-transitioning] * {
    transition:
      background-color 260ms ease-out,
      color 260ms ease-out,
      border-color 260ms ease-out,
      fill 260ms ease-out;
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
