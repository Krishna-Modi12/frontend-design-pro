import { forwardRef } from "react";
import type { ReactNode } from "react";
import { focusRing, tapTarget } from "../lib/tokens";

export interface CtaButtonProps {
  /** Where it goes. Every CTA on this page is a link, so there is no onClick. */
  href: string;
  /** `primary` is the acid fill; `secondary` is the hairline outline. */
  variant: "primary" | "secondary";
  children: ReactNode;
  /** Set on the outbound GitHub link so the tab is not hijacked silently. */
  external?: boolean;
}

const VARIANT: Record<CtaButtonProps["variant"], string> = {
  primary:
    "bg-accent text-accent-ink hover:shadow-[0_0_0_6px_var(--color-accent-glow)] " +
    "font-semibold",
  secondary:
    "border border-surface-border-strong text-ink hover:border-accent " +
    "hover:text-accent font-medium",
};

/**
 * The one interactive primitive on the page, so it is the one thing that
 * forwards a ref — `core/component-api.md` scopes that requirement to
 * interactive components, not to every section wrapper that happens to render a
 * <div>. A section can be reached by its `id`; a control a shell needs to focus
 * cannot.
 *
 * The transition names its properties. PERF-04 bans the blanket keyword — it
 * animates layout properties nobody asked it to, and it cannot be spelled here
 * either, because the regex half of that check reads comments too.
 */
const CtaButton = forwardRef<HTMLAnchorElement, CtaButtonProps>(function CtaButton(
  { href, variant, children, external = false },
  ref,
) {
  const outbound = external
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {};

  return (
    <a
      ref={ref}
      href={href}
      {...outbound}
      className={`${tapTarget} ${focusRing} ${VARIANT[variant]} inline-flex items-center justify-center rounded-xl px-6 text-sm transition-[color,background-color,border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none`}
    >
      {children}
    </a>
  );
});

export default CtaButton;
