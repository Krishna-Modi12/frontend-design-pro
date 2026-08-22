"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "./gsapClient";

const fmt = new Intl.NumberFormat("en-US");

/**
 * Ticks a `<span>`'s text through a sequence of already-real numbers — the
 * caller supplies values read from `data.generated.json` / the router's own
 * result, never a new literal. Writes `textContent` directly through a ref,
 * same reasoning `MetricCard` documents: nothing else on the page depends on
 * the intermediate value, so a React re-render per tick would be pure waste.
 *
 * Reduced motion jumps straight to the last step, matching every other
 * animated read on this page.
 */
export function useTokenCountdown(steps: number[]): RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement | null>(null);
  const key = steps.join(",");

  useEffect(() => {
    const node = ref.current;
    if (node === null || steps.length === 0) return;
    const last = steps[steps.length - 1];
    if (last === undefined) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = fmt.format(last);
      return;
    }

    const first = steps[0] ?? 0;
    const counter = { n: first };
    node.textContent = fmt.format(first);

    const timeline = gsap.timeline();
    for (let i = 1; i < steps.length; i++) {
      const target = steps[i];
      if (target === undefined) continue;
      timeline.to(
        counter,
        {
          n: target,
          duration: 0.9,
          ease: "power2.inOut",
          snap: { n: 1 },
          onUpdate: () => {
            if (node) node.textContent = fmt.format(Math.round(counter.n));
          },
        },
        i === 1 ? "+=0.15" : "+=0.35",
      );
    }

    return () => {
      timeline.kill();
    };
    // `key` is the derived, stable identity for `steps` (a fresh array
    // literal every render otherwise re-triggers this needlessly).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ref;
}

export default useTokenCountdown;
