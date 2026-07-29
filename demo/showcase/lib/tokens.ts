/**
 * Nexus design tokens.
 *
 * All colors are OKLCH. No raw hex is permitted in component files —
 * components must reference these tokens (or the CSS variables they
 * mirror in `app/globals.css`), never `#000`, `bg-black`, or ad hoc hex.
 */

export const colors = {
  /** Near-black canvas background. */
  bgBase: "oklch(12% 0.01 260)",
  /** Slightly lifted surface, used for cards/panels. */
  bgSurface: "oklch(17% 0.012 260)",
  /** Raised surface, e.g. hover states, inputs. */
  bgRaised: "oklch(21% 0.014 260)",
  /** Hairline borders on dark surfaces. */
  border: "oklch(28% 0.014 260)",
  /** Primary text. */
  textPrimary: "oklch(96% 0.005 260)",
  /** Secondary / muted text. */
  textMuted: "oklch(70% 0.012 260)",
  /** Faint tertiary text (labels, captions). */
  textFaint: "oklch(52% 0.012 260)",
  /** The single accent: acid green. Use sparingly. */
  accent: "oklch(70% 0.25 145)",
  /** Accent, dimmed for hover-adjacent states. */
  accentDim: "oklch(58% 0.2 145)",
  /** Accent, for glow/shadow use at low opacity. */
  accentGlow: "oklch(70% 0.25 145 / 0.35)",
  /** Danger/error state — kept desaturated so it never competes with the accent. */
  danger: "oklch(62% 0.19 25)",
} as const;

export const fonts = {
  display: "var(--font-manrope)",
  mono: "var(--font-jetbrains-mono)",
} as const;

export type ColorToken = keyof typeof colors;
