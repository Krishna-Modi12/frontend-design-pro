"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import useReducedMotion from "../lib/useReducedMotion";

/** `three` loads in its own async chunk, off the critical path for the
    server-rendered headline — this dynamic import is the boundary that
    makes that split happen. (No `@react-three/fiber` — `HeroShaderCanvas`
    is raw `three`, a measured bundle-size deviation documented there.) */
const HeroShaderCanvas = dynamic(
  () => import("./HeroShaderCanvas").then((mod) => mod.HeroShaderCanvas),
  { ssr: false },
);

export interface HeroBackgroundProps {
  className?: string;
}

/**
 * Owns the hero's background layer end to end. A static CSS gradient div is
 * the permanent zero-JS base — the `<640px` fallback `motion-budget.md`
 * requires, and the paint that's already on screen while the WebGL chunk
 * loads above that width. The Canvas itself never mounts at all below
 * 640px, not just visually hidden, which is the actual performance/battery
 * saving the rule asks for.
 *
 * `aria-hidden` on the whole layer: it's decoration behind a real DOM
 * headline (`Hero.tsx`'s `<h1>`), never the only copy of anything.
 */
export function HeroBackground({ className }: HeroBackgroundProps): ReactElement {
  const reduced = useReducedMotion();
  const [enableCanvas, setEnableCanvas] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setEnableCanvas(mq.matches);
    const onChange = (event: MediaQueryListEvent): void => setEnableCanvas(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div aria-hidden="true" data-hero-scene className={className}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(160deg, var(--color-accent) 0%, var(--color-bg-page) 70%)",
          opacity: 0.3,
        }}
      />
      {enableCanvas ? <HeroShaderCanvas reduced={reduced} /> : null}
      {/* Protects the actual text column with a solid-background zone, then
          fades to transparent by the ellipse's outer edge — the gradient
          reads clearly around the copy instead of being washed out
          everywhere. Sized to the FULL stagger block in `Hero.tsx`, not just
          label/headline/subhead: the CTA row and the "Scroll to explore"
          link extend well below the subhead, and both are already
          low-contrast `text-text-muted` by design — an earlier version of
          this zone only covered the top three elements, leaving the two
          lowest-contrast pieces of text sitting in the fading edge with
          little protection. `pages:verify`'s axe pass caught this as an
          intermittent `color-contrast` failure (intermittent because it
          depends on the shader's momentary animated colour under whichever
          element the fade left exposed) once `uOpacity` rose enough for it
          to matter — a solid inner zone that actually spans the real content
          height removes the dependency on the shader's colour entirely,
          rather than relying on it usually being pale enough. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 46% at 50% 46%, var(--color-bg-page) 0%, var(--color-bg-page) 62%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default HeroBackground;
