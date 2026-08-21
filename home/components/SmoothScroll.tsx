"use client";

import { useEffect } from "react";
import type { ReactElement, ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsapClient";

export interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Lenis, synced to GSAP's ticker so ScrollTrigger positions stay correct —
 * per the brief: lerp 0.1, smoothWheel true, `lenis.on('scroll',
 * ScrollTrigger.update)`.
 *
 * Skipped entirely under `prefers-reduced-motion`, checked once at mount:
 * Lenis's inertia IS the motion `animations` skill's core rule 7 requires
 * `useReducedMotion()` or a media query to gate, and there is no reduced form
 * of "smoothed, lagging scroll" to fall back to — native instant scroll is the
 * correct reduced-motion behaviour, not a slower Lenis.
 */
export function SmoothScroll({ children }: SmoothScrollProps): ReactElement {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number): void => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export default SmoothScroll;
