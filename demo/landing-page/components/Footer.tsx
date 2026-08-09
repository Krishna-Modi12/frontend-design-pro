import type { ReactElement } from "react";
import { focusRing, sectionShell, tapTarget } from "../lib/tokens";

export interface FooterProps {
  repoUrl: string;
  /** Commit the running build was cut from, or `local` when it was not cut from one. */
  buildSha: string;
}

/**
 * Deliberately three items and no columns. A "Product / Company / Resources"
 * footer on a repository with one page and no company is furniture — and the
 * pack version is not here on purpose: `demo/landing-page/` is not on the
 * version-leak allowlist in `scripts/build_release.py`, so printing the current
 * version would fail a blocking gate. `metadata.json` and `docs/CHANGELOG.md`
 * are the only version authorities.
 */
export default function Footer({ repoUrl, buildSha }: FooterProps): ReactElement {
  return (
    <footer className="border-t border-surface-border">
      <div
        className={`${sectionShell} flex flex-col gap-4 py-10 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between`}
      >
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className={`${tapTarget} ${focusRing} inline-flex items-center rounded text-ink-muted underline decoration-surface-border-strong underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:decoration-accent motion-reduce:transition-none`}
        >
          github.com/Krishna-Modi12/frontend-design-pro
        </a>

        <p>MIT License</p>

        <p data-metric="true">build {buildSha}</p>
      </div>
    </footer>
  );
}
