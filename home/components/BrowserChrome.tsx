import type { ReactElement, ReactNode } from "react";
import { cardShell } from "../lib/tokens";

export interface BrowserChromeProps {
  url: string;
  children: ReactNode;
}

/**
 * A mock browser-chrome frame — URL bar and traffic-light dots, pure markup,
 * no state. Shared by `SectionHow` (wraps `RouterPanel`) and `SectionProof`
 * (wraps `CheckerPanel`) so both live panels read as something running, not
 * a bare card.
 */
export function BrowserChrome({ url, children }: BrowserChromeProps): ReactElement {
  return (
    <div className={`${cardShell} overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-border bg-bg-surface px-4 py-2.5">
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        </span>
        <span className="mx-auto truncate rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-muted">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

export default BrowserChrome;
