import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import { CTA_HEADLINE, CTA_REASSURANCE, CTA_SUPPORT } from "../lib/content";
import { fadeUp, sectionShell } from "../lib/tokens";
import { useFadeUp } from "../lib/useFadeUp";

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
 * Centred, which is the one centred block on the page. That is what makes it
 * work — a page of left-aligned sections ending on a centred one reads as a
 * deliberate stop, where a page that centres everything reads as a template.
 *
 * The reassurance line is the part most generated pages drop. "No card" and
 * "installs nothing on the primary" answer the two objections a database tool
 * actually meets, and answering them next to the button is worth more than
 * another adjective in the headline.
 */
export default function CtaBar({ href }: CtaBarProps): ReactElement {
  const { ref, visible } = useFadeUp();

  return (
    <section
      id="start"
      aria-labelledby="cta-heading"
      className="border-t border-surface-border py-24"
    >
      <div
        ref={ref}
        data-fade
        className={`${sectionShell} flex flex-col items-center text-center ${fadeUp(visible)}`}
      >
        <h2
          id="cta-heading"
          data-display
          className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl"
        >
          {CTA_HEADLINE}
        </h2>

        <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-secondary text-pretty">
          {CTA_SUPPORT}
        </p>

        <div className="mt-9">
          <CtaButton href={href}>Start a rehearsal</CtaButton>
        </div>

        {/* Prose, not a figure, so it is not in the mono face — `data-metric`
            here made it read as a code comment stuck under a button. */}
        <p className="mt-6 text-xs leading-relaxed text-ink-muted">{CTA_REASSURANCE}</p>
      </div>
    </section>
  );
}
