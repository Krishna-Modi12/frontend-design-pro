"use client";

import { forwardRef, useCallback, useRef, useState, useEffect } from "react";
import type { ReactElement } from "react";
import { gsap } from "../lib/gsapClient";
import type { Figures, ReferenceRecord } from "../lib/data.types";
import HeroBackground from "./HeroBackground";
import HeroCorpus from "./HeroCorpus";
import { useWorld } from "./WorldProvider";
import { focusRing, tapTarget } from "../lib/tokens";

export interface HeroProps {
  installHref: string;
  howItWorksHref: string;
  figures: Figures;
  references: ReferenceRecord[];
}

const HEADLINE = "Change what your agent reaches for.";

/** The reference this pack loads to build a page like this one. */
const LIT_SKILL = "landing-pages";
const LIT_NAME = "landing-patterns.md";

/**
 * The hero: one column of type, and the corpus it is talking about.
 *
 * **Composition.** Type left, corpus right, on the page's own axis. Every
 * section below is left-aligned editorial with hard seams and real artefacts;
 * the hero was once the only centred, symmetric, soft-focus block on the page,
 * which is what made it read as belonging to a different site.
 *
 * **There is no pinned sequence any more, and that is a simplification worth
 * naming.** `home/DESIGN.md` §7 used to record a full-viewport pin as the
 * single documented exception to this page's stated L2 interaction tier. The
 * pin existed to drive one number — a 0→1 progress the WebGL hero object read
 * to reveal its strata as you scrolled. `HeroCorpus` shows the whole corpus at
 * first paint instead, because the point was never that the corpus is large in
 * instalments; it is that it is large and mostly untouched, which is a fact
 * about a still image. With the object gone the pin had nothing left to drive,
 * so the page now honours its own interaction tier with no exception at all.
 *
 * **The headline is split into words in JSX rather than by a library.** GSAP
 * staggers the spans natively, so `SplitType` would be a dependency earning
 * nothing.
 *
 * **Motion is a layer, never a gate.** Every element is in the server-rendered
 * HTML and visible at first paint; `gsap.from()` animates down from a hidden
 * state rather than a CSS class holding content hidden until JS runs, so a
 * reader whose JS never executes sees the finished hero rather than nothing.
 *
 * **No eyebrow above the headline.** There was one — "AI frontend skill pack",
 * set as a tracked uppercase label. It said nothing the headline and the
 * sentence under it do not, and a kicker over a heading is the most reliable
 * tell of a template. The headline carries itself.
 */
function HeroImpl(
  { installHref, howItWorksHref, figures, references }: HeroProps,
  ref: React.ForwardedRef<HTMLElement>,
): ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const staggerRef = useRef<HTMLDivElement | null>(null);
  const { reroll } = useWorld();

  /** Which reference the reader is pointing at, or null for the default. */
  const [probed, setProbed] = useState<ReferenceRecord | null>(null);

  // A plain `useState` setter, but memoised so `HeroCorpus` is not handed a
  // new callback identity on every render. This fires on pointer movement
  // between marks, never on scroll — `ANI-04` is about the scroll frame.
  const onHoverChange = useCallback((record: ReferenceRecord | null) => {
    setProbed(record);
  }, []);

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
        // The one authored moment: the corpus sets itself, line by line, the
        // way a page of type would be composed — then the single reference
        // this pack would load for a request like the reader's ignites. It
        // runs once, on load, and never again; there is no scroll trigger on
        // this section at all.
        const marks = section.querySelectorAll("[data-corpus-mark]");
        gsap.from(marks, {
          opacity: 0,
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.5,
          stagger: { each: 0.004, from: "start" },
          delay: 0.3,
          ease: "power3.out",
        });
      }
    }, section ?? undefined);

    return () => context.revert();
  }, []);

  const activeName = probed === null ? `${LIT_SKILL}/${LIT_NAME}` : `${probed.skill}/${probed.name}`;

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

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div ref={staggerRef}>
          <h1
            data-display
            data-hero-headline
            className="text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.03] text-text-primary"
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

          {/* Says the one thing the corpus shows, and nothing the sections
              below repeat. Both figures are rendered from
              `data.generated.json`, never typed: the sentence this replaced
              said "60 checks" against a real figure of {figures.ciConstraints},
              and no gate could see it because a bare "N checks" is
              deliberately unclaimed. */}
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
                already sold. */}
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

          {/* Names whichever mark is lit, and prices it. Visible at first
              paint rather than revealed by scroll — the sentence is the
              graphic's label, and a label that arrives later is not one.
              `aria-live` is deliberately absent: the figure is pointer-only
              and already carries the same facts in its own text alternative,
              so announcing every mark a mouse crosses would be noise. */}
          <p
            data-hero-block
            data-hero-caption
            className="mt-8 max-w-md font-mono text-xs leading-relaxed text-text-muted"
          >
            {probed === null ? (
              <>
                The lit mark is <span className="text-text-secondary">{activeName}</span> — the
                reference this pack loads to build a page like this one. The other{" "}
                {(figures.referenceFiles - 1).toLocaleString("en-US")} stay on disk.
              </>
            ) : (
              <>
                <span className="text-text-secondary">{activeName}</span> —{" "}
                <span data-metric>{probed.tokens.toLocaleString("en-US")}</span> tokens, loaded
                only when {probed.skill} routes to it.
              </>
            )}
          </p>
        </div>

        {/* The corpus, in its own track. Below `lg:` the grid collapses and it
            sits under the copy rather than behind it — the whole reason the
            text needs no scrim at any width. */}
        <div className="w-full">
          <HeroCorpus
            references={references}
            litSkill={LIT_SKILL}
            litName={LIT_NAME}
            onHoverChange={onHoverChange}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

export const Hero = forwardRef(HeroImpl);
Hero.displayName = "Hero";

export default Hero;
