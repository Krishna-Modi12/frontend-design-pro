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

export interface Adapter {
  dir: string;
  label: string;
}

export interface GeneratedData {
  figures: Figures;
  baseDeps: string[];
  skills: SkillRecord[];
  adapters: Adapter[];
  version: string;
}
