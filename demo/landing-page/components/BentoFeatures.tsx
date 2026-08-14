import type { ReactElement } from "react";
import type { Feature } from "../lib/content";
import SectionEyebrow from "./SectionEyebrow";
import { cardInset, cardShell, fadeUp, sectionShell, sectionSpacing } from "../lib/tokens";
import { useFadeUp } from "../lib/useFadeUp";

export interface BentoFeaturesProps {
  features: Feature[];
}

/**
 * Four cards on a two-column grid, and the grid is `items-start`.
 *
 * That one utility is the whole difference between this and the equal-height
 * card grid the landing-pages skill bans outright. Grid items stretch to the
 * row height by default, so four cards with different amounts of copy become
 * four identical rectangles with three of them holding a pool of empty space at
 * the bottom — the exact shape that reads as generated. `items-start` lets each
 * card end where its content ends.
 *
 * The previous version had six cells with explicit row and column spans. Two of
 * them restated what the steps above now say, and a bento earns its shape by
 * having something different in every cell rather than by being large. Four
 * cells that each say one thing beats six where two are filler.
 *
 * No icons, deliberately. A generic glyph above every card title is decoration
 * standing in for hierarchy — the accent rule does the same job of marking a
 * start without pretending a database lock has a natural pictogram.
 */
export default function BentoFeatures({ features }: BentoFeaturesProps): ReactElement {
  const { ref, visible } = useFadeUp();

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className={`${sectionSpacing} border-t border-surface-border`}
    >
      <div ref={ref} data-fade className={`${sectionShell} ${fadeUp(visible)}`}>
        <SectionEyebrow>What it reports</SectionEyebrow>

        <h2
          id="features-heading"
          data-display
          className="mt-6 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl"
        >
          A planner estimate is a guess. This is a measurement.
        </h2>

        <div className="mt-12 grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.id} className={`${cardShell} ${cardInset}`}>
              <span aria-hidden="true" className="mb-5 block h-1 w-12 rounded-full bg-accent" />
              <h3 className="text-lg font-semibold tracking-tight text-ink">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary text-pretty">
                {feature.body}
              </p>
              <FeatureDetail detail={feature.detail} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The optional figure pair, as its own component so the absent case is an
 * early return rather than `&&` in the JSX above. `&&` renders `0` when the
 * left side is a number, and more to the point it lets the empty case go
 * undesigned — here that case is genuinely nothing, and saying so explicitly is
 * the difference between a decision and an omission.
 */
function FeatureDetail({ detail }: Pick<Feature, "detail">): ReactElement | null {
  if (detail === undefined) return null;

  return (
    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-t border-surface-border pt-5">
      {detail.map((item) => (
        <div key={item.label}>
          <dt data-label className="text-ink-muted">
            {item.label}
          </dt>
          <dd data-metric className="mt-1.5 text-xl font-semibold text-ink">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
