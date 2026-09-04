import type { ReactElement } from "react";
import { SHOWCASE_SELF_CHECK_SOURCE, REPO_URL } from "../lib/content";
import { focusRing } from "../lib/tokens";

export interface ShowcaseSelfCheckProps {
  text: string;
}

/**
 * The SLOP-05 note under the carousel, deliberately its own file rather than
 * inlined into `ShowcaseCard` — greppable and editable on its own, the same way
 * `GRANDFATHERED` in `scripts/test_constraints.py` is a dict entry rather than a
 * comment.
 *
 * This was `ShowcaseWaiver` until the showcase demo was renamed. It disclosed a
 * live violation then; it makes the stronger claim now, that the examples pass
 * with nothing waived. The rename of the file is the point rather than churn:
 * a component called `ShowcaseWaiver` rendering a paragraph that says nothing is
 * waived is the kind of stale name that later gets believed over the code.
 *
 * It carries a real link, which it could not when it rendered inside
 * `ShowcaseCard` — that card is one large `<a>`, and a nested interactive
 * element is both invalid HTML and an axe violation. Moving it out from under
 * the carousel (see `SectionShowcase`) removed that constraint, so the citation
 * is an anchor now: a claim that makes its own evidence one click away is a
 * better claim.
 */
export function ShowcaseSelfCheck({ text }: ShowcaseSelfCheckProps): ReactElement {
  return (
    <p className="mt-3 rounded-lg border border-border bg-bg-surface p-3 text-xs leading-relaxed text-text-secondary">
      <strong className="text-text-primary">We check our own work — </strong>
      {text}{" "}
      <a
        href={`${REPO_URL}/blob/main/${SHOWCASE_SELF_CHECK_SOURCE}`}
        rel="noreferrer"
        className={`${focusRing} rounded font-medium text-accent underline underline-offset-2`}
      >
        See {SHOWCASE_SELF_CHECK_SOURCE}
      </a>{" "}
      for the rule, the deleted waiver and the test that keeps it deleted.
    </p>
  );
}

export default ShowcaseSelfCheck;
