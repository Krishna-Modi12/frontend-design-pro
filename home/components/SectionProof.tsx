import type { ReactElement } from "react";
import CheckerPanel from "./CheckerPanel";
import BrowserChrome from "./BrowserChrome";
import MetricCard from "./MetricCard";
import { PROOF_COPY, PROOF_CHIPS } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing, cardShell } from "../lib/tokens";

export interface SectionProofProps {
  figures: Figures;
}

/**
 * v2.3 — replaces the old Wall (a decorative marquee, six accordion cards,
 * the checker last). This leads with the checker instead: an asymmetric
 * bento pairing it against a 2x2 stat grid that sums in public —
 * `parserConstraints + regexConstraints === ciConstraints`, so a reader can
 * add 17 and 44 themselves rather than take the 61 on faith. `MetricCard`
 * and the `bg-accent-glow` frame are both reused verbatim from elsewhere on
 * this page (`SectionProblem`, `SectionHow`) rather than introducing a new
 * decorative technique — this page's own restraint (one derived accent,
 * COL-03) is a constraint worth keeping here too.
 */
export function SectionProof({ figures }: SectionProofProps): ReactElement {
  return (
    <section id="checks" className={`${sectionSpacing} bg-bg-surface`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          {PROOF_COPY.eyebrow}
        </p>
        <h2 data-display className="mt-4 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {PROOF_COPY.heading}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">{PROOF_COPY.body}</p>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.1rem] bg-accent-glow p-1">
            <BrowserChrome url="frontend-design-pro.dev/checks">
              <CheckerPanel />
            </BrowserChrome>
          </div>

          {/* Eight cells, not four — a lone 2x2 stat grid left this column
              mostly empty beside the checker's own height (its code pane and
              findings list run much taller than four cards). Folding the chip
              row in here instead of below closes that gap without inventing
              a second decorative technique. */}
          <div className="grid content-start grid-cols-2 gap-4">
            <MetricCard value={figures.releaseGates} label="Release gates, every build" />
            <MetricCard value={figures.parserConstraints} label="AST checks — semantic" />
            <MetricCard value={figures.regexConstraints} label="Regex checks — syntactic" />
            <MetricCard value={figures.ciConstraints} label="Total constraints, every release" />
            {PROOF_CHIPS.map((chip) => (
              <div
                key={chip.id}
                className={`${cardShell} flex items-center justify-center px-4 py-6 text-center text-sm font-medium text-text-secondary`}
              >
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionProof;
