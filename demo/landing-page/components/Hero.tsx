import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import { sectionShell } from "../lib/tokens";

export interface HeroProps {
  /** Repository the primary CTA points at. Passed in so the URL lives in one place. */
  repoUrl: string;
}

/** One line of the excerpt, carrying its real line number in `SKILL.md`. */
interface SourceLine {
  no: number;
  text: string;
}

/**
 * `SKILL.md` lines 60–68, verbatim. The line numbers are rendered rather than
 * decorative: this is the whole router, and a reader who thinks the page is
 * marketing can open the file and diff it against what is on screen.
 *
 * Copied rather than read at build time on purpose — the demo is documented as
 * liftable into another project, and a build that reaches two directories up
 * for a file outside its own tree stops being liftable.
 *
 * The cost of that copy is that these numbers move whenever the registry table
 * above them gains a row. Two new skills shifted them by two on the way in.
 * Re-check them against `SKILL.md` before recapturing the screenshot.
 */
const ROUTER_EXCERPT: SourceLine[] = [
  { no: 60, text: "## Loading protocol" },
  { no: 61, text: "" },
  { no: 62, text: "1. Read this file — always (2.0k)." },
  { no: 63, text: "2. Match trigger keywords → pick one skill." },
  { no: 64, text: "3. Load `skills/{id}/SKILL.md` (0.8–1.6k — measured, not estimated)." },
  {
    no: 65,
    text: "4. Load its listed core deps (0.6–0.9k each) plus the accessibility baseline when producing code.",
  },
  {
    no: 66,
    text: "5. Each skill has its own `references/` for depth — load a reference **only** when the skill file points you there for the specific task.",
  },
  {
    no: 67,
    text: "6. **Budget ≤8,000 tokens.** Over budget: drop the deepest reference first, note the omission.",
  },
  { no: 68, text: "7. No keyword match → ask ONE clarifying question. Never guess." },
];

type SegmentKind = "heading" | "path" | "strong" | "plain";

interface Segment {
  /** Stable across renders: line number plus the offset the run starts at. */
  id: string;
  kind: SegmentKind;
  text: string;
}

const SEGMENT_INK: Record<SegmentKind, string> = {
  heading: "text-ink-faint",
  path: "text-accent",
  strong: "text-ink",
  plain: "text-ink-muted",
};

/** Backticked paths and **bold** runs, in one pass, keeping their delimiters. */
const MARKUP = /(`[^`]+`|\*\*[^*]+\*\*)/g;

/**
 * Module scope, not a hook: the excerpt is a constant, so re-tokenising it on
 * every render would be work with no input that can change.
 */
function tokenize(line: SourceLine): Segment[] {
  if (line.text.startsWith("## ")) {
    return [{ id: `${line.no}:0`, kind: "heading", text: line.text }];
  }

  const segments: Segment[] = [];
  let offset = 0;

  for (const part of line.text.split(MARKUP)) {
    if (part.length === 0) {
      continue;
    }
    const kind: SegmentKind = part.startsWith("`")
      ? "path"
      : part.startsWith("**")
        ? "strong"
        : "plain";
    segments.push({ id: `${line.no}:${offset}`, kind, text: part });
    offset += part.length;
  }

  return segments;
}

const TOKENISED: { line: SourceLine; segments: Segment[] }[] = ROUTER_EXCERPT.map(
  (line: SourceLine) => ({ line, segments: tokenize(line) }),
);

interface BudgetFact {
  id: string;
  label: string;
  value: string;
}

/**
 * The cost per use, which is a different claim from the inventory in the strip
 * below: that one is what exists, this is what a request actually pays for it.
 *
 * Figures from `docs/AGENT_COMPATIBILITY.md` and step 6 of the protocol in the
 * panel opposite. The ceiling is not advisory — Gate 8a fails the build when a
 * skill exceeds it.
 */
const BUDGET: BudgetFact[] = [
  { id: "per-request", label: "Loaded per request", value: "5,000–6,300 tokens" },
  { id: "skills-read", label: "Skills read", value: "exactly one" },
  { id: "ceiling", label: "Hard ceiling", value: "8,000 tokens" },
];

/**
 * The headline steps down to `text-5xl` on mobile rather than starting at
 * `text-7xl`: "frontend-design-pro" at 72px is wider than a 390px viewport even
 * after the hyphen break, and `npm run demos:verify` fails a page that scrolls
 * sideways.
 */
export default function Hero({ repoUrl }: HeroProps): ReactElement {
  return (
    <section
      id="overview"
      className="flex min-h-[100dvh] flex-col justify-center border-b border-surface-border"
    >
      <div className={`${sectionShell} grid items-center gap-14 pt-24 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">
            Skill pack · MIT · React · Next.js · Tailwind
          </p>

          <h1 className="mt-6 text-balance break-words text-5xl font-semibold tracking-tighter sm:text-7xl lg:text-8xl">
            frontend-design-pro
          </h1>

          <div aria-hidden="true" className="mt-8 h-1.5 w-32 rounded-full bg-accent" />

          <p className="mt-8 max-w-lg text-pretty text-lg leading-relaxed text-ink-muted">
            Your agent loads exactly one skill. Not fifty thousand tokens of slop.
          </p>

          <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-ink-faint">
            A registry that routes instead of a document that gets pasted. The rules
            below are not advice — they are the checks that refuse to build a release.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CtaButton href={repoUrl} variant="primary" external>
              Read the rules
            </CtaButton>
            <CtaButton href="#registry" variant="secondary">
              See the registry
            </CtaButton>
          </div>
        </div>

        <div className="lg:col-span-5">
          <figure className="m-0">
            <div
              role="region"
              aria-label="SKILL.md router, lines 60 to 68"
              tabIndex={0}
              className="overflow-x-auto rounded-xl border border-surface-border bg-surface-sunken p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
            >
              <pre className="m-0 font-mono text-[0.8125rem] leading-relaxed">
                <code className="grid grid-cols-[2.25rem_1fr] gap-x-3">
                  {TOKENISED.map(
                    ({ line, segments }: { line: SourceLine; segments: Segment[] }) => (
                      <span key={line.no} className="contents">
                        <span
                          data-metric="true"
                          aria-hidden="true"
                          className="select-none text-right text-ink-faint/70"
                        >
                          {line.no}
                        </span>
                        <span className="whitespace-pre-wrap break-words">
                          {segments.map((segment: Segment) => (
                            <span key={segment.id} className={SEGMENT_INK[segment.kind]}>
                              {segment.text}
                            </span>
                          ))}
                        </span>
                      </span>
                    ),
                  )}
                </code>
              </pre>
            </div>
            <figcaption className="mt-3 text-xs text-ink-faint">
              <code className="font-mono">SKILL.md</code> lines 60–68, unedited. Every
              other file in the pack is reached from here.
            </figcaption>
          </figure>
        </div>
      </div>

      <div className={`${sectionShell} mt-16 pb-14`}>
        <dl className="flex flex-wrap gap-x-14 gap-y-5 border-t border-surface-border pt-6">
          {BUDGET.map((fact: BudgetFact) => (
            <div key={fact.id}>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink-faint">
                {fact.label}
              </dt>
              <dd data-metric="true" className="mt-1.5 text-sm text-accent">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
