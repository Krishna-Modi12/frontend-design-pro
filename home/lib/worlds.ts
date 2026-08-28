/**
 * The curated "world" catalog — a small, hand-designed, individually-audited
 * set picked once per session, not true per-load randomization. Modeled on
 * Impeccable's own "Worlds": a reviewed catalog, a seed that reproduces a
 * whole roll, a reroll that never repeats an already-shown option — not the
 * naive fully-random-per-load pattern, which reads as cheap.
 *
 * Every accent below is OKLCH, computed via the same OKLCH → OKLab → linear
 * sRGB → relative luminance → WCAG pipeline `tokens.css`'s own header
 * documents, never eyeballed. Worst case across the three light grounds
 * (bg-page / bg-surface / bg-elevated):
 *
 *   signature  oklch(55%   0.18 45)   4.92 / 4.50 / 5.19
 *   mesh       oklch(54.6% 0.22 270)  4.97 / 4.55 / 5.25
 *   grain      oklch(52%   0.12 120)  5.05 / 4.63 / 5.33
 *   grid       oklch(55%   0.17 310)  4.98 / 4.56 / 5.26
 *
 * All four clear 4.5:1 AA as text on every light ground and as a fill under
 * white; all four sit around 3.5–3.6:1 against the footer's `bg-invert`,
 * matching `signature`'s own existing large-text/fill-only restriction there
 * (see `tokens.css`'s Accent comment) — none of the four is used for small
 * text on the footer.
 *
 * `signature`'s accent is deliberately unchanged from today's value. The
 * Hero shader's contrast/cooling math (`HeroShaderCanvas.tsx`) was hand-tuned
 * against exactly this accent/bg-page pair, including a prior real bug fix —
 * letting the same shader take an arbitrary hue would put that tuning at
 * risk per-hue. Only `signature` renders through the shader; `mesh`/`grain`/
 * `grid` are pure CSS/SVG, so their accents carry no such risk.
 *
 * Verification, stated per `CLAUDE.md`'s own "state the gap plainly"
 * convention: full `pages:verify` (hydration, axe, overflow) runs in
 * automation against `signature` only, via the `?world=signature`
 * deterministic override every screenshot/verify script uses — this is not
 * full 4-world CI coverage, and nothing here changes that. All 4 worlds
 * (including `grain`/`grid`, previously structural-only) have since been
 * axe-run manually in a real browser with zero violations at any impact
 * level, closing what was originally a stated gap — but a manual pass is a
 * point-in-time check, not a standing one; a future world or accent change
 * needs its own manual axe pass before it can claim the same.
 */

export type WorldId = "signature" | "mesh" | "grain" | "grid";

export interface WorldDef {
  id: WorldId;
  /** oklch() string — the page's one chromatic hue for this world. */
  accent: string;
  accentInk: string;
  accentGlow: string;
  /** Tailwind font-weight utility for the Hero `<h1>` only. */
  headlineWeight: string;
}

export const WORLDS: WorldDef[] = [
  {
    id: "signature",
    accent: "oklch(55% 0.18 45)",
    accentInk: "oklch(100% 0 0)",
    accentGlow: "oklch(55% 0.18 45 / 0.12)",
    headlineWeight: "font-medium",
  },
  {
    id: "mesh",
    accent: "oklch(54.6% 0.22 270)",
    accentInk: "oklch(100% 0 0)",
    accentGlow: "oklch(54.6% 0.22 270 / 0.12)",
    headlineWeight: "font-semibold",
  },
  {
    id: "grain",
    accent: "oklch(52% 0.12 120)",
    accentInk: "oklch(100% 0 0)",
    accentGlow: "oklch(52% 0.12 120 / 0.12)",
    headlineWeight: "font-normal",
  },
  {
    id: "grid",
    accent: "oklch(55% 0.17 310)",
    accentInk: "oklch(100% 0 0)",
    accentGlow: "oklch(55% 0.17 310 / 0.12)",
    headlineWeight: "font-semibold",
  },
];

export const DEFAULT_WORLD_ID: WorldId = "signature";

export function isWorldId(value: string | null): value is WorldId {
  return value !== null && WORLDS.some((world) => world.id === value);
}

export function getWorld(id: WorldId): WorldDef {
  const world = WORLDS.find((candidate) => candidate.id === id);
  if (!world) throw new Error(`Unknown world id: ${id}`);
  return world;
}
