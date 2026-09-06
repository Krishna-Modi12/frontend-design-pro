// EXAMPLE: Reference-quality scramble / decode reveal
// Intent: CREATE_COMPONENT · Product: dev-tool · Dials: DV=6 MI=7 VD=3
// Illustrates canvas-typography discipline (text-on-path-scramble.md):
//   • The scrambling glyphs are aria-hidden; a stable sr-only copy carries the real string
//   • Never aria-live on the scrambling node — every intermediate frame would be announced
//   • requestAnimationFrame with an elapsed clock, not setInterval at a fixed tick
//   • Per-character stagger; simultaneous resolution reads as a flicker, not a reveal
//   • Spaces and punctuation are preserved so a half-decoded string still reads as language
//   • prefers-reduced-motion renders the target immediately and never starts the loop
// Key principles on display:
//   • All 4 states: empty (no phrases), loading, error, success
//   • Width is reserved from the resolved string, so the line cannot reflow mid-scramble
//   • 44px+ touch targets, visible focus rings, exported prop interfaces used as types

import { useCallback, useEffect, useRef, useState } from "react";

export interface TextScrambleProps {
  phrases?: string[];
  /** Delay between each character starting to resolve. The stagger is the effect. */
  staggerMs?: number;
  /** Base time a character spends scrambling before locking. */
  settleMs?: number;
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  hasError?: boolean;
}

interface Slot {
  target: string;
  start: number;
  end: number;
  shown: string;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_PHRASES = ["Checkpoint committed", "Replaying from step 4", "Workflow resumed"];

function buildSlots(target: string, staggerMs: number, settleMs: number): Slot[] {
  return Array.from(target).map((ch, index) => {
    const start = index * staggerMs;
    return {
      target: ch,
      start,
      // Jittered so the line does not resolve as a clean left-to-right wipe.
      end: start + settleMs + ((index * 37) % 190),
      shown: ch === " " ? " " : "",
    };
  });
}

export default function TextScramble({
  phrases = DEFAULT_PHRASES,
  staggerMs = 38,
  settleMs = 240,
  isLoading = false,
  hasError = false,
}: TextScrambleProps = {}) {
  const [index, setIndex] = useState(0);
  const [rendered, setRendered] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef(0);

  const active = phrases[index] ?? "";
  // The longest phrase reserves the line box, so resolving glyphs of different
  // widths cannot reflow everything below them.
  const widest = phrases.reduce((longest, p) => (p.length > longest.length ? p : longest), "");

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isLoading || hasError || active.length === 0) return;

    if (reducedMotion) {
      setRendered(active);
      return;
    }

    const slots = buildSlots(active, staggerMs, settleMs);
    const total = slots.reduce((max, s) => Math.max(max, s.end), 0);
    const begin = performance.now();

    const frame = (now: number) => {
      const elapsed = now - begin;
      for (const slot of slots) {
        if (slot.target === " ") continue;
        if (elapsed >= slot.end) slot.shown = slot.target;
        else if (elapsed >= slot.start) {
          slot.shown = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? slot.target;
        }
      }
      setRendered(slots.map((s) => s.shown).join(""));

      if (elapsed < total) rafRef.current = requestAnimationFrame(frame);
      else rafRef.current = 0;
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [active, reducedMotion, staggerMs, settleMs, isLoading, hasError]);

  const next = useCallback(() => {
    setIndex((current) => (current + 1) % Math.max(phrases.length, 1));
  }, [phrases.length]);

  if (hasError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border border-[oklch(63.7%_0.208_25.3)] bg-[oklch(20.1%_0.014_248)] p-6 font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(96.2%_0.005_248)]">Couldn&rsquo;t load the status feed</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          The workflow log didn&rsquo;t respond, so there is nothing to decode.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl items-center justify-center p-6">
        <div className="w-full space-y-4">
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-11 w-40 animate-pulse rounded-xl bg-[oklch(23.1%_0.013_248)]" />
        </div>
      </div>
    );
  }

  if (phrases.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[oklch(31.6%_0.015_248)] bg-[oklch(20.1%_0.014_248)] p-8 text-center font-[Manrope,system-ui,sans-serif]">
        <h2 className="text-xl font-bold text-[oklch(96.2%_0.005_248)]">No phrases to decode</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">Pass a phrase to watch it resolve.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(17.4%_0.012_248)] p-6 font-[Manrope,system-ui,sans-serif]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}
      <section aria-label="Workflow status" className="w-full max-w-xl text-center">
        <p className="relative inline-block text-2xl font-semibold tracking-tight text-[oklch(96.2%_0.005_248)] sm:text-3xl">
          {/* Reserves the line box at the widest phrase — invisible, unselectable, no reflow. */}
          <span aria-hidden="true" className="invisible block whitespace-pre font-mono">
            {widest}
          </span>
          <span aria-hidden="true" className="absolute inset-0 block whitespace-pre font-mono">
            {rendered}
          </span>
          {/* The real string, stable and never scrambled. No aria-live: the
              intermediate frames must not be announced one by one. */}
          <span className="sr-only">{active}</span>
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={next}
            className="inline-flex h-11 items-center rounded-xl bg-[oklch(72.4%_0.181_156.3)] px-5 text-sm font-semibold text-[oklch(17.4%_0.012_248)] outline-none transition-colors duration-200 ease-out hover:bg-[oklch(78.1%_0.166_156.3)] focus-visible:ring-2 focus-visible:ring-[oklch(72.4%_0.181_156.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(17.4%_0.012_248)] motion-reduce:transition-none"
          >
            Next event
          </button>
        </div>
      </section>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
