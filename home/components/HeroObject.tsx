"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import useReducedMotion from "../lib/useReducedMotion";
import type { ReferenceRecord } from "../lib/data.types";
import HeroDepthFallback from "./HeroDepthFallback";

/** `three` loads in its own async chunk, off the critical path for the
    server-rendered headline — this dynamic import is the boundary that makes
    that split happen. No `@react-three/fiber`: see `HeroDepthScene` for the
    measurement behind that. */
const HeroDepthScene = dynamic(
  () => import("./HeroDepthScene").then((mod) => mod.HeroDepthScene),
  { ssr: false },
);

export interface HeroObjectProps {
  references: ReferenceRecord[];
  progressRef: React.MutableRefObject<number>;
}

/**
 * Owns the hero object's mount policy, and holds the space the object
 * occupies in the hero's grid.
 *
 * **It is a track, not a backdrop.** The object sits in its own column beside
 * the copy rather than spread behind it. That is what lets the text sit on
 * plain `bg-page` with nothing animated under it, which is what removed the
 * contrast scrim the previous hero needed. It also makes the canvas roughly a
 * quarter of the pixels a full-bleed one cost, which is most of the frame
 * budget back before a single optimisation.
 *
 * **The fallback is always in the DOM.** `HeroDepthFallback` is
 * server-rendered and never unmounts: it is the paint already on screen while
 * the `three` chunk loads, the permanent rendering below 640px where the
 * scene never mounts at all (`motion-budget.md`'s heavy-background rule — the
 * saving only counts if the canvas is absent rather than hidden), what a
 * reader with JavaScript disabled sees, and the floor for a failed or lost
 * WebGL context. The scene fades in over it rather than replacing it, so
 * there is no frame in which the hero has no object.
 *
 * **All four worlds mount it.** The scene reads `--color-accent` at mount, so
 * the world supplies the hue and the object stays constant. The 640px gate is
 * uniform across worlds now; it used to apply to `signature` alone, which
 * left the three CSS worlds unbudgeted at phone widths.
 */
export function HeroObject({ references, progressRef }: HeroObjectProps): ReactElement {
  const reduced = useReducedMotion();
  const [enableCanvas, setEnableCanvas] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setEnableCanvas(mq.matches);
    const onChange = (event: MediaQueryListEvent): void => setEnableCanvas(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && enableCanvas;

  return (
    <div className="relative h-[15rem] w-full sm:h-[22rem] lg:h-[30rem]">
      <HeroDepthFallback
        references={references}
        className={`absolute inset-y-0 left-1/2 h-full w-[42%] -translate-x-1/2 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
          live ? "opacity-0" : "opacity-100"
        }`}
      />
      {live ? (
        <div className="absolute inset-0">
          <HeroDepthScene references={references} reduced={reduced} progressRef={progressRef} />
        </div>
      ) : null}
    </div>
  );
}

export default HeroObject;
