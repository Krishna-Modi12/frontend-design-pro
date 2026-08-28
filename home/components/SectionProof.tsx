import type { ReactElement } from "react";
import CheckerPanel from "./CheckerPanel";
import BrowserChrome from "./BrowserChrome";
import { PROOF_COPY } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing } from "../lib/tokens";

export interface SectionProofProps {
  figures: Figures;
}

export function SectionProof({ figures }: SectionProofProps): ReactElement {
  return (
    <section id="checks" className={`${sectionSpacing} bg-bg-surface`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">{PROOF_COPY.eyebrow}</p>
        <h2 data-display className="mt-4 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {PROOF_COPY.heading}
        </h2>

        <div className="mt-10 rounded-[1.1rem] bg-accent-glow p-1">
          <BrowserChrome url="frontend-design-pro.dev/checks">
            <CheckerPanel />
          </BrowserChrome>
        </div>

        <p data-metric className="mt-4 text-sm text-text-muted">
          {figures.releaseGates} gates · {figures.parserConstraints} AST checks · {figures.regexConstraints} regex checks · {figures.ciConstraints} total
        </p>
      </div>
    </section>
  );
}

export default SectionProof;
