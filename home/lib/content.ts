export const PRODUCT = "frontend-design-pro";
export const REPO_URL = "https://github.com/Krishna-Modi12/frontend-design-pro";
export const INSTALL_COMMAND = "npx skills add Krishna-Modi12/frontend-design-pro";

export const NAV = [
  { id: "problem", label: "Numbers" },
  { id: "how-it-works", label: "How it works" },
  { id: "wall", label: "The wall" },
  { id: "install", label: "Install" },
] as const;

/**
 * The real adapter list ships in `data.generated.json` (14 entries, matching
 * `metadata.json`'s "14 adapters (10 automatic, 4 manual)"), generated from
 * `install/`'s own directories by `tools/pages-data/generate.mjs` — see
 * `data.types.ts` for the `Adapter` shape. The page this replaces listed 13
 * by hand and had drifted from the real count.
 */

export const PROBLEM_COPY = {
  eyebrow: "01 — The problem",
  heading: "A pack is not a document.",
  body: "Behind the router sits 373,600 tokens of reference depth — material every skill can point into, none of it loaded until a request routes there. The pack is not handed to an agent whole: a router matches your request against trigger keywords, opens exactly one of 19 skills plus the core files it declares, and everything else stays on disk.",
} as const;

export const ROUTER_DEFAULT_REQUEST = "Build a landing page with pricing and testimonials";

export const ROUTER_EXAMPLES = [
  { label: "a landing page", request: "Build a landing page with pricing and testimonials" },
  { label: "a checkout form", request: "Multi-step checkout form with validation and error recovery" },
  { label: "a data table", request: "Sortable data table with pagination and a loading skeleton" },
  { label: "a colour theme", request: "Generate a dark theme from this brand colour and prove it passes AA" },
  { label: "something out of scope", request: "rewrite the billing service in Go" },
] as const;

export const HOW_IT_WORKS = [
  {
    letter: "A",
    title: "Trigger keywords match intent",
    caption: "Matched by keyword, not guessed",
    body: "The router reads your prompt, matches it against every skill's trigger keywords, and loads exactly one — the most specific match — plus the core files it declares. No match, and it asks a clarifying question instead of guessing. Try it below.",
  },
  {
    letter: "B",
    title: "Constraints run first",
    caption: "Checked before it ships",
    body: "What gets written is held to 60 machine-checked constraints (17 AST + 43 regex) — the first half walked through the TypeScript compiler API, the second run as patterns. Ten deliberate anti-examples exist to prove the checks actually fire.",
  },
  {
    letter: "C",
    title: "Lazy-loaded, type-safe output",
    caption: "Only what's needed loads",
    body: "One skill plus its declared dependencies — nothing else opens. A typical request loads a few thousand tokens against the full depth available, and every shipped example compiles under tsc --strict.",
  },
] as const;

export const WALL_MARQUEE = [
  "No Inter/Roboto/Poppins as a display face",
  "No raw hex — OKLCH tokens only",
  "No min-h-screen",
  "No transition-all",
  "No bounce or elastic easing",
  "No placeholder brand names",
  "No John Doe, no user123",
  "No 'Elevate your workflow' copy",
  "No bg-clip-text on body copy",
  "No outline-none without a focus ring",
  "Icon-only buttons need aria-label",
  "prefers-reduced-motion is mandatory",
] as const;

export interface WallCategory {
  id: string;
  title: string;
  body: string;
  /** Short resting-state caption, shown in place of `body` until the card's
      disclosure opens. Categories with a live `count` use `title` for this
      instead (already 2-3 words) rather than duplicating it here. */
  caption?: string;
  /** Key into `Figures`, when this category has a live count to show. */
  count?: "parserConstraints" | "regexConstraints";
  wide?: boolean;
}

export const WALL_CATEGORIES: WallCategory[] = [
  {
    id: "ast",
    title: "Semantic constraints",
    count: "parserConstraints",
    body: "Walked through the TypeScript compiler API rather than matched as text — the eight rules a regex cannot see without understanding the tree it's reading.",
    wide: true,
  },
  {
    id: "regex",
    title: "Pattern constraints",
    count: "regexConstraints",
    body: "Run as regular expressions over source. Faster to check, and the half this page's own checker below can run in your browser.",
    wide: true,
  },
  {
    id: "slop",
    title: "No placeholder anything",
    caption: "No placeholder defaults, ever",
    body: "Acme, John Doe, user123, $99.99, 'Elevate your workflow' — the defaults an agent reaches for when nothing else is specified.",
  },
  {
    id: "motion",
    title: "No dated easing",
    caption: "Motion stays calm, not bouncy",
    body: "No bounce, elastic or back easing on an entrance. No transition: all. Reduced motion is functional, not a string mention.",
  },
  {
    id: "type",
    title: "No default typefaces",
    caption: "No default typefaces allowed",
    body: "Inter, Roboto, Arial, Poppins, DM Sans, Space Grotesk are banned as a display face — fine in a fallback stack, never carrying identity.",
  },
  {
    id: "layout",
    title: "No min-h-screen",
    caption: "Viewport units that actually fit",
    body: "100vh ignores the mobile toolbar. min-h-[100dvh] is the only accepted form, checked by pattern on every shipped example.",
  },
];
