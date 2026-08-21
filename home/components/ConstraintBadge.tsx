import type { ReactElement } from "react";

export interface ConstraintBadgeProps {
  text: string;
}

export function ConstraintBadge({ text }: ConstraintBadgeProps): ReactElement {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm text-text-secondary">
      {text}
    </span>
  );
}

export default ConstraintBadge;
