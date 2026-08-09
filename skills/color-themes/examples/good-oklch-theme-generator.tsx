// EXAMPLE: Reference-quality OKLCH theme generator
// Intent: CREATE_COMPONENT · Product: dev-tool · Dials: DV=5 MI=3 VD=6
// Illustrates color-themes discipline (oklch-theme-engine.md):
//   • Every token is generated in OKLCH — no hex anywhere in or out
//   • Chroma is clamped to what the sRGB gamut holds at each lightness, so nothing clips
//   • Harmonic offsets are applied on the hue wheel, where OKLCH keeps them equal-weight
//   • Dark themes get LOWER chroma, not higher — saturated colour on near-black vibrates
//   • Contrast is measured before a pair is presented, not asserted (accessibility-aware-schemes.md)
// Key principles on display:
//   • All 4 states: empty (no swatches), loading, error, success
//   • 44px+ touch targets, visible focus rings, labelled controls
//   • Exported prop interfaces used as types; no `any`
//   • Contrast result is paired with a word, never signalled by colour alone

import { useMemo, useState } from "react";

export type HarmonicScheme = "complementary" | "split" | "triadic" | "analogous";

export interface ThemeTokens {
  surface: string;
  elevated: string;
  border: string;
  muted: string;
  text: string;
  accent: string;
}

export interface OklchThemeGeneratorProps {
  /** Anchor hue in degrees. Everything else is derived from it. */
  baseHue?: number;
  scheme?: HarmonicScheme;
  dark?: boolean;
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  hasError?: boolean;
}

const SCHEME_OFFSETS: Record<HarmonicScheme, number[]> = {
  complementary: [0, 180],
  split: [0, 150, 210],
  triadic: [0, 120, 240],
  analogous: [0, 30, -30],
};

/** Chroma the sRGB gamut can hold at a given lightness — peaks mid, zero at both ends. */
function maxChroma(l: number): number {
  const t = Math.min(Math.max(l, 0), 100) / 100;
  return 0.37 * Math.pow(1 - Math.abs(t - 0.5) * 2, 0.65);
}

function oklch(l: number, c: number, h: number): string {
  const clamped = Math.min(c, maxChroma(l));
  return `oklch(${l.toFixed(1)}% ${clamped.toFixed(3)} ${((h % 360) + 360) % 360})`;
}

export function generateTheme(hue: number, dark: boolean): ThemeTokens {
  return dark
    ? {
        surface: oklch(17.4, 0.012, hue),
        elevated: oklch(20.1, 0.014, hue),
        border: oklch(26.8, 0.014, hue),
        muted: oklch(63.2, 0.019, hue),
        text: oklch(96.2, 0.005, hue),
        // 0.14 against 0.19 on light: the dark field does the saturating for you.
        accent: oklch(72.4, 0.14, hue),
      }
    : {
        surface: oklch(98.5, 0.002, hue),
        elevated: oklch(100, 0, hue),
        border: oklch(91, 0.004, hue),
        muted: oklch(55, 0.018, hue),
        text: oklch(18.8, 0.013, hue),
        accent: oklch(58, 0.19, hue),
      };
}

const srgb = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

function oklchToLinear(l: number, c: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const ll = l / 100;
  const lc = Math.pow(ll + 0.3963377774 * a + 0.2158037573 * b, 3);
  const mc = Math.pow(ll - 0.1055613458 * a - 0.0638541728 * b, 3);
  const sc = Math.pow(ll - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ];
}

function parseOklch(token: string): [number, number, number] {
  const parts = token.replace(/^oklch\(|\)$/g, "").split(/\s+/);
  return [
    Number.parseFloat(parts[0] ?? "0"),
    Number.parseFloat(parts[1] ?? "0"),
    Number.parseFloat(parts[2] ?? "0"),
  ];
}

/** WCAG 2.x relative luminance, computed from the OKLCH token itself. */
function luminance(token: string): number {
  const [l, c, h] = parseOklch(token);
  const [r, g, b] = oklchToLinear(l, c, h);
  const clamp = (v: number) => Math.min(Math.max(encode(Math.max(v, 0)), 0), 1);
  return 0.2126 * srgb(clamp(r)) + 0.7152 * srgb(clamp(g)) + 0.0722 * srgb(clamp(b));
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export default function OklchThemeGenerator({
  baseHue = 248,
  scheme = "split",
  dark = true,
  isLoading = false,
  hasError = false,
}: OklchThemeGeneratorProps = {}) {
  const [hue, setHue] = useState(baseHue);
  const [activeScheme, setActiveScheme] = useState<HarmonicScheme>(scheme);
  const [isDark, setIsDark] = useState(dark);

  const tokens = useMemo(() => generateTheme(hue, isDark), [hue, isDark]);
  const harmony = useMemo(
    () => (SCHEME_OFFSETS[activeScheme] ?? []).map((d) => ((hue + d) % 360 + 360) % 360),
    [hue, activeScheme]
  );
  const ratio = useMemo(() => contrastRatio(tokens.text, tokens.surface), [tokens]);
  const passes = ratio >= 4.5;

  if (hasError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-2xl border border-[oklch(63.7%_0.208_25.3)] bg-[oklch(20.1%_0.014_248)] p-6 font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(96.2%_0.005_248)]">Couldn&rsquo;t generate a theme</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          The anchor colour didn&rsquo;t resolve. Pick a hue and try again.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(17.4%_0.012_248)] p-4">
        <div className="w-full max-w-2xl space-y-4">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-[oklch(23.1%_0.013_248)]" />
          <div className="h-32 w-full animate-pulse rounded-2xl bg-[oklch(23.1%_0.013_248)]" />
        </div>
      </main>
    );
  }

  const entries = Object.entries(tokens);

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[oklch(31.6%_0.015_248)] bg-[oklch(20.1%_0.014_248)] p-8 text-center font-[Manrope,system-ui,sans-serif]">
        <h2 className="text-xl font-bold text-[oklch(96.2%_0.005_248)]">No tokens generated</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">Choose an anchor hue to build a scale.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] justify-center bg-[oklch(17.4%_0.012_248)] p-4 font-[Manrope,system-ui,sans-serif]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}
      <section
        aria-label="Theme generator"
        className="w-full max-w-2xl space-y-6 rounded-2xl border border-[oklch(26.8%_0.014_248)] bg-[oklch(20.1%_0.014_248)] p-6 sm:p-8"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[oklch(96.2%_0.005_248)]">
            Generated palette
          </h2>
          <p className="mt-1 text-sm text-[oklch(74.8%_0.017_248)]">
            Six tokens derived from one hue, with chroma clamped to the sRGB gamut.
          </p>
        </div>

        <div>
          <label htmlFor="hue" className="mb-1.5 block text-sm font-semibold text-[oklch(96.2%_0.005_248)]">
            Anchor hue — {hue}&deg;
          </label>
          <input
            id="hue"
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="h-11 w-full cursor-pointer accent-[oklch(72.4%_0.181_156.3)]"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[12rem] flex-1">
            <label
              htmlFor="scheme"
              className="mb-1.5 block text-sm font-semibold text-[oklch(96.2%_0.005_248)]"
            >
              Harmonic scheme
            </label>
            <select
              id="scheme"
              value={activeScheme}
              onChange={(e) => setActiveScheme(e.target.value as HarmonicScheme)}
              className="h-11 w-full rounded-xl border-2 border-[oklch(31.6%_0.015_248)] bg-[oklch(17.4%_0.012_248)] px-3 text-[oklch(96.2%_0.005_248)] outline-none transition-colors duration-200 ease-out focus:border-[oklch(72.4%_0.181_156.3)] motion-reduce:transition-none"
            >
              <option value="complementary">Complementary — +180&deg;</option>
              <option value="split">Split complementary — &plusmn;150&deg;</option>
              <option value="triadic">Triadic — &plusmn;120&deg;</option>
              <option value="analogous">Analogous — &plusmn;30&deg;</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-pressed={isDark}
              className="inline-flex h-11 items-center rounded-xl border border-[oklch(31.6%_0.015_248)] px-4 text-sm font-semibold text-[oklch(96.2%_0.005_248)] outline-none transition-colors duration-200 ease-out hover:border-[oklch(43.9%_0.018_248)] focus-visible:ring-2 focus-visible:ring-[oklch(72.4%_0.181_156.3)] motion-reduce:transition-none"
            >
              {isDark ? "Dark scale" : "Light scale"}
            </button>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {entries.map(([name, value]) => (
            <li
              key={name}
              className="overflow-hidden rounded-xl border border-[oklch(31.6%_0.015_248)]"
            >
              <div className="h-14 w-full" style={{ backgroundColor: value }} />
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-[oklch(96.2%_0.005_248)]">{name}</p>
                <p className="truncate text-[11px] tabular-nums text-[oklch(63.2%_0.019_248)]">{value}</p>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-[oklch(96.2%_0.005_248)]">
            Harmony — {harmony.length} hues
          </h3>
          <ul className="flex flex-wrap gap-2">
            {harmony.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span
                  className="inline-block h-8 w-8 rounded-lg border border-[oklch(31.6%_0.015_248)]"
                  style={{ backgroundColor: oklch(isDark ? 72.4 : 58, 0.14, h) }}
                />
                <span className="text-xs tabular-nums text-[oklch(74.8%_0.017_248)]">{h}&deg;</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The verdict is a word first. Colour alone would exclude the readers
            most likely to depend on this number being right. */}
        <p
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            passes
              ? "border-[oklch(72.4%_0.181_156.3)] text-[oklch(82.1%_0.13_156.3)]"
              : "border-[oklch(63.7%_0.208_25.3)] text-[oklch(78.4%_0.13_25.3)]"
          }`}
        >
          {passes ? "Passes" : "Fails"} WCAG AA for body text — text on surface is{" "}
          <span className="tabular-nums">{ratio.toFixed(2)}:1</span>, minimum 4.5:1.
        </p>
      </section>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
