import type { ReactElement } from "react";
import { cardShell, sectionShell, sectionSpacing } from "../lib/tokens";

/** The six marks. Geometric, one per card, never a numbered badge — the registry
 *  is a lookup table, not a sequence, and 01/02/03 would imply an order. */
export type FeatureMark = "bracket" | "dot" | "line" | "diamond" | "arc" | "square";

export interface RegistrySkill {
  /** The real directory under `skills/`, and the key. */
  id: string;
  title: string;
  /** Verbatim `description:` from that skill's own frontmatter. */
  description: string;
  mark: FeatureMark;
  span: string;
}

export interface BentoFeaturesProps {
  skills: RegistrySkill[];
  /** How many skills exist in total, so six cards are not read as all of them. */
  totalSkills: number;
}

const MARK_PATH: Record<FeatureMark, string> = {
  bracket: "M9 2H2v12h7",
  dot: "M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  line: "M2 8h12",
  diamond: "M8 2l6 6-6 6-6-6z",
  arc: "M2 13A6 6 0 0 1 14 13",
  square: "M3 3h10v10H3z",
};

export default function BentoFeatures({
  skills,
  totalSkills,
}: BentoFeaturesProps): ReactElement {
  return (
    <section id="registry" className={sectionShell}>
      <div className={sectionSpacing}>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          The registry
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-ink-muted">
          Six of {totalSkills} skills, each a real directory under{" "}
          <code className="font-mono text-ink">skills/</code>. The description on
          every card is that skill&rsquo;s own frontmatter, copied without edits.
        </p>

        <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill: RegistrySkill) => (
            <li key={skill.id} className={`${cardShell} ${skill.span} p-6`}>
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4 text-accent">
                <path
                  d={MARK_PATH[skill.mark]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                {skill.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-accent">skills/{skill.id}/</p>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted">
                {skill.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
