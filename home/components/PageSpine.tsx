"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { ScrollTrigger } from "../lib/gsapClient";

/**
 * The route the page itself takes, drawn in the outer margin exactly as far as
 * the reader has scrolled.
 *
 * **The waypoints are measured, not authored.** There are no hand-placed
 * positions in this file. On mount the component reads the real bounding box
 * of every `:scope > section` inside `<main>` and puts a waypoint at each
 * centre, so the marks are the page's own stages and the gaps between them are
 * the page's own rhythm — the hero's long opener, the short install close. Add
 * a section and it gets a waypoint; change a section's height and one moves.
 *
 * **It is a straight rail, and that is a correction rather than a compromise.**
 * The first version of this drew an SVG curve weaving between two rails. Two
 * separate measurements killed it. Rendered, 80px of horizontal excursion
 * spread over an 8,500px page reads as a straight line — no amplitude that
 * fits the free margin changes that. Profiled, the SVG cost one forced layout
 * per scroll frame: writing `stroke-dashoffset` on a path and `transform` on a
 * `<g>` both dirty SVG layout in Blink, and on the built page at 4x CPU
 * throttle that was **251 layouts on an upward scroll against 3 with the spine
 * off the page**. It was spending a layout per frame to draw a curve nobody
 * could see, and it was felt as stutter.
 *
 * So the per-frame update is now transform-only on plain HTML elements, which
 * the compositor handles without layout, style recalc or paint: one
 * `scaleY` for the drawn length, one `translate3d` for the head. Waypoint
 * opacities are written only when the set of reached waypoints actually
 * changes, rather than re-asserted seven at a time every frame.
 *
 * **`Skiper19`'s mechanic, this page's runtime.** The technique — one
 * continuous line whose drawn length tracks scroll progress — was prompted by
 * Skiper UI's `Skiper19` (`@gurvinder-singh02`, skiper-ui.com), which reaches
 * it through Framer Motion's `useScroll` + `pathLength`. `home/` already runs
 * GSAP and ScrollTrigger for every other scroll-linked effect here, so adding
 * a second animation runtime would be pure bundle cost. Nothing else from that
 * component travelled — not its palette (an acid green on navy, one of the
 * three AI-design clusters this pack's own wall names), not its display face,
 * not its 350vh scroll region, and not its path data.
 *
 * **Not a hairline column.** `lib/tokens.ts` says the section seams are
 * horizontal only, because a vertical rule between sections would read as the
 * anti-slop wall's "broadsheet hairline columns". That prohibition is about a
 * repeating grid of straight rules used as structure, and it still stands.
 * This is one line in the outer margin that touches no content, carries the
 * reader's position, and is absent until scrolled.
 *
 * **Reduced motion gets the finished route.** Not hidden and not faded to: the
 * route is information about the page's shape, so it renders complete and
 * static, and the head is removed — a head on a motionless route would mark a
 * reading position that isn't moving.
 *
 * Below `lg` it does not render at all. The free margin at those widths is the
 * 20px of `sectionShell` padding, which is not enough room for it, and a phone
 * is already scrolling 13 screens of this page without extra chrome in the way.
 */
export interface PageSpineProps {
  /** Which children of the route's own parent get a waypoint. Scoped to direct
      children by default, so a section nested inside another one later cannot
      quietly add a second waypoint at nearly the same height. */
  sectionSelector?: string;
  className?: string;
}

interface Waypoint {
  readonly y: number;
  /** Fraction of the route drawn by the time the head reaches this waypoint. */
  readonly at: number;
}

interface Route {
  readonly height: number;
  /** Distance from the viewport's left edge to the band, in px. */
  readonly left: number;
  /** Distance from the band's left edge to the rail, in px. */
  readonly x: number;
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

/** The band is wide enough at `xl` to carry a heavier line without it reading
    as a border; below that it stays a hairline. */
const EXPRESSIVE_BAND = 64;

function buildRoute(band: number, main: HTMLElement, sections: readonly HTMLElement[]): Route | null {
  const height = main.offsetHeight;
  if (height <= 0) return null;

  const origin = main.getBoundingClientRect().top;
  const nodes = sections.map((section) => {
    const box = section.getBoundingClientRect();
    const y = box.top - origin + box.height / 2;
    return { y, at: y / height };
  });
  if (nodes.length === 0) return null;

  const gutter = Math.max(0, (main.clientWidth - SHELL_MAX) / 2) + SHELL_PAD;

  return {
    height,
    // Right edge of the band meets the left edge of the text, or hard against
    // the window once the gutter is too narrow to hold the band at all.
    left: Math.max(0, gutter - band),
    x: Math.round(band / 2),
    stroke: band >= EXPRESSIVE_BAND ? 2 : 1.5,
    radius: band >= EXPRESSIVE_BAND ? 4.5 : 3,
    nodes,
  };
}

export function PageSpine({
  sectionSelector = ":scope > section",
  className = "",
}: PageSpineProps): ReactElement {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const drawnRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [route, setRoute] = useState<Route | null>(null);

  // Only ever replaces the route when the numbers actually moved. Without this
  // every ResizeObserver callback would hand back a fresh object, and the
  // paint effect below would kill and rebuild its ScrollTrigger each time.
  const commit = useCallback((next: Route | null): void => {
    setRoute((current) => {
      if (current === null || next === null) return current === next ? current : next;
      const same =
        current.height === next.height &&
        current.left === next.left &&
        current.x === next.x &&
        current.nodes.length === next.nodes.length &&
        current.nodes.every((node, i) => node.y === next.nodes[i]?.y);
      return same ? current : next;
    });
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (wrap === null) return;
    // The spine is rendered as a direct child of the element whose extent it
    // maps, so its own parent is the route.
    const main = wrap.parentElement;
    if (main === null) return;

    let frame = 0;
    const measure = (): void => {
      frame = 0;
      // `clientWidth` is 0 while the band is `display: none` below `lg`, which
      // is how one check covers both the breakpoint and an unmounted layout.
      const band = wrap.clientWidth;
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
    const wrap = wrapRef.current;
    const drawn = drawnRef.current;
    if (wrap === null || drawn === null || route === null) return;
    const main = wrap.parentElement;
    if (main === null) return;

    const head = headRef.current;
    const nodes = nodeRefs.current;
    // Only touch a waypoint when the set of reached ones actually changes.
    let painted = -1;
    const paint = (progress: number): void => {
      // Both of these are transform-only writes on composited elements: no
      // layout, no style recalc, no paint. See the note at the top of the file
      // for the measurement that made this the whole point of the component.
      drawn.style.transform = `scaleY(${progress})`;
      if (head !== null) {
        head.style.transform = `translate3d(0, ${(progress * route.height).toFixed(1)}px, 0)`;
      }

      let reached = -1;
      for (let i = 0; i < route.nodes.length; i += 1) {
        if (progress >= route.nodes[i]!.at) reached = i;
      }
      if (reached === painted) return;
      painted = reached;
      route.nodes.forEach((_node, index) => {
        const element = nodes[index];
        if (element === undefined || element === null) return;
        element.style.opacity = index <= reached ? "1" : "0";
      });
    };

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
    <div
      ref={wrapRef}
      data-page-spine
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-8 lg:block xl:w-20 ${className}`}
      {...(route === null ? {} : { style: { left: route.left } })}
    >
      {route === null ? null : (
        <>
          {/* The road ahead. Without it the drawn line arrives from nowhere and
              reads as an effect rather than as progress along something. */}
          <div
            className="absolute inset-y-0 w-px bg-border"
            style={{ left: route.x }}
            aria-hidden="true"
          />
          <div
            ref={drawnRef}
            data-page-spine-drawn
            className="absolute inset-y-0 origin-top bg-accent"
            style={{
              left: route.x - (route.stroke - 1) / 2,
              width: route.stroke,
              transform: "scaleY(0)",
              willChange: "transform",
            }}
          />
          {route.nodes.map((node, index) => (
            <div
              key={node.y}
              ref={(element) => {
                nodeRefs.current[index] = element;
              }}
              className="absolute rounded-full bg-accent motion-reduce:transition-none"
              style={{
                left: route.x - route.radius + 0.5,
                top: node.y - route.radius,
                width: route.radius * 2,
                height: route.radius * 2,
                opacity: 0,
                transition: "opacity 240ms ease-out",
              }}
            />
          ))}
          {/* Where the reader is. Its own element so the per-frame write is a
              transform on one composited node and nothing else. */}
          <div
            ref={headRef}
            data-page-spine-head
            className="absolute left-0 top-0"
            style={{ transform: "translate3d(0, 0, 0)", willChange: "transform" }}
          >
            <div
              className="absolute rounded-full bg-accent"
              style={{
                left: route.x - route.radius * 2.2,
                top: -route.radius * 2.2,
                width: route.radius * 4.4,
                height: route.radius * 4.4,
                opacity: 0.16,
              }}
            />
            <div
              className="absolute rounded-full bg-accent"
              style={{
                left: route.x - route.radius * 0.85,
                top: -route.radius * 0.85,
                width: route.radius * 1.7,
                height: route.radius * 1.7,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default PageSpine;
