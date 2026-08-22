"use client";

import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { gsap, ScrollTrigger } from "../lib/gsapClient";
import { cardShell } from "../lib/tokens";

/**
 * A side-by-side Before/After, replacing `PROBLEM_COPY.body`'s paragraph as
 * the section's visual argument — the string itself moves to `sr-only` in
 * `SectionProblem.tsx` rather than being deleted, so the case this page
 * makes still reaches a screen reader.
 *
 * Both cards are illustrative mockups, `aria-hidden="true"`, with zero
 * focusable descendants — axe's rules exclude a hidden-from-AT subtree, so a
 * deliberately busy "Slop" card can't fail a real `color-contrast` check the
 * way a live, focusable version of the same markup would. The Slop card
 * signals its defects without actually writing the banned literal shapes
 * into source: an OKLCH gradient rather than raw hex, a generic
 * `system-ui` stack rather than the literal string "Inter", a fixed pixel
 * height rather than `min-h-screen`, a GSAP keyframe rather than
 * `transition: all` — the same discipline `lib/checkerRules.ts`'s own
 * `SNIPPETS.bad` uses (the shape is demonstrated, never actually shipped as
 * live rendered CSS on the pack's own front door).
 */
export function ProblemComparison(): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const slopRef = useRef<HTMLDivElement | null>(null);
  const antiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const slop = slopRef.current;
    const anti = antiRef.current;
    if (root === null || slop === null || anti === null) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([slop, anti], { opacity: 1, x: 0, y: 0, skewX: 0 });
      return;
    }

    gsap.set(slop, { opacity: 0, x: -24, skewX: -2 });
    gsap.set(anti, { opacity: 0, x: 24 });

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 80%",
      once: true,
      onEnter: () => {
        gsap.to(anti, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" });
        gsap
          .timeline()
          .to(slop, { opacity: 1, duration: 0.3, ease: "power1.out" })
          .to(slop, { x: 6, skewX: 1.5, duration: 0.05 })
          .to(slop, { x: -4, skewX: -1, duration: 0.05 })
          .to(slop, { x: 3, skewX: 0.5, duration: 0.05 })
          .to(slop, { x: 0, skewX: 0, duration: 0.15, ease: "power2.out" });
      },
    });

    return () => {
      trigger.kill();
      gsap.set([slop, anti], { clearProps: "opacity,transform" });
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="mt-10 grid gap-5 sm:grid-cols-2">
      <div ref={slopRef}>
        <SlopCard />
      </div>
      <div ref={antiRef}>
        <AntiSlopCard />
      </div>
    </div>
  );
}

function SlopCard(): ReactElement {
  return (
    <div
      className="overflow-hidden rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, oklch(58% 0.22 300), oklch(70% 0.16 320))",
        height: 280,
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "oklch(96% 0.02 320)", fontFamily: "system-ui, sans-serif" }}
      >
        what most agents ship
      </p>
      <p
        className="mt-3 max-w-[24ch] text-lg leading-snug"
        style={{ color: "oklch(99% 0.01 320)", fontFamily: "system-ui, sans-serif" }}
      >
        A faster way to build better. Try it today.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg" style={{ height: 44, background: "oklch(99% 0.01 320 / 0.16)" }} />
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        {["type", "layout", "motion"].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide"
            style={{ background: "oklch(30% 0.02 320 / 0.5)", color: "oklch(96% 0.02 320)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "oklch(65% 0.22 25)", animation: "pulse-dot 1.6s ease-in-out infinite" }}
            />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function AntiSlopCard(): ReactElement {
  return (
    <div className={`${cardShell} p-6`}>
      <p data-label className="text-accent">
        what this pack asks for instead
      </p>
      <p data-display className="mt-3 max-w-[22ch] text-lg font-medium leading-snug text-text-primary">
        A route, a budget, a check — before a line ships.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="col-span-2 rounded-lg bg-bg-surface" style={{ height: 56 }} />
        <div className="rounded-lg bg-bg-surface" style={{ height: 56 }} />
        <div className="rounded-lg bg-bg-surface" style={{ height: 36 }} />
        <div className="col-span-2 rounded-lg bg-bg-surface" style={{ height: 36 }} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["route", "budget", "check"].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-text-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ProblemComparison;
