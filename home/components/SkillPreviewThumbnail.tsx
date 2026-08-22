import type { ReactElement } from "react";

export interface SkillPreviewThumbnailProps {
  group: string;
}

/**
 * A small preview keyed on `SkillRecord.group` — the registry has exactly
 * four real group values (`lib/data.generated.json`: "Meta", "Making it
 * look right", "Building something new", "Making it work well"), not
 * nineteen bespoke thumbnails that would drift the moment a skill is added
 * or moved. CSS/inline-SVG only, no per-skill asset generation.
 */
export function SkillPreviewThumbnail({ group }: SkillPreviewThumbnailProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-surface"
    >
      <Glyph group={group} />
    </span>
  );
}

function Glyph({ group }: { group: string }): ReactElement {
  const stroke = "var(--color-accent)";
  switch (group) {
    case "Meta":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.5">
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </svg>
      );
    case "Making it look right":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M5 18V10" />
          <path d="M12 18V6" />
          <path d="M19 18v-4" />
        </svg>
      );
    case "Building something new":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.5">
          <rect x="4" y="4" width="7" height="7" />
          <rect x="13" y="13" width="7" height="7" />
        </svg>
      );
    case "Making it work well":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7h10" />
          <path d="M5 12h10" />
          <path d="M5 17h6" />
          <circle cx="19" cy="7" r="1.3" fill={stroke} stroke="none" />
          <circle cx="19" cy="12" r="1.3" fill={stroke} stroke="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.5">
          <circle cx="6" cy="6" r="1.4" fill={stroke} stroke="none" />
          <circle cx="12" cy="6" r="1.4" fill={stroke} stroke="none" />
          <circle cx="18" cy="6" r="1.4" fill={stroke} stroke="none" />
          <circle cx="6" cy="18" r="1.4" fill={stroke} stroke="none" />
          <circle cx="12" cy="18" r="1.4" fill={stroke} stroke="none" />
          <circle cx="18" cy="18" r="1.4" fill={stroke} stroke="none" />
        </svg>
      );
  }
}

export default SkillPreviewThumbnail;
