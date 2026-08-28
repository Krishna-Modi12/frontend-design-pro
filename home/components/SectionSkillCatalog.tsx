import type { ReactElement } from "react";
import SkillCatalogGrid from "./SkillCatalogGrid";
import { CATALOG_COPY } from "../lib/content";
import type { SkillRecord } from "../lib/data.types";
import { sectionShell, sectionSpacing } from "../lib/tokens";

export interface SectionSkillCatalogProps {
  skills: SkillRecord[];
}

/**
 * New in v2.2 — a scannable card row for a handful of the 19 skills, the gap
 * this rebuild's research found: the pack's own README lists all 19 in a
 * table, but nothing on the page itself let a visitor browse even a few of
 * them without leaving. Curated selection lives in `content.ts`'s
 * `SKILL_CATALOG_IDS`; `SkillCatalogGrid` does the client-side filter and
 * reveal so this section itself stays a server component.
 */
export function SectionSkillCatalog({ skills }: SectionSkillCatalogProps): ReactElement {
  return (
    <section id="catalog" data-section-surface className={`${sectionSpacing} bg-bg-page`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          {CATALOG_COPY.eyebrow}
        </p>
        <h2 data-display className="mt-4 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {CATALOG_COPY.heading}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">{CATALOG_COPY.body}</p>

        <SkillCatalogGrid skills={skills} />
      </div>
    </section>
  );
}

export default SectionSkillCatalog;
