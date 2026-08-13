import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import { CTA_HEADLINE, CTA_REASSURANCE, CTA_SUPPORT } from "../lib/content";
import { sectionShell, sectionSpacing } from "../lib/tokens";

export interface CtaBarProps {
  /** Where the single primary action goes. */
  href: string;
}

/**
 * Short headline, one action, risk-reversal microcopy — the three parts of a
 * CTA bar. One action, not two: the pair belongs in the hero where the reader
 * is still deciding what this is, but by the bottom of the page they have
 * decided, and a second button here only re-opens the question.
 *
 * The reassurance line is the part most generated pages drop. "No card" and
 * "installs nothing on the primary" answer the two objections a database tool
 * actually meets, and answering them next to the button is worth more than
 * another adjective in the headline.
 */
export default function CtaBar({ href }: CtaBarProps): ReactElement {
  return (
    <section id="start" aria-labelledby="cta-heading" className={sectionSpacing}>
      <div className={sectionShell}>
        <div className="flex flex-col items-start gap-8 border-t border-surface-border pt-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2
              id="cta-heading"
              data-display
              className="text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.05] text-ink"
            >
              {CTA_HEADLINE}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-secondary text-pretty">
              {CTA_SUPPORT}
            </p>
          </div>

          {/* The reassurance is prose, not a figure, so it is not in the mono
              face — `data-metric` here made it read as a code comment stuck
              under a button, and set it wider than the control it belongs to. */}
          <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
            <CtaButton href={href}>Point it at a replica</CtaButton>
            <p className="max-w-[17rem] text-balance text-xs leading-relaxed text-ink-muted lg:text-end">
              {CTA_REASSURANCE}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
