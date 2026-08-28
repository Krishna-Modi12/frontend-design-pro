import type { ReactElement } from "react";
import type { Finding } from "../lib/checkerRules";
import ChevronIcon from "./ChevronIcon";
import { severityColor } from "../lib/severity";
import { focusRing } from "../lib/tokens";

export interface FindingRowProps {
  finding: Finding;
}

/** One collapsible row in the findings list — reuses the `[data-disclosure]`
    primitive `SectionHow`/`SectionInstall` already register in tokens.ts. */
export function FindingRow({ finding }: FindingRowProps): ReactElement {
  return (
    <details data-disclosure className="rounded-lg border border-border px-3 py-2">
      <summary className={`${focusRing} flex list-none items-center gap-2 rounded-lg`}>
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: severityColor(finding.rule.severity) }}
        />
        <span data-metric className="shrink-0 text-xs font-semibold text-text-primary">
          {finding.rule.id}
        </span>
        <span className="hidden shrink-0 text-xs uppercase tracking-wide text-text-muted sm:inline">
          {finding.rule.severity}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">{finding.rule.desc}</span>
        <ChevronIcon />
      </summary>
      <code className="mt-2 block [overflow-wrap:anywhere] rounded bg-bg-surface px-2 py-1 font-mono text-xs text-text-primary">
        {finding.evidence.trim().slice(0, 160)}
      </code>
    </details>
  );
}

export default FindingRow;
