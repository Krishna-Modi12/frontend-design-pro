import type { ReactElement } from "react";
import { cardShell, sectionShell, sectionSpacing } from "../lib/tokens";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Tailwind span class, or "" for a single column. */
  span: string;
}

export interface SocialProofProps {
  testimonials: Testimonial[];
  /** Rendered under the row. States plainly that the quotes are invented. */
  disclosure: string;
}

/**
 * Two wide, one narrow, on a five-column track — 2 + 2 + 1. A three-up row of
 * equal cards is the stock arrangement, and it forces all three quotes to the
 * same length, which is why generated testimonials all sound like the same
 * person. Different widths let a long quote be long and a short one land.
 *
 * The quotes are invented, for a product that does not exist. `disclosure`
 * says so on the page rather than only in a source comment — a reader of the
 * rendered page should not have to open the repo to learn that.
 */
export default function SocialProof({
  testimonials,
  disclosure,
}: SocialProofProps): ReactElement {
  return (
    <section id="who-uses-it" className={sectionShell}>
      <div className={sectionSpacing}>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          What the yard changed
        </h2>

        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className={`${cardShell} ${testimonial.span} flex flex-col justify-between p-6 lg:p-8`}
            >
              <blockquote className="text-pretty text-base leading-relaxed text-ink">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-surface-border pt-4">
                <span className="block text-sm font-medium text-ink">
                  {testimonial.name}
                </span>
                <span className="mt-1 block font-mono text-xs uppercase tracking-[0.14em] text-ink-faint">
                  {testimonial.role} · {testimonial.company}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-faint">
          {disclosure}
        </p>
      </div>
    </section>
  );
}
