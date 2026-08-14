import type { ReactElement } from "react";

export interface SectionEyebrowProps {
  children: string;
}

/**
 * The label that opens a section, with its accent rule.
 *
 * This exists as a component rather than as a repeated pair of elements because
 * the rule and the label have to start on exactly the same rail in every
 * section, and they did not: an earlier version set the rule as a sibling in a
 * flex row, which put the label's first glyph a few pixels right of the
 * headline beneath it in three sections out of five. Measured with a Range over
 * the first text node, then fixed by making all five the same object.
 *
 * The rule is `aria-hidden` and a block rather than an `<hr>`: it is a piece of
 * drawing, not a thematic break, and a screen reader announcing a separator
 * before every section heading is noise.
 */
export default function SectionEyebrow({ children }: SectionEyebrowProps): ReactElement {
  return (
    <p data-label className="text-ink-muted">
      <span aria-hidden="true" className="mb-5 block h-px w-8 bg-accent-text" />
      {children}
    </p>
  );
}
