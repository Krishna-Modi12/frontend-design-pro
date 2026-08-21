import type { SkillRecord } from "./data.types";

/**
 * A port of the router in `.github/pages/app.js` (the page this replaces),
 * itself an implementation of the loading protocol written in the root
 * `SKILL.md`:
 *
 *     2. Match trigger keywords → pick one skill.
 *     ...
 *     7. No keyword match → ask ONE clarifying question. Never guess.
 *
 * and, from the registry's preamble, "Most specific wins." Both halves are
 * implemented, and the second matters more than it looks: a router that falls
 * back to a default skill when nothing matches answers confidently in exactly
 * the case the pack documents itself as refusing — and the first thing anyone
 * types into a box like this is something that matches nothing.
 */

const WORD = /[a-z0-9]+/g;

function normalize(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
}

export function matchedKeywords(skill: SkillRecord, request: string): string[] {
  const haystack = normalize(request);
  const hits: string[] = [];
  for (const keyword of skill.keywords) {
    if (haystack.includes(normalize(keyword))) hits.push(keyword);
  }
  return hits;
}

/**
 * "Most specific wins" scored as words matched, so a two-word trigger
 * ("landing page") outranks a one-word trigger that also hit — the registry's
 * own tie-break ("form validation" goes to `forms`, not `react-components`)
 * expressed as arithmetic.
 */
export function score(hits: string[]): number {
  return hits.reduce((total, k) => total + (k.match(WORD) ?? []).length, 0);
}

export type RouteResult =
  | { kind: "none" }
  | { kind: "ambiguous"; between: [SkillRecord, SkillRecord] }
  | { kind: "hit"; skill: SkillRecord; hits: string[]; score: number };

interface Ranked {
  skill: SkillRecord;
  hits: string[];
  score: number;
}

export function route(skills: SkillRecord[], request: string): RouteResult {
  const ranked: Ranked[] = skills
    .map((skill) => {
      const hits = matchedKeywords(skill, request);
      return { skill, hits, score: score(hits) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.id.localeCompare(b.skill.id));

  const first = ranked[0];
  if (first === undefined) return { kind: "none" };

  const second = ranked[1];
  if (second !== undefined && second.score === first.score) {
    return { kind: "ambiguous", between: [first.skill, second.skill] };
  }
  return { kind: "hit", skill: first.skill, hits: first.hits, score: first.score };
}
