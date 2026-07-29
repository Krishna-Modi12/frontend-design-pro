"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import Hero from "../components/Hero";
import type { PlatformMetric } from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import type { PlanPrice } from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import type { RegionState } from "../components/Footer";
import { focusRing, sectionShell, tapTarget, tokenStyles } from "../lib/tokens";

/**
 * Everything the page reads from the network in one shape. The three sections
 * share a single request because they share a single failure: if the control
 * plane is down, showing a live pricing table next to a broken metric strip is
 * worse than showing both as unavailable.
 */
interface PageData {
  metrics: PlatformMetric[];
  plans: PlanPrice[];
  verified: Record<string, string>;
  region: RegionState;
}

type LoadState =
  | { readonly phase: "loading" }
  | { readonly phase: "ready"; readonly data: PageData }
  | { readonly phase: "failed"; readonly reason: string };

const BUILD_SHA = "a7f31c9";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Overview", href: "#overview" },
  { label: "Runtime", href: "#capabilities" },
  { label: "Pricing", href: "#pricing" },
  { label: "Teams", href: "#stories" },
];

export default function LandingPage(): ReactElement {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [quickstartOpen, setQuickstartOpen] = useState(false);
  const ctaRef = useRef<HTMLButtonElement | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setState({ phase: "loading" });
    try {
      const response = await fetch("/api/site/overview", { headers: { Accept: "application/json" } });
      if (!response.ok) {
        setState({ phase: "failed", reason: `the control plane answered ${response.status}` });
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

  // Closing the quickstart returns focus to the control that opened it, which is
  // the whole reason Hero forwards a ref to its primary button.
  const closeQuickstart = useCallback((): void => {
    setQuickstartOpen(false);
    ctaRef.current?.focus();
  }, []);

  const isLoading = state.phase === "loading";
  const error = state.phase === "failed" ? state.reason : null;
  const data = state.phase === "ready" ? state.data : null;
  const throughput =
    data?.metrics.find((metric: PlatformMetric) => metric.id === "steps-committed") ?? null;

  return (
    <div className="min-h-[100dvh] bg-surface text-ink antialiased">
      <style>{tokenStyles}</style>

      <a
        href="#overview"
        className={`${focusRing} sr-only rounded-lg bg-surface-raised px-4 py-3 text-sm font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-4 focus-visible:z-20`}
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 border-b border-hairline bg-surface/85 backdrop-blur">
        <div className={`${sectionShell} flex h-16 items-center justify-between gap-6`}>
          <p className="text-base font-semibold tracking-[-0.01em]">Tracepoint</p>

          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-1">
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
            href="/signin"
            className={`${tapTarget} ${focusRing} inline-flex items-center rounded-lg border border-hairline-strong px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:border-accent motion-reduce:transition-none`}
          >
            Sign in
          </a>
        </div>
      </header>

      <main>
        <Hero
          metrics={data?.metrics ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={() => void load()}
          onQuickstart={() => setQuickstartOpen((open: boolean) => !open)}
          quickstartOpen={quickstartOpen}
          ctaRef={ctaRef}
        />

        {quickstartOpen ? (
          <section
            id="quickstart"
            aria-label="Quickstart"
            className={`${sectionShell} border-b border-hairline py-8`}
          >
            <ol className="grid gap-4 text-sm leading-relaxed text-ink-muted sm:grid-cols-3">
              <li>
                <span className="font-medium text-ink">1 · Install</span> — one package,
                no daemon: <code>npm i @tracepoint/sdk</code>
              </li>
              <li>
                <span className="font-medium text-ink">2 · Wrap a function</span> — the
                handler you already have becomes a workflow with one import.
              </li>
              <li>
                <span className="font-medium text-ink">3 · Kill the worker</span> —
                restart it and watch the run resume at the step it reached.
              </li>
            </ol>
            <button
              type="button"
              onClick={closeQuickstart}
              className={`${tapTarget} ${focusRing} mt-4 inline-flex items-center rounded-lg border border-hairline-strong px-4 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:border-accent hover:text-ink motion-reduce:transition-none`}
            >
              Close quickstart
            </button>
          </section>
        ) : null}

        <Features throughput={throughput} isLoading={isLoading} error={error} />

        <Pricing
          plans={data === null ? null : data.plans}
          isLoading={isLoading}
          error={error}
          onRetry={() => void load()}
        />

        <Testimonials verified={data?.verified ?? null} isLoading={isLoading} error={error} />
      </main>

      <Footer buildSha={BUILD_SHA} regionState={data?.region ?? "unknown"} />
    </div>
  );
}
