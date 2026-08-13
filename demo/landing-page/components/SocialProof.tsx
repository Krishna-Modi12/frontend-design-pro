import type { ReactElement } from "react";
import type { Testimonial } from "../lib/content";
import { cardShell, sectionShell, sectionSpacing } from "../lib/tokens";

export interface SocialProofProps {
  testimonials: Testimonial[];
}

/**
 * Two wide, one full — never three uniform cards, which is the shape that makes
 * invented praise look even more invented. The quotes are different lengths
 * because real ones are, and the layout follows the copy rather than trimming
 * the copy to fit the layout.
 *
 * Marked up as <figure>/<blockquote>/<figcaption>, which is the pairing that
 * actually attributes a quotation. A <div> with a name under it in smaller text
 * looks identical and tells a screen reader nothing about whose words these are.
 */
export default function SocialProof({ testimonials }: SocialProofProps): ReactElement {
  return (
    <section
      id="teams"
      aria-labelledby="proof-heading"
      className={`${sectionSpacing} border-t border-surface-border bg-surface-sunken`}
    >
      <div className={sectionShell}>
        <h2
          id="proof-heading"
          data-display
          className="max-w-2xl text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.05] text-ink"
        >
          {/* U+2011 non-breaking hyphen. `text-wrap: balance` still breaks at an
              ordinary hyphen, and this heading was splitting as "The Tuesday-"
              over "morning rule, retired." — a hyphen at the end of a display
              line reads as a typo rather than as a line break. */}
          The Tuesday‑morning rule, retired.
        </h2>

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:gap-5">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className={`${cardShell} ${testimonial.span} m-0 flex flex-col p-6 lg:p-8`}
            >
              <blockquote
                data-display
                className="text-lg leading-snug text-ink text-pretty lg:text-xl"
              >
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-medium text-ink">{testimonial.name}</span>
                <span className="mt-0.5 block text-ink-muted">{testimonial.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
