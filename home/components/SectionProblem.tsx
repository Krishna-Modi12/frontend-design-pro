import type { ReactElement } from "react";
import MetricCard from "./MetricCard";
import ProblemComparison from "./ProblemComparison";
import { PROBLEM_COPY } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing } from "../lib/tokens";

export interface SectionProblemProps {
  figures: Figures;
}

/**
 * v2.1: `PROBLEM_COPY.body`'s paragraph moved to `sr-only` — the visual
 * argument is now `ProblemComparison`'s Before/After, not prose. The four
 * real figures stay as a single row of `MetricCard`s below it; they no
 * longer share width with a text column, so all four now read at equal
 * weight. All four numbers are `figures.*` from `data.generated.json`, never
 * a literal — see the note at the top of `tools/pages-data/generate.mjs` for
 * why that is what closes the "stale homepage figure" defect this project
 * has shipped three times.
 */
export function SectionProblem({ figures }: SectionProblemProps): ReactElement {
  return (
    <section id="problem" className={`${sectionSpacing} bg-bg-surface`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          {PROBLEM_COPY.eyebrow}
        </p>
        <h2 data-display className="mt-4 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {PROBLEM_COPY.heading}
        </h2>
        <p className="sr-only">{PROBLEM_COPY.body}</p>

        <ProblemComparison />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard value={figures.registryTokens} label="Always-loaded registry, tokens" />
          <MetricCard value={figures.referenceDepthTokens} label="Reference depth on disk, tokens" />
          <MetricCard value={figures.skills} label="Skills — one loads per request" />
          <MetricCard value={figures.ciConstraints} label="Machine-checked constraints" />
        </div>
      </div>
    </section>
  );
}

export default SectionProblem;
