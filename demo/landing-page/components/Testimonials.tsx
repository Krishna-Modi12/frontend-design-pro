"use client";

import type { ReactElement } from "react";
import {
  alertShell,
  cardShell,
  focusRing,
  fontGeistMono,
  sectionShell,
  sectionSpacing,
  skeletonBlock,
} from "../lib/tokens";

export interface DeveloperStory {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** What the live figure for this account counts, e.g. "steps replayed". */
  statLabel: string;
}

export interface TestimonialsProps {
  /**
   * Story id → live figure pulled from that customer's account by the content
   * API. `null` while the request is in flight or after it failed.
   */
  verified: Record<string, string> | null;
  isLoading: boolean;
  error: string | null;
}

const STORIES: DeveloperStory[] = [
  {
    id: "kalimba",
    quote:
      "We deleted 2,400 lines of retry glue and a Redis lock nobody understood. The replay log answers the only question that matters during an incident: which steps already ran?",
    name: "Ana Ngugi",
    role: "Staff SRE",
    company: "Kalimba Freight",
    statLabel: "steps replayed last quarter",
  },
  {
    id: "otsu",
    quote:
      "Post-mortems used to start with grep. Now I open the run, scrub to the failed step and read the exact payload it retried with.",
    name: "Kenji Tanaka",
    role: "Platform lead",
    company: "Otsu Labs",
    statLabel: "runs inspected this month",
  },
  {
    id: "meridian",
    quote:
      "Idempotency keys were our most-argued design review topic for two years. The step boundary made the argument obsolete — the runtime owns exactly-once, and our audit reviewers accepted the log as evidence.",
    name: "Priya Raghunathan",
    role: "Principal engineer",
    company: "Meridian Health",
    statLabel: "charges settled without a duplicate",
  },
  {
    id: "vela",
    quote:
      "The local engine is the part I did not expect to care about. I kill the worker mid-charge on my laptop and watch it resume. That test used to need a staging deploy.",
    name: "Tomás Ferreira",
    role: "Backend engineer",
    company: "Vela Payments",
    statLabel: "local replays before the first deploy",
  },
  {
    id: "sable",
    quote:
      "Dispatch p99 has stayed under 48ms through three traffic peaks, including a 6.4× spike we did not warn anyone about.",
    name: "Leila Haddad",
    role: "Head of infrastructure",
    company: "Sable Analytics",
    statLabel: "peak steps per second",
  },
];

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .map((part: string) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

export default function Testimonials({
  verified,
  isLoading,
  error,
}: TestimonialsProps): ReactElement {
  function statFor(storyId: string): string | null {
    if (verified === null) {
      return null;
    }
    return verified[storyId] ?? null;
  }

  return (
    <section id="stories" aria-labelledby="stories-title" className={sectionSpacing}>
      <div className={sectionShell}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">In production</p>
            <h2
              id="stories-title"
              className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl"
            >
              Engineers who deleted their retry code
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-ink-muted">
            Figures under each quote are read from that account, refreshed hourly, and
            published with permission.
          </p>
        </div>

        {error !== null ? (
          <p role="alert" className={`${alertShell} mt-8 p-4 text-sm leading-relaxed text-ink-muted`}>
            Account figures are unavailable — {error}. The quotes below are unaffected.
          </p>
        ) : null}

        <div className="mt-10 gap-4 md:columns-2 lg:columns-3">
          {STORIES.map((story: DeveloperStory) => {
            const stat = statFor(story.id);
            return (
              <figure
                key={story.id}
                className={`${cardShell} mb-4 flex break-inside-avoid flex-col gap-5 p-6`}
              >
                <blockquote className="text-pretty text-[0.9375rem] leading-relaxed text-ink">
                  {story.quote}
                </blockquote>

                <figcaption className="flex items-center gap-3 border-t border-hairline pt-5">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline-strong bg-surface-sunken text-xs font-medium text-accent"
                    style={{ fontFamily: fontGeistMono }}
                  >
                    {initialsOf(story.name)}
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block font-medium text-ink">{story.name}</span>
                    <span className="block text-xs text-ink-faint">
                      {story.role}, {story.company}
                    </span>
                  </span>
                </figcaption>

                <p className="flex flex-wrap items-baseline gap-2 text-xs text-ink-faint">
                  {error !== null ? (
                    <span>{story.statLabel} — figure withheld</span>
                  ) : isLoading ? (
                    <>
                      <span className={`${skeletonBlock} h-3 w-16`} />
                      <span className="sr-only">Reading account figures…</span>
                    </>
                  ) : stat !== null ? (
                    <>
                      <span
                        data-metric="true"
                        className="text-sm font-medium tabular-nums text-ink"
                        style={{ fontFamily: fontGeistMono }}
                      >
                        {stat}
                      </span>
                      <span>{story.statLabel}</span>
                    </>
                  ) : (
                    <span>{story.statLabel} — not published for this account</span>
                  )}
                </p>
              </figure>
            );
          })}
        </div>

        <p className="mt-10 text-sm leading-relaxed text-ink-muted">
          Reference calls are arranged on request.{" "}
          <a
            href="/customers"
            className={`${focusRing} rounded font-medium text-accent underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent motion-reduce:transition-none`}
          >
            Read the long-form write-ups
          </a>
        </p>
      </div>
    </section>
  );
}
