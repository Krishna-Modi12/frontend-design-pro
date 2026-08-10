import type { ReactElement } from "react";
import CtaButton from "./CtaButton";
import { cardShell, sectionShell, sectionSpacing } from "../lib/tokens";

export interface Adapter {
  /** Directory under `install/`, and the key. */
  id: string;
  /** What the installer drops in, or why it cannot. */
  installs: string;
  /** `auto` means setup.sh writes the file; `manual` means no file can be written. */
  mode: "auto" | "manual";
  /** True where docs/AGENT_COMPATIBILITY.md does not claim a tested path. */
  untested: boolean;
}

export interface InstallMatrixProps {
  adapters: Adapter[];
  repoUrl: string;
}

const MODE_INK: Record<Adapter["mode"], string> = {
  auto: "text-accent",
  manual: "text-ink-faint",
};

/**
 * Where a testimonial section would go on a normal landing page.
 *
 * There are no testimonials, because there are no users to quote yet, and
 * inventing three with names and job titles is the exact thing `SLOP-01` exists
 * to catch. What goes here instead is the part of the pack a reader can verify
 * in under a minute — what the installer writes, and where the model stops
 * working.
 */
export default function InstallMatrix({
  adapters,
  repoUrl,
}: InstallMatrixProps): ReactElement {
  const auto = adapters.filter((adapter: Adapter) => adapter.mode === "auto");
  const manual = adapters.filter((adapter: Adapter) => adapter.mode === "manual");

  return (
    <section id="install" className={sectionShell}>
      <div className={sectionSpacing}>
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Install in 30 seconds
        </h2>

        {/* `items-start` so each card ends where its content does. Grid stretches
            by default, which would run the two-column card's border down to match
            the taller adapter list and leave a panel of empty surface below its
            last control. */}
        <div className="mt-10 grid items-start gap-4 lg:grid-cols-3">
          {/* `min-w-0` is load-bearing, not tidying. A grid item defaults to
              `min-width: auto`, which is its min-content width — and the min-content
              of the command block below is one unbroken 354px line. Without this the
              track grows past the viewport and the whole page scrolls sideways on a
              phone, with `overflow-x-auto` powerless to stop it. */}
          <div className={`${cardShell} min-w-0 p-8 lg:col-span-2`}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Two commands
            </h3>

            <div
              role="region"
              aria-label="Install commands"
              tabIndex={0}
              className="mt-5 overflow-x-auto rounded-xl border border-surface-border bg-surface-sunken p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
            >
              <pre className="m-0 font-mono text-[0.8125rem] leading-relaxed text-ink-muted">
                <code>
                  <span className="text-accent">unzip</span> frontend-design-pro-v*.skill
                  -d ./{"\n"}
                  <span className="text-accent">bash</span>{" "}
                  frontend-design-pro/setup.sh
                </code>
              </pre>
            </div>

            <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-ink-muted">
              The second line detects the agent and writes its native rules file.{" "}
              <code className="font-mono text-ink">--list</code> names every adapter,{" "}
              <code className="font-mono text-ink">--dry-run</code> shows what it would
              write, and nothing is overwritten without{" "}
              <code className="font-mono text-ink">--force</code>.{" "}
              <code className="font-mono text-ink">setup.ps1</code> is the PowerShell
              port.
            </p>

            <div className="mt-8">
              <CtaButton href={repoUrl} variant="secondary" external>
                Clone the repo
              </CtaButton>
            </div>
          </div>

          <div className={`${cardShell} min-w-0 p-8`}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {auto.length} written for you
            </h3>
            <ul className="mt-5 flex list-none flex-col gap-3 p-0">
              {auto.map((adapter: Adapter) => (
                <li key={adapter.id}>
                  <p className="font-mono text-sm text-ink">
                    <span className={MODE_INK[adapter.mode]}>install/</span>
                    {adapter.id}
                  </p>
                  <p className="mt-0.5 break-words text-xs leading-relaxed text-ink-muted">
                    {adapter.installs}
                  </p>
                  {adapter.untested ? (
                    <p className="mt-0.5 text-xs text-ink-faint">
                      Ships, but not in the tested matrix
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {manual.length} by hand
            </h3>
            <p className="mt-3 font-mono text-sm leading-relaxed text-ink-muted">
              {manual.map((adapter: Adapter) => adapter.id).join(" · ")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              A web upload, a JSON merge, or a file your repo already owns. No
              installer can safely drop those in, so the docs give the real steps
              instead of automating a step that cannot be automated.
            </p>
          </div>
        </div>

        <aside className="mt-4 rounded-2xl border border-surface-border bg-surface-sunken p-8">
          <h3 className="text-sm font-semibold text-ink">Where this stops working</h3>
          <p className="mt-3 max-w-3xl text-pretty text-sm leading-relaxed text-ink-muted">
            Lazy loading needs an agent that can decide, mid-conversation, to open one
            specific file it was never given. Claude Code is the only host with a real
            filesystem for that. Everywhere else it degrades to retrieval search,
            manual <code className="font-mono text-ink">@</code>-referencing, or
            pasting — routing and the anti-slop wall survive the trip, on-demand depth
            does not.
          </p>
        </aside>
      </div>
    </section>
  );
}
