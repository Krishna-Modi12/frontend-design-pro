import type { ReactElement } from "react";
import type { Step } from "../lib/content";
import SectionEyebrow from "./SectionEyebrow";
import { fadeUp, sectionShell, sectionSpacing } from "../lib/tokens";
import { useFadeUp } from "../lib/useFadeUp";

export interface HowItWorksProps {
  steps: Step[];
}

/**
 * Three steps on an uneven track — 3 / 5 / 4 of twelve columns.
 *
 * The middle step is the widest because it is the one that does the work; the
 * other two are a setup and a result. Three equal columns would say the three
 * are interchangeable, which is the same failure the metric strip's track
 * exists to avoid.
 *
 * ── On the numbers ───────────────────────────────────────────────────────────
 *
 * The anti-slop wall bans numbered markers on content that is not a sequence.
 * This one is a genuine sequence — you cannot rehearse before connecting, or
 * read a verdict before rehearsing — which is what makes 01/02/03 legitimate
 * here and would not make it legitimate on the bento below. They are set in
 * mono at the same size as the body, not in filled circles: a numeral in a
 * coloured disc is a badge, and a badge implies a status rather than an order.
 *
 * The connector is a single rule behind the row rather than a border on each
 * card, so it runs continuously through the gaps instead of stopping at every
 * column edge. It is `aria-hidden` — the order is already carried by the
 * numerals and by the DOM, and an <hr> announced three times says nothing.
 */
export default function HowItWorks({ steps }: HowItWorksProps): ReactElement {
  const { ref, visible } = useFadeUp();

  return (
    <section id="how-it-works" aria-labelledby="how-heading" className={sectionSpacing}>
      <div ref={ref} data-fade className={`${sectionShell} ${fadeUp(visible)}`}>
        <SectionEyebrow>How it works</SectionEyebrow>

        <h2
          id="how-heading"
          data-display
          className="mt-6 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl"
        >
          Three steps, and none of them touch the primary.
        </h2>

        <div className="relative mt-12">
          {/* The rule sits at the vertical centre of the marker row. Desktop
              only: stacked, the steps read top to bottom and a horizontal line
              would cut across them. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[0.55rem] hidden h-px bg-surface-border lg:block"
          />

          <ol role="list" className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            {steps.map((step) => (
              <li key={step.id} className={`${step.span} relative`}>
                <span
                  data-metric
                  className="relative inline-block bg-surface-page pe-3 text-sm font-semibold text-accent-text"
                >
                  {step.marker}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary text-pretty">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
