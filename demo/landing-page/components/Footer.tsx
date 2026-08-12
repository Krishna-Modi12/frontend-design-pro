import type { ReactElement } from "react";
import { focusRing, sectionShell } from "../lib/tokens";

export interface FooterProps {
  repoUrl: string;
  /** Commit the page was built from. Never a version string — see below. */
  buildSha: string;
}

/**
 * Minimal on purpose. A four-column sitemap under a one-page demo is furniture
 * for a site that does not exist, and every link in it would be dead.
 *
 * No version string anywhere in this app. `demo/landing-page/` is not on the
 * release script's version-leak allowlist, so the current version appearing in
 * any file here fails pre-flight for the entire repo — the build stops, and the
 * error names a landing page rather than the release.
 */
export default function Footer({ repoUrl, buildSha }: FooterProps): ReactElement {
  return (
    <footer className="border-t border-surface-border">
      <div
        className={`${sectionShell} flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between`}
      >
        <a
          href={repoUrl}
          rel="noreferrer"
          className={`${focusRing} font-mono text-xs text-ink-muted transition-colors duration-150 ease-out hover:text-accent motion-reduce:transition-none`}
        >
          github.com/Krishna-Modi12/frontend-design-pro
        </a>
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs text-ink-faint">MIT License</span>
          <span data-metric className="text-xs text-ink-faint">
            build {buildSha}
          </span>
        </div>
      </div>
    </footer>
  );
}
