/**
 * The page's structural content — everything that is not a figure.
 *
 * Figures cross the network from `/api/site/overview` because they change when
 * the pack changes. These do not: they are the shape of the repo, and if one of
 * them goes stale it is because a directory was renamed, which is a code change,
 * not a data change.
 *
 * Every string here was copied out of the repo. The source is named above each
 * block so it can be re-derived rather than trusted.
 */
import type { EnforcedRule } from "../components/ConstraintWall";
import type { RegistrySkill } from "../components/BentoFeatures";
import type { Adapter } from "../components/InstallMatrix";

export const REPO_URL = "https://github.com/Krishna-Modi12/frontend-design-pro";

/** metadata.json · stats.skills and stats.ci_constraints. */
export const TOTAL_SKILLS = 19;
export const TOTAL_CONSTRAINTS = 53;

/**
 * `descriptions` are the verbatim `description:` line from each
 * `skills/{id}/SKILL.md` frontmatter. Titles are the human form of the same
 * directory name — note `threejs-3d` and `animations`, which are the real IDs.
 */
export const REGISTRY_SKILLS: RegistrySkill[] = [
  {
    id: "landing-pages",
    title: "Landing pages",
    description:
      "Marketing pages — heroes, pricing, testimonials, bento grids, social proof, CTAs, empty states, onboarding.",
    mark: "bracket",
    span: "lg:col-span-2",
  },
  {
    id: "forms",
    title: "Forms",
    description:
      "Forms and auth — validation, RHF + Zod, error states, checkout, login/signup, OTP/MFA, payments.",
    mark: "dot",
    span: "lg:col-span-1",
  },
  {
    id: "threejs-3d",
    title: "Three.js and R3F",
    description:
      "3D web experiences with React Three Fiber — scenes, geometry, materials, lighting, shaders, post-processing, model loading, raycasting.",
    mark: "diamond",
    span: "lg:col-span-1",
  },
  {
    id: "animations",
    title: "Animations",
    description:
      "Motion — easing and timing rules, Framer Motion, GSAP, scroll-driven experiences, view transitions, reduced motion.",
    mark: "arc",
    span: "lg:col-span-1",
  },
  {
    id: "agent-ops",
    title: "Agent ops",
    description:
      "Agent operating discipline — token budgeting, cross-session memory, self-improvement loops, self-verification, parallel work, and subagent orchestration.",
    mark: "line",
    span: "lg:col-span-2",
  },
  {
    id: "iconography",
    title: "Iconography",
    description:
      "Icon systems — sizing, weight matching, colour inheritance, hit areas, SVG accessibility, and avatar patterns.",
    mark: "square",
    span: "lg:col-span-1",
  },
];

/**
 * core/validate-checklist.md, cross-checked against the suite that reports each
 * ID — `scripts/parser_constraints.js` for the AST three,
 * `scripts/test_constraints.py` for the regex three.
 */
export const ENFORCED_RULES: EnforcedRule[] = [
  {
    id: "TYP-02",
    enforcer: "regex",
    rule: "No Inter as the display face",
    detail:
      "Roboto, Arial, Poppins, DM Sans and Space Grotesk fail the same check. The default typeface is the fastest way to make three unrelated products look like one.",
  },
  {
    id: "TOK-01",
    enforcer: "regex",
    rule: "OKLCH tokens, never hex",
    detail:
      "A hex value in a token definition fails. OKLCH is what makes a lightness ramp hold its hue instead of drifting grey in the middle.",
  },
  {
    id: "SLOP-01",
    enforcer: "regex",
    rule: "No placeholder names",
    detail:
      "The two stock filler names fail outright — printing them here would trip this rule on this very file. It is the cheapest tell that nobody read the output before shipping it.",
  },
  {
    id: "MOTION-01",
    enforcer: "AST",
    rule: "Reduced motion has to work",
    detail:
      "The parser checks for a real matchMedia call, hook, media query or motion-reduce: variant. A prefers-reduced-motion block that sets nothing does not count.",
  },
  {
    id: "DELAY-01-AST",
    enforcer: "AST",
    rule: "No fake loading states",
    detail:
      "A setTimeout gating state inside a mount effect is a skeleton pretending to wait for a request that was never made.",
  },
  {
    id: "TS-01-AST",
    enforcer: "AST",
    rule: "Declared prop types must be used",
    detail:
      "An exported Props interface that nothing is typed with is documentation of an API the component does not have.",
  },
];

/** install/README.md — the adapter table, including its own untested column. */
export const ADAPTERS: Adapter[] = [
  {
    id: "cursor",
    mode: "auto",
    untested: false,
    installs: ".cursor/rules/frontend-design-pro.mdc",
  },
  {
    id: "copilot",
    mode: "auto",
    untested: false,
    installs: ".github/copilot-instructions.md",
  },
  {
    id: "windsurf",
    mode: "auto",
    untested: true,
    installs: ".windsurf/rules/frontend-design-pro.md",
  },
  {
    id: "continue",
    mode: "auto",
    untested: true,
    installs: ".continue/rules/frontend-design-pro.md",
  },
  { id: "aider", mode: "auto", untested: true, installs: "CONVENTIONS.md" },
  { id: "claude", mode: "manual", untested: false, installs: "unzip into ~/.claude/skills/" },
  { id: "chatgpt", mode: "manual", untested: false, installs: "Custom GPT knowledge upload" },
  { id: "gemini", mode: "manual", untested: false, installs: "system instruction" },
  { id: "codex", mode: "manual", untested: false, installs: "AGENTS.md merge" },
  { id: "generic", mode: "manual", untested: false, installs: "any other host" },
];
