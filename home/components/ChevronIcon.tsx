import type { ReactElement } from "react";

/** The open/closed indicator for every `<details data-disclosure>` on the
    page — rotation is driven by `[data-disclosure][open]` in `tokens.ts`,
    not per-instance state. */
export function ChevronIcon(): ReactElement {
  return (
    <svg
      data-disclosure-chevron
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="h-3 w-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M3 4.5 6 8l3-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default ChevronIcon;
