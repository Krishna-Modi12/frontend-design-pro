"use client";

import { useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";

export interface MarqueeProps {
  /** Pre-rendered items — a function prop can't cross the server/client
      boundary into this component, so the caller renders each item itself. */
  items: ReactNode[];
  /** Pixels per second — the brief's spec is 40. */
  speed?: number;
}

/**
 * Seamless CSS marquee: two identical copies of the item list sit side by
 * side, and the track translates by exactly -50% — because the second copy
 * is pixel-identical to the first, the loop has no visible seam. Speed is
 * expressed as duration = trackWidth / speed, measured after layout rather
 * than hardcoded, so the loop rate stays 40px/s regardless of how much
 * content `items` holds.
 *
 * Pauses on hover via the `[data-marquee]:hover` rule in `lib/tokens.ts`, and
 * stops entirely under `prefers-reduced-motion` via the same file's media
 * block — a scrolling list of text is exactly the kind of decorative motion
 * that preference exists to remove.
 */
export function Marquee({ items, speed = 40 }: MarqueeProps): ReactElement {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (track === null) return;

    const setDuration = (): void => {
      const halfWidth = track.scrollWidth / 2;
      const duration = Math.max(halfWidth / speed, 4);
      track.style.setProperty("--marquee-duration", `${duration}s`);
    };

    setDuration();
    const observer = new ResizeObserver(setDuration);
    observer.observe(track);
    return () => observer.disconnect();
  }, [speed, items]);

  return (
    <div data-marquee className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div ref={trackRef} data-marquee-track className="flex w-max gap-3">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3">
            {items.map((item, i) => (
              <div key={`${copy}-${i}`}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
