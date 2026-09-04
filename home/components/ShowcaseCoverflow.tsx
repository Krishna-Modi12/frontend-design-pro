"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { StaticImageData } from "next/image";
import ShowcaseCard from "./ShowcaseCard";
import type { ShowcaseProject } from "../lib/content";
import { focusRing, tapTarget } from "../lib/tokens";

/** One slide, fully resolved. `SectionShowcase` is a server component and
    this is a client one, so everything crossing the boundary has to be
    serialisable — the href resolution that used to be a callback prop is
    done on the server and the result passed as data. */
export interface ShowcaseSlide extends ShowcaseProject {
  image: StaticImageData;
}

export interface ShowcaseCoverflowProps {
  slides: ShowcaseSlide[];
}

/** Coverflow constants. Lifted from Skiper UI's `Skiper49` (`Carousel_003`,
    `@gurvinder-singh02`), whose Swiper config reads rotate 40 / depth 100 /
    modifier 1. Kept close to those numbers because the look is the point.

    **There is deliberately no opacity ramp.** An earlier pass faded the
    off-centre slides toward the page ground, which looked right and was an
    accessibility regression: `pages:verify`'s axe pass found 12 serious
    contrast failures — every text element on all three non-centred cards,
    down to 1.63:1 on the furthest — because fading a card fades its text and
    its background together. Depth here is carried by geometry alone, which is
    also what Swiper does: its coverflow does not fade slides either, it paints
    `slideShadows`, and a scrim over a card is the same contrast problem in a
    different hat. */
const ROTATE_DEG = 38;
const DEPTH_PX = 110;
const SCALE_DROP = 0.12;
/** Past this many slide-widths from centre a card is fully receded; clamping
    keeps the far edges from inverting as the track overscrolls. */
const REACH = 1.6;

/**
 * The carousel rests on the second slide, not the first.
 *
 * A centre-anchored coverflow can only show a slide upright by centring it,
 * so at index 0 there is nothing to the left and the band renders half empty
 * — which reads as a broken grid rather than as a carousel. From index 1 the
 * composition is the one this effect exists for: a card upright in the middle
 * with a neighbour rotated in from either side. Nothing is hidden by starting
 * here — all four slides are in the DOM and server-rendered, the first dot is
 * visibly unfilled, and the previous control is enabled — and the four
 * projects are peers, so there is no claim being made by which one is centred.
 */
const INITIAL_INDEX = 1;

/** `useLayoutEffect` on the client so the initial scroll lands before paint;
    plain `useEffect` on the server, where React warns about the former and
    neither one runs. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The showcase, as a coverflow carousel.
 *
 * **Why this is not Swiper.** The design comes from Skiper UI's `Skiper49`,
 * which is built on Swiper with Framer Motion for its entry animation and
 * `lucide-react` for two chevrons. Adopting it literally costs three runtime
 * dependencies, one of them a *second* animation runtime beside the GSAP this
 * page already ships — the same trade `RouteStroke` refused one release ago.
 * The effect itself is not the expensive part: Swiper's coverflow is a
 * `rotateY` / `translateZ` / `scale` ramp keyed to each slide's distance from
 * the viewport centre, which is the whole of `paint()` below.
 *
 * **What a native scroll container buys instead.** Drag and momentum come from
 * the platform rather than from a JS inertia model, so they match the reader's
 * OS and input device for free; `scroll-snap` does the landing; and with
 * JavaScript disabled the section degrades to a plain horizontal scroller with
 * all four cards in the server-rendered HTML rather than to an empty box.
 *
 * **No loop, deliberately.** `Skiper49` loops eleven images. Four slides is
 * below Swiper's own threshold for a clean loop, and more to the point the
 * heading beside this says *four* — a carousel that never ends contradicts the
 * count it is illustrating. Both ends are reachable and the controls disable
 * there, so the reader can see that four is all of them.
 *
 * **No autoplay**, for the reason `home/DESIGN.md` §1 gives: content that moves
 * under a reader is not an L2 interaction.
 */
export function ShowcaseCoverflow({ slides }: ShowcaseCoverflowProps): ReactElement {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** Centre of the slide at `index`, in the track's scroll coordinates. */
  const centreOf = useCallback((track: HTMLDivElement, index: number): number => {
    const slide = track.children[index];
    if (!(slide instanceof HTMLElement)) return 0;
    return slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2;
  }, []);

  const scrollToIndex = useCallback(
    (index: number): void => {
      const track = trackRef.current;
      if (track === null) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, index));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({ left: centreOf(track, clamped), behavior: reduce ? "auto" : "smooth" });
    },
    [centreOf, slides.length],
  );

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (track === null) return;

    const flat = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Before the first paint, and without smooth behaviour: this is the
    // resting position, not a navigation, so it must never read as motion.
    track.scrollLeft = centreOf(track, INITIAL_INDEX);

    const paint = (): void => {
      frameRef.current = null;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < track.children.length; i += 1) {
        const slide = track.children[i];
        if (!(slide instanceof HTMLElement)) continue;

        const centre = slide.offsetLeft + slide.offsetWidth / 2;
        const raw = (centre - mid) / slide.offsetWidth;
        const d = Math.max(-REACH, Math.min(REACH, raw));
        const a = Math.abs(d);

        if (Math.abs(centre - mid) < nearestDistance) {
          nearestDistance = Math.abs(centre - mid);
          nearest = i;
        }

        // Under reduced motion the ramp is skipped entirely rather than
        // slowed: there is no gentler form of "rotated away in 3D", and a
        // flat, fully legible row is the correct reduced state.
        if (flat) {
          slide.style.transform = "";
          slide.style.zIndex = "";
          continue;
        }

        slide.style.transform =
          `rotateY(${(-d * ROTATE_DEG).toFixed(2)}deg) ` +
          `translateZ(${(-a * DEPTH_PX).toFixed(1)}px) ` +
          `scale(${(1 - a * SCALE_DROP).toFixed(3)})`;
        // Nearer the centre paints later, so a rotated neighbour never
        // overlaps the card the reader is actually looking at.
        slide.style.zIndex = String(100 - Math.round(a * 100));
      }

      setActive(nearest);
      setAtStart(track.scrollLeft <= 1);
      setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 1);
    };

    // Coalesced to one paint per frame: this runs on every scroll event, which
    // on a trackpad fires far faster than the compositor needs (`ANI-04`).
    const onScroll = (): void => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(paint);
    };

    paint();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /** Tabbing into a card that is rotated off to the side must bring it to the
      centre — otherwise keyboard focus lands on something the reader cannot
      read, which is the classic carousel accessibility failure. */
  const onFocusCapture = useCallback(
    (event: React.FocusEvent<HTMLDivElement>): void => {
      const track = trackRef.current;
      if (track === null) return;
      const index = Array.prototype.indexOf.call(
        track.children,
        (event.target as HTMLElement).closest("[data-showcase-slide]"),
      );
      if (index >= 0) scrollToIndex(index);
    },
    [scrollToIndex],
  );

  return (
    // Bounded to the same column as every other section rather than run
    // full-bleed, so a receding card fades out against a margin instead of
    // being cut off by the window. It has to stay this wide: at `max-w-3xl`
    // the track's own overflow edge sliced the neighbouring card in half.
    <div className="mx-auto mt-10 w-full max-w-6xl">
      <div
        ref={trackRef}
        onFocusCapture={onFocusCapture}
        data-showcase-grid
        aria-roledescription="carousel"
        aria-label="Four projects built with this pack"
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          // The slide width is a custom property so the edge padding can be
          // derived from it and the first and last card can still reach the
          // centre. Spacer elements would do the same job, but `pages:verify`
          // counts this element's direct children and expects exactly four.
          ["--slide" as string]: "min(78vw, 21rem)",
          paddingInline: "max(1.25rem, calc(50% - var(--slide) / 2))",
          perspective: "1200px",
        }}
        // Lenis owns the wheel on this page (`SmoothScroll`); without this it
        // swallows the horizontal delta before the track ever sees it.
        data-lenis-prevent
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-showcase-slide
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.name}`}
            className="w-[var(--slide)] shrink-0 snap-center transition-transform duration-100 ease-out motion-reduce:transition-none [&>a]:h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <ShowcaseCard
              name={slide.name}
              tagline={slide.tagline}
              variant={slide.variant}
              image={slide.image}
              href={slide.href}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => scrollToIndex(active - 1)}
          disabled={atStart}
          aria-label="Previous project"
          className={`${tapTarget} ${focusRing} inline-flex items-center justify-center rounded-full border border-border px-3 text-text-secondary transition-colors duration-150 ease-out hover:border-border-strong hover:text-text-primary disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Real buttons rather than dots-as-divs, each naming the project it
            jumps to — "slide 3 of 4" tells a screen-reader user nothing about
            what they would be choosing. */}
        {/* The dot stays 10px; the BUTTON is 24px.
            WCAG 2.5.8 Target Size (Minimum) is 24x24 CSS px at AA, and these
            were 10x10 — measured on the rendered page, not read off the
            source. The standard's spacing exception does not rescue them
            either: it only applies when a 24px circle centred on each target
            clears its neighbours, and at 10px dots with an 8px gap the centres
            sat 18px apart. Nothing caught it, because axe does not run
            `target-size` by default and no constraint in this repo measures a
            rendered box. Padding the hit area rather than growing the dot
            keeps the visual rhythm the coverflow was designed with. */}
        <div className="flex items-center gap-1">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Show ${slide.name}`}
              aria-current={index === active ? "true" : undefined}
              className={`${focusRing} grid h-6 w-6 place-items-center rounded-full`}
            >
              <span
                aria-hidden="true"
                className={`block h-2.5 w-2.5 rounded-full transition-colors duration-150 ease-out motion-reduce:transition-none ${
                  index === active ? "bg-accent" : "bg-border-strong hover:bg-text-muted"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(active + 1)}
          disabled={atEnd}
          aria-label="Next project"
          className={`${tapTarget} ${focusRing} inline-flex items-center justify-center rounded-full border border-border px-3 text-text-secondary transition-colors duration-150 ease-out hover:border-border-strong hover:text-text-primary disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ShowcaseCoverflow;
