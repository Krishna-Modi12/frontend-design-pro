import type { ReactElement } from "react";
import data from "../lib/data.generated.json";
import type { GeneratedData } from "../lib/data.types";
import SmoothScroll from "../components/SmoothScroll";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SectionProblem from "../components/SectionProblem";
import SectionSkillCatalog from "../components/SectionSkillCatalog";
import SectionHow from "../components/SectionHow";
import SectionWall from "../components/SectionWall";
import SectionShowcase from "../components/SectionShowcase";
import SectionInstall from "../components/SectionInstall";
import { focusRing, tokenStyles } from "../lib/tokens";

const payload = data as GeneratedData;

/**
 * Static at build time — this app has no client-only data dependency (unlike
 * `demo/landing-page`'s fetched `/api/site/overview`), because every figure
 * here comes from `data.generated.json`, imported directly rather than
 * fetched. There's no loading/error/empty state to model because there's
 * nothing asynchronous to wait on.
 */
export default function Page(): ReactElement {
  return (
    <SmoothScroll>
      <div className="min-h-[100dvh] bg-bg-page text-text-primary antialiased">
        <style dangerouslySetInnerHTML={{ __html: tokenStyles }} />

        <a
          href="#main"
          className={`${focusRing} sr-only rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50`}
        >
          Skip to content
        </a>

        <Navbar version={payload.version} />

        <main id="main">
          <Hero installHref="#install" howItWorksHref="#how-it-works" />
          <SectionProblem figures={payload.figures} />
          <SectionSkillCatalog skills={payload.skills} />
          <SectionHow skills={payload.skills} figures={payload.figures} />
          <SectionWall figures={payload.figures} />
          <SectionShowcase />
          <SectionInstall adapters={payload.adapters} buildYear={new Date().getFullYear()} />
        </main>
      </div>
    </SmoothScroll>
  );
}
