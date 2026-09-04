"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";

export interface RouteStrokeProps {
  /** Fractions of the scrub at which each node is considered reached. */
  nodeAt?: readonly [number, number, number];
  className?: string;
}

/**
 * The routing path through `#how-it-works`, drawn by scroll.
 *
 * **The geometry is the claim.** Three plateaus, each lower than the last,
 * joined by two eased descents: a request enters against the whole registry
 * and leaves having narrowed to one skill and its declared dependencies. The
 * three nodes sit under the three cards they belong to. A straight rule could
 * not say that, and this replaced a straight rule — a 1px `div` whose width
 * was scrubbed 0→100%. The mechanic was already right; it had no shape.
 *
 * **`strokeDashoffset` on the section's own ScrollTrigger, not a second
 * animation runtime.** The technique — one continuous stroke whose drawn
 * length tracks scroll progress — is generic and decades older than the web,
 * but this build was prompted by Skiper UI's `Skiper19` (`@gurvinder-singh02`,
 * skiper-ui.com), which reaches it through Framer Motion's `useScroll` +
 * `pathLength`. Credited because the prompt was, not because anything was
 * copied: `home/` already runs GSAP and ScrollTrigger for every other
 * scroll-linked effect on the page, and adding Framer Motion for one stroke
 * would have put a second animation runtime in the bundle to do what
 * `getTotalLength()` and a dash offset already do. Nothing else from that
 * component travelled — not its palette (an acid green on navy, which is one
 * of the three AI-design clusters this pack's own wall names), not its
 * display face, not its 350vh scroll region, and not its path data.
 *
 * **Reduced motion gets the finished path, immediately.** Not a fade to it,
 * and not a hidden one: the route is information, so it renders complete and
 * static, exactly as the rule it replaced did.
 */

/** Nodes sit at the horizontal centre of each of the three cards. */
const NODES = [
  { x: 175, y: 16 },
  { x: 500, y: 44 },
  { x: 825, y: 72 },
] as const;

/** Module-level so the default is a stable reference: an inline literal in the
    parameter list is a new array on every render, which would re-run the
    effect below — and re-create its ScrollTrigger — on each one. */
const DEFAULT_NODE_AT: readonly [number, number, number] = [0.18, 0.52, 0.86];

const D =
  `M0 ${NODES[0].y} H${NODES[0].x} ` +
  `C 310 ${NODES[0].y} 365 ${NODES[1].y} ${NODES[1].x} ${NODES[1].y} ` +
  `C 635 ${NODES[1].y} 690 ${NODES[2].y} ${NODES[2].x} ${NODES[2].y} ` +
  `H1000`;

export function RouteStroke({
  nodeAt = DEFAULT_NODE_AT,
  className = "",
}: RouteStrokeProps): ReactElement {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([null, null, null]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (wrap === null || path === null) return;

    const length = path.getTotalLength();
    const paint = (progress: number): void => {
      path.style.strokeDashoffset = String(length * (1 - progress));
      nodeRefs.current.forEach((node, index) => {
        const threshold = nodeAt[index];
        if (node === null || threshold === undefined) return;
        node.style.opacity = progress >= threshold ? "1" : "0";
      });
    };

    path.style.strokeDasharray = String(length);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(1);
      return;
    }

    paint(0);
    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: "top 78%",
      end: "bottom 55%",
      scrub: 1,
      // `onUpdate` writes styles directly rather than through React state —
      // this fires on every scroll frame, which is exactly what `ANI-04`
      // exists to keep out of a `setState`.
      onUpdate: (self) => paint(self.progress),
    });
    return () => {
      trigger.kill();
      gsap.killTweensOf(path);
    };
  }, [nodeAt]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <svg
        viewBox="0 0 1000 88"
        preserveAspectRatio="none"
        className="h-24 w-full overflow-visible"
      >
        <path
          d={D}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          // Without this the `preserveAspectRatio="none"` stretch scales the
          // stroke horizontally too, and a 1px hairline becomes a wedge.
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={pathRef}
          d={D}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {NODES.map((node, index) => (
          <circle
            key={node.x}
            ref={(element) => {
              nodeRefs.current[index] = element;
            }}
            cx={node.x}
            cy={node.y}
            r="3.5"
            fill="var(--color-accent)"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: 0, transition: "opacity 240ms ease-out" }}
            className="motion-reduce:transition-none"
          />
        ))}
      </svg>
    </div>
  );
}

export default RouteStroke;
