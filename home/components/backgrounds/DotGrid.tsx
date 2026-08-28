import type { ReactElement } from "react";

/** Hue-independent by design (plain black at low opacity, not the accent) —
    it only ever renders under the `grid` world, so it doesn't need to react
    to a different world's colour, matching the page-wide
    `[data-world="grid"] [data-section-surface]` texture in `lib/tokens.ts`. */
const DOT_GRID_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='2' cy='2' r='1.4' fill='%23000' fill-opacity='0.14'/%3E%3C/svg%3E\")";

/**
 * Hero's `grid` world background — a quiet dot grid over `HeroBackground`'s
 * shared base gradient, radially masked so it fades out toward the edges
 * instead of fighting the headline (the Aceternity pattern noted in Phase 0
 * research: an SVG pattern plus a radial fade mask). Bolder than the
 * page-wide `grid` texture in `lib/tokens.ts` (14% fill vs. that layer's 5%)
 * — the Hero is the one section built to carry a stronger decorative layer.
 * No animation, so no reduced-motion branch is needed here either.
 */
export function DotGrid(): ReactElement {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: DOT_GRID_SVG,
        backgroundRepeat: "repeat",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(70% 70% at 50% 40%, black 0%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(70% 70% at 50% 40%, black 0%, transparent 85%)",
      }}
    />
  );
}

export default DotGrid;
