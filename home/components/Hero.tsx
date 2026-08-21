"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap } from "../lib/gsapClient";
import HeroCanvas from "./HeroCanvas";
import { focusRing, tapTarget } from "../lib/tokens";

export interface HeroProps {
  installHref: string;
  howItWorksHref: string;
}

const HEADLINE = "Change what your agent reaches for.";

/**
 * Content fades in on load, staggered: label → headline → subhead → CTA →
 * scroll indicator, per the brief. `gsap.from()` rather than a pre-hidden CSS
 * class — every element is visible in the server-rendered HTML from first
 * paint, so a reader whose JS never runs (or runs slowly) sees the finished
 * hero immediately rather than nothing. That is the same "every failure path
 * ends with the content on screen" rule `useFadeUp` documents, applied to an
 * on-load animation instead of a scroll one.
 */
function HeroImpl(
  { installHref, howItWorksHref }: HeroProps,
  ref: React.ForwardedRef<HTMLElement>,
): ReactElement {
  const staggerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const container = staggerRef.current;
    if (container === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const children = Array.from(container.children) as HTMLElement[];
    const tween = gsap.from(children, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.08,
      ease: "power3.out",
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-bg-page"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 50% 38%, var(--color-accent-glow), transparent 70%)",
      }}
    >
      <HeroCanvas
        sourceRef={headlineRef}
        className="pointer-events-none absolute inset-0 z-0"
      />

      <div ref={staggerRef} className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center lg:px-8">
        <p data-label className="text-text-muted">
          AI frontend skill pack
        </p>

        <h1
          ref={headlineRef}
          data-display
          className="relative z-10 mt-6 text-[clamp(2.75rem,7vw,5rem)] font-medium leading-[1.03] text-text-primary"
        >
          {HEADLINE}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary text-pretty">
          Registry-routed. Machine-enforced. Anti-slop by default — a request loads exactly
          one of 19 skills, and everything it writes is held to 60 checks before it ships.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={installHref}
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-accent-ink transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_40px_var(--color-accent-glow)] motion-reduce:transition-none`}
          >
            Get the skill pack
          </a>
          <a
            href={howItWorksHref}
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-xl border border-border-strong bg-bg-page px-8 py-4 text-base font-medium text-text-primary transition-colors duration-300 ease-out hover:border-accent motion-reduce:transition-none`}
          >
            See how it works
          </a>
        </div>

        <a
          href={howItWorksHref}
          className={`${focusRing} mt-16 inline-flex flex-col items-center gap-2 rounded text-sm text-text-muted`}
        >
          Scroll to explore
          <svg
            className="h-4 w-4 animate-bounce motion-reduce:animate-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}

export const Hero = forwardRef(HeroImpl);
Hero.displayName = "Hero";

export default Hero;
