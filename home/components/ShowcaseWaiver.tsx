import type { ReactElement } from "react";
import { NEXUS_WAIVER_SOURCE, REPO_URL } from "../lib/content";
import { focusRing } from "../lib/tokens";

export interface ShowcaseWaiverProps {
  text: string;
}

/**
 * The Nexus/SLOP-05 disclosure, deliberately its own file rather than inlined
 * into `ShowcaseCard` — greppable and deletable in the single commit that
 * eventually renames Nexus, the same way `GRANDFATHERED` in
 * `scripts/test_constraints.py` is a dict entry rather than a comment.
 *
 * It used to carry no link, on purpose: it rendered inside `ShowcaseCard`,
 * itself one large `<a>`, and a nested interactive element is both invalid
 * HTML and an axe violation — so the README it cites was named in plain text
 * and the reader had to go find it. Moving the waiver out from under the
 * carousel (see `SectionShowcase`) removes that constraint, so the citation
 * is a real link now. A disclosure that makes its own evidence one click away
 * is a better disclosure.
 */
export function ShowcaseWaiver({ text }: ShowcaseWaiverProps): ReactElement {
  return (
    <p className="mt-3 rounded-lg border border-border bg-bg-surface p-3 text-xs leading-relaxed text-text-secondary">
      <strong className="text-text-primary">We check our own work — </strong>
      {text}{" "}
      <a
        href={`${REPO_URL}/blob/main/${NEXUS_WAIVER_SOURCE}`}
        rel="noreferrer"
        className={`${focusRing} rounded font-medium text-accent underline underline-offset-2`}
      >
        See {NEXUS_WAIVER_SOURCE}
      </a>{" "}
      for the full reasoning and tracking.
    </p>
  );
}

export default ShowcaseWaiver;
