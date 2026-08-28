import type { ReactElement } from "react";

/** Alpha is capped inside the filter itself (`feFuncA slope`), not via a CSS
    `opacity` that would also dim `HeroBackground`'s shared base gradient
    sitting underneath this layer — desaturated (`feColorMatrix saturate 0`)
    so it reads as neutral texture rather than a colour of its own. */
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.12'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Hero's `grain` world background — a static `feTurbulence` grain layer over
 * `HeroBackground`'s shared base gradient. Static, not animated: the plan's
 * two options were "static or a slow opacity pulse," resolved to static here
 * — one fewer thing needing a reduced-motion decision, and grain reads as
 * texture either way.
 */
export function GrainOverlay(): ReactElement {
  return (
    <div className="absolute inset-0" style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: "repeat" }} />
  );
}

export default GrainOverlay;
