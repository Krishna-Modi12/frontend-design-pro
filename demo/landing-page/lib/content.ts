/**
 * Bellwether — every word on the page, in one place.
 *
 * Bellwether is a FICTIONAL product: a tool that replays a pending schema
 * change against a mirror of production traffic and reports what it would lock
 * before it touches the primary. Nothing here describes a real service, and the
 * page says so on itself rather than only in this comment — a disclosure that
 * lives in a source file is a disclosure nobody reading the page will see.
 *
 * ── Two rules govern this file ───────────────────────────────────────────────
 *
 * 1. No figure about `frontend-design-pro` appears anywhere on this page.
 *    An earlier version served the pack's own counts here, two of them drifted
 *    out of step with `metadata.json`, and a screenshot in the repo README
 *    shipped a wrong count for a full release. A fictional product cannot
 *    drift, because there is nothing for it to drift from.
 *
 * 2. The pack's own vocabulary is avoided on purpose, which is harder here than
 *    it looks. Gate 11 reads this file for "<number> <noun>" pairs, and the
 *    nouns it watches — constraints, tests, gates, references, examples — are
 *    all ordinary words for a database tool. A foreign-key CONSTRAINT is the
 *    obvious thing a schema-migration product would talk about, and a sentence
 *    putting a figure next to that noun would be read as a claim about this
 *    repo and fail the build. The copy says "checks", "rules" and "relations"
 *    instead. That is a real cost of the demo living inside the pack, and it is
 *    cheaper than the alternative, which was a page that quietly went stale.
 *
 *    Writing this very note is how that was confirmed. The first draft spelled
 *    the trap out with a worked example — a real number beside the real noun —
 *    and Gate 11 failed the build on the comment warning about the failure.
 *
 * Figures are irregular on purpose: the anti-slop wall bans round data, because
 * 1,000 migrations and 50% faster are what a generated page says when nobody
 * measured anything.
 */

/** Invented for the sector. Not Acme, Cloudly, SmartFlow or Nexus. */
export const PRODUCT = "Bellwether";

export const REPO_URL = "https://github.com/Krishna-Modi12/frontend-design-pro";

/**
 * Short on purpose. The first draft ran "Schema change rehearsal · Postgres and
 * MySQL · Runs in your own VPC", which wrapped onto a second line at 1920 and
 * restated three of the four proof points sitting 200px below it. An eyebrow
 * names the category; the proof bar carries the specifics.
 */
export const TAGLINE = "Schema change rehearsal";

/**
 * The headline. Two sentences, because the second one is the product: the
 * rehearsal is the first run, and the whole pitch is that it costs nothing.
 */
export const HEADLINE_LEAD = "Every migration runs twice.";
export const HEADLINE_REST = "The first time, nothing is at stake.";

export const SUBHEAD =
  "Bellwether replays a pending schema change against a mirror of live traffic, measures what it locks and for how long, and returns a verdict you can read before anything reaches the primary.";

/** Technical proof, not a logo wall. Sits within 40px of the CTA pair. */
export const PROOF_POINTS = [
  "Postgres 12–17",
  "MySQL 8",
  "Runs in your VPC",
  "No agent on the primary",
];

/* ── The hero artifact ──────────────────────────────────────────────────────
   A rehearsal report for one migration. This replaces the terminal panel the
   previous version of this page put here, which was the single most generic
   component a developer-tool page can ship — and which showed a command being
   typed rather than the thing the product actually produces. */

export interface ReportRow {
  label: string;
  value: string;
  /** Shown under the value in the report's second column. */
  note: string;
}

export type Verdict = "pass" | "hold" | "refuse";

export const REPORT = {
  id: "Rehearsal 4192",
  verdict: "hold" as Verdict,
  verdictLabel: "Hold",
  /** The statement under rehearsal. Real DDL, not a placeholder. */
  statement: "ALTER TABLE orders ADD COLUMN settled_at timestamptz",
  target: "orders · primary-eu-2",
  rows: [
    {
      label: "Rows touched",
      value: "48,213,904",
      note: "Counted on the mirror, not estimated from the planner.",
    },
    {
      label: "Traffic replayed",
      value: "2.1%",
      note: "A slice weighted to match the live read/write mix.",
    },
    {
      label: "Longest lock",
      value: "1.94s",
      note: "ACCESS EXCLUSIVE, taken while the index builds.",
    },
    {
      label: "Observed p95",
      value: "340ms",
      note: "Checkout writes queued behind the lock in rehearsal.",
    },
  ] satisfies ReportRow[],
  finding:
    "The index build blocks checkout writes for 1.94s. At 14:00 that is roughly 2,700 queued writes — enough to trip the payment timeout. Re-run after 02:20, or build the index CONCURRENTLY and keep the window under 40ms.",

  /**
   * Write volume by hour, midnight to 23:00, normalised to the busiest hour.
   * The report's advice is "re-run after 02:20", and this is the evidence for
   * it: the peak sits at 14:00 where the finding says it does, and the trough
   * is where it sends you. A recommendation with no visible basis is the thing
   * a generated page produces — the reader should be able to check this one by
   * looking at it.
   */
  trafficByHour: [
    18, 12, 9, 7, 6, 8, 14, 27, 46, 63, 74, 81,
    86, 92, 100, 94, 88, 79, 71, 62, 51, 39, 29, 23,
  ],
  /** Half-open [from, to) in local hours — the window the finding points at. */
  quietWindow: { from: 2, to: 5 },
} as const;

/* ── Feature bento ──────────────────────────────────────────────────────────
   Six cells at four different widths. Rule 3 of the landing-pages skill: never
   an equal-height card grid, and at least one element per section breaks the
   column grid — here the first cell spans two rows and the last runs full
   width, so no two rows of this bento share a shape. */

export interface Feature {
  title: string;
  body: string;
  /** Tailwind column/row spans for the lg breakpoint. */
  span: string;
  /**
   * Optional figures pinned to the bottom of a cell. Only the tall cell uses
   * this, and it is not decoration: that cell claims a planner estimate is a
   * guess, and these two numbers are the claim being demonstrated instead of
   * repeated. A cell that spans two rows has to earn the second one — the first
   * draft of this bento left it two-thirds empty, which reads as a layout
   * nobody checked rather than as breathing room.
   */
  detail?: { label: string; value: string }[];
}

export const FEATURES: Feature[] = [
  {
    title: "Replay, not simulation",
    body: "The rehearsal runs your statement against a real copy at production scale — production's index bloat, production's row widths, production's dead tuples. A number from the query planner is a guess about all three.",
    span: "lg:col-span-3 lg:row-span-2",
    detail: [
      { label: "Planner estimate", value: "40ms" },
      { label: "Observed in rehearsal", value: "1.94s" },
    ],
  },
  {
    title: "Lock forecast",
    body: "Which lock, on which relation, for how long, at which hour. The answer is a distribution across the day, not one number pretending the load is flat.",
    span: "lg:col-span-3",
  },
  {
    title: "Quiet-window finder",
    body: "Bellwether reads a fortnight of traffic and names the windows where this particular lock would cost the least.",
    span: "lg:col-span-3",
  },
  {
    title: "No agent on the primary",
    body: "Reads a replica and the write-ahead log. Nothing installs beside the database you are already worried about.",
    span: "lg:col-span-2",
  },
  {
    title: "The reversal is rehearsed too",
    body: "The down path replays on the same copy. A migration you cannot reverse is not ready, whatever the up path did — and two-thirds of down paths have never been run once.",
    span: "lg:col-span-4",
  },
  {
    title: "A verdict, in the pull request",
    body: "Pass, hold or refuse — with the statement that caused it and the rewrite that clears it. The reviewer reads one paragraph instead of reconstructing a plan from a diff.",
    span: "lg:col-span-6",
  },
];

/* ── Social proof ───────────────────────────────────────────────────────────
   Invented quotes for an invented product, attributed to invented people at
   invented companies. Two wide, one narrow — masonry rather than three uniform
   cards. The names are not the ones in the skill file's own example, which
   would have been copying the illustration rather than following the rule. */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  span: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We had a rule that migrations only shipped on Tuesday mornings, and the rule existed because nobody could answer how long a statement would lock. It is answerable now, so the rule is gone.",
    name: "Ifeoma Achebe",
    role: "Staff Engineer · Kestrel Freight",
    span: "lg:col-span-7",
  },
  {
    quote:
      "The reversal rehearsal is the part I did not expect to care about. Two of our down paths did not work. We learned that on a copy, at four in the afternoon, instead of at two in the morning.",
    name: "Tomás Beltrán",
    role: "Database Reliability · Orrery Health",
    span: "lg:col-span-5",
  },
  {
    quote:
      "A reviewer reads one paragraph now. Before, they were guessing at a plan from a diff and hoping.",
    name: "Sunita Kaur Grewal",
    role: "Platform Lead · Thornbury",
    span: "lg:col-span-12",
  },
];

/* ── Closing CTA ────────────────────────────────────────────────────────────
   Short headline, one primary action, and risk-reversal microcopy — the three
   parts of a CTA bar in the landing-pages skill. */

export const CTA_HEADLINE = "Rehearse the next one.";
export const CTA_SUPPORT =
  "Point Bellwether at a replica and open a pull request. First verdict in about ten minutes.";
export const CTA_REASSURANCE = "Reads a replica · installs nothing on the primary · no card";

/**
 * The disclosure, rendered on the page rather than buried here. A page that
 * invents a company, four operating figures and three customers owes the reader
 * a plain sentence saying so.
 */
export const DISCLOSURE =
  "Bellwether is not a real product. This page is sample output from the frontend-design-pro skill pack — generated under the pack's own rules, then rendered and checked in a real browser.";
