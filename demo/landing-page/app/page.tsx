"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Hero from "../components/Hero";
import MetricsStrip from "../components/MetricsStrip";
import type { PlatformMetric } from "../components/MetricsStrip";
import BentoFeatures from "../components/BentoFeatures";
import SocialProof from "../components/SocialProof";
import CtaBar from "../components/CtaBar";
import Footer from "../components/Footer";
import { FEATURES, PRODUCT, REPO_URL, TESTIMONIALS } from "../lib/content";
import { focusRing, sectionShell, tapTarget, tokenStyles } from "../lib/tokens";

/**
 * A project Pages site is served from /<repo>, and Next rewrites its own asset
 * URLs but not the ones you hand to `fetch`. A root-anchored path would leave
 * the prefix off, 404, and drop the page into its error state — which is a
 * convincing imitation of a broken endpoint. Empty in dev and under
 * `next start`, both of which serve from the root.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * The commit this page was built from, injected by CI. Falls back to "local"
 * rather than to an invented hash — a fabricated build ref on a page that
 * prints a build ref is worse than no build ref.
 */
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? "local";

const NAV = [
  { id: "how-it-works", label: "How it works" },
  { id: "numbers", label: "Numbers" },
  { id: "teams", label: "Teams" },
];

interface MetricsState {
  status: "loading" | "error" | "ready";
  metrics: PlatformMetric[];
  /** Why it failed, in the interface's voice. Never a raw exception. */
  reason?: string;
}

export default function Page(): ReactElement {
  const [state, setState] = useState<MetricsState>({
    status: "loading",
    metrics: [],
  });

  /**
   * A real request with a real abort. The anti-slop wall bans mount-time
   * `setTimeout` loaders specifically — a skeleton on a timer is a skeleton
   * pretending to wait for something, and it is the cheapest tell that nobody
   * wired the page to anything.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        const response = await fetch(`${BASE_PATH}/api/site/overview`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) {
          setState({
            status: "error",
            metrics: [],
            reason: `The overview endpoint answered ${response.status}.`,
          });
          return;
        }
        const payload: { metrics?: PlatformMetric[] } = await response.json();
        setState({ status: "ready", metrics: payload.metrics ?? [] });
      } catch {
        // `fetch` rejects only on a transport failure — anything the server
        // actually answered is an `ok: false` and was handled above. An abort
        // lands here too, and must not be reported as a failure: the component
        // is unmounting and there is nobody left to tell.
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          metrics: [],
          reason: "The request never reached us.",
        });
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-surface-page text-ink antialiased">
      <style dangerouslySetInnerHTML={{ __html: tokenStyles }} />

      {/* First tabstop on the page. Anything with a <nav> needs one, or a
          keyboard reader walks the whole header before reaching the content. */}
      <a
        href="#main"
        className={`${focusRing} sr-only rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50`}
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-page/85 backdrop-blur">
        <div className={`${sectionShell} flex h-16 items-center justify-between`}>
          <a
            href="#top"
            data-display
            className={`${focusRing} rounded text-lg font-medium tracking-normal`}
          >
            {PRODUCT}
          </a>

          <nav aria-label="Sections" className="flex items-center gap-1">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`${tapTarget} ${focusRing} hidden items-center rounded-lg px-3 text-sm text-ink-secondary transition-colors duration-150 ease-out hover:text-ink motion-reduce:transition-none sm:inline-flex`}
              >
                {item.label}
              </a>
            ))}
            <a
              href={REPO_URL}
              rel="noreferrer"
              className={`${tapTarget} ${focusRing} ms-2 inline-flex items-center rounded-lg border border-surface-border-strong bg-surface-raised px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-accent hover:text-accent motion-reduce:transition-none`}
            >
              The pack
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        <Hero primaryHref="#start" secondaryHref="#how-it-works" />
        <MetricsStrip
          metrics={state.metrics}
          status={state.status}
          errorMessage={state.reason}
        />
        <BentoFeatures features={FEATURES} />
        <SocialProof testimonials={TESTIMONIALS} />
        <CtaBar href={REPO_URL} />
      </main>

      <Footer repoUrl={REPO_URL} buildSha={BUILD_SHA} />
    </div>
  );
}
