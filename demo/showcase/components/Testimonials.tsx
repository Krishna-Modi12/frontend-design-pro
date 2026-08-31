"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  metric: string;
}

export interface TestimonialsProps {
  testimonials: Testimonial[];
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => void;
};

/**
 * Single-slide carousel. Slide swaps use the View Transitions API when the
 * browser supports it; otherwise it falls back to a plain CSS transition
 * (see `.testimonial-fade` in `app/globals.css`).
 */
export function Testimonials({ testimonials }: TestimonialsProps) {
  const [index, setIndex] = useState(0);
  const active = testimonials[index];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goTo = (nextIndex: number) => {
    const doc = document as DocumentWithViewTransition;
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => setIndex(nextIndex));
    } else {
      setIndex(nextIndex);
    }
  };

  /**
   * `role="tablist"`/`role="tab"` commits to the ARIA tabs pattern, which
   * means arrow-key roving selection is expected, not optional — a screen
   * reader user who knows the pattern will try it and get nothing without
   * this. Left/Right (and Home/End) move both focus and selection together,
   * per the APG's "automatic activation" model, which fits a control this
   * small better than a separate confirm step would.
   */
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const last = testimonials.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    goTo(next);
    tabRefs.current[next]?.focus();
  };

  if (!active) return null;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <blockquote key={active.id} className="testimonial-fade">
        <p className="text-xl leading-relaxed text-text-primary sm:text-2xl">“{active.quote}”</p>
        <footer className="mt-6 flex flex-col items-center gap-1">
          <span className="font-semibold text-text-primary">{active.name}</span>
          <span className="text-sm text-text-muted">{active.role}</span>
          <span className="mt-2 font-mono text-sm tabular-nums text-accent">{active.metric}</span>
        </footer>
      </blockquote>

      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Testimonials">
        {testimonials.map((testimonial, i) => (
          <button
            key={testimonial.id}
            ref={(node) => {
              tabRefs.current[i] = node;
            }}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show testimonial from ${testimonial.name}`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => goTo(i)}
            onKeyDown={onTabKeyDown}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
