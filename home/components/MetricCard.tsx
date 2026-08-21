"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import { cardShell, cardInset } from "../lib/tokens";

export interface MetricCardProps {
  value: number;
  label: string;
  /** Grid span, for the asymmetric 2-large/2-small bento the brief specifies. */
  span?: "large" | "small";
}

const fmt = new Intl.NumberFormat("en-US");

/**
 * Counts up from 0 to `value` once it scrolls into view. The tween writes
 * `textContent` directly through a ref rather than React state — a state
 * update per animation frame for 1.5s would mean ~90 re-renders for a single
 * number, and nothing else on the card depends on the intermediate value.
 */
function MetricCardImpl(
  { value, label, span = "small" }: MetricCardProps,
  ref: React.ForwardedRef<HTMLDivElement>,
): ReactElement {
  const numberRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = numberRef.current;
    if (node === null) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = fmt.format(value);
      return;
    }

    node.textContent = "0";
    const counter = { n: 0 };
    const trigger = ScrollTrigger.create({
      trigger: node,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          n: value,
          duration: 1.5,
          ease: "power2.out",
          snap: { n: 1 },
          onUpdate: () => {
            if (node) node.textContent = fmt.format(Math.round(counter.n));
          },
        });
      },
    });

    return () => trigger.kill();
  }, [value]);

  return (
    <div
      ref={ref}
      className={`${cardShell} ${cardInset} flex flex-col justify-between ${
        span === "large" ? "sm:col-span-2" : ""
      }`}
    >
      <span ref={numberRef} data-metric className="text-4xl font-medium text-accent sm:text-5xl">
        0
      </span>
      <span className="mt-3 text-sm text-text-secondary">{label}</span>
    </div>
  );
}

export const MetricCard = forwardRef(MetricCardImpl);
MetricCard.displayName = "MetricCard";

export default MetricCard;
