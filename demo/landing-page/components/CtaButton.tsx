import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import { focusRing, tapTarget } from "../lib/tokens";

export interface CtaButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `solid` carries the accent; `outline` is the quieter second action. */
  variant?: "solid" | "outline";
}

/**
 * One primary style per page, paired with a ghost secondary — never two solids.
 * On a light ground the outline variant has to sit on the raised surface rather
 * than on nothing: a transparent button on porcelain reads as a caption with a
 * box drawn round it, where the same treatment on a dark ground reads as a
 * control. Its border is `border-strong`, which is the token measured at 3.28:1
 * so the control's edge clears WCAG 1.4.11 without the label having to carry it.
 */
const VARIANT: Record<"solid" | "outline", string> = {
  solid: "bg-accent text-accent-ink shadow-card hover:bg-accent/90",
  outline:
    "border border-surface-border-strong bg-surface-raised text-ink hover:border-accent hover:text-accent",
};

/**
 * `forwardRef` lives here rather than on the section wrappers.
 * `core/component-api.md` scopes the requirement to interactive components —
 * something has to be able to focus this, scroll it into view, or measure it.
 * A <section> that nothing ever calls a method on does not need a handle, and
 * forwarding one everywhere is cargo cult rather than API design.
 *
 * Transitions are duration-150 ease-out: entrances and hovers decelerate.
 * `ease-in` accelerates into a stop, which reads as the UI flinching, and the
 * anti-slop wall bans it for entrances.
 */
const CtaButton = forwardRef<HTMLAnchorElement, CtaButtonProps>(function CtaButton(
  { variant = "solid", className = "", children, ...rest },
  ref,
): ReactElement {
  return (
    <a
      ref={ref}
      className={`${tapTarget} ${focusRing} ${VARIANT[variant]} ${className} inline-flex items-center justify-center rounded-xl px-6 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none`}
      {...rest}
    >
      {children}
    </a>
  );
});

export default CtaButton;
