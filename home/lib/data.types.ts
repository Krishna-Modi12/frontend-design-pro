/**
 * Shape of `lib/data.generated.json`, written by
 * `tools/pages-data/generate.mjs` from the registry in `SKILL.md`, each
 * skill's frontmatter, and `scripts/check_figures.py --truth`. Never hand-edit
 * the JSON — these types exist so a shape drift in the generator fails
 * `tsc --noEmit` instead of shipping a silent `any`.
 */

export interface Figures {
  skills: number;
  coreFiles: number;
  referenceFiles: number;
  referenceDepthTokens: number;
  exampleFiles: number;
  antiExamples: number;
  testFiles: number;
  releaseGates: number;
  parserConstraints: number;
  regexConstraints: number;
  ciConstraints: number;
  registryTokens: number;
  bandLow: number;
  bandHigh: number;
}

export interface SkillRecord {
  id: string;
  path: string;
  keywords: string[];
  registryDep: string;
  deps: string[];
  budget: number;
  group: string;
  covers: string;
  trySaying: string;
}

/**
 * One `skills/<skill>/references/<name>` file. The hero draws one mark per
 * record, width scaled by `tokens` — see `components/HeroCorpus.tsx`.
 * `tokens` is the repo's canonical measure (LF-normalised bytes ÷ 4), and the
 * generator asserts both the count and the sum against
 * `check_figures.py --truth` before writing, so these cannot drift from the
 * `referenceFiles` / `referenceDepthTokens` figures above.
 */
export interface ReferenceRecord {
  skill: string;
  name: string;
  tokens: number;
}

export interface Adapter {
  dir: string;
  label: string;
}

export interface GeneratedData {
  figures: Figures;
  baseDeps: string[];
  skills: SkillRecord[];
  references: ReferenceRecord[];
  adapters: Adapter[];
  version: string;
}
