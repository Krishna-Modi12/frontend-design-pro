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
 * Short on purpose. An eyebrow names the category; the proof bar carries the
 * specifics.
 */
export const TAGLINE = "Schema change rehearsal";

/**
 * One sentence, and it is the whole product.
 *
 * The light version of this page split the headline in two and set the second
 * half in a display italic. That worked at 80px in an editorial serif; in a
 * single grotesque it just looks like a sentence that lost its nerve halfway.
 * The second half moved into the subhead, where it reads as the explanation it
 * always was.
 */
export const HEADLINE = "Every migration runs twice.";

/**
 * Two lines at the hero's measure, not three. The landing-pages skill fixes
 * hero subtext at two lines, and a three-line subhead is the kind of thing that
 * is invisible in source and obvious on the page.
 */
export const SUBHEAD =
  "The first time against a copy of production, with real traffic replayed over it. The second time for real — and by then you already know what it locks.";

/** Technical proof, not a logo wall. Sits within 40px of the CTA pair. */
export const PROOF_POINTS = [
  "Postgres 12–17",
  "MySQL 8",
  "Runs in your VPC",
  "No agent on the primary",
];

/* ── The hero artifact ──────────────────────────────────────────────────────
   A rehearsal report for one migration. This replaces the terminal panel an
   older version of this page put here, which was the single most generic
   component a developer-tool page can ship — and which showed a command being
   typed rather than the thing the product actually produces.

   It survived the move to dark deliberately. The obvious dark-mode hero for a
   developer tool is a syntax-coloured code panel, which is the same mistake as
   the terminal wearing a different hat: it shows the input the reader already
   knows how to write, not the answer they are here for. */

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

/* ── How it works ───────────────────────────────────────────────────────────
   Three steps, and the markers are mono numerals rather than filled badges.
   The anti-slop wall bans numbered markers on content that is not a sequence —
   this one genuinely is a sequence, which is what makes 01/02/03 legitimate
   here and would not make it legitimate on the bento below. */

export interface Step {
  id: string;
  marker: string;
  title: string;
  body: string;
  /** Column span at `lg`. The middle step is the wide one. */
  span: string;
}

export const STEPS: Step[] = [
  {
    id: "connect",
    marker: "01",
    title: "Connect",
    body: "Point Bellwether at a read replica. Nothing is installed beside the database you are already worried about.",
    span: "lg:col-span-3",
  },
  {
    id: "rehearse",
    marker: "02",
    title: "Rehearse",
    body: "The pending statement runs against a copy at production scale, with a weighted slice of live traffic replayed over the top of it. Production's index bloat, production's row widths, production's contention.",
    span: "lg:col-span-5",
  },
  {
    id: "verdict",
    marker: "03",
    title: "Verdict",
    body: "Pass, hold or refuse — with the lock it took, how long it held, and the hour where it would cost least.",
    span: "lg:col-span-4",
  },
];

/* ── Feature bento ──────────────────────────────────────────────────────────
   Four cells, not six. The six-cell version carried two cards that restated
   what the steps above already said, and a bento earns its shape by having
   something different in every cell rather than by being large.

   Heights are not equalised — `items-start` on the grid lets each card end
   where its content ends. Rule 3 of the landing-pages skill: never an
   equal-height card grid. */

export interface Feature {
  id: string;
  title: string;
  body: string;
  /**
   * Optional figures pinned under the body. Only the first cell uses this, and
   * it is not decoration: that cell claims a planner estimate is a guess, and
   * these two numbers are the claim being demonstrated instead of repeated.
   */
  detail?: { label: string; value: string }[];
}

export const FEATURES: Feature[] = [
  {
    id: "replay",
    title: "Replay, not simulation",
    body: "The rehearsal runs your statement against a real copy at production scale. A number from the query planner is a guess about all of it.",
    detail: [
      { label: "Planner estimate", value: "40ms" },
      { label: "Observed in rehearsal", value: "1.94s" },
    ],
  },
  {
    id: "forecast",
    title: "Lock forecast",
    body: "Which lock, on which relation, for how long, at which hour. The answer is a distribution across the day, not one number pretending the load is flat.",
  },
  {
    id: "quiet",
    title: "Quiet-window finder",
    body: "Bellwether reads a fortnight of traffic and names the windows where this particular lock would cost the least.",
  },
  {
    id: "reversal",
    title: "The reversal is rehearsed too",
    body: "The down path replays on the same copy. A migration you cannot reverse is not ready, whatever the up path did — and two-thirds of down paths have never been run once.",
  },
];

/* ── Social proof ───────────────────────────────────────────────────────────
   Two invented quotes for an invented product, at two widths — never a row of
   uniform cards, which is the shape that makes invented praise look even more
   invented. The names are not the ones in the skill file's own example, which
   would have been copying the illustration rather than following the rule. */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  /** Initials for the avatar. Decorative — the name is right beside it. */
  initials: string;
  span: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "achebe",
    quote:
      "We retired the Tuesday-morning rule because we finally knew how long the lock would last. The rule only ever existed because nobody could answer that.",
    name: "Ifeoma Achebe",
    role: "Staff Engineer · Kestrel Freight",
    initials: "IA",
    span: "md:col-span-2",
  },
  {
    id: "beltran",
    quote:
      "Two of our down paths did not work. We learned that on a copy, at four in the afternoon, instead of at two in the morning.",
    name: "Tomás Beltrán",
    role: "Database Reliability · Orrery Health",
    initials: "TB",
    span: "md:col-span-1",
  },
];

/* ── Closing CTA ────────────────────────────────────────────────────────────
   Short headline, one primary action, and risk-reversal microcopy — the three
   parts of a CTA bar in the landing-pages skill. */

export const CTA_HEADLINE = "Rehearse the next one.";
export const CTA_SUPPORT =
  "Point Bellwether at a replica. First verdict in about ten minutes.";
export const CTA_REASSURANCE = "Reads a replica · installs nothing on the primary · no card";

/**
 * The disclosure, rendered on the page rather than buried here. A page that
 * invents a company, four operating figures and two customers owes the reader
 * a plain sentence saying so.
 */
export const DISCLOSURE =
  "Bellwether is not a real product. This page is sample output from the frontend-design-pro skill pack — generated under the pack's own rules, then rendered and checked in a real browser.";
