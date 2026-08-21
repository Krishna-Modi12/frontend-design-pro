import type { ReactElement } from "react";
import CopyButton from "./CopyButton";
import { INSTALL_COMMAND, PRODUCT, REPO_URL } from "../lib/content";
import type { Adapter } from "../lib/data.types";
import { sectionShell, sectionSpacing, focusRing, tapTarget } from "../lib/tokens";

export interface SectionInstallProps {
  adapters: Adapter[];
  buildYear: number;
}

/**
 * The one dark section on the page — `bg-invert`, per the brief's Part 3
 * spec. Accent only appears here as a large heading/fill (`accent` measures
 * 3.61:1 against `bg-invert`, AA-large only — see `tokens.css`); every small
 * text element uses `ink-invert`/`ink-invert-secondary` instead, which are
 * scoped to this ground specifically.
 */
export function SectionInstall({ adapters, buildYear }: SectionInstallProps): ReactElement {
  return (
    <section id="install" className={`${sectionSpacing} bg-bg-invert`}>
      <div className={sectionShell}>
        <h2 data-display className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-ink-invert">
          Install in one command
        </h2>
        <p className="mt-3 max-w-lg text-ink-invert-secondary">
          Tracks the default branch. For the gated, version-stamped archive instead:{" "}
          <code className="text-ink-invert">gh release download --repo Krishna-Modi12/frontend-design-pro --pattern &apos;*.skill&apos;</code>
        </p>

        <div className="mt-6 flex max-w-2xl items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-4">
          {/* `overflow-x-auto` here would create a horizontally-scrollable region
              with no way to reach it from a keyboard — axe's
              `scrollable-region-focusable`, and the same fix this project's
              own `.cmd-text code` already carries: wrap instead of scroll. */}
          <code className="flex-1 whitespace-pre-wrap font-mono text-sm text-ink-invert [overflow-wrap:anywhere]">
            <span aria-hidden="true" className="mr-2 text-ink-invert-secondary">$</span>
            {INSTALL_COMMAND}
          </code>
          <CopyButton text={INSTALL_COMMAND} />
        </div>

        <div className="mt-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-invert-secondary">
            Adapters this ships for
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {adapters.map((adapter) => (
              <div
                key={adapter.dir}
                className="rounded-lg border border-white/10 px-3 py-3 text-center text-xs text-ink-invert-secondary"
              >
                {adapter.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <a
            href={REPO_URL}
            rel="noreferrer"
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-ink`}
          >
            View on GitHub
          </a>
          <a
            href={`${REPO_URL}/blob/main/docs/ARCHITECTURE.md`}
            rel="noreferrer"
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-ink-invert transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
          >
            Read the docs
          </a>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-ink-invert-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {buildYear} {PRODUCT} · MIT licensed
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={REPO_URL} rel="noreferrer" className={`${focusRing} rounded hover:text-ink-invert`}>
              Repository
            </a>
            <a href={`${REPO_URL}/releases`} rel="noreferrer" className={`${focusRing} rounded hover:text-ink-invert`}>
              Releases
            </a>
            <a href={`${REPO_URL}/issues`} rel="noreferrer" className={`${focusRing} rounded hover:text-ink-invert`}>
              Report a defect
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionInstall;
