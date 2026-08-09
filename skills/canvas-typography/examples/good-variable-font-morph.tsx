// EXAMPLE: Reference-quality variable-font weight morph on scroll
// Intent: CREATE_COMPONENT · Product: editorial · Dials: DV=6 MI=5 VD=4
// Illustrates canvas-typography discipline without a canvas:
//   • Real selectable DOM text — a variable axis costs nothing in accessibility (variable-font-animation.md)
//   • font-weight, not font-variation-settings: it interpolates and does not clobber sibling axes
//   • Scroll listener is passive and coalesced to one update per frame via RAF
//   • prefers-reduced-motion lands on the SETTLED weight, never the from-state
//   • Axis range is declared once and clamped — browsers clamp silently and the motion stalls
// Key principles on display:
//   • All 4 states: empty (no sections), loading, error, success
//   • 44px+ touch targets, visible focus rings, skip link ahead of the nav
//   • Exported prop interfaces used as types; no `any`

import { useCallback, useEffect, useRef, useState } from "react";

export interface WeightRange {
  /** Must match the font's real axis range — outside it the browser clamps silently. */
  min: number;
  max: number;
}

export interface VariableFontMorphProps {
  sections?: MorphSection[];
  /** Weight the headline rests at once fully in view, and under reduced motion. */
  settledWeight?: number;
  range?: WeightRange;
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  hasError?: boolean;
}

export interface MorphSection {
  id: string;
  title: string;
  body: string;
}

const DEFAULT_SECTIONS: MorphSection[] = [
  {
    id: "durability",
    title: "Durability",
    body:
      "Each step commits to an append-only log before the next one starts, so a crash costs the step in flight and nothing behind it.",
  },
  {
    id: "replay",
    title: "Replay",
    body:
      "A resumed run reads its own history rather than re-executing it. Side effects that already happened do not happen twice.",
  },
  {
    id: "observability",
    title: "Observability",
    body:
      "Every checkpoint carries the input hash and the wall-clock it landed, which is what makes a 3am incident a query instead of an excavation.",
  },
];

const DEFAULT_RANGE: WeightRange = { min: 250, max: 800 };

export default function VariableFontMorph({
  sections = DEFAULT_SECTIONS,
  settledWeight = 800,
  range = DEFAULT_RANGE,
  isLoading = false,
  hasError = false,
}: VariableFontMorphProps = {}) {
  const headingRefs = useRef<Map<string, HTMLHeadingElement>>(new Map());
  const rafRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const registerHeading = useCallback((id: string, node: HTMLHeadingElement | null) => {
    if (node) headingRefs.current.set(id, node);
    else headingRefs.current.delete(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading || hasError) return;
    const nodes = headingRefs.current;

    // Reduced motion is not "a faster morph" — it is the resolved weight, applied
    // once, with no listener attached at all.
    if (reducedMotion) {
      for (const node of nodes.values()) node.style.fontWeight = String(settledWeight);
      return;
    }

    const span = range.max - range.min;

    const update = () => {
      rafRef.current = 0;
      const viewport = window.innerHeight || 1;
      for (const node of nodes.values()) {
        const rect = node.getBoundingClientRect();
        const progress = 1 - Math.min(Math.max(rect.top / viewport, 0), 1);
        // Rounded: sub-integer weights force a re-shape for a difference nobody sees.
        node.style.fontWeight = String(Math.round(range.min + progress * span));
      }
    };

    const onScroll = () => {
      // Coalesce — scroll fires far more often than the display refreshes.
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    // Passive: a blocking scroll listener stalls the compositor, which is a steep
    // price for a weight axis.
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [sections, reducedMotion, settledWeight, range, isLoading, hasError]);

  if (hasError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-2xl border border-[oklch(63.7%_0.208_25.3)] bg-[oklch(20.1%_0.014_248)] p-6 font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(96.2%_0.005_248)]">Couldn&rsquo;t load the chapters</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          The section list didn&rsquo;t respond. Try refreshing in a moment.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(17.4%_0.012_248)] p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="h-12 w-2/3 animate-pulse rounded-xl bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-[oklch(23.1%_0.013_248)]" />
          <div className="h-12 w-1/2 animate-pulse rounded-xl bg-[oklch(26.8%_0.014_248)]" />
        </div>
      </main>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[oklch(31.6%_0.015_248)] bg-[oklch(20.1%_0.014_248)] p-8 text-center font-[Manrope,system-ui,sans-serif]">
        <h2 className="text-xl font-bold text-[oklch(96.2%_0.005_248)]">Nothing to read yet</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">Add a section to see the weight axis respond.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[oklch(17.4%_0.012_248)] font-[Manrope,system-ui,sans-serif]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap') */}
      <a
        href="#chapters"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-xl focus:bg-[oklch(72.4%_0.181_156.3)] focus:px-4 focus:text-sm focus:font-semibold focus:text-[oklch(17.4%_0.012_248)]"
      >
        Skip to chapters
      </a>

      <header className="border-b border-[oklch(26.8%_0.014_248)] px-6 py-4">
        <nav aria-label="Chapters">
          <ul className="mx-auto flex max-w-2xl flex-wrap gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex h-11 items-center rounded-xl px-3 text-sm font-medium text-[oklch(74.8%_0.017_248)] outline-none transition-colors duration-200 ease-out hover:text-[oklch(96.2%_0.005_248)] focus-visible:ring-2 focus-visible:ring-[oklch(72.4%_0.181_156.3)] motion-reduce:transition-none"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="chapters" className="mx-auto max-w-2xl px-6 py-16">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="py-20">
            <h2
              ref={(node) => registerHeading(section.id, node)}
              // Inline weight is written by the effect; the transition smooths the
              // per-frame steps without owning the value.
              style={{ fontWeight: range.min }}
              className="text-balance text-4xl tracking-tight text-[oklch(96.2%_0.005_248)] transition-[font-weight] duration-200 ease-out sm:text-5xl motion-reduce:transition-none"
            >
              {section.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[oklch(74.8%_0.017_248)]">{section.body}</p>
          </section>
        ))}
      </main>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
