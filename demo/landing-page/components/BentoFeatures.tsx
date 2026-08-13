import type { ReactElement } from "react";
import type { Feature } from "../lib/content";
import { cardShell, sectionShell, sectionSpacing } from "../lib/tokens";

export interface BentoFeaturesProps {
  features: Feature[];
}

/**
 * Six cells on a six-column track, at four different widths, and no two rows
 * the same shape:
 *
 *   row 1   [ 3 spanning two rows ][ 3 ]
 *   row 2   [ the tall cell cont. ][ 3 ]
 *   row 3   [ 2 ][ 4 ]
 *   row 4   [ 6 ]
 *
 * Rule 3 of the landing-pages skill is "never an equal-height card grid", and
 * the reason is that a uniform grid asserts every feature matters the same
 * amount — which is never true and reads, correctly, as nobody having decided.
 * The tall cell is the argument the product rests on; the full-width cell is
 * the outcome the reader is buying. Spans live in `lib/content.ts` beside the
 * copy they weight, because the two are one decision.
 *
 * No numbered markers. The wall bans 01/02/03 on content that is not a
 * sequence, and these are six independent claims — a reader can start anywhere.
 */
export default function BentoFeatures({ features }: BentoFeaturesProps): ReactElement {
  return (
    <section
      id="how-it-works"
      aria-labelledby="features-heading"
      className={sectionSpacing}
    >
      <div className={sectionShell}>
        <div className="max-w-2xl">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-accent" />
            <span data-label className="text-xs text-ink-muted">
              How the replay works
            </span>
          </p>
          <h2
            id="features-heading"
            data-display
            className="mt-6 text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.05] text-ink"
          >
            The rehearsal is the product.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-secondary text-pretty">
            Everything else — the forecast, the quiet window, the verdict in the
            pull request — is something the replay makes possible rather than a
            separate feature that had to be built.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`${cardShell} ${feature.span} flex flex-col p-6 lg:p-7`}
            >
              <h3 data-display className="text-xl font-medium leading-snug text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary text-pretty">
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
 * The two figures under the tall cell. `mt-auto` is what pins them to the
 * bottom of a cell that is taller than its copy — the parent is a flex column,
 * so the margin absorbs the slack instead of leaving it under the paragraph.
 *
 * Returns null rather than being gated with `&&` at the call site. `&&` renders
 * `0` when the left operand is a number and, more to the point here, it hides
 * the fact that the absent case was considered at all.
 */
function FeatureDetail({ detail }: Pick<Feature, "detail">): ReactElement | null {
  if (detail === undefined) return null;

  return (
    <dl className="mt-auto pt-8">
      {detail.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-4 border-t border-surface-border py-3"
        >
          <dt className="text-sm text-ink-muted">{row.label}</dt>
          <dd data-metric className="text-2xl font-semibold text-ink">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
