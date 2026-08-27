import type { CheckerRule } from "./checkerRules";

/**
 * Presentation-only mapping from `checkerRules.ts`'s own severity field to
 * the tokens in `tokens.css`'s Severity block — shared by the editor gutter
 * and the findings list so a line's dot and its collapsed row always agree.
 * Reads `CheckerRule["severity"]` rather than redeclaring the three levels,
 * so a fourth severity added to the suite fails `tsc` here instead of
 * silently rendering as `medium`.
 */
const RANK: Record<CheckerRule["severity"], number> = {
  critical: 3,
  high: 2,
  medium: 1,
};

/** Highest-severity-wins ordering, for a gutter line with more than one finding. */
export function severityRank(severity: CheckerRule["severity"]): number {
  return RANK[severity];
}

export function severityColor(severity: CheckerRule["severity"]): string {
  if (severity === "critical") return "var(--color-danger)";
  if (severity === "high") return "var(--color-warning)";
  return "var(--color-text-muted)";
}
