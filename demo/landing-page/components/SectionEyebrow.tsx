import type { ReactElement } from "react";

export interface SectionEyebrowProps {
  /** The category label. Set in caps by the `data-label` rule. */
  children: string;
}

/**
 * Eyebrow with an accent rule above it, not beside it.
 *
 * The rule used to sit inline, before the text, in a `flex … gap-3` row. The
 * paragraph's *box* started at the column rail, so nothing looked wrong in the
 * markup — but the first glyph of the label started 44px to its right (a 32px
 * rule plus a 12px gap), while the h1, the subhead, the CTA pair and the proof
 * list all began at the rail. Measured, not guessed: a Range over the first text
 * node reports ink position, and it read rail+44 at 390, 768, 1280 and 1920.
 *
 * Stacking the rule fixes it at every width without hanging anything into the
 * gutter — which was the other option, and which fails at 390px where the
 * container has only 20px of padding to hang 44px of rule into.
 *
 * The rule is `aria-hidden`: it is a graphic mark, and announcing it would put a
 * meaningless stop in front of the label for anyone reading with a screen
 * reader.
 */
export default function SectionEyebrow({ children }: SectionEyebrowProps): ReactElement {
  return (
    <p data-label className="text-ink-muted">
      <span aria-hidden="true" className="mb-5 block h-px w-8 bg-accent" />
      {children}
    </p>
  );
}
