"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import { cardShell } from "../lib/tokens";

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
 *
 * The markup renders the real formatted value, not "0": this app is a static
 * export, so whatever the server HTML says is what a crawler, a link unfurl,
 * or a client whose JS never runs sees permanently. The reset to "0" happens
 * inside `onEnter`, the instant before the tween — so a card that is never
 * scrolled to just keeps showing its real number, and there is no frame where
 * a hydrated client flashes the final value before the count-up.
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
      return;
    }

    const counter = { n: 0 };
    const trigger = ScrollTrigger.create({
      trigger: node,
      start: "top 90%",
      once: true,
      onEnter: () => {
        node.textContent = "0";
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
      className={`${cardShell} flex flex-col justify-between p-4 sm:p-6 lg:p-8 ${
        span === "large" ? "sm:col-span-2" : ""
      }`}
    >
      <span
        ref={numberRef}
        data-metric
        className="text-2xl font-medium text-accent sm:text-4xl lg:text-5xl"
      >
        {fmt.format(value)}
      </span>
      <span className="mt-3 text-sm text-text-secondary">{label}</span>
    </div>
  );
}

export const MetricCard = forwardRef(MetricCardImpl);
MetricCard.displayName = "MetricCard";

export default MetricCard;
