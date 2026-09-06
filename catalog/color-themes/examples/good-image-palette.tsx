// EXAMPLE: Reference-quality image → OKLCH palette extraction
// Intent: CREATE_COMPONENT · Product: dev-tool · Dials: DV=5 MI=3 VD=6
// Illustrates color-themes discipline (image-palette-extraction.md):
//   • Median cut, never averaging — the mean of any photograph is the same muddy grey
//   • Downscaled to 160px before sampling: same answer, milliseconds instead of seconds
//   • getContext("2d") null-guarded, and crossOrigin set so getImageData cannot taint
//   • Clusters scored by chroma × log(size) so a large flat sky cannot win the accent slot
//   • Only the HUE survives into the theme; lightness comes from the fixed ramp
// Key principles on display:
//   • All 4 states: empty (no image yet), loading (decoding), error (unreadable), success
//   • 44px+ touch targets, labelled file input, results announced politely
//   • Exported prop interfaces used as types; no `any`

import { useCallback, useRef, useState } from "react";

export interface PaletteSwatch {
  /** Always an OKLCH string. Nothing hex-shaped leaves this component. */
  token: string;
  role: "dominant" | "accent" | "surface";
  /** Share of sampled pixels in this cluster, 0–1. */
  weight: number;
}

export interface ImagePaletteProps {
  /** Longest edge, in pixels, that the image is downscaled to before sampling. */
  sampleSize?: number;
  /** Recursion depth for median cut — yields 2^depth clusters. */
  depth?: number;
  initialSwatches?: PaletteSwatch[];
  isLoading?: boolean;
  hasError?: boolean;
}

interface Cluster {
  r: number;
  g: number;
  b: number;
  count: number;
}

const srgbToLinear = (v: number) =>
  v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

/** sRGB → OKLCH. The cube roots are the perceptual part; skipping them buys nothing. */
export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: L * 100,
    c: Math.sqrt(A * A + B * B),
    h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
  };
}

function centroid(pixels: number[][]): Cluster {
  if (pixels.length === 0) return { r: 0, g: 0, b: 0, count: 0 };
  let r = 0;
  let g = 0;
  let b = 0;
  for (const p of pixels) {
    r += p[0] ?? 0;
    g += p[1] ?? 0;
    b += p[2] ?? 0;
  }
  const n = pixels.length;
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n), count: n };
}

/**
 * Median cut: split the colour box along its widest axis, at the median. Splitting
 * at the median rather than the midpoint follows where pixels actually are, so a
 * large flat region cannot drag the split.
 */
export function medianCut(pixels: number[][], depth: number): Cluster[] {
  if (depth === 0 || pixels.length <= 1) return [centroid(pixels)];

  let axis = 0;
  let widest = -1;
  for (let i = 0; i < 3; i++) {
    let lo = 255;
    let hi = 0;
    for (const p of pixels) {
      const v = p[i] ?? 0;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (hi - lo > widest) {
      widest = hi - lo;
      axis = i;
    }
  }

  const sorted = [...pixels].sort((a, b) => (a[axis] ?? 0) - (b[axis] ?? 0));
  const mid = sorted.length >> 1;
  return [
    ...medianCut(sorted.slice(0, mid), depth - 1),
    ...medianCut(sorted.slice(mid), depth - 1),
  ];
}

export function clustersToSwatches(clusters: Cluster[], total: number): PaletteSwatch[] {
  const scored = clusters
    .filter((k) => k.count > 0)
    .map((k) => {
      const { l, c, h } = rgbToOklch(k.r, k.g, k.b);
      return { ...k, l, c, h, score: c * Math.log(k.count + 1) };
    });
  if (scored.length === 0) return [];

  // Chroma floor keeps a near-grey from taking the accent on pixel count alone;
  // the lightness window excludes near-black and near-white, which are useless as accents.
  const usable = scored.filter((s) => s.c > 0.04 && s.l > 20 && s.l < 85);
  const accent = [...(usable.length > 0 ? usable : scored)].sort((a, b) => b.score - a.score)[0];
  const dominant = [...scored].sort((a, b) => b.count - a.count)[0];
  const surface = [...scored].sort((a, b) => a.c - b.c || a.l - b.l)[0];

  const swatch = (
    s: { l: number; c: number; h: number; count: number },
    role: PaletteSwatch["role"]
  ): PaletteSwatch => ({
    token: `oklch(${s.l.toFixed(1)}% ${s.c.toFixed(3)} ${s.h.toFixed(1)})`,
    role,
    weight: total > 0 ? s.count / total : 0,
  });

  const out: PaletteSwatch[] = [];
  if (dominant) out.push(swatch(dominant, "dominant"));
  if (accent) out.push(swatch(accent, "accent"));
  if (surface) out.push(swatch(surface, "surface"));
  return out;
}

export default function ImagePalette({
  sampleSize = 160,
  depth = 3,
  initialSwatches = [],
  isLoading = false,
  hasError = false,
}: ImagePaletteProps = {}) {
  const [swatches, setSwatches] = useState<PaletteSwatch[]>(initialSwatches);
  const [decoding, setDecoding] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const extract = useCallback(
    (image: HTMLImageElement) => {
      const scale = Math.min(1, sampleSize / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
      const w = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
      const h = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setFailure("This browser didn't provide a canvas context, so colours can't be read.");
        return;
      }

      ctx.drawImage(image, 0, 0, w, h);
      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, w, h).data;
      } catch {
        // A cross-origin image without CORS headers taints the canvas.
        setFailure("That image is served without CORS headers, so its pixels can't be read.");
        return;
      }

      const pixels: number[][] = [];
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i + 3] ?? 0) < 128) continue; // skip transparent pixels
        pixels.push([data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]);
      }
      if (pixels.length === 0) {
        setFailure("That image is fully transparent — there is nothing to sample.");
        return;
      }

      setFailure(null);
      setSwatches(clustersToSwatches(medianCut(pixels, depth), pixels.length));
    },
    [sampleSize, depth]
  );

  const onFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setDecoding(true);
      setFailure(null);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        extract(image);
        setDecoding(false);
      };
      image.onerror = () => {
        setFailure("That file couldn't be decoded as an image.");
        setDecoding(false);
      };
      image.src = url;
    },
    [extract]
  );

  if (hasError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-2xl border border-[oklch(63.7%_0.208_25.3)] bg-[oklch(20.1%_0.014_248)] p-6 font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(96.2%_0.005_248)]">Couldn&rsquo;t read the image</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          The upload didn&rsquo;t complete. Choose a file and try again.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(17.4%_0.012_248)] p-4">
        <div className="w-full max-w-2xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-[oklch(23.1%_0.013_248)]" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-[oklch(23.1%_0.013_248)]" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] justify-center bg-[oklch(17.4%_0.012_248)] p-4 font-[Manrope,system-ui,sans-serif]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}
      <section
        aria-label="Image palette extraction"
        className="w-full max-w-2xl space-y-6 rounded-2xl border border-[oklch(26.8%_0.014_248)] bg-[oklch(20.1%_0.014_248)] p-6 sm:p-8"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[oklch(96.2%_0.005_248)]">
            Palette from an image
          </h2>
          <p className="mt-1 text-sm text-[oklch(74.8%_0.017_248)]">
            Median cut over the downscaled pixels, reported in OKLCH. Averaging would return the
            same brown-grey for every photograph.
          </p>
        </div>

        <div>
          <label htmlFor="source" className="mb-1.5 block text-sm font-semibold text-[oklch(96.2%_0.005_248)]">
            Source image
          </label>
          <input
            id="source"
            type="file"
            accept="image/*"
            onChange={onFile}
            className="h-11 w-full cursor-pointer rounded-xl border-2 border-[oklch(31.6%_0.015_248)] bg-[oklch(17.4%_0.012_248)] px-3 text-base text-[oklch(96.2%_0.005_248)] outline-none transition-colors duration-200 ease-out file:mr-3 file:h-8 file:rounded-lg file:border-0 file:bg-[oklch(72.4%_0.181_156.3)] file:px-3 file:text-sm file:font-semibold file:text-[oklch(17.4%_0.012_248)] focus:border-[oklch(72.4%_0.181_156.3)] motion-reduce:transition-none"
          />
        </div>

        <div aria-live="polite">
          {failure !== null ? (
            <p role="alert" className="text-sm font-semibold text-[oklch(78.4%_0.13_25.3)]">
              {failure}
            </p>
          ) : decoding ? (
            <p className="text-sm text-[oklch(74.8%_0.017_248)]">Decoding the image&hellip;</p>
          ) : swatches.length === 0 ? (
            <p className="text-sm text-[oklch(74.8%_0.017_248)]">
              No palette yet — choose an image to sample one.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {swatches.map((swatch) => (
                <li
                  key={swatch.role}
                  className="overflow-hidden rounded-xl border border-[oklch(31.6%_0.015_248)]"
                >
                  <div className="h-16 w-full" style={{ backgroundColor: swatch.token }} />
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold capitalize text-[oklch(96.2%_0.005_248)]">
                      {swatch.role}
                    </p>
                    <p className="truncate text-[11px] tabular-nums text-[oklch(63.2%_0.019_248)]">
                      {swatch.token}
                    </p>
                    <p className="text-[11px] tabular-nums text-[oklch(63.2%_0.019_248)]">
                      {(swatch.weight * 100).toFixed(1)}% of sampled pixels
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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
