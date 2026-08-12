/**
 * Switchyard — the page's structural content.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Switchyard is a FICTIONAL product. It does not exist, the quotes below were
 * written for this demo, and the people and companies attributed to them are
 * invented. This file is sample output: it shows what the pack generates from
 * the prompt recorded in `docs/DEMO_PROMPTS.md`, in the same way
 * `demo/showcase/` is a page for the fictional "Nexus".
 *
 * Nothing here states a figure about `frontend-design-pro` itself. That is
 * deliberate — the previous version of this page quoted the pack's own counts,
 * two of them drifted, and it rendered "Six of 53" while the real count was 59.
 * A demo that markets a fictional product has no figures that can go stale.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Live figures cross the network from `/api/site/overview`, because a metric
 * strip that cannot be empty or fail is not a metric strip. Everything in this
 * file is structure, and structure only changes when the page does.
 */
import type { RegistryFeature } from "../components/BentoFeatures";
import type { Testimonial } from "../components/SocialProof";

export const PRODUCT = "Switchyard";

/** Every outbound link on the page. A demo links to the pack, not to a fiction. */
export const REPO_URL = "https://github.com/Krishna-Modi12/frontend-design-pro";

export const HERO = {
  eyebrow: "Release orchestration · self-hosted · runs beside your cluster",
  title: PRODUCT,
  lede: "Route every release through a yard that already knows what is on the track.",
  body: "Hold a rollout on a siding, move traffic by the increment you choose, and reverse the whole consist from one key — without opening a war room to find out what else is moving.",
  primaryCta: "Read the rollout guide",
  secondaryCta: "See what it does",
} as const;

/**
 * The hero's right column: a real session against the CLI, not a screenshot of
 * one. Kept to short lines so it never overflows at 390px, and rendered as text
 * so it is selectable, searchable and readable by a screen reader.
 */
export interface TerminalLine {
  id: string;
  /** `cont` is a wrapped command — a shell marks those `>`, never `$` again. */
  kind: "prompt" | "cont" | "out" | "flag" | "ok";
  text: string;
}

export const TERMINAL: TerminalLine[] = [
  { id: "l1", kind: "prompt", text: "switchyard roll api@4b21f0c --to 10%" },
  { id: "l2", kind: "out", text: "consist  api · worker · scheduler" },
  { id: "l3", kind: "out", text: "holding  2 services already moving" },
  { id: "l4", kind: "flag", text: "  ! scheduler is mid-rollout (38%)" },
  { id: "l5", kind: "flag", text: "  ! blast radius would reach checkout" },
  { id: "l6", kind: "out", text: "" },
  // Wrapped at the shell's own continuation, not because it was too long to
  // think about: at 54 characters this line ran past the panel and the capture
  // showed a command cut off mid-word. The panel scrolls, but a screenshot
  // cannot, and the screenshot is what most people see.
  { id: "l7", kind: "prompt", text: "switchyard roll api@4b21f0c --to 10% \\" },
  { id: "l8", kind: "cont", text: "  --after scheduler" },
  { id: "l9", kind: "ok", text: "queued on siding 3 · starts in 4m12s" },
  { id: "l10", kind: "ok", text: "reverse with: switchyard back api" },
];

/**
 * Six capabilities, six spans that do not divide evenly — 2+1+1 over 1+2+1.
 * An equal-weight grid tells a reader every feature matters the same amount,
 * which is never true and is the first thing that makes a page look generated.
 */
export const FEATURES: RegistryFeature[] = [
  {
    id: "progressive",
    title: "Progressive rollout",
    body: "Move traffic in the increments you name — 1%, 10%, a single availability zone, one customer. Each step holds until its error budget clears, and a step that does not clear never advances on its own.",
    mark: "bracket",
    span: "lg:col-span-2",
  },
  {
    id: "reverse",
    title: "One-key reverse",
    body: "Roll the whole consist back to the last good revision, including the config and the migration guard, in one command.",
    mark: "arrow",
    span: "",
  },
  {
    id: "radius",
    title: "Blast radius",
    body: "See which services a change can reach before it moves, derived from real call traffic rather than a diagram somebody drew in 2023.",
    mark: "rings",
    span: "",
  },
  {
    id: "sidings",
    title: "Preview sidings",
    body: "Every branch gets a full environment on a siding, torn down when the branch merges.",
    mark: "track",
    span: "",
  },
  {
    id: "graph",
    title: "Dependency graph",
    body: "The yard keeps its own map of what depends on what, rebuilt from traces every night. When two rollouts would collide, the second one waits instead of finding out in production.",
    mark: "grid",
    span: "lg:col-span-2",
  },
  {
    id: "audit",
    title: "Signed audit trail",
    body: "Who moved what, when, and which approval let it through — signed, exportable, and boring on purpose.",
    mark: "seal",
    span: "",
  },
];

/**
 * Invented quotes for an invented product, in the same register as
 * `demo/showcase/`. Two wide and one narrow, so the row does not read as a
 * three-up template. Each names something specific enough to be falsifiable if
 * the product were real — a vague testimonial is placeholder copy wearing a
 * name.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "We moved from a Thursday release train to twelve deploys a day without adding anyone to the on-call rotation. The part that did it was the hold — engineers stopped asking in chat whether it was safe to ship, because the yard already knew.",
    name: "Priya Raghunathan",
    role: "Staff engineer, platform",
    company: "Northbound Logistics",
    span: "lg:col-span-2",
  },
  {
    id: "t2",
    quote:
      "The dependency graph caught a migration that would have taken checkout down with it. That one catch paid for the year.",
    name: "Tomas Lindqvist",
    role: "Director of engineering",
    company: "Ferrule",
    span: "lg:col-span-2",
  },
  // The narrow column, so the quote is written short rather than wrapped short.
  // A long quote here came out eight lines of four words in the capture.
  {
    id: "t3",
    quote: "Median rollback went from eleven minutes with a runbook to one command.",
    name: "Dede Okonkwo",
    role: "SRE lead",
    company: "Cartage",
    span: "",
  },
];

export const FOOTER_NOTE =
  "Switchyard is a fictional product. This page is sample output from the frontend-design-pro skill pack, generated under its own rules.";
