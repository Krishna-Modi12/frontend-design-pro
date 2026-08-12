"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import Hero from "../components/Hero";
import MetricsStrip from "../components/MetricsStrip";
import type { PlatformMetric } from "../components/MetricsStrip";
import ConstraintWall from "../components/ConstraintWall";
import BentoFeatures from "../components/BentoFeatures";
import InstallMatrix from "../components/InstallMatrix";
import Footer from "../components/Footer";
import {
  ADAPTERS,
  ENFORCED_RULES,
  REGISTRY_SKILLS,
  REPO_URL,
  TOTAL_CONSTRAINTS,
  TOTAL_SKILLS,
} from "../lib/content";
import { focusRing, sectionShell, tapTarget, tokenStyles } from "../lib/tokens";

/** Everything the page reads from the network. One request, one failure mode. */
interface PageData {
  metrics: PlatformMetric[];
}

type LoadState =
  | { readonly phase: "loading" }
  | { readonly phase: "ready"; readonly data: PageData }
  | { readonly phase: "failed"; readonly reason: string };

/**
 * Real when CI sets it, honest when it does not. A hardcoded short SHA would be
 * a fabrication on a page whose argument is that its numbers are checkable.
 */
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? "local";

/**
 * A project Pages site is served from /<repo>, and Next rewrites its own asset
 * URLs but not the ones you hand to `fetch`. A root-anchored path would leave
 * the prefix off, 404, and drop the page into its error state — which is a
 * convincing imitation of a broken endpoint. Empty in dev and under
 * `next start`, both of which serve from the root.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Rules", href: "#rules" },
  { label: "Registry", href: "#registry" },
  { label: "Install", href: "#install" },
];

export default function LandingPage(): ReactElement {
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  const load = useCallback(async (): Promise<void> => {
    setState({ phase: "loading" });
    try {
      const response = await fetch(`${BASE_PATH}/api/site/overview`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        setState({ phase: "failed", reason: `the overview endpoint answered ${response.status}` });
        return;
      }
      const data: PageData = await response.json();
      setState({ phase: "ready", data });
    } catch {
      // fetch() rejects only on a transport failure; anything else is an ok:false.
      setState({ phase: "failed", reason: "the request never reached us" });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isLoading = state.phase === "loading";
  const error = state.phase === "failed" ? state.reason : null;
  const metrics = state.phase === "ready" ? state.data.metrics : [];

  return (
    <div className="min-h-[100dvh] bg-surface-page text-ink antialiased">
      <style>{tokenStyles}</style>

      <a
        href="#overview"
        className={`${focusRing} sr-only rounded-lg bg-surface-elevated px-4 py-3 text-sm font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-20`}
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-page/85 backdrop-blur">
        <div className={`${sectionShell} flex h-16 items-center justify-between gap-6`}>
          <p className="font-mono text-sm font-medium tracking-tight">
            frontend-design-pro
          </p>

          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex list-none items-center gap-1 p-0">
              {NAV_LINKS.map((link: { label: string; href: string }) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`${tapTarget} ${focusRing} inline-flex items-center rounded-lg px-3 text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-ink motion-reduce:transition-none`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-lg border border-surface-border-strong px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
          >
            GitHub
          </a>
        </div>
      </header>

      <main>
        <Hero repoUrl={REPO_URL} />

        <MetricsStrip metrics={metrics} isLoading={isLoading} error={error} />

        <ConstraintWall rules={ENFORCED_RULES} totalConstraints={TOTAL_CONSTRAINTS} />

        <BentoFeatures skills={REGISTRY_SKILLS} totalSkills={TOTAL_SKILLS} />

        <InstallMatrix adapters={ADAPTERS} repoUrl={REPO_URL} />
      </main>

      <Footer repoUrl={REPO_URL} buildSha={BUILD_SHA} />
    </div>
  );
}
