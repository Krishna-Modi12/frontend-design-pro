import type { ReactElement } from "react";
import type { StaticImageData } from "next/image";
import bellwether from "../public/showcase/bellwether.png";
import wavelet from "../public/showcase/wavelet.png";
import ledgerline from "../public/showcase/ledgerline.png";
import ledgerlineFull from "../public/showcase/ledgerline-full.png";
import arclight from "../public/showcase/arclight.png";
import arclightFull from "../public/showcase/arclight-full.png";
import ShowcaseCoverflow from "./ShowcaseCoverflow";
import type { ShowcaseSlide } from "./ShowcaseCoverflow";
import ShowcaseSelfCheck from "./ShowcaseSelfCheck";
import { SHOWCASE_COPY, SHOWCASE_PROJECTS, SHOWCASE_SELF_CHECK } from "../lib/content";
import type { ShowcaseProject } from "../lib/content";
import { sectionShell, sectionSpacing } from "../lib/tokens";

type ShowcaseId = ShowcaseProject["id"];

const THUMBNAILS: Record<ShowcaseId, StaticImageData> = { bellwether, wavelet, ledgerline, arclight };

/** Only the two static cards need a resolved target — the live cards already
    carry a real URL in `SHOWCASE_PROJECTS`. Reading `.src` off a statically
    imported asset (rather than a hand-built path string) is the one
    basePath-safe way to link to a `public/` file that isn't rendered through
    `next/image` itself — see `next.config.ts`'s export-mode note. */
const STATIC_TARGETS: Partial<Record<ShowcaseId, string>> = {
  ledgerline: ledgerlineFull.src,
  arclight: arclightFull.src,
};

/** Resolved on the server: `ShowcaseCoverflow` is a client component, so the
    href rule crosses the boundary as data rather than as a callback. */
const SLIDES: ShowcaseSlide[] = SHOWCASE_PROJECTS.map((project) => ({
  ...project,
  image: THUMBNAILS[project.id],
  href: project.variant === "live" ? project.href : (STATIC_TARGETS[project.id] ?? project.href),
}));

/**
 * Four real demo projects — two deployed apps that link out live, two
 * stub-typed reference builds that were never installed and link to a
 * full-page capture instead. `ShowcaseCard`'s `variant` prop keeps both honest
 * about which is which rather than presenting all four the same way.
 *
 * **The 2×2 grid is now a coverflow carousel** (`ShowcaseCoverflow`), built to
 * the design of Skiper UI's `Skiper49` but on a native scroll-snap container
 * rather than its Swiper/Framer Motion stack — the reasoning is in that
 * component's docblock.
 *
 * **The SLOP-05 note moved out of the card and under the carousel.** Two
 * reasons, and the second is the one that matters. Coverflow wants uniform
 * slide heights, and a five-line note on one of four cards breaks that. But
 * a claim a reader has to *drag sideways to discover* is a worse
 * claim than one sitting in the open under the section — so it is now
 * visible without any interaction at all, and, no longer nested inside
 * `ShowcaseCard`'s single large `<a>`, it can finally link to the README it
 * cites instead of naming it in plain text.
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
      </div>

      {/* Full-bleed: the carousel derives its own edge padding from the slide
          width so the first and last card can reach the centre, which a
          `max-w-6xl` shell would fight. */}
      <ShowcaseCoverflow slides={SLIDES} />

      <div className={sectionShell}>
        <div className="mt-4 max-w-2xl">
          <ShowcaseSelfCheck text={SHOWCASE_SELF_CHECK} />
        </div>
      </div>
    </section>
  );
}

export default SectionShowcase;
