"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import RouterPanel from "./RouterPanel";
import { HOW_IT_WORKS } from "../lib/content";
import type { SkillRecord, Figures } from "../lib/data.types";
import useStaggerReveal from "../lib/useStaggerReveal";
import { sectionShell, sectionSpacing, cardShell, cardInset } from "../lib/tokens";

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
    <section id="how-it-works" className={`${sectionSpacing} bg-bg-page`}>
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

        <div
          ref={cardsRef}
          className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.9fr_1.05fr] lg:gap-8"
        >
          {HOW_IT_WORKS.map((step) => (
            <article key={step.letter} className={`${cardShell} ${cardInset}`}>
              <span
                data-metric
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-glow text-sm font-semibold text-text-primary"
              >
                {step.letter}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <p className="text-sm text-text-muted">
            Type a request below. This runs the real registry — not a lookalike written for
            the page.
          </p>
          <div className="mt-4">
            <RouterPanel skills={skills} figures={figures} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionHow;
