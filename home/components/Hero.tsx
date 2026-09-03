"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import type { Figures, ReferenceRecord } from "../lib/data.types";
import HeroBackground from "./HeroBackground";
import HeroObject from "./HeroObject";
import { useWorld } from "./WorldProvider";
import { focusRing, tapTarget } from "../lib/tokens";

export interface HeroProps {
  installHref: string;
  howItWorksHref: string;
  figures: Figures;
  references: ReferenceRecord[];
}

const HEADLINE = "Change what your agent reaches for.";

/**
 * The hero: one object, one column of type, one bounded pinned sequence.
 *
 * **Composition.** Type left, object right. Every section below this one is
 * left-aligned editorial with hard seams and real artefacts; the hero used to
 * be the only centred, symmetric, soft-focus block on the page, which is what
 * made it read as belonging to a different site. It now shares the page's own
 * axis.
 *
 * **The headline is split into words in JSX rather than by a library.** GSAP
 * staggers the spans natively, so `SplitType` would be a dependency earning
 * nothing. (It would also once have been a conflict: the canvas that used to
 * sample this headline walked a `Range` over the `<h1>`'s single text node,
 * and wrapping the words in elements would have broken it. That canvas is
 * gone — the conflict is noted because the reasoning survives the component.)
 *
 * **Motion is a layer, never a gate.** Every element is in the server-rendered
 * HTML and visible at first paint; `gsap.from()` animates down from a hidden
 * state rather than a CSS class holding content hidden until JS runs, so a
 * reader whose JS never executes sees the finished hero rather than nothing.
 */
function HeroImpl(
  { installHref, howItWorksHref, figures, references }: HeroProps,
  ref: React.ForwardedRef<HTMLElement>,
): ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const staggerRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  /** 0 → 1 across the pinned range. A ref rather than state on purpose: this
      updates on every scroll frame, and a `setState` there is exactly what
      `ANI-04` exists to stop. The scene reads it inside its own rAF loop. */
  const progressRef = useRef(0);
  const { reroll } = useWorld();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = staggerRef.current;
    const section = sectionRef.current;
    const context = gsap.context(() => {
      if (container !== null) {
        // Words first, then the blocks under the headline, as one sequence.
        const words = container.querySelectorAll("[data-hero-word]");
        const blocks = container.querySelectorAll("[data-hero-block]");
        gsap.from(words, { opacity: 0, y: 24, duration: 0.7, stagger: 0.04, ease: "power3.out" });
        gsap.from(blocks, {
          opacity: 0,
          y: 16,
          duration: 0.6,
          stagger: 0.08,
          delay: 0.25,
          ease: "power3.out",
        });
      }

      if (section !== null) {
        // The one pinned scene on this site, bounded at a single viewport and
        // then released — `home/DESIGN.md` §7 records it as the single
        // documented exception to the L2 "no full-viewport pinned scenes"
        // rule. It never traps the scroll: the pin ends after one viewport of
        // travel whether or not the reader engages with it, and it is not
        // registered at all under reduced motion.
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=100%",
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            const caption = captionRef.current;
            if (caption !== null) {
              caption.style.opacity = String(
                Math.min(Math.max((self.progress - 0.45) / 0.25, 0), 1),
              );
            }
          },
        });
      }
    }, section ?? undefined);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref !== null) ref.current = node;
      }}
      id="top"
      className="relative flex min-h-[100dvh] items-center overflow-hidden bg-bg-page"
    >
      <HeroBackground className="pointer-events-none absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div ref={staggerRef}>
          <p data-hero-block data-label className="text-text-muted">
            AI frontend skill pack
          </p>

          <h1
            data-display
            data-hero-headline
            className="mt-6 text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.03] text-text-primary"
          >
            {HEADLINE.split(" ").map((word, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key -- the
                // headline is a constant; its words are positional, and two
                // identical words would otherwise collide on a text key.
                key={`${word}-${index}`}
                data-hero-word
                className="inline-block whitespace-pre"
              >
                {word}
                {index < HEADLINE.split(" ").length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          {/* Says the one thing the object shows, and nothing the sections
              below repeat. The old subhead stated all three of their
              arguments at once — one-of-19 belongs to `#problem`, the check
              count to `#checks`, registry-routed to `#how-it-works` — which
              left the hero asserting summaries the reader was about to be
              shown properly. The ratio is the claim only this object makes.
              Both figures are rendered from `data.generated.json`, never
              typed: the sentence this replaced said "60 checks" against a
              real figure of {figures.ciConstraints}, and no gate could see it
              because a bare "N checks" is deliberately unclaimed. */}
          <p
            data-hero-block
            className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary text-pretty"
          >
            A request loads one skill — about{" "}
            <span data-metric>{figures.bandLow.toLocaleString("en-US")}</span> tokens against{" "}
            <span data-metric>{figures.referenceDepthTokens.toLocaleString("en-US")}</span> that
            stay on disk. That ratio is the architecture.
          </p>

          <div data-hero-block className="mt-10 flex flex-wrap items-center gap-4">
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

            {/* Manual reroll — a new curated world, excluding the current one
                and everything already shown this session. Icon-only rather
                than a third labelled action: a first-viewport decision point
                holds one primary and one or two secondary choices before it
                dilutes the primary CTA, and this is a toy for a reader who is
                already sold. `reroll()` applies the swap with no transition
                rule active under reduced motion, so it needs no separate
                branch here. */}
            <button
              type="button"
              onClick={reroll}
              aria-label="Try another world"
              className={`${tapTarget} ${focusRing} inline-flex items-center justify-center rounded-lg px-2 text-text-muted transition-colors duration-300 ease-out hover:text-text-primary motion-reduce:transition-none`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0 1 14.5-3.5M19.5 15a8 8 0 0 1-14.5 3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* The payoff of the pinned sequence, in words. Starts at zero
              opacity and is written by the ScrollTrigger above; under reduced
              motion no trigger is registered, so the inline style below is
              what the reader gets — visible, immediately, with no motion. */}
          <p
            ref={captionRef}
            data-hero-caption
            className="mt-8 max-w-md font-mono text-xs leading-relaxed text-text-muted motion-safe:opacity-0"
          >
            The lit stratum is{" "}
            <span className="text-text-secondary">landing-pages/landing-patterns.md</span> — the
            reference this pack loads to build a page like this one. The rest stays on disk.
          </p>
        </div>

        {/* The object, in its own track. Below `lg:` the grid collapses and it
            sits under the copy rather than behind it — the whole reason the
            text needs no scrim at any width. */}
        <HeroObject references={references} progressRef={progressRef} />
      </div>
    </section>
  );
}

export const Hero = forwardRef(HeroImpl);
Hero.displayName = "Hero";

export default Hero;
