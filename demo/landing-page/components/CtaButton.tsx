import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import { focusRing, tapTarget } from "../lib/tokens";

export interface CtaButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `solid` carries the accent; `outline` is the quieter second action. */
  variant?: "solid" | "outline";
}

/**
 * One primary style per page, paired with a ghost secondary — never two solids.
 *
 * The outline variant is genuinely transparent here, and that is a change the
 * palette made rather than a preference. On the light ground this page used to
 * have, a transparent button read as a caption with a box drawn round it and
 * had to sit on the raised surface to look like a control at all. On near-black
 * the outline reads as a control on its own, so the fill comes off.
 *
 * Its border is `border-strong`, the token measured at 3.00:1 against the
 * worst of the three surfaces, so the control's edge clears WCAG 1.4.11
 * without the label having to carry it.
 *
 * `accent-ink` on the solid variant is pure white, not `ink`. `ink` is 95%
 * lightness and measures 4.30:1 on the accent fill — under AA. That pairing is
 * the single easiest mistake to make in this palette, which is why the two
 * tokens exist separately.
 */
const VARIANT: Record<"solid" | "outline", string> = {
  solid: "bg-accent text-accent-ink shadow-card hover:bg-accent/90",
  outline:
    "border border-surface-border-strong text-ink hover:border-accent-text hover:text-accent-text",
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
