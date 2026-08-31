import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import RehearsalReport from "./RehearsalReport";
import SectionEyebrow from "./SectionEyebrow";
import { HEADLINE, HERO_CTA_NOTE, PROOF_POINTS, REPORT, SUBHEAD, TAGLINE } from "../lib/content";
import { sectionShell } from "../lib/tokens";

export interface HeroProps {
  /** The one action the page is asking for. */
  primaryHref: string;
  /** The quieter second action, for a reader not ready to commit. */
  secondaryHref: string;
}

/**
 * Editorial 5:7 — the report takes the wider track.
 *
 * This is the reverse of the usual split and of the version before it, which
 * gave the headline seven columns because the type was the visual: a
 * high-contrast serif at 80px genuinely was the image on that page. In a single
 * grotesque the headline is no longer the picture, so the artifact gets the
 * room and the words get a tighter measure — which is also better for reading.
 *
 * ── On filling the viewport ──────────────────────────────────────────────────
 *
 * `min-h-[100dvh]` is back on this section, and it is the one thing here worth
 * watching. It has now failed in both directions, which is what settled it:
 *
 *   Centred, with short content. An earlier hero pushed the headline roughly
 *   40% down a 1080px viewport and left an empty field above it. Every gate
 *   passed. It looked like nothing had loaded.
 *
 *   Top-aligned, with short content. The first draft of THIS hero moved the
 *   slack to the bottom instead, which was not better — 350px of empty page
 *   under the proof bar, measured in the capture.
 *
 * Neither is fixed by choosing a side, because both are the same defect: the
 * content was too short for the box. So the content grew — the report went back
 * to full-width rows, which is worth ~150px — and the remaining slack is split
 * evenly by centring. At 1080 that leaves a little over 100px top and bottom,
 * which reads as margin rather than as a void.
 *
 * `items-center` on the section, not on the grid: the grid's own `items-start`
 * still governs how the two columns sit relative to each other.
 *
 * The banned static-viewport utility is not named in prose anywhere in this app,
 * deliberately. RES-03 is a regex over source, so a comment explaining the rule
 * reads as a violation of it — and Tailwind scans comments too, so writing the
 * class name here also emitted a real unused utility into the stylesheet. Both
 * were live in the first draft of this file.
 */
export default function Hero({ primaryHref, secondaryHref }: HeroProps): ReactElement {
  return (
    <section
      aria-labelledby="hero-heading"
      // The header is sticky and 4rem tall, and this section starts underneath
      // it — so a full `100dvh` here is a viewport's worth of hero pushed 64px
      // down, and the last 64px of it sits below the fold. Subtracting the
      // header is what "the hero fills the screen" actually means; without it
      // the centring is computed against a box the reader cannot fully see, and
      // the slack lands unevenly (measured: 243px above, 120px below).
      className="flex min-h-[calc(100dvh-4rem)] items-center border-b border-surface-border"
    >
      <div
        className={`${sectionShell} grid w-full items-start gap-x-12 gap-y-14 py-16 lg:grid-cols-12`}
      >
        <div className="lg:col-span-5">
          <SectionEyebrow>{TAGLINE}</SectionEyebrow>

          <h1
            id="hero-heading"
            data-display
            // Sized to the FIVE-column track it actually sits in, not to the
            // page. At 4.25rem it broke as "Every / migration / runs twice." —
            // three lines with one word stranded on the first, which is what a
            // display size chosen against the full width does in a narrow one.
            className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]"
          >
            {HEADLINE}
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-secondary text-pretty">
            {SUBHEAD}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <CtaButton href={primaryHref}>Start a rehearsal</CtaButton>
            <CtaButton href={secondaryHref} variant="outline">
              How the replay works
            </CtaButton>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink-muted">{HERO_CTA_NOTE}</p>

          {/* Trust signals within 40px of the CTA they support. That budget
              used to be spent as a flat mt-8 straight off the button row; the
              CTA note above now sits in between, so it's mt-4 off the note
              instead — closer than the note's own top margin, which keeps
              this list read as "attached to the CTA" rather than "a new
              block that happens to follow the note." Capability claims
              rather than a logo wall: a wall of invented customer logos on a
              page for an invented product is a fabricated screenshot with
              extra steps. */}
          <ul
            role="list"
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted"
          >
            {/* The separator LEADS each item except the first, and lives inside
                the <li> rather than beside it. Both details are load-bearing.
                Inside, because a dot as its own flex child gets spaced by the
                list's gap and pushes the first item off the rail the headline
                sits on. Leading, because a trailing dot strands itself at the
                end of a wrapped line — visible in the capture, where the list
                broke after "Runs in your VPC" and left a dot hanging. */}
            {PROOF_POINTS.map((point, index) => (
              <li key={point} className="flex items-center gap-x-4">
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className="size-1 shrink-0 rounded-full bg-surface-border-strong"
                  />
                ) : null}
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <RehearsalReport
            id={REPORT.id}
            verdict={REPORT.verdict}
            verdictLabel={REPORT.verdictLabel}
            statement={REPORT.statement}
            target={REPORT.target}
            rows={REPORT.rows}
            finding={REPORT.finding}
            trafficByHour={REPORT.trafficByHour}
            quietWindow={REPORT.quietWindow}
          />
        </div>
      </div>
    </section>
  );
}
