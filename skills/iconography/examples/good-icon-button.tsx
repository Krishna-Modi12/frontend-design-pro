// GOLD: Icon buttons — optical sizing, weight pairing, and the label rule.
// Source doctrine: references/icon-systems.md.
//   • An icon that carries meaning gets an accessible name; a decorative one is
//     hidden from the tree entirely. There is no third case, and "both" is a bug:
//     an aria-hidden icon inside a labelled button is correct, an unlabelled
//     button with a visible icon is not.
//   • Icon size tracks the *text* it sits with, not the button box. 1em keeps the
//     glyph optically matched when the type scale changes.
//   • Stroke weight is a token, not a per-icon decision — mixing weights in one
//     cluster is the single most common tell of an assembled-not-designed UI.
//   • The 44px target is the hit area, not the glyph. A 16px icon in a 44px
//     button is correct; a 44px icon is a billboard.
import * as React from "react";

/* ── weight + size tokens ─────────────────────────────────────────────────── */
const ICON_WEIGHT = { regular: 1.5, bold: 2 } as const;
const buttonSizes = {
  sm: { box: "h-11 w-11", glyph: "text-base" },
  md: { box: "h-11 w-11 sm:h-12 sm:w-12", glyph: "text-lg" },
  lg: { box: "h-12 w-12 md:h-14 md:w-14", glyph: "text-xl" },
} as const;
export type IconButtonSize = keyof typeof buttonSizes;

const tones = {
  neutral:
    "text-[oklch(45%_0.010_240)] hover:text-[oklch(14%_0.012_240)] hover:bg-[oklch(94%_0.005_240)]",
  danger:
    "text-[oklch(52%_0.180_25)] hover:text-[oklch(42%_0.190_25)] hover:bg-[oklch(95%_0.030_25)]",
} as const;
export type IconButtonTone = keyof typeof tones;

/* ── glyphs: 24-grid, currentColor, weight from the token ─────────────────── */
export interface GlyphProps extends React.SVGProps<SVGSVGElement> {
  weight?: keyof typeof ICON_WEIGHT;
}

function glyph(path: React.ReactNode, displayName: string) {
  const Icon = React.forwardRef<SVGSVGElement, GlyphProps>(function Glyph(
    { weight = "regular", className = "", ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        // 1em, so the glyph scales with the button's own type size.
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth={ICON_WEIGHT[weight]}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {path}
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}

export const StarIcon = glyph(
  <path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85z" />,
  "StarIcon",
);
export const TrashIcon = glyph(
  <>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
  </>,
  "TrashIcon",
);
export const SpinnerIcon = glyph(
  <path d="M12 3a9 9 0 019 9" />,
  "SpinnerIcon",
);

/* ── IconButton ───────────────────────────────────────────────────────────── */
export interface IconButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** The icon component to render. Always hidden from assistive tech. */
  icon: React.ComponentType<GlyphProps>;
  /**
   * The button's accessible name. Required — an icon-only control has no text
   * node, so without this it reaches a screen reader as "button".
   */
  label: string;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  weight?: keyof typeof ICON_WEIGHT;
  /** Drive from a real pending action; never from a timer. */
  isPending?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon: Icon,
      label,
      size = "md",
      tone = "neutral",
      weight = "regular",
      isPending = false,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) {
    const s = buttonSizes[size];
    return (
      <button
        ref={ref}
        type="button"
        // The label is the name; the glyph is decoration on top of it.
        aria-label={label}
        aria-busy={isPending || undefined}
        disabled={disabled ?? isPending}
        className={`inline-flex shrink-0 items-center justify-center rounded-xl transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(60%_0.185_276)] focus-visible:ring-offset-2 disabled:opacity-50 ${s.box} ${s.glyph} ${tones[tone]} ${className}`}
        {...props}
      >
        {isPending ? (
          <SpinnerIcon
            weight={weight}
            aria-hidden="true"
            focusable="false"
            className="animate-spin motion-reduce:animate-none"
          />
        ) : (
          <Icon weight={weight} aria-hidden="true" focusable="false" />
        )}
      </button>
    );
  },
);

/* ── demo ─────────────────────────────────────────────────────────────────── */
interface Asset {
  id: string;
  name: string;
  size: string;
  starred: boolean;
}

export interface AssetToolbarProps {
  assets?: Asset[];
  isLoading?: boolean;
  /** Non-null renders the recoverable error branch instead of the list. */
  error?: string | null;
}

const SEED: Asset[] = [
  { id: "a-1", name: "wordmark-dark.svg", size: "4.2 kB", starred: true },
  { id: "a-2", name: "og-card-1200x630.png", size: "184.6 kB", starred: false },
  { id: "a-3", name: "brand-motion-loop.webm", size: "2.1 MB", starred: false },
];

export default function AssetToolbar({
  assets = SEED,
  isLoading = false,
  error = null,
}: AssetToolbarProps = {}) {
  const [items, setItems] = React.useState(assets);

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8" aria-busy="true">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <ul className="mt-6 max-w-xl space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-[oklch(93%_0.005_240)]" />
          ))}
        </ul>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8">
        <div
          role="alert"
          className="max-w-xl rounded-xl border border-[oklch(80%_0.090_25)] bg-[oklch(97%_0.020_25)] p-4"
        >
          <h2 className="text-sm font-semibold text-[oklch(38%_0.170_25)]">
            Assets could not be loaded
          </h2>
          <p className="mt-1 text-sm text-[oklch(45%_0.060_25)]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance">
        Brand assets
      </h1>
      <p className="mt-1 text-sm text-[oklch(45%_0.010_240)]">
        {items.length} files · 2.3&nbsp;MB total
      </p>

      <ul className="mt-6 max-w-xl divide-y divide-[oklch(92%_0.005_240)] rounded-xl border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)]">
        {items.map((asset) => (
          <li key={asset.id} className="flex items-center gap-3 p-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-sm text-[oklch(14%_0.012_240)]">
                {asset.name}
              </span>
              <span className="block text-xs text-[oklch(45%_0.010_240)]">{asset.size}</span>
            </span>
            <IconButton
              icon={StarIcon}
              // The name changes with the state, so the control never announces
              // something the user has already undone.
              label={asset.starred ? `Unstar ${asset.name}` : `Star ${asset.name}`}
              aria-pressed={asset.starred}
              weight={asset.starred ? "bold" : "regular"}
              size="sm"
              onClick={() =>
                setItems((prev) =>
                  prev.map((a) => (a.id === asset.id ? { ...a, starred: !a.starred } : a)),
                )
              }
            />
            <IconButton
              icon={TrashIcon}
              label={`Delete ${asset.name}`}
              tone="danger"
              size="sm"
              onClick={() => setItems((prev) => prev.filter((a) => a.id !== asset.id))}
            />
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="mt-6 max-w-xl rounded-xl border border-dashed border-[oklch(85%_0.005_240)] p-6 text-center text-sm text-[oklch(45%_0.010_240)]">
          Every asset has been removed. Upload a file to start again.
        </p>
      )}
    </main>
  );
}
