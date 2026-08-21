"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap, ScrollTrigger } from "./gsapClient";

export interface StaggerReveal {
  ref: RefObject<HTMLDivElement | null>;
}

/**
 * GSAP ScrollTrigger stagger entrance, per the brief's Part 2 spec: every
 * direct child of the container animates opacity 0→1 and translateY 40px→0,
 * 0.6s each, 0.08s apart, triggered at "top 85%".
 *
 * `core/design-tokens.md`'s Motion section and `MOTION-02` both ban `ease-in`
 * on an entrance and cap standard UI motion at 600ms — this stays inside
 * both. The brief's exact cubic-bezier(0.16, 1, 0.3, 1) needs GSAP's
 * CustomEase plugin to express literally; `power3.out` is the built-in ease
 * closest to that curve's shape (a fast start settling into a long tail) and
 * avoids pulling in a second plugin for one curve — still strictly ease-out,
 * which is the actual constraint.
 *
 * `prefers-reduced-motion` is checked once at mount, before any ScrollTrigger
 * is created — not after, the same ordering `useFadeUp` uses and for the same
 * reason: creating the animation and then skipping the transition still
 * starts children at `opacity: 0`, which for a reader who asked for less
 * motion is worse than for everyone else. Reduced motion here sets every
 * child to its final state directly and never touches ScrollTrigger.
 */
export function useStaggerReveal(childSelector = ":scope > *"): StaggerReveal {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (container === null) return;
    const children = Array.from(container.querySelectorAll<HTMLElement>(childSelector));
    if (!children.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(children, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(children, { opacity: 0, y: 40 });
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
        });
      },
    });

    return () => {
      trigger.kill();
      gsap.set(children, { clearProps: "opacity,transform" });
    };
  }, [childSelector]);

  return { ref };
}

export default useStaggerReveal;
