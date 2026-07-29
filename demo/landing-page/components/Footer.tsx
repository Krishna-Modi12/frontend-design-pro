"use client";

import type { ReactElement } from "react";
import { CircleCheck, CircleDashed, CircleAlert } from "lucide-react";
import { focusRing, fontGeistMono, sectionShell, tapTarget } from "../lib/tokens";

/** Regional health as reported by the status page, not by the control plane. */
export type RegionState = "operational" | "degraded" | "unknown";

export interface FooterProps {
  /** Commit the running build was cut from — short SHA, as the deploy prints it. */
  buildSha: string;
  /** `unknown` while the status page is unreachable; the footer never guesses. */
  regionState: RegionState;
}

interface NavColumn {
  heading: string;
  links: { label: string; href: string }[];
}

const NAV: NavColumn[] = [
  {
    heading: "Runtime",
    links: [
      { label: "Durable steps", href: "/docs/steps" },
      { label: "Replay semantics", href: "/docs/replay" },
      { label: "Retry and backoff", href: "/docs/retries" },
      { label: "Local engine", href: "/docs/local-engine" },
    ],
  },
  {
    heading: "Reference",
    links: [
      { label: "TypeScript SDK", href: "/docs/sdk" },
      { label: "CLI", href: "/docs/cli" },
      { label: "Log format", href: "/docs/log-format" },
      { label: "Self-hosting", href: "/docs/self-host" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Changelog", href: "/changelog" },
      { label: "Security posture", href: "/security" },
      { label: "Pricing", href: "#pricing" },
      { label: "Contact an engineer", href: "/contact" },
    ],
  },
];

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

export default function Footer({ buildSha, regionState }: FooterProps): ReactElement {
  const region = REGION_COPY[regionState];

  return (
    <footer className="border-t border-hairline bg-surface-sunken">
      <div className={`${sectionShell} grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:py-16`}>
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

          <a
            href="/status"
            className={`${tapTarget} ${focusRing} mt-2 inline-flex items-center rounded text-sm text-ink-muted underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-out hover:decoration-accent motion-reduce:transition-none`}
          >
            Open the status history
          </a>
        </div>

        <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3">
          {NAV.map((column: NavColumn) => (
            <div key={column.heading}>
              <h2 className="text-xs uppercase tracking-[0.14em] text-ink-faint">
                {column.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-1">
                {column.links.map((link: { label: string; href: string }) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`${tapTarget} ${focusRing} inline-flex items-center rounded text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-ink motion-reduce:transition-none`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`${sectionShell} flex flex-col gap-3 border-t border-hairline py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between`}>
        <p>© 2026 Tracepoint Systems · MIT-licensed SDK, source-available engine</p>
        <p data-metric="true" style={{ fontFamily: fontGeistMono }}>
          build {buildSha}
        </p>
      </div>
    </footer>
  );
}
