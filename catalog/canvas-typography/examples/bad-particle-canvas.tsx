/**
 * ❌ BAD EXAMPLE: Broken Particle Typography
 * Study every violation. Do NOT produce output like this.
 *
 * VIOLATIONS IN THIS FILE:
 * ❌ [CANVAS] getContext("2d") non-null asserted — returns null under SSR, jsdom and a lost GPU process
 * ❌ [CANVAS] No DPR scaling — the type renders soft on every retina display
 * ❌ [CANVAS] Canvas carries the ONLY copy of the headline — invisible to screen readers, search, translation
 * ❌ [CANVAS] No aria-hidden on decorative canvas, and no text alternative anywhere
 * ❌ [MOTION] setInterval drives the render loop — drifts against the display, keeps firing in a hidden tab
 * ❌ [MOTION] No cleanup returned from useEffect — the loop keeps drawing to a detached canvas forever
 * ❌ [MOTION] No prefers-reduced-motion check at all — vestibular users get the full assembly
 * ❌ [MOTION] Frame-counted physics instead of elapsed time — runs 2.4× faster on a 144Hz display
 * ❌ [PERF] Particle objects allocated inside the loop — thousands of short-lived objects per second
 * ❌ [PERF] Particle count hard-coded at 5000 regardless of viewport — a phone renders a smear
 * ❌ [PERF] fillStyle reassigned per particle — a state change per draw, the expensive part
 * ❌ [PERF] Offscreen sampling re-run every frame instead of once per text change
 * ❌ [TOK] Raw hex colours instead of OKLCH tokens
 * ❌ [RES] min-h-screen instead of min-h-[100dvh] — breaks on mobile with a dynamic toolbar
 * ❌ [TYP] Inter as the display face — banned; reads as an untouched default
 * ❌ [COPY] Placeholder copy left in ("Lorem ipsum", "Your headline here")
 * ❌ [TS] `any` on the particle array, and no exported prop interface
 */

import { useEffect, useRef } from "react";

export default function BadParticleCanvas({ headline = "Your headline here" }: any) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Non-null assertion on something that genuinely returns null.
    const ctx = canvas.getContext("2d")!;

    // No DPR handling — backing store stays at CSS size and the text is blurry.
    canvas.width = 800;
    canvas.height = 300;

    // setInterval, not requestAnimationFrame. No cleanup either.
    setInterval(() => {
      // Re-sampling the text on every tick: the single most expensive operation
      // in the system, run 33 times a second for no reason.
      const off = document.createElement("canvas");
      off.width = 800;
      off.height = 300;
      const octx = off.getContext("2d")!;
      octx.font = "800 72px Inter, sans-serif";
      octx.fillStyle = "#ffffff";
      octx.fillText(headline, 100, 150);
      const data = octx.getImageData(0, 0, 800, 300).data;

      ctx.clearRect(0, 0, 800, 300);

      // Fixed 5000 particles regardless of device, allocated fresh every tick.
      const particles: any[] = [];
      for (let i = 0; i < 5000; i++) {
        particles.push({ x: Math.random() * 800, y: Math.random() * 300 });
      }

      for (const p of particles) {
        // Frame-counted movement — speed depends entirely on refresh rate.
        p.x += 1;
        p.y += 1;
        // fillStyle set per particle: a full state change for every draw.
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(p.x, p.y, 2, 2);
      }

      void data;
    }, 30);
  }, [headline]);

  return (
    <div className="min-h-screen bg-[#0d0d12] font-[Inter,sans-serif]">
      {/* The canvas is the only copy of the headline. Nothing here is readable
          by anything that is not a pair of eyes pointed at the screen. */}
      <canvas ref={ref} className="w-full" />
      <p className="text-[#888]">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
}
