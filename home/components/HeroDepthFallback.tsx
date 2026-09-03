import type { ReactElement } from "react";
import type { ReferenceRecord } from "../lib/data.types";

export interface HeroDepthFallbackProps {
  references: ReferenceRecord[];
  className?: string;
}

/**
 * The zero-JS, zero-WebGL rendering of the hero's object.
 *
 * This is the permanent paint below 640px, where the scene never mounts at
 * all (`motion-budget.md`'s heavy-background rule — the saving only counts if
 * the canvas is absent rather than hidden), the paint already on screen while
 * the `three` chunk loads above that width, and the floor every other failure
 * path lands on: no WebGL context, a lost context, or a device that misses
 * the frame budget.
 *
 * It is a real fallback rather than an empty box, and it is the same object:
 * one band per skill, height proportional to the summed token count of that
 * skill's references, rim-lit from the same side by the same accent token.
 * Aggregating 19 bands out of the corpus rather than drawing all of its
 * references is deliberate — at a phone's width a per-reference band is under
 * a pixel, so the honest simplification is a coarser view of the same tree,
 * not a decorative stand-in for it.
 *
 * Server-rendered: no hooks, no client boundary, no hydration cost. It is
 * also what a reader with JavaScript disabled sees, which is why the
 * proportions come from real data rather than a hardcoded set of heights.
 */
export function HeroDepthFallback({
  references,
  className,
}: HeroDepthFallbackProps): ReactElement {
  const bySkill = new Map<string, number>();
  for (const ref of references) {
    bySkill.set(ref.skill, (bySkill.get(ref.skill) ?? 0) + ref.tokens);
  }
  const bands = [...bySkill.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const total = bands.reduce((sum, [, tokens]) => sum + tokens, 0);

  return (
    <div
      aria-hidden="true"
      data-hero-fallback
      className={`flex flex-col justify-center gap-[2px] ${className ?? ""}`}
    >
      {bands.map(([skill, tokens], index) => (
        <div
          key={skill}
          className="w-full rounded-[1px] bg-text-primary"
          style={{
            height: `${(tokens / total) * 100}%`,
            // Rim light: the same key direction the scene lights from, as a
            // static ramp. Opacity carries it, so no second colour enters the
            // page — the band is ink, lit by nothing but its own alpha. The
            // range is deliberately wide: a first pass ran 0.10–0.24 and the
            // object was so faint on cream that the whole sub-640px hero read
            // as empty space, which defeats the point of shipping a fallback
            // at all.
            opacity: 0.22 + (index / Math.max(bands.length - 1, 1)) * 0.4,
          }}
        />
      ))}
    </div>
  );
}

export default HeroDepthFallback;
