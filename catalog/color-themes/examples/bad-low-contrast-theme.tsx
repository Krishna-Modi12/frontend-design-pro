/**
 * ❌ BAD EXAMPLE: Broken Palette Extraction and Contrast
 * Study every violation. Do NOT produce output like this.
 *
 * VIOLATIONS IN THIS FILE:
 * ❌ [COLOR] Palette derived by AVERAGING every pixel — always returns the same muddy brown-grey
 * ❌ [COLOR] Full-resolution sampling with no downscale — megapixels of work for an identical answer
 * ❌ [CANVAS] getContext("2d") non-null asserted, and getImageData is never guarded against tainting
 * ❌ [CANVAS] crossOrigin never set, so any remote image throws SecurityError in production
 * ❌ [A11Y] Text and surface differ by ~1.4:1 — far below the 4.5:1 minimum, and never measured
 * ❌ [A11Y] Placeholder text at #cfcfcf on #e8e8e8 — effectively invisible
 * ❌ [A11Y] No prefers-contrast handling, no forced-colors consideration
 * ❌ [MOTION] setTimeout used as a fake loading gate rather than real extraction state
 * ❌ [PERF] Extraction runs on every render, not in response to a new image
 * ❌ [TOK] Raw hex output instead of OKLCH
 * ❌ [RES] min-h-screen and no responsive breakpoints
 * ❌ [TYP] Inter as the display face — banned
 * ❌ [COPY] Placeholder copy ("Lorem ipsum")
 * ❌ [TS] `any` throughout, no exported interface
 */

import { useEffect, useState } from "react";

// Averaging. A sunset and a forest both come back as the same brown-grey, because
// colours from opposite sides of the wheel cancel.
function averageColour(data: any): string {
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const n = data.length / 4;
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export default function BadLowContrastTheme({ src = "/photo.jpg" }: any) {
  const [colour, setColour] = useState("#e8e8e8");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fake loading gate — a timer pretending to be extraction state.
    setTimeout(() => setLoading(false), 900);
  }, []);

  // No dependency array: this re-runs on every single render.
  useEffect(() => {
    const img = new Image();
    // crossOrigin never set — getImageData will throw SecurityError on any remote image.
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Full resolution: 12 megapixels of work for an answer that would be
      // identical at 160px on the long edge.
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      setColour(averageColour(data));
    };
    img.src = src;
  });

  if (loading) return <div className="min-h-screen bg-[#e8e8e8]" />;

  return (
    <div className="min-h-screen font-[Inter,sans-serif]" style={{ background: colour }}>
      {/* #cfcfcf on #e8e8e8 is roughly 1.4:1. Nothing here measured it. */}
      <h1 style={{ color: "#cfcfcf", fontSize: 32 }}>Lorem ipsum</h1>
      <p style={{ color: "#d4d4d4" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.
      </p>
      <button style={{ background: "#e0e0e0", color: "#d8d8d8", height: 26 }}>Continue</button>
    </div>
  );
}
