"use client";

import { useState } from "react";

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

  const goTo = (nextIndex: number) => {
    const doc = document as DocumentWithViewTransition;
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => setIndex(nextIndex));
    } else {
      setIndex(nextIndex);
    }
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
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show testimonial from ${testimonial.name}`}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
