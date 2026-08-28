import type { ReactElement } from "react";
import type { StaticImageData } from "next/image";
import bellwether from "../public/showcase/bellwether.png";
import nexus from "../public/showcase/nexus.png";
import ledgerline from "../public/showcase/ledgerline.png";
import ledgerlineFull from "../public/showcase/ledgerline-full.png";
import arclight from "../public/showcase/arclight.png";
import arclightFull from "../public/showcase/arclight-full.png";
import ShowcaseCard from "./ShowcaseCard";
import ShowcaseWaiver from "./ShowcaseWaiver";
import { SHOWCASE_COPY, SHOWCASE_PROJECTS, NEXUS_WAIVER } from "../lib/content";
import type { ShowcaseProject } from "../lib/content";
import { sectionShell, sectionSpacing } from "../lib/tokens";

type ShowcaseId = ShowcaseProject["id"];

const THUMBNAILS: Record<ShowcaseId, StaticImageData> = { bellwether, nexus, ledgerline, arclight };

/** Only the two static cards need a resolved target — the live cards already
    carry a real URL in `SHOWCASE_PROJECTS`. Reading `.src` off a statically
    imported asset (rather than a hand-built path string) is the one
    basePath-safe way to link to a `public/` file that isn't rendered through
    `next/image` itself — see `next.config.ts`'s export-mode note. */
const STATIC_TARGETS: Partial<Record<ShowcaseId, string>> = {
  ledgerline: ledgerlineFull.src,
  arclight: arclightFull.src,
};

/**
 * New in v2.2 — the one gap the original research found still open: four real
 * demo projects existed on disk with no presence on the page, standing in for
 * a generic mockup gallery (`MockUIGallery`, retired alongside this). Two are
 * deployed apps and link out live; two are stub-typed reference builds, never
 * installed, and link to a full-page capture instead — `ShowcaseCard`'s
 * `variant` prop keeps both honest about which is which rather than
 * presenting all four the same way.
 */
export function SectionShowcase(): ReactElement {
  return (
    <section id="showcase" data-section-surface className={`${sectionSpacing} bg-bg-page`}>
      <div className={sectionShell}>
        <p data-label className="text-accent">
          {SHOWCASE_COPY.eyebrow}
        </p>
        <h2 data-display className="mt-4 max-w-2xl text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold text-text-primary">
          {SHOWCASE_COPY.heading}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">{SHOWCASE_COPY.body}</p>

        <div data-showcase-grid className="mt-10 grid gap-6 sm:grid-cols-2">
          {SHOWCASE_PROJECTS.map((project) => (
            <ShowcaseCard
              key={project.id}
              name={project.name}
              tagline={project.tagline}
              variant={project.variant}
              image={THUMBNAILS[project.id]}
              href={project.variant === "live" ? project.href : (STATIC_TARGETS[project.id] ?? project.href)}
              waiver={project.id === "nexus" ? <ShowcaseWaiver text={NEXUS_WAIVER} /> : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SectionShowcase;
