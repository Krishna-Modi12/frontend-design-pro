"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import CheckerPanel from "./CheckerPanel";
import BrowserChrome from "./BrowserChrome";
import Marquee from "./Marquee";
import ConstraintBadge from "./ConstraintBadge";
import ChevronIcon from "./ChevronIcon";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import { WALL_MARQUEE, WALL_CATEGORIES } from "../lib/content";
import type { Figures } from "../lib/data.types";
import { sectionShell, sectionSpacing, cardShell, cardInset, focusRing } from "../lib/tokens";

export interface SectionWallProps {
  figures: Figures;
}

/** Six small, continuous CSS-only motifs, one per `WALL_CATEGORIES` id — the
    same economy and reduced-motion coverage as `SectionHow`'s `StepMotif`. */
function WallMotif({ id }: { id: string }): ReactElement {
  if (id === "ast") {
    return (
      <span
        aria-hidden="true"
        className="mt-3 inline-block h-2 w-2 rounded-full bg-accent"
        style={{ animation: "pulse-dot 1.8s ease-in-out infinite" }}
      />
    );
  }
  if (id === "regex") {
    return (
      <div aria-hidden="true" className="relative mt-3 h-1.5 w-16 overflow-hidden rounded-full bg-bg-page">
        <span
          className="absolute inset-y-0 w-6 rounded-full bg-accent [animation:sweep-highlight_2.2s_ease-in-out_infinite]"
        />
      </div>
    );
  }
  if (id === "slop") {
    return (
      <span
        aria-hidden="true"
        className="mt-3 inline-block h-2 w-2 rounded-full"
        style={{ background: "oklch(65% 0.22 25)", animation: "pulse-dot 1.6s ease-in-out infinite" }}
      />
    );
  }
  if (id === "motion") {
    return (
      <div aria-hidden="true" className="relative mt-3 h-3.5 w-14 rounded-full bg-bg-page">
        <span className="absolute left-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-accent [animation:track-slide_1.8s_ease-in-out_infinite]" />
      </div>
    );
  }
  if (id === "type") {
    return (
      <div aria-hidden="true" className="relative mt-3 h-5 w-8">
        <span className="absolute inset-0 font-sans text-sm text-text-muted [animation:crossfade-swap_2.6s_ease-in-out_infinite]">
          Aa
        </span>
        <span
          data-display
          className="absolute inset-0 text-sm font-semibold text-accent [animation:crossfade-swap_2.6s_ease-in-out_infinite_1.3s]"
        >
          Aa
        </span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="mt-3 flex h-5 items-end gap-1">
      <span className="w-1.5 rounded-full bg-border-strong" style={{ height: "100%" }} />
      <span className="w-1.5 rounded-full bg-accent [animation:bar-grow_2s_ease-in-out_infinite]" />
    </div>
  );
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
 *
 * v2.2: reframed from a rules-dump to a demo of the mechanism. `CheckerPanel`
 * now leads the section, directly under the heading; the marquee and the six
 * category cards move below it as ambient/supporting detail (still real —
 * every count is `figures.*`, not a literal — just no longer the section's
 * first move). `MockUIGallery`'s six abstract mockup cards are retired: a
 * real screenshot in the new Showcase section is stronger evidence than an
 * illustrative one, and this was the only place still using that component.
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
        <h2 data-display className="mt-4 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {figures.ciConstraints} checks catch the defaults agents keep reaching for.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
          Paste a component below and watch it fail — then switch to the pack's own version and watch the
          same checks pass. Nothing here is staged; it's the real ruleset, running in your browser.
        </p>

        <div ref={playgroundRef} className="mt-8">
          <BrowserChrome url="frontend-design-pro.dev/wall">
            <CheckerPanel />
          </BrowserChrome>
        </div>

        <div className="mt-14">
          <Marquee items={WALL_MARQUEE.map((text) => (
            <ConstraintBadge key={text} text={text} />
          ))} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {WALL_CATEGORIES.map((category) => (
            <details
              key={category.id}
              data-disclosure
              className={`${cardShell} ${cardInset} ${category.wide ? "sm:col-span-2" : ""}`}
            >
              <summary className={`${focusRing} flex items-start justify-between gap-3 rounded-lg`}>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {category.title}
                    {category.count ? (
                      <span data-metric className="ml-2 text-sm font-normal text-accent">
                        {figures[category.count]}
                      </span>
                    ) : null}
                  </h3>
                  {category.caption ? <p className="mt-1 text-sm text-text-muted">{category.caption}</p> : null}
                  <WallMotif id={category.id} />
                </div>
                <ChevronIcon />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{category.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SectionWall;
