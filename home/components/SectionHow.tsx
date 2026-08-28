"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import RouterPanel from "./RouterPanel";
import BrowserChrome from "./BrowserChrome";
import ChevronIcon from "./ChevronIcon";
import { HOW_IT_WORKS } from "../lib/content";
import type { SkillRecord, Figures } from "../lib/data.types";
import useStaggerReveal from "../lib/useStaggerReveal";
import { sectionShell, sectionSpacing, cardShell, focusRing } from "../lib/tokens";

/** Three small, continuous CSS-only motifs — one per card, keyed by letter.
    No React state: each is a plain keyframe loop from `tokens.ts`, covered
    by the same reduced-motion override every other decoration on this page
    uses. */
function StepMotif({ letter }: { letter: string }): ReactElement | null {
  if (letter === "A") {
    return (
      <div aria-hidden="true" className="mt-4 flex items-center gap-1.5">
        {[40, 56, 32].map((width, i) => (
          <span
            key={i}
            className="h-5 rounded-full bg-bg-page [animation:chip-cycle_2.4s_ease-in-out_infinite]"
            style={{ width, animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    );
  }
  if (letter === "B") {
    return (
      <div aria-hidden="true" className="relative mt-4 h-6 w-6">
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 h-6 w-6 text-text-muted [animation:crossfade-swap_2.6s_ease-in-out_infinite]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 h-6 w-6 text-accent [animation:crossfade-swap_2.6s_ease-in-out_infinite_1.3s]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="mt-4 flex items-end gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="h-4 w-1.5 rounded-full bg-accent [animation:dim-to-bright_2.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export interface SectionHowProps {
  skills: SkillRecord[];
  figures: Figures;
}

/**
 * Three asymmetric cards (35/30/35, per the brief) with a connecting line
 * that fills in as the section scrolls — a GSAP ScrollTrigger `scrub`, not a
 * moving dot on an SVG path as the brief sketches, which is a defensible
 * simplification of the same idea (progress made visible through scroll) at
 * a fraction of the implementation cost. Below the cards sits the section's
 * actual demonstration: the live router, not a fourth static card — see the
 * plan note on why the two existing interactive panels were relocated here
 * rather than dropped.
 */
export function SectionHow({ skills, figures }: SectionHowProps): ReactElement {
  const { ref: cardsRef } = useStaggerReveal();
  const lineRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const line = lineRef.current;
    const fill = fillRef.current;
    if (line === null || fill === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.width = "100%";
      return;
    }

    gsap.set(fill, { width: "0%" });
    const trigger = ScrollTrigger.create({
      trigger: line,
      start: "top 75%",
      end: "bottom 60%",
      scrub: 1,
      onUpdate: (self) => {
        fill.style.width = `${Math.round(self.progress * 100)}%`;
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <section id="how-it-works" data-section-surface className={`${sectionSpacing} bg-bg-page`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          02 — How it works
        </p>
        <h2 data-display className="mt-4 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          Spec first. Constrain always. Generate once.
        </h2>

        <div ref={lineRef} className="relative mt-12 hidden h-px bg-border lg:block">
          <div ref={fillRef} className="absolute inset-y-0 left-0 h-px bg-accent" />
        </div>

        {/* v2.2: cards tightened (gap-8→gap-6, cardInset→p-5) and the router
            panel below given a visual lead-in + soft accent-glow frame, so the
            live demonstration reads as the section's point rather than a
            fourth card of equal weight to three static ones. */}
        <div
          ref={cardsRef}
          className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.9fr_1.05fr] lg:gap-6"
        >
          {HOW_IT_WORKS.map((step) => (
            <details key={step.letter} data-disclosure className={`${cardShell} p-5`}>
              <summary className={`${focusRing} flex items-start justify-between gap-3 rounded-lg`}>
                <div>
                  <span
                    data-metric
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-glow text-sm font-semibold text-text-primary"
                  >
                    {step.letter}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{step.caption}</p>
                  <StepMotif letter={step.letter} />
                </div>
                <ChevronIcon />
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{step.body}</p>
            </details>
          ))}
        </div>

        <div className="mt-14">
          <p data-label className="mb-3 text-text-muted">
            See it decide — live
          </p>
          <div className="rounded-[1.1rem] bg-accent-glow p-1">
            <BrowserChrome url="frontend-design-pro.dev/router">
              <RouterPanel skills={skills} figures={figures} />
            </BrowserChrome>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionHow;
