"use client";

import type { ReactElement } from "react";
import SkillPreviewThumbnail from "./SkillPreviewThumbnail";
import { SKILL_CATALOG_IDS, REPO_URL } from "../lib/content";
import type { SkillRecord } from "../lib/data.types";
import useStaggerReveal from "../lib/useStaggerReveal";
import { cardShell, cardInset, focusRing } from "../lib/tokens";

export interface SkillCatalogGridProps {
  skills: SkillRecord[];
}

/**
 * Filters the full registry down to the curated `SKILL_CATALOG_IDS` at
 * render time rather than baking a separate data shape — one source of
 * truth (`data.generated.json`) for every card on the page, including this
 * one. A curated ID absent from the registry (a future rename) silently
 * disappears from this grid rather than rendering broken; the loud failure
 * lives at build time in `tools/pages-data/generate.mjs`, not here, so a
 * production page never ships a card pointing at nothing.
 */
export function SkillCatalogGrid({ skills }: SkillCatalogGridProps): ReactElement {
  const { ref } = useStaggerReveal();
  const featured = SKILL_CATALOG_IDS.map((id) => skills.find((s) => s.id === id)).filter(
    (s): s is SkillRecord => s !== undefined,
  );

  return (
    <div
      ref={ref}
      className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
    >
      {featured.map((skill) => (
        <a
          key={skill.id}
          href={`${REPO_URL}/blob/main/${skill.path}`}
          rel="noreferrer"
          className={`${cardShell} ${cardInset} ${focusRing} flex flex-col transition-colors duration-150 ease-out hover:border-border-strong motion-reduce:transition-none`}
        >
          <div className="flex items-center gap-3">
            <SkillPreviewThumbnail group={skill.group} />
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
              style={{ background: "var(--color-emphasis-bg)", color: "var(--color-emphasis)" }}
            >
              {skill.group}
            </span>
          </div>

          <p data-metric className="mt-4 text-sm font-semibold text-text-primary">
            {skill.id}
          </p>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{skill.covers}</p>

          <p className="mt-4 border-t border-border pt-3 text-xs italic leading-relaxed text-text-muted">
            {skill.trySaying}
          </p>
        </a>
      ))}
    </div>
  );
}

export default SkillCatalogGrid;
