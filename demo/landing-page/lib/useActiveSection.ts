"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy for the header nav. Same tool as `useFadeUp` — an
 * IntersectionObserver, not a scroll listener — for the same reason: it
 * answers "is this section where the reader's attention is" off the main
 * thread instead of computing it on every scroll frame.
 *
 * ── Why a thin band near the top, not the default full-viewport root ────────
 *
 * The default root margin treats a section as "current" the instant any
 * pixel of it is on screen, which means the section about to leave and the
 * section about to arrive are both "intersecting" for most of the scroll —
 * exactly the ambiguity a reader glancing at the nav needs resolved, not
 * reproduced. `rootMargin: "-45% 0px -50% 0px"` shrinks the observation area
 * to a thin band just above the viewport's vertical centre, just below the
 * sticky header's reach — a section only counts as active once it has
 * genuinely reached where the reader is looking.
 *
 * ── Undefined is a real state, not a loading placeholder ────────────────────
 *
 * Above the first section (still reading the hero) and below the last
 * (footer), nothing is active — the nav should show no current item rather
 * than sticking to whichever section fired last, which would tell the
 * reader they're "on" How it works while looking at the footer.
 */
export function useActiveSection(ids: readonly string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { threshold: 0, rootMargin: "-45% 0px -50% 0px" },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default useActiveSection;
