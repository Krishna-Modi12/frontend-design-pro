import type { ReactElement } from "react";
import { DISCLOSURE, PRODUCT } from "../lib/content";
import { focusRing, sectionShell } from "../lib/tokens";

export interface FooterProps {
  repoUrl: string;
  /** The gallery index this page is an exhibit in. */
  galleryUrl: string;
  /** The commit this page was built from. "local" when nothing injected one. */
  buildSha: string;
}

/**
 * Minimal on purpose. A four-column sitemap under a page with five sections is
 * furniture — it exists because footers usually have one, which is the same
 * reasoning that produces every other generic decision on a generated page.
 *
 * The disclosure is the one thing here that is not optional. This page invents
 * a company, four operating figures, a rehearsal report and two customers, and
 * a reader who cannot tell that at a glance has been misled by a demo. It is
 * rendered, not left in a source comment where only a contributor would find
 * it.
 *
 * No version string anywhere in this file. `demo/landing-page/` is not on the
 * release leak-scan allowlist, so the current version appearing here would fail
 * pre-flight — and a version baked into a demo is one more figure that goes
 * stale the moment the next release cuts.
 *
 * The gallery link is here because a reader can arrive at this page directly —
 * README links straight to it — and the disclosure above tells them the product
 * is invented without telling them what the page IS. The index answers that, and
 * a demo nobody can trace back to the thing it demonstrates is a dead end.
 */
export default function Footer({ repoUrl, galleryUrl, buildSha }: FooterProps): ReactElement {
  return (
    <footer className="border-t border-surface-border bg-surface-raised">
      <div className={`${sectionShell} flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:justify-between`}>
        <div className="max-w-2xl">
          <p data-display className="text-lg font-medium text-ink">
            {PRODUCT}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary text-pretty">
            {DISCLOSURE}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <a
            href={repoUrl}
            rel="noreferrer"
            // `accent-text`, not `accent`. The fill value measures 4.14:1 as
            // text on this ground and fails AA; the two exist precisely so a
            // link never accidentally picks the button colour.
            className={`${focusRing} rounded text-sm font-medium text-accent-text underline-offset-4 hover:underline`}
          >
            See the pack that generated this
          </a>
          <a
            href={galleryUrl}
            rel="noreferrer"
            className={`${focusRing} rounded text-sm text-ink-secondary underline-offset-4 hover:underline`}
          >
            See the other page it built
          </a>
          <p data-metric className="text-xs text-ink-muted">
            build {buildSha}
          </p>
        </div>
      </div>
    </footer>
  );
}
