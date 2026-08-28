import Image from "next/image";
import type { ReactElement, ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { cardShell, focusRing } from "../lib/tokens";

export interface ShowcaseCardProps {
  name: string;
  tagline: string;
  href: string;
  image: StaticImageData;
  variant: "live" | "static";
  /** `ShowcaseWaiver`, when this card carries one — kept generic here so this
      component stays agnostic to which project needs a disclosure. */
  waiver?: ReactNode;
}

/**
 * One component with a `variant` prop rather than two, so the accessible-name
 * and image-handling logic can't drift between the live cards and the static
 * ones. The whole card is a single `<a>` (real link semantics, not a
 * `<div onClick>`) — its accessible name is `name` + `tagline` + the trailing
 * CTA text, which already differs card to card, so the two "Live" cards
 * don't collapse to identical link names despite sharing a CTA label.
 */
export function ShowcaseCard({ name, tagline, href, image, variant, waiver }: ShowcaseCardProps): ReactElement {
  return (
    <a
      href={href}
      rel={variant === "live" ? "noreferrer" : undefined}
      className={`${cardShell} ${focusRing} flex flex-col overflow-hidden transition-colors duration-150 ease-out hover:border-border-strong motion-reduce:transition-none`}
    >
      <div className="relative aspect-video overflow-hidden bg-bg-surface">
        <Image
          src={image}
          alt={`${name} — screenshot`}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
          loading="lazy"
        />
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{ background: "var(--color-emphasis-bg)", color: "var(--color-emphasis)" }}
        >
          {variant === "live" ? (
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
          ) : null}
          {variant === "live" ? "Live" : "Static preview"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 data-metric className="text-base font-semibold text-text-primary">
          {name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{tagline}</p>
        {waiver}
        <span className="mt-4 text-sm font-medium text-accent">
          {variant === "live" ? "Open live →" : "Open full capture →"}
        </span>
      </div>
    </a>
  );
}

export default ShowcaseCard;
