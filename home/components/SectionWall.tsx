import type { ReactElement } from "react";
import CheckerPanel from "./CheckerPanel";
import Marquee from "./Marquee";
import ConstraintBadge from "./ConstraintBadge";
import { WALL_MARQUEE, WALL_CATEGORIES } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing, cardShell, cardInset } from "../lib/tokens";

export interface SectionWallProps {
  figures: Figures;
}

export function SectionWall({ figures }: SectionWallProps): ReactElement {
  return (
    <section id="wall" className={`${sectionSpacing} bg-bg-surface`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          03 — The wall
        </p>
        <h2 data-display className="mt-4 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {figures.ciConstraints} checks catch the defaults agents keep reaching for.
        </h2>

        <div className="mt-8">
          <Marquee items={WALL_MARQUEE.map((text) => (
            <ConstraintBadge key={text} text={text} />
          ))} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {WALL_CATEGORIES.map((category) => (
            <article
              key={category.id}
              className={`${cardShell} ${cardInset} ${category.wide ? "sm:col-span-2" : ""}`}
            >
              <h3 className="text-base font-semibold text-text-primary">
                {category.title}
                {category.count ? (
                  <span data-metric className="ml-2 text-sm font-normal text-accent">
                    {figures[category.count]}
                  </span>
                ) : null}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{category.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <p className="text-sm text-text-muted">
            Paste a component. Both snippets below are cross-checked against{" "}
            <code>scripts/test_constraints.py</code> in both directions before this ships.
          </p>
          <div className="mt-4">
            <CheckerPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionWall;
