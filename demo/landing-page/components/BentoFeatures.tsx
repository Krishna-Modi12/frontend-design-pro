import type { ReactElement } from "react";
import { cardShell, sectionShell, sectionSpacing } from "../lib/tokens";

/** The inline marks. Geometric, one per card, drawn rather than imported. */
export type FeatureMark = "bracket" | "arrow" | "rings" | "track" | "grid" | "seal";

export interface RegistryFeature {
  id: string;
  title: string;
  body: string;
  mark: FeatureMark;
  /** Tailwind span class, or "" for a single column. Spans are uneven on purpose. */
  span: string;
}

export interface BentoFeaturesProps {
  features: RegistryFeature[];
}

/** The geometry, keyed by mark. Only the inner shapes differ. */
const MARK_SHAPES: Record<FeatureMark, ReactElement> = {
  bracket: <path d="M7 3H4v14h3M13 3h3v14h-3" />,
  arrow: <path d="M16 10H4M9 5l-5 5 5 5" />,
  rings: (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <circle cx="10" cy="10" r="7" opacity="0.5" />
    </>
  ),
  track: <path d="M3 6h14M3 14h9a5 5 0 0 0 5-5" />,
  grid: <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />,
  seal: (
    <>
      <circle cx="10" cy="8" r="5" />
      <path d="M7 12.5 6 18l4-2 4 2-1-5.5" />
    </>
  ),
};

/**
 * Marks are inline SVG rather than an icon package. Six shapes is not worth a
 * dependency, and the only icon rule in the pack is that an icon-only *control*
 * carries an accessible name — these are decoration beside a heading that
 * already says the thing, so they are hidden from the accessibility tree and
 * contribute nothing to it.
 *
 * One <svg> with its attributes written out, rather than six sharing a spread
 * object. The spread version was the first thing written here and `A11Y-01`
 * rejected it: an attribute that reaches the element through `{...common}` is
 * invisible to the AST checker, which is the same reason it is invisible to
 * every other reviewer. `aria-hidden` has to be legible where the element is.
 */
function Mark({ kind }: { kind: FeatureMark }): ReactElement {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {MARK_SHAPES[kind]}
    </svg>
  );
}

/**
 * Twelve columns, six cards, spans that do not divide evenly: 2+1+1 on the
 * first row and 1+2+1 on the second. Equal-height card grids are the first
 * item on the anti-slop wall — six identical boxes say every capability weighs
 * the same, which is never true of a real product and is the single most
 * reliable tell that a page was generated rather than composed.
 */
export default function BentoFeatures({ features }: BentoFeaturesProps): ReactElement {
  return (
    <section id="what-it-does" className={sectionShell}>
      <div className={sectionSpacing}>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          What the yard does
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted">
          Six capabilities, and the two that carry the product are the two given
          the room.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.id}
              className={`${cardShell} ${feature.span} flex flex-col p-6 lg:p-8`}
            >
              <span className="text-accent">
                <Mark kind={feature.mark} />
              </span>
              <h3 className="mt-5 text-balance text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
