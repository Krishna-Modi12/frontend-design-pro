"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import useReducedMotion from "../lib/useReducedMotion";

/** `three` + `@react-three/fiber` load in their own async chunk, off the
    critical path for the server-rendered headline — this dynamic import is
    the boundary that makes that split happen. */
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
          opacity: 0.18,
        }}
      />
      {enableCanvas ? <HeroShaderCanvas reduced={reduced} /> : null}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(60% 50% at 50% 38%, transparent 0%, var(--color-bg-page) 85%)",
        }}
      />
    </div>
  );
}

export default HeroBackground;
