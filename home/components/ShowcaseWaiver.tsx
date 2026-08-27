import type { ReactElement } from "react";

export interface ShowcaseWaiverProps {
  text: string;
}

/**
 * The Nexus/SLOP-05 disclosure, deliberately its own file rather than inlined
 * into `ShowcaseCard` — greppable and deletable in the single commit that
 * eventually renames Nexus, the same way `GRANDFATHERED` in
 * `scripts/test_constraints.py` is a dict entry rather than a comment.
 *
 * No link inside this component on purpose: it renders inside `ShowcaseCard`,
 * which is itself one large `<a>` — a nested interactive element would be
 * both invalid HTML and an axe violation. The README it points to is named in
 * plain text instead.
 */
export function ShowcaseWaiver({ text }: ShowcaseWaiverProps): ReactElement {
  return (
    <p className="mt-3 rounded-lg border border-border bg-bg-surface p-3 text-xs leading-relaxed text-text-secondary">
      <strong className="text-text-primary">Known naming exception — </strong>
      {text}
    </p>
  );
}

export default ShowcaseWaiver;
