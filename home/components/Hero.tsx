"use client";

import { forwardRef, useCallback, useRef, useState, useEffect } from "react";
import type { ReactElement } from "react";
import { gsap } from "../lib/gsapClient";
import type { Figures, ReferenceRecord } from "../lib/data.types";
import HeroBackground from "./HeroBackground";
import HeroCorpusRing from "./HeroCorpusRing";
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
 * to reveal its strata as you scrolled. `HeroCorpusRing` shows the whole corpus at
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

  // A plain `useState` setter, but memoised so `HeroCorpusRing` is not handed a
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
        // Queried from the SECTION rather than the container: the caption
        // moved out of the copy column so it could follow the ring on
        // mobile, and a container-scoped query would have silently
        // dropped it from the entrance sequence.
        const blocks = (section ?? container).querySelectorAll("[data-hero-block]");
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

      // NOTHING HERE TOUCHES THE CORPUS, AND THAT IS THE POINT.
      //
      // This block used to run `gsap.from(marks, { opacity: 0, scaleX: 0,
      // delay: 0.3 })` over all 119 ticks while `HeroCorpusRing` set each
      // tick's own opacity and transitioned it in CSS. Two systems owned one
      // property, and the tween lost: measured against the shipped production
      // build, 0 of 119 marks were visible at 500ms and still 0 at 8s. The
      // `from` state was written and never advanced, so a reader with motion
      // enabled met an empty half-hero. Under `prefers-reduced-motion` the
      // effect returned at the top of this hook, never touched the marks, and
      // the hero rendered correctly — which is why every gate passed.
      //
      // The corpus animates itself now, with a CSS transition on a property
      // no one else writes. If a future pass wants the ring choreographed
      // with the type, drive it from a prop this component owns; do not reach
      // into that subtree from here.
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
      /* 86dvh, not 100, and only from `lg:`.
         Not 100, because a full-viewport opener guarantees the first frame a
         reader — or a link preview, or a thumbnail — gets contains nothing but
         the hero, and then needs a scroll cue bolted on to admit there is
         more. Letting the next section's seam sit just above the fold IS the
         cue, it costs no element, and it cannot be mistaken for a control.
         There is deliberately no arrow here, and adding one would be a
         regression, not an addition.
         Only from `lg:`, because below it the two tracks stack and the content
         is already taller than the viewport — so the minimum buys nothing, and
         the `items-center` it exists to serve banks the slack as padding at
         the top instead. Measured on a 390px screen before this: ~250px of
         empty page between the header and the headline, which is the first
         thing a phone reader was given. */
      className="relative flex items-center overflow-hidden bg-bg-page lg:min-h-[86dvh]"
    >
      <HeroBackground className="pointer-events-none absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 py-14 sm:gap-12 sm:px-8 sm:py-20 lg:gap-y-8 lg:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div ref={staggerRef} className="lg:col-start-1 lg:row-start-1">
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

          {/* Stacked and full-width below `sm:`, side by side above it. Two
              auto-width buttons in a `flex-wrap` row came out at 472px and
              458px on a 390px screen — near enough to look like a mistake
              rather than a hierarchy, and ragged down the right edge.
              The reroll is nested WITH the secondary rather than being a third
              sibling of the row: as a sibling it wrapped onto a line of its
              own at 1024px and read as a stray icon dropped under the buttons.
              Nested, the pair moves as one at every width. */}
          <div
            data-hero-block
            className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <a
              href={installHref}
              className={`${tapTarget} ${focusRing} inline-flex w-full items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-accent-ink transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_40px_var(--color-accent-glow)] motion-reduce:transition-none sm:w-auto`}
            >
              Get the skill pack
            </a>
            <div className="flex items-center gap-2">
              <a
                href={howItWorksHref}
                className={`${tapTarget} ${focusRing} inline-flex flex-1 items-center justify-center rounded-xl border border-border-strong bg-bg-page px-8 py-4 text-base font-medium text-text-primary transition-colors duration-300 ease-out hover:border-accent motion-reduce:transition-none sm:flex-none`}
              >
                See how it works
              </a>

              {/* Manual reroll — a new curated world, excluding the current one
                  and everything already shown this session. Icon-only rather
                  than a third labelled action: a first-viewport decision point
                  holds one primary and one or two secondary choices before it
                  dilutes the primary CTA, and this is a toy for a reader who
                  is already sold. */}
              <button
                type="button"
                onClick={reroll}
                aria-label="Try another world"
                className={`${tapTarget} ${focusRing} inline-flex shrink-0 items-center justify-center rounded-lg px-2 text-text-muted transition-colors duration-300 ease-out hover:text-text-primary motion-reduce:transition-none`}
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
          </div>

        </div>

        {/* The corpus, in its own track. Below `lg:` the grid collapses and
            it sits under the copy rather than behind it — the whole reason the
            text needs no scrim at any width. Capped rather than full-bleed: a
            ring reads as a figure at a size the eye can take in whole, and at
            1440px an uncapped one would be taller than the headline. */}
        <div className="flex w-full justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-end">
          <HeroCorpusRing
            references={references}
            litSkill={LIT_SKILL}
            litName={LIT_NAME}
            onHoverChange={onHoverChange}
            className="h-auto w-full max-w-[20rem] sm:max-w-[24rem] lg:max-w-[26rem]"
          />
        </div>

        {/* Names whichever mark is lit, and prices it. Visible at first
            paint rather than revealed by scroll — the sentence is the
            graphic's label, and a label that arrives later is not one.

          **It sits after the ring in the DOM, and that is the mobile reading
          order rather than a styling accident.** Below `lg:` the two tracks
          stack, and measured on a 390px screen this paragraph began at y=512
          while the figure it names began at y=630 — so a phone reader was
          told "the lit mark is landing-patterns.md" most of a screen before
          there was a lit mark to look at. A caption belongs under its figure.
          At `lg:` explicit grid placement puts it back in the copy column,
          under the buttons, where the composition wants it.
            `aria-live` is deliberately absent: the figure is pointer-only
            and already carries the same facts in its own text alternative,
            so announcing every mark a mouse crosses would be noise. */}
        <p
          data-hero-block
          data-hero-caption
          className="max-w-md font-mono text-xs leading-relaxed text-text-muted lg:col-start-1 lg:row-start-2 lg:-mt-2"
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
    </section>
  );
}

export const Hero = forwardRef(HeroImpl);
Hero.displayName = "Hero";

export default Hero;
