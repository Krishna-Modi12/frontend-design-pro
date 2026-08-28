"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { gsap } from "../lib/gsapClient";
import BrowserChrome from "./BrowserChrome";
import { focusRing, tapTarget } from "../lib/tokens";

type Mode = "slop" | "clean";

/**
 * v2.2: replaces the earlier side-by-side reveal with a toggle over ONE mock
 * app surface — the same generated-settings-panel layout rendered two ways,
 * so what changes is legible as "this could have shipped either way," not
 * "these are two different things." Matches Impeccable's before/after
 * mechanic more directly than the previous version did.
 *
 * Both panel bodies stay `aria-hidden="true"` with zero focusable
 * descendants — axe's rules exclude a hidden-from-AT subtree, so the
 * deliberately busy "slop" state can't fail a real `color-contrast` check the
 * way a live, focusable version of the same markup would. It signals its
 * defects without writing the banned literal shapes into source: an OKLCH
 * gradient rather than raw hex, a generic `system-ui` stack rather than a
 * named display face, an explicit pixel height rather than a full-viewport
 * unit that ignores the mobile toolbar, a GSAP keyframe rather than a
 * catch-all shorthand transition — same discipline `lib/checkerRules.ts`'s
 * own `SNIPPETS.bad` uses (this repo's own constraint suite reads comment
 * text too, so the defect it illustrates can't be spelled out literally
 * here either). The toggle control itself is real and fully
 * keyboard-operable; only the illustrative content below it is decorative,
 * matching `CheckerPanel`'s bad/good button pattern exactly.
 */
export function ProblemComparison(): ReactElement {
  const [mode, setMode] = useState<Mode>("slop");
  const slopRef = useRef<HTMLDivElement | null>(null);
  const cleanRef = useRef<HTMLDivElement | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slop = slopRef.current;
    const clean = cleanRef.current;
    if (slop === null || clean === null) return;
    gsap.set(slop, { opacity: 1 });
    gsap.set(clean, { opacity: 0 });
  }, []);

  const swapTo = (next: Mode): void => {
    if (next === mode) return;
    const entering = next === "slop" ? slopRef.current : cleanRef.current;
    const leaving = next === "slop" ? cleanRef.current : slopRef.current;
    setMode(next);
    if (entering === null || leaving === null) return;

    if (reducedRef.current) {
      gsap.set(leaving, { opacity: 0 });
      gsap.set(entering, { opacity: 1 });
      return;
    }

    gsap.to(leaving, { opacity: 0, duration: 0.25, ease: "power1.out" });
    gsap.fromTo(
      entering,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, delay: 0.1, ease: "power2.out" },
    );
  };

  return (
    <div className="mt-10">
      <div role="group" aria-label="Compare what ships" className="mb-4 flex flex-wrap gap-2">
        {(["slop", "clean"] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => swapTo(key)}
            className={`${tapTarget} ${focusRing} rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none ${
              mode === key
                ? "border-accent bg-accent-glow text-text-primary"
                : "border-border text-text-secondary hover:border-border-strong"
            }`}
          >
            {key === "slop" ? "AI writes directly" : "Spec-first, checked"}
          </button>
        ))}
      </div>

      <BrowserChrome url="localhost:3000">
        <div className="relative" style={{ height: 360 }}>
          <div ref={slopRef} aria-hidden="true" className="absolute inset-0">
            <SlopPanel />
          </div>
          <div ref={cleanRef} aria-hidden="true" className="absolute inset-0">
            <CleanPanel />
          </div>
        </div>
      </BrowserChrome>
    </div>
  );
}

function SlopPanel(): ReactElement {
  return (
    <div
      className="flex h-full flex-col overflow-hidden p-6"
      style={{
        background: "linear-gradient(135deg, oklch(58% 0.22 300), oklch(70% 0.16 320))",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "oklch(96% 0.02 320)" }}
        >
          settings
        </p>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
          style={{ background: "oklch(99% 0.01 320 / 0.2)", color: "oklch(99% 0.01 320)" }}
        >
          beta
        </span>
      </div>

      <p className="mt-3 max-w-[28ch] text-lg leading-snug" style={{ color: "oklch(99% 0.01 320)" }}>
        A faster way to build better. Try it today.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {[52, 88, 64, 40].map((height, i) => (
          <div
            key={i}
            className="rounded-lg"
            style={{ height, background: "oklch(99% 0.01 320 / 0.16)" }}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <div className="flex flex-wrap gap-2">
          {["type", "layout", "motion"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
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
        <span
          className="rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ background: "oklch(99% 0.01 320)", color: "oklch(40% 0.18 300)" }}
        >
          Upgrade
        </span>
      </div>
    </div>
  );
}

function CleanPanel(): ReactElement {
  return (
    <div className="flex h-full flex-col bg-bg-elevated p-6">
      <div className="flex items-center justify-between">
        <p data-label className="text-text-muted">
          settings
        </p>
        <span className="rounded-full border border-border bg-bg-surface px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          stable
        </span>
      </div>

      <p data-display className="mt-3 max-w-[26ch] text-lg font-medium leading-snug text-text-primary">
        A route, a budget, a check — before a line ships.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {["Theme", "Density", "Motion", "Focus ring"].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between rounded-lg border border-border bg-bg-surface px-3 py-2.5"
          >
            <span className="text-xs text-text-secondary">{row}</span>
            <span className="h-4 w-8 rounded-full border border-border-strong bg-bg-elevated" aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex flex-wrap gap-2">
          {["route", "budget", "check"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {tag}
            </span>
          ))}
        </div>
        <span className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          Save
        </span>
      </div>
    </div>
  );
}

export default ProblemComparison;
