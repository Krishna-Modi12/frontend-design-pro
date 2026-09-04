export const PRODUCT = "frontend-design-pro";
export const REPO_URL = "https://github.com/Krishna-Modi12/frontend-design-pro";
export const INSTALL_COMMAND = "npx skills add Krishna-Modi12/frontend-design-pro";

/**
 * v2.4: dropped `checks` as a top-level link — six items chronically
 * overran the 768px budget (see `Navbar.tsx`'s width-budget comment; v2.2
 * and v2.3 both spent whole passes just trimming padding to keep six
 * items fitting). `checks` (`SectionProof`) sits directly after
 * `how-it-works` (`SectionHow`) in page order, so it stays fully reachable
 * by anchor/scroll — this only removes it from the nav list, not the
 * section itself.
 */
export const NAV = [
  { id: "problem", label: "Numbers" },
  { id: "catalog", label: "Catalog" },
  { id: "how-it-works", label: "How it works" },
  { id: "showcase", label: "Showcase" },
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
  eyebrow: "The problem",
  heading: "A pack is not a document.",
  body: "Behind the router sits 436,039 tokens of reference depth — material every skill can point into, none of it loaded until a request routes there. The pack is not handed to an agent whole: a router matches your request against trigger keywords, opens exactly one of 19 skills plus the core files it declares, and everything else stays on disk.",
} as const;

export const CATALOG_COPY = {
  eyebrow: "The catalog",
  heading: "19 skills. Four of them, to scan.",
  body: "One per group, chosen for how directly each demonstrates the pack's own argument — the full 19 are in the registry the router below searches.",
} as const;

/**
 * Curated, not exhaustive — one per registry group (`Meta`, `Making it look
 * right`, `Building something new`, `Making it work well`), each picked
 * because it ties back to something else on this page: `agent-ops` is the
 * context-budget story the router demo makes concrete; `design-system` is
 * the DESIGN.md discipline this very page was built under; `landing-pages`
 * is what `Bellwether` in the showcase below was built from; `react-performance`
 * is the image/lazy-loading budget the showcase's own screenshots follow.
 * IDs are validated against the live registry by `tools/pages-data/generate.mjs`
 * at data-generation time — a future rename fails the build, not a card.
 */
export const SKILL_CATALOG_IDS = ["agent-ops", "design-system", "landing-pages", "react-performance"] as const;

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
    body: "What gets written is held to 61 machine-checked constraints (17 AST + 44 regex) — the first half walked through the TypeScript compiler API, the second run as patterns. Ten deliberate anti-examples exist to prove the checks actually fire.",
  },
  {
    letter: "C",
    title: "Lazy-loaded, type-safe output",
    caption: "Only what's needed loads",
    body: "One skill plus its declared dependencies — nothing else opens. A typical request loads a few thousand tokens against the full depth available, and every shipped example compiles under tsc --strict.",
  },
] as const;

export const PROOF_COPY = {
  eyebrow: "Proof",
  heading: "Not asserted. Checked, live.",
} as const;

export const SHOWCASE_COPY = {
  eyebrow: "The showcase",
  heading: "Four things this pack actually built.",
  body: "Two are real, deployed apps — open them. Two are stub-typed reference components, checked but never installed, shown as static captures instead.",
} as const;

export interface ShowcaseProject {
  id: "bellwether" | "wavelet" | "ledgerline" | "arclight";
  name: string;
  tagline: string;
  variant: "live" | "static";
  /** Only meaningful for `variant: "live"` — the static cards' href is the
      imported full-page screenshot, resolved in `SectionShowcase.tsx`. */
  href: string;
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "bellwether",
    name: "Bellwether",
    tagline: "A landing page for a schema-migration rehearsal tool — a real, installed Next.js app, deployed.",
    variant: "live",
    href: "https://krishna-modi12.github.io/frontend-design-pro/landing-page/",
  },
  {
    id: "wavelet",
    name: "Wavelet",
    tagline: "A dark analytics-SaaS page with a WebGL hero — a real, installed Next.js + React Three Fiber app, deployed.",
    variant: "live",
    href: "https://krishna-modi12.github.io/frontend-design-pro/showcase/",
  },
  {
    id: "ledgerline",
    name: "Ledgerline",
    tagline: "An accounts dashboard — type-checked against real component contracts, never installed, shown as a static capture.",
    variant: "static",
    href: "",
  },
  {
    id: "arclight",
    name: "Arclight",
    tagline: "A sign-in form with real validation — type-checked, never installed, shown as a static capture.",
    variant: "static",
    href: "",
  },
];

/**
 * The showcase demo was called "Nexus" for most of its life — one of the four
 * placeholder brand names `SLOP-05` bans. It shipped as a declared
 * `GRANDFATHERED` waiver in `scripts/test_constraints.py`, printed with its
 * reason on every run of the suite, and this paragraph restated that waiver on
 * the page rather than leaving it in a script comment nobody reads.
 *
 * It is renamed now and the waiver is deleted, so the paragraph makes the
 * stronger claim instead: the examples on this page pass the checks with
 * nothing waived. That is a claim a reader can verify, which is why it cites
 * the suite rather than the README — `GRANDFATHERED` is the empty dict, and
 * `grandfathered_check()` fails the suite if an entry returns.
 */
export const SHOWCASE_SELF_CHECK =
  "Every example above is checked against the same constraints this pack hands your agent — including SLOP-05, which bans placeholder brand names. The showcase itself used to fail that one, and rather than quietly skip our own repository we shipped the violation as a declared waiver that printed on every run. It is renamed, the waiver is gone, and a test fails the suite if one comes back.";

/** Cited by `ShowcaseSelfCheck` as a real link. Split out of the prose rather
    than left in the sentence so the component is not doing string surgery to
    find where the anchor starts. */
export const SHOWCASE_SELF_CHECK_SOURCE = "scripts/test_constraints.py";
