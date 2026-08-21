"use client";

import { useEffect, useState } from "react";

/**
 * `false` until mount (SSR has no `matchMedia`), then tracks the live value —
 * unlike `useFadeUp`, which only needs the preference once, GSAP/Lenis setup
 * in `HeroCanvas` and `SmoothScroll` needs to react if it changes mid-session.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default useReducedMotion;
