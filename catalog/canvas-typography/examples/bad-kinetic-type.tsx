/**
 * ❌ BAD EXAMPLE: Broken Kinetic Typography
 * Study every violation. Do NOT produce output like this.
 *
 * VIOLATIONS IN THIS FILE:
 * ❌ [MOTION] No prefers-reduced-motion check — a headline that never stops moving
 * ❌ [MOTION] Infinite oscillating weight animation — reads as a broken font loader, not as design
 * ❌ [MOTION] setTimeout used as a fake loading gate — the skeleton is theatre, not state
 * ❌ [MOTION] ease-in on an entrance — the element decelerates INTO view, which is backwards
 * ❌ [MOTION] Non-passive scroll listener — blocks the compositor and makes the page feel heavy
 * ❌ [MOTION] Scroll handler does layout work directly, uncoalesced — many reads per frame
 * ❌ [MOTION] No cleanup — the scroll listener outlives the component
 * ❌ [TYPE] font-variation-settings restated without "wdth", silently resetting width to default
 * ❌ [TYPE] font-weight declared alongside font-variation-settings — the settings string wins, so it does nothing
 * ❌ [TYPE] Axis animated to 950, outside the font's real 200–800 range — the browser clamps and the motion stalls
 * ❌ [A11Y] aria-live on animating text — every intermediate frame is announced
 * ❌ [TOK] Raw hex instead of OKLCH tokens
 * ❌ [TYP] Poppins as the display face — banned
 * ❌ [RES] min-h-screen instead of min-h-[100dvh]
 * ❌ [COPY] Placeholder copy ("Lorem ipsum")
 * ❌ [TS] `any` props, no exported interface
 */

import { useEffect, useState } from "react";

export default function BadKineticType({ title = "Lorem ipsum" }: any) {
  const [weight, setWeight] = useState(200);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fake loading gate: a timer pretending to be a data dependency.
    setTimeout(() => setLoading(false), 1200);
  }, []);

  useEffect(() => {
    // Oscillates forever. No reduced-motion check, no way to stop it.
    const id = setInterval(() => {
      setWeight((w) => (w >= 950 ? 200 : w + 25));
    }, 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Non-passive, uncoalesced, and never removed.
    window.addEventListener("scroll", () => {
      const el = document.querySelector(".kinetic-heading");
      if (el) {
        const rect = el.getBoundingClientRect();
        (el as HTMLElement).style.fontWeight = String(200 + rect.top / 2);
      }
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0d0d12]" />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] font-[Poppins,sans-serif]">
      <h1
        className="kinetic-heading text-6xl text-[#f2f2f2] transition-all duration-700 ease-in"
        // aria-live on text that changes every 40ms.
        aria-live="polite"
        style={{
          // Restated without "wdth", so width silently resets to the default.
          // And font-weight below is dead: the settings string overrides it.
          fontVariationSettings: `"wght" ${weight}`,
          fontWeight: 700,
        }}
      >
        {title}
      </h1>
      <p className="text-[#8a8a8a]">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
}
