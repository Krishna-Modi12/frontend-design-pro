import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import RehearsalReport from "./RehearsalReport";
import SectionEyebrow from "./SectionEyebrow";
import {
  HEADLINE_LEAD,
  HEADLINE_REST,
  PROOF_POINTS,
  REPORT,
  SUBHEAD,
  TAGLINE,
} from "../lib/content";
import { sectionShell } from "../lib/tokens";

export interface HeroProps {
  /** The one action the page is asking for. */
  primaryHref: string;
  /** The quieter second action, for a reader not ready to commit. */
  secondaryHref: string;
}

/**
 * Editorial 7:5. The headline column takes the wider track because the type is
 * the visual here — at 80px in a high-contrast serif the words are the image,
 * and a 6:6 split would give the report room it does not need at the cost of
 * breaking the headline onto more lines than it should take.
 *
 * ── The dead band is gone, deliberately ──────────────────────────────────────
 *
 * The previous hero was `min-h-[100dvh]` and centred its content, which pushed
 * the headline roughly 40% down a 1080px viewport and left an empty near-black
 * field above it. Every gate passed. It looked like nothing had loaded.
 *
 * `min-h-[100dvh]` lives on the page shell instead, which is what the anti-slop
 * wall actually asks for — it bans the static-viewport height utility in favour
 * of the dynamic one, not that every hero fill a viewport. Vertical space here
 * is `pt-16 pb-24`: composed, and roughly a third of what the old hero spent on
 * nothing.
 *
 * The banned utility is not named in prose anywhere in this app, deliberately.
 * RES-03 is a regex over source, so a comment explaining the rule reads as a
 * violation of it — and Tailwind scans comments too, so writing the class name
 * here also emitted a real `min-height: 100vh` utility into the stylesheet that
 * nothing used. Both were live in the first draft of this file.
 */
export default function Hero({ primaryHref, secondaryHref }: HeroProps): ReactElement {
  return (
    <section aria-labelledby="hero-heading" className="border-b border-surface-border">
      <div
        className={`${sectionShell} grid items-start gap-x-12 gap-y-14 pb-20 pt-16 lg:grid-cols-12 lg:pb-28 lg:pt-20`}
      >
        <div className="lg:col-span-7">
          <SectionEyebrow>{TAGLINE}</SectionEyebrow>

          {/* Two sentences, two treatments. The second is the claim the product
              actually makes, so it gets the italic — a real one, from the
              italic face imported in the layout, not a sheared roman. */}
          <h1
            id="hero-heading"
            data-display
            className="mt-6 text-[clamp(2.75rem,6.2vw,5rem)] font-medium leading-[0.98] text-ink"
          >
            {HEADLINE_LEAD}{" "}
            <span className="font-normal italic text-ink-secondary">
              {HEADLINE_REST}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-secondary text-pretty">
            {SUBHEAD}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CtaButton href={primaryHref}>Start a rehearsal</CtaButton>
            <CtaButton href={secondaryHref} variant="outline">
              How the replay works
            </CtaButton>
          </div>

          {/* Trust signals within 40px of the CTA they support — 32px here.
              Capability claims rather than a logo wall: a wall of invented
              customer logos on a page for an invented product is a fabricated
              screenshot with extra steps. */}
          <ul
            role="list"
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted"
          >
            {/* The separator trails each item rather than leading it, so the
                first proof point's first glyph lands on the same rail as the
                headline above it. Leading dots put every item — including the
                first — 12px to the right of everything else in the column. */}
            {PROOF_POINTS.map((point, index) => (
              <li key={point} className="flex items-center gap-x-5">
                {point}
                {index < PROOF_POINTS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="size-1 shrink-0 rounded-full bg-surface-border-strong"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
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
