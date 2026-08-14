import type { ReactElement } from "react";
import type { Testimonial } from "../lib/content";
import SectionEyebrow from "./SectionEyebrow";
import { cardInset, cardShell, fadeUp, sectionShell, sectionSpacing } from "../lib/tokens";
import { useFadeUp } from "../lib/useFadeUp";

export interface SocialProofProps {
  testimonials: Testimonial[];
}

/**
 * Two quotes at two widths — never a row of uniform cards, which is the shape
 * that makes invented praise look even more invented. There were three; the
 * third said the same thing as the first in different words, and cutting it is
 * the same edit as cutting the bento from six cells to four.
 *
 * Marked up as <figure>/<blockquote>/<figcaption>, which is the pairing that
 * actually attributes a quotation. A <div> with a name under it in smaller text
 * looks identical and tells a screen reader nothing about whose words these are.
 *
 * The avatar is initials on a wash, not a stock portrait: a photograph of a
 * person who does not exist, attached to a quote they did not say, is a
 * fabrication rather than a placeholder. It is `aria-hidden` because the name
 * it abbreviates is directly beside it.
 */
export default function SocialProof({ testimonials }: SocialProofProps): ReactElement {
  const { ref, visible } = useFadeUp();

  return (
    <section
      id="teams"
      aria-labelledby="proof-heading"
      className={`${sectionSpacing} border-t border-surface-border bg-surface-raised`}
    >
      <div ref={ref} data-fade className={`${sectionShell} ${fadeUp(visible)}`}>
        <SectionEyebrow>Teams</SectionEyebrow>

        <h2
          id="proof-heading"
          data-display
          className="mt-6 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl"
        >
          {/* U+2011 non-breaking hyphen. `text-wrap: balance` still breaks at an
              ordinary hyphen, and this heading was splitting as "The Tuesday-"
              over "morning rule, retired." — a hyphen at the end of a display
              line reads as a typo rather than as a line break. */}
          The Tuesday‑morning rule, retired.
        </h2>

        <div className="mt-12 grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className={`${cardShell} ${cardInset} ${testimonial.span} m-0 flex flex-col`}
            >
              <blockquote className="text-lg leading-snug text-ink text-pretty">
                {testimonial.quote}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  data-metric
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-wash text-xs font-semibold text-accent-text"
                >
                  {testimonial.initials}
                </span>
                <span className="text-sm">
                  <span className="block font-medium text-ink">{testimonial.name}</span>
                  <span className="mt-0.5 block text-ink-muted">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
