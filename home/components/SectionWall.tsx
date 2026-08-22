"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import CheckerPanel from "./CheckerPanel";
import BrowserChrome from "./BrowserChrome";
import MockUIGallery from "./MockUIGallery";
import Marquee from "./Marquee";
import ConstraintBadge from "./ConstraintBadge";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import { WALL_MARQUEE, WALL_CATEGORIES } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing, cardShell, cardInset } from "../lib/tokens";

export interface SectionWallProps {
  figures: Figures;
}

/**
 * The playground's default findings (`CheckerPanel`'s `SNIPPETS.bad`, loaded
 * on mount) reveal one-by-one as this section scrolls into place, desktop
 * only — the site's one signature scroll-driven moment, chosen because this
 * is the section that proves the pack's central claim rather than asserting
 * it. `pin` + a one-shot `onEnter` tween (not `scrub`) deliberately, so the
 * reveal plays over its own fixed duration once the pin engages rather than
 * needing continuous fine-grained scroll deltas to render smoothly — more
 * robust against `verify-home.mjs`'s `settle()`, which jumps in large
 * instant increments rather than scrolling continuously.
 *
 * Scoped to the FIRST scroll-through only (`once: true` via the trigger
 * never re-arming): editing the snippet or scrolling past again renders
 * findings instantly, unanimated — re-triggering a scroll-jack on every
 * keystroke would be a defect, not a feature. Below 1024px and under
 * `prefers-reduced-motion` this never pins at all, matching the hero's own
 * <640px degrade philosophy.
 */
export function SectionWall({ figures }: SectionWallProps): ReactElement {
  const playgroundRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const playground = playgroundRef.current;
    if (playground === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    const findings = Array.from(playground.querySelectorAll<HTMLElement>("[data-findings] > article"));
    if (!findings.length) return;

    gsap.set(findings, { opacity: 0, y: 24 });
    const trigger = ScrollTrigger.create({
      trigger: playground,
      pin: true,
      start: "top top+=72",
      end: "+=60%",
      onEnter: () => {
        gsap.to(findings, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" });
      },
    });

    return () => {
      trigger.kill();
      gsap.set(findings, { clearProps: "opacity,transform" });
    };
  }, []);

  return (
    <section id="wall" className={`${sectionSpacing} bg-bg-surface`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          03 — The wall
        </p>
        <h2 data-display className="mt-4 text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {figures.ciConstraints} checks catch the defaults agents keep reaching for.
        </h2>

        <div className="mt-8">
          <Marquee items={WALL_MARQUEE.map((text) => (
            <ConstraintBadge key={text} text={text} />
          ))} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {WALL_CATEGORIES.map((category) => (
            <article
              key={category.id}
              className={`${cardShell} ${cardInset} ${category.wide ? "sm:col-span-2" : ""}`}
            >
              <h3 className="text-base font-semibold text-text-primary">
                {category.title}
                {category.count ? (
                  <span data-metric className="ml-2 text-sm font-normal text-accent">
                    {figures[category.count]}
                  </span>
                ) : null}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{category.body}</p>
            </article>
          ))}
        </div>

        <div ref={playgroundRef} className="mt-12">
          <p className="text-sm text-text-muted">
            Paste a component. Both snippets below are cross-checked against{" "}
            <code>scripts/test_constraints.py</code> in both directions before this ships.
          </p>
          <div className="mt-4">
            <BrowserChrome url="frontend-design-pro.dev/wall">
              <CheckerPanel />
            </BrowserChrome>
          </div>
        </div>

        <div className="mt-14">
          <p data-label className="text-accent">
            what the rest of the pack produces
          </p>
          <MockUIGallery />
        </div>
      </div>
    </section>
  );
}

export default SectionWall;
