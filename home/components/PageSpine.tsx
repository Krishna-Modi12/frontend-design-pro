"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { ScrollTrigger } from "../lib/gsapClient";

/**
 * The route the page itself takes, drawn in the left gutter exactly as far as
 * the reader has scrolled.
 *
 * **The geometry is measured, not authored.** There is no hand-drawn `d` in
 * this file. On mount the component reads the real position of every
 * `<section>` inside `<main>` and threads a curve through their centres, so
 * the waypoints are the page's own stages and the spacing between them is the
 * page's own rhythm — the hero's long opener, the short install close. Change
 * a section's height and the route changes with it; add a section and it gets
 * a waypoint. A decorative squiggle would survive either edit unchanged, and
 * that is the difference being drawn here.
 *
 * **Why the weave never settles into a pattern.** The x co-ordinate alternates
 * between two rails, which on its own is a zigzag. What keeps it from reading
 * as one is that the y co-ordinates are section centres, and this page's
 * sections are nothing like equal in height — so the wave has a constant
 * amplitude and a thoroughly irregular period. That is load-bearing: a
 * regular one would be a decorative ripple down the margin, which is the
 * failure mode this construction is one step away from.
 *
 * **`Skiper19`'s mechanic, this page's runtime.** The technique — one
 * continuous stroke whose drawn length tracks scroll progress — was prompted
 * by Skiper UI's `Skiper19` (`@gurvinder-singh02`, skiper-ui.com), which
 * reaches it through Framer Motion's `useScroll` + `pathLength`. `home/`
 * already runs GSAP and ScrollTrigger for every other scroll-linked effect
 * here, so adding a second animation runtime to offset a dash would be pure
 * bundle cost; this uses `getTotalLength()` and `strokeDashoffset`, the same
 * way `RouteStroke` does. Nothing else from that component travelled — not
 * its palette (an acid green on navy, one of the three AI-design clusters
 * this pack's own wall names), not its display face, not its 350vh scroll
 * region, and not its path data, which is the part that would have made this
 * decoration rather than a map.
 *
 * **Not a hairline column.** `lib/tokens.ts` says the section seams are
 * horizontal only, because a vertical rule between sections would read as the
 * anti-slop wall's "broadsheet hairline columns". That prohibition is about a
 * repeating grid of straight rules used as structure, and it still stands.
 * This is a single non-repeating curve in the outer margin that touches no
 * content, carries the reader's position, and is absent until scrolled — the
 * comment in `tokens.ts` was narrowed to say which of the two it means.
 *
 * **Reduced motion gets the finished route.** Not hidden and not faded to:
 * the route is information about the page's shape, so it renders complete and
 * static, exactly as `RouteStroke` does.
 *
 * Below `lg` it does not render at all. The free margin at those widths is the
 * 20px of `sectionShell` padding, which is not enough room for a curve, and a
 * phone is already scrolling 13 screens of this page without extra chrome in
 * the way.
 */
export interface PageSpineProps {
  /** Which children of the route's own parent get a waypoint. Scoped to direct
      children by default, so a section nested inside another one later cannot
      quietly add a second waypoint at nearly the same height. */
  sectionSelector?: string;
  className?: string;
}

interface Waypoint {
  readonly x: number;
  readonly y: number;
  /** Fraction of the route drawn by the time the tip reaches this waypoint. */
  readonly at: number;
}

interface Route {
  readonly width: number;
  readonly height: number;
  /** Distance from the viewport's left edge to the band, in px. */
  readonly left: number;
  readonly d: string;
  readonly stroke: number;
  readonly radius: number;
  readonly nodes: readonly Waypoint[];
}

/** `sectionShell`'s `max-w-6xl` and its `lg:px-8`, in px — see `lib/tokens.ts`.
    The band is parked immediately outside the text column rather than against
    the window, because at 1920 those are 336px apart and a line at the window
    edge belongs to the browser rather than to the page. If these two ever
    drift from the shell, the spine moves outward by the difference and the
    clamp below keeps it on screen; nothing breaks. */
const SHELL_MAX = 1152;
const SHELL_PAD = 32;

/** How far the weave stays clear of each edge of the band, as a fraction. */
const INSET = 0.28;

/** Handle length as a fraction of a segment's vertical run. Vertical handles
    at both ends mean every waypoint is passed through smoothly, with no cusp
    where two segments meet. */
const TENSION = 0.42;

/** The band is wide enough at `xl` to carry a heavier line without it reading
    as a border; below that it stays a hairline. */
const EXPRESSIVE_BAND = 64;

function buildRoute(band: number, main: HTMLElement, sections: readonly HTMLElement[]): Route | null {
  const height = main.offsetHeight;
  if (height <= 0) return null;

  const origin = main.getBoundingClientRect().top;
  const near = band * INSET;
  const far = band * (1 - INSET);

  const points = sections.map((section, index) => {
    const box = section.getBoundingClientRect();
    return {
      x: index % 2 === 0 ? near : far,
      y: box.top - origin + box.height / 2,
    };
  });

  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return null;

  // The route runs the full height of `<main>`, entering at the top edge and
  // leaving at the bottom, so it never appears to start or stop mid-page.
  const path = [{ x: first.x, y: 0 }, ...points, { x: last.x, y: height }];

  let d = `M${path[0]?.x.toFixed(1) ?? 0} 0`;
  for (let i = 1; i < path.length; i += 1) {
    const from = path[i - 1];
    const to = path[i];
    if (from === undefined || to === undefined) continue;
    const handle = (to.y - from.y) * TENSION;
    d +=
      ` C${from.x.toFixed(1)} ${(from.y + handle).toFixed(1)}` +
      ` ${to.x.toFixed(1)} ${(to.y - handle).toFixed(1)}` +
      ` ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }

  const gutter = Math.max(0, (main.clientWidth - SHELL_MAX) / 2) + SHELL_PAD;

  return {
    width: band,
    height,
    // Right edge of the band meets the left edge of the text, or hard against
    // the window once the gutter is too narrow to hold the band at all.
    left: Math.max(0, gutter - band),
    d,
    stroke: band >= EXPRESSIVE_BAND ? 2 : 1.5,
    radius: band >= EXPRESSIVE_BAND ? 4.5 : 3,
    // Arc length and vertical distance are within a fraction of a percent of
    // each other here: the whole horizontal excursion is at most the band's
    // 80px against a page thousands of pixels tall. `y / height` is the honest
    // approximation, and measuring the real arc length would need a second
    // layout pass to buy nothing.
    nodes: points.map((point) => ({ ...point, at: point.y / height })),
  };
}

export function PageSpine({
  sectionSelector = ":scope > section",
  className = "",
}: PageSpineProps): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([]);
  const [route, setRoute] = useState<Route | null>(null);

  // Only ever replaces the route when the numbers actually moved. Without
  // this every ResizeObserver callback would hand back a fresh object, and the
  // paint effect below would kill and rebuild its ScrollTrigger each time.
  const commit = useCallback((next: Route | null): void => {
    setRoute((current) => {
      if (current === null || next === null) return current === next ? current : next;
      const same =
        current.d === next.d && current.width === next.width && current.height === next.height;
      return same ? current : next;
    });
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg === null) return;
    // The spine is rendered as a direct child of the element whose extent it
    // maps, so its own parent is the route.
    const main = svg.parentElement;
    if (main === null) return;

    let frame = 0;
    const measure = (): void => {
      frame = 0;
      // `clientWidth` is 0 while the band is `display: none` below `lg`, which
      // is how one check covers both the breakpoint and an unmounted layout.
      const band = svg.clientWidth;
      if (band === 0) {
        commit(null);
        return;
      }
      const sections = Array.from(main.querySelectorAll<HTMLElement>(sectionSelector));
      commit(sections.length === 0 ? null : buildRoute(band, main, sections));
    };

    const schedule = (): void => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    // A ResizeObserver on `<main>` rather than a resize listener: the page's
    // height also moves when fonts land and when a reveal changes a section's
    // wrap, and neither of those is a window resize.
    const observer = new ResizeObserver(schedule);
    observer.observe(main);
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [commit, sectionSelector]);

  useEffect(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (path === null || svg === null || route === null) return;
    const main = svg.parentElement;
    if (main === null) return;

    const length = path.getTotalLength();
    const nodes = nodeRefs.current;
    const head = headRef.current;
    const paint = (progress: number): void => {
      path.style.strokeDashoffset = String(length * (1 - progress));
      if (head !== null) {
        // Without this the drawn line simply stops in mid-air, which reads as
        // a line that failed to render rather than as a position in the page.
        const tip = path.getPointAtLength(length * progress);
        head.setAttribute("transform", `translate(${tip.x.toFixed(2)} ${tip.y.toFixed(2)})`);
      }
      route.nodes.forEach((node, index) => {
        const element = nodes[index];
        if (element === undefined || element === null) return;
        element.style.opacity = progress >= node.at ? "1" : "0";
      });
    };

    path.style.strokeDasharray = String(length);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No head under reduce. The route renders complete and static, and a
      // head on a static route would mark a reading position that isn't
      // moving and therefore isn't true.
      if (head !== null) head.style.display = "none";
      paint(1);
      return;
    }

    paint(0);
    const trigger = ScrollTrigger.create({
      trigger: main,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      // Writes style directly rather than through React state. This fires on
      // every scroll frame, which is exactly what `ANI-04` exists to keep out
      // of a `setState`.
      onUpdate: (self) => paint(self.progress),
    });
    return () => {
      trigger.kill();
    };
  }, [route]);

  return (
    <svg
      ref={svgRef}
      data-page-spine
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-8 lg:block xl:w-20 ${className}`}
      {...(route === null
        ? {}
        : {
            viewBox: `0 0 ${route.width} ${route.height}`,
            preserveAspectRatio: "xMidYMin meet",
            style: { left: route.left },
          })}
    >
      {route === null ? null : (
        <>
          {/* The road ahead. Without it the drawn line arrives from nowhere and
              reads as an effect rather than as progress along something. */}
          <path d={route.d} fill="none" stroke="var(--color-border)" strokeWidth="1" />
          <path
            ref={pathRef}
            data-page-spine-path
            d={route.d}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={route.stroke}
            strokeLinecap="round"
          />
          {route.nodes.map((node, index) => (
            <circle
              key={`${node.x}:${node.y}`}
              ref={(element) => {
                nodeRefs.current[index] = element;
              }}
              cx={node.x}
              cy={node.y}
              r={route.radius}
              fill="var(--color-accent)"
              style={{ opacity: 0, transition: "opacity 240ms ease-out" }}
              className="motion-reduce:transition-none"
            />
          ))}
          {/* Where the reader is, drawn last so it sits over a waypoint it has
              just reached rather than under it. */}
          <g ref={headRef} data-page-spine-head>
            <circle r={route.radius * 2.2} fill="var(--color-accent)" opacity="0.16" />
            <circle r={route.radius * 0.85} fill="var(--color-accent)" />
          </g>
        </>
      )}
    </svg>
  );
}

export default PageSpine;
