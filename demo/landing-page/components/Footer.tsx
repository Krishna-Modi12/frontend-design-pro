"use client";

import type { ReactElement } from "react";
import { CircleCheck, CircleDashed, CircleAlert, Github } from "lucide-react";
import { focusRing, fontGeistMono, sectionShell, tapTarget } from "../lib/tokens";

/** Regional health as reported by the status page, not by the control plane. */
export type RegionState = "operational" | "degraded" | "unknown";

export interface FooterProps {
  /** Commit the running build was cut from — short SHA, as the deploy prints it. */
  buildSha: string;
  /** `unknown` while the status page is unreachable; the footer never guesses. */
  regionState: RegionState;
}

const REGION_COPY: Record<RegionState, { icon: ReactElement; text: string; ink: string }> = {
  operational: {
    icon: <CircleCheck aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />,
    text: "All three regions operational",
    ink: "text-success",
  },
  degraded: {
    icon: <CircleAlert aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />,
    text: "One region degraded — runs are queued, not dropped",
    ink: "text-warn",
  },
  unknown: {
    icon: <CircleDashed aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />,
    text: "Status page unreachable",
    ink: "text-ink-faint",
  },
};

/**
 * Deliberately not a sitemap. A Product/Company/Resources column block is the
 * default shape for a page like this and it earns nothing here — every route it
 * would list is already reachable from the header or from the section it belongs
 * to. What is left is the three things a reader actually leaves with: where the
 * source is, what it costs them legally, and whether it is up right now.
 */
export default function Footer({ buildSha, regionState }: FooterProps): ReactElement {
  const region = REGION_COPY[regionState];

  return (
    <footer className="border-t border-hairline bg-surface-sunken">
      <div
        className={`${sectionShell} flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div>
          <p className="text-base font-semibold tracking-[-0.01em]">Tracepoint</p>
          <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-ink-muted">
            Durable execution for teams who would rather read a log than reconstruct
            what a queue did at 03:00.
          </p>

          <p className={`mt-6 inline-flex items-center gap-2 text-sm ${region.ink}`}>
            {region.icon}
            {region.text}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <a
            href="https://github.com/tracepoint/sdk"
            className={`${tapTarget} ${focusRing} inline-flex items-center gap-2 rounded-lg border border-hairline-strong px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
          >
            <Github aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
            Source on GitHub
          </a>

          <a
            href="/status"
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded text-sm text-ink-muted underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent motion-reduce:transition-none`}
          >
            Open the status history
          </a>
        </div>
      </div>

      <div
        className={`${sectionShell} flex flex-col gap-3 border-t border-hairline py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between`}
      >
        <p>© 2026 Tracepoint Systems · MIT-licensed SDK, source-available engine</p>
        <p data-metric="true" style={{ fontFamily: fontGeistMono }}>
          build {buildSha}
        </p>
      </div>
    </footer>
  );
}
