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
 *   signature  oklch(50.5% 0.088 225) 5.40 / 4.94 / 5.70
 *   mesh       oklch(54.6% 0.22 270)  4.97 / 4.55 / 5.25
 *   grain      oklch(52%   0.12 120)  5.05 / 4.63 / 5.33
 *   grid       oklch(55%   0.17 310)  4.98 / 4.56 / 5.26
 *
 * All four clear 4.5:1 AA as text on every light ground and as a fill under
 * white; all four sit between 3.29 and 3.57:1 against the footer's
 * `bg-invert`, matching `signature`'s own existing large-text/fill-only
 * restriction there (see `tokens.css`'s Accent comment) — none of the four is
 * used for small text on the footer.
 *
 * `signature` is the one that changed. It was a terracotta at H 45 for the
 * pack's whole life; `tokens.css`'s Accent comment carries the three measured
 * reasons it is a marine blue now, the short version being that it was out of
 * gamut, it was ΔE 0.085 from `--color-danger`, and the palette it belonged to
 * is one the pack's own wall tells agents not to reach for. The other three
 * worlds are untouched. Worth noting what the move bought at the level of the
 * set: the four accents now sit at H 120 / 225 / 270 / 310 instead of
 * stranding one of them down at H 45, between the two status hues.
 *
 * **All four worlds now render the hero's object.** They did not use to: the
 * shader this replaced carried contrast and cooling maths hand-tuned against
 * the `signature` accent/bg-page pair specifically, so letting it take an
 * arbitrary hue would have put that tuning at risk per-hue, and only
 * `signature` reached WebGL at all. `HeroDepthScene` has no per-hue tuning —
 * it reads `--color-accent` at mount and lights one object with it, over the
 * page's own ink — so a world is now a ground texture and a hue rather than a
 * different hero. The four accents below are still what makes each world
 * legible, and the ratios above are still what makes each one legal.
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
    accent: "oklch(50.5% 0.088 225)",
    accentInk: "oklch(100% 0 0)",
    accentGlow: "oklch(50.5% 0.088 225 / 0.12)",
    headlineWeight: "font-medium",
  },
  {
    id: "mesh",
    accent: "oklch(54.6% 0.22 270)",
    accentInk: "oklch(100% 0 0)",
    accentGlow: "oklch(54.6% 0.22 270 / 0.12)",
    headlineWeight: "font-medium",
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
    headlineWeight: "font-medium",
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
