import type { ReactElement } from "react";
import MetricCard from "./MetricCard";
import { PROBLEM_COPY } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing } from "../lib/tokens";

export interface SectionProblemProps {
  figures: Figures;
}

/**
 * Asymmetric 60/40 two-column layout, per the brief: copy on the left, a
 * bento of the four figures that back it up on the right — 2 large cards on
 * top, 2 small underneath. All four numbers are `figures.*` from
 * `data.generated.json`, never a literal — see the note at the top of
 * `tools/pages-data/generate.mjs` for why that is what closes the "stale
 * homepage figure" defect this project has shipped three times.
 */
export function SectionProblem({ figures }: SectionProblemProps): ReactElement {
  return (
    <section id="problem" className={`${sectionSpacing} bg-bg-surface`}>
      <div className={`${sectionShell} grid gap-12 lg:grid-cols-5 lg:gap-16`}>
        <div className="lg:col-span-3">
          <p data-label className="text-accent">
            {PROBLEM_COPY.eyebrow}
          </p>
          <h2 data-display className="mt-4 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
            {PROBLEM_COPY.heading}
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary text-pretty">
            {PROBLEM_COPY.body}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <MetricCard value={figures.registryTokens} label="Always-loaded registry, tokens" span="large" />
          <MetricCard value={figures.referenceDepthTokens} label="Reference depth on disk, tokens" span="large" />
          <MetricCard value={figures.skills} label="Skills — one loads per request" />
          <MetricCard value={figures.ciConstraints} label="Machine-checked constraints" />
        </div>
      </div>
    </section>
  );
}

export default SectionProblem;
