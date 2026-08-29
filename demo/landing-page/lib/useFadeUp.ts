"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface FadeUp {
  /** Attach to the element that should reveal. */
  ref: RefObject<HTMLDivElement | null>;
  /** False until the element has been scrolled into view at least once. */
  visible: boolean;
}

/**
 * The only motion on this page: one fade-up as a section enters the viewport.
 *
 * ── Why an IntersectionObserver and not a scroll handler ─────────────────────
 *
 * A scroll listener runs on the main thread on every frame of every scroll, for
 * every section that registered one, and computes layout to answer a question
 * the browser already knows the answer to. IntersectionObserver answers it off
 * the main thread and fires once.
 *
 * ── Reduced motion is checked BEFORE observing, not after ────────────────────
 *
 * When the preference is set, this reveals immediately and never observes
 * anything. The naive shape — observe, then skip the transition — still starts
 * the element at `opacity: 0`, so a reader who has asked for less motion gets a
 * page whose content is invisible until they scroll past it. That is strictly
 * worse for them than for everybody else, which is the opposite of the point.
 *
 * `lib/tokens.ts` also carries a `prefers-reduced-motion` rule forcing
 * `[data-fade]` visible. That is not redundant: this hook reads the preference
 * once at mount, and a reader who turns it on afterwards would otherwise be
 * left with sections stranded at zero opacity and no way to reveal them.
 *
 * ── Reveal once ──────────────────────────────────────────────────────────────
 *
 * The observer disconnects after the first intersection. Re-hiding a section
 * when it leaves the viewport means content that vanishes on scroll-up, which
 * reads as a rendering bug rather than as an effect.
 */
export function useFadeUp(): FadeUp {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (node === null || typeof IntersectionObserver === "undefined") {
      // Nothing to observe, or nothing to observe WITH. Reveal rather than
      // leaving the section at zero opacity — every failure path in this hook
      // has to end with the content on screen. A reveal that can strand its own
      // content is worse than no reveal, and this one already shipped a
      // full-page screenshot of five empty bands.
      setVisible(true);
      return;
    }

    // A section taller than the viewport can never reach a 10% threshold from
    // the bottom edge, so it would stay hidden while filling the screen. The
    // negative bottom margin fires the reveal once the section's top has come
    // meaningfully into view, which is the behaviour a threshold alone implies
    // but does not deliver for tall elements.
    const observer = new IntersectionObserver(
      (entries) => {
        // `noUncheckedIndexedAccess` is on in this tsconfig, so this is a
        // genuine `| undefined` rather than ceremony.
        const entry = entries[0];
        if (entry === undefined) return;
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(node);

    // Safety net for a render path that never scrolls at all — a link-unfurl
    // bot, an SEO crawler, or a print/PDF capture. A working IntersectionObserver
    // that simply never sees a real scroll event never fires `isIntersecting`,
    // and this is a Persuade-mode page whose whole job is to be seen and shared;
    // this can't leave a section stranded at zero opacity for those paths.
    const fallback = window.setTimeout(() => setVisible(true), 4000);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return { ref, visible };
}

export default useFadeUp;
