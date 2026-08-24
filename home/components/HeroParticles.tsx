"use client";

import { useEffect, useRef } from "react";
import type { ReactElement, RefObject } from "react";
import useReducedMotion from "../lib/useReducedMotion";

export interface HeroParticlesProps {
  /** The real headline element this canvas decorates — read for its exact
      rendered font, size and position so the sample lines up with it. */
  sourceRef: RefObject<HTMLElement | null>;
  className?: string;
}

interface Particle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isAccent: boolean;
}

const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 2200;
const SPRING_K = 0.02;
const DAMPING = 0.86;
const DISPERSE_STRENGTH = 260;
/** Ceiling on how visible the field gets at rest — a *subtle* texture behind
    the real headline, per the brief, not a second copy of it. */
const MAX_ALPHA = 0.55;

/**
 * Canvas particle typography behind the hero headline.
 *
 * `skills/canvas-typography/SKILL.md` — the pack's own rules for exactly this
 * effect — governs every decision here:
 *
 *   Rule 1: the canvas is decoration; it samples `sourceRef`'s OWN rendered
 *   text rather than carrying a second copy of the string, and is never the
 *   only copy — the DOM `<h1>` in `Hero.tsx` is that, and this canvas reads
 *   its computed font/size/position rather than guessing them. A first draft
 *   of this component recomputed its own font size and wrap width instead of
 *   reading the real element, and the two disagreed enough to render as a
 *   visibly misaligned duplicate headline rather than a texture behind the
 *   real one — found by looking at a screenshot, since no gate renders
 *   anything. Sampling the live element is what fixes it structurally rather
 *   than by tuning numbers until they happen to match.
 *   Rule 2: every `getContext("2d")` call is null-checked; a failure bails to
 *   rendering nothing, leaving the DOM headline as the only visual.
 *   Rule 3/4: `requestAnimationFrame`, driven by elapsed time (`dt`) rather
 *   than frame count, so a throttled tab and a 144Hz monitor move at the same
 *   speed.
 *   Rule 5: reduced motion means this component renders nothing at all rather
 *   than a frozen mid-state — the DOM headline is already the resting state
 *   there is to freeze to.
 *   Rule 6: the backing store is sized at `cssSize * dpr`, then the context is
 *   scaled back, so the sample stays sharp on a retina display.
 *   Rule 7: sampling waits on `document.fonts.ready` — measuring text before
 *   the real face has loaded samples the fallback font's shape instead.
 *
 * Particle count deliberately does NOT copy the "5,000, always" spec some
 * briefs for this effect reach for — that exact shape (a fixed count
 * regardless of viewport) is listed as this skill's own anti-pattern example,
 * because a phone then renders a smear. Count instead falls out of the
 * sampled on-alpha area of the actual headline, capped by a ceiling derived
 * from viewport area and `navigator.deviceMemory` where the browser exposes
 * it (Safari does not; a mid-tier default stands in there).
 */
export function HeroParticles({ sourceRef, className }: HeroParticlesProps): ReactElement | null {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);
  const disperseRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (host === null || canvas === null || source === null) return;

    const ctx = canvas.getContext("2d");
    if (ctx === null) return; // No 2D context available — draw nothing, DOM headline stands alone.

    let cancelled = false;

    async function build(): Promise<void> {
      await document.fonts.ready.catch(() => {}); // A font-load failure still leaves system-ui measurable.
      if (cancelled || host === null || canvas === null || ctx === null || source === null) return;

      const hostRect = host.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(hostRect.width));
      const cssH = Math.max(1, Math.round(hostRect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      // The real headline's own box and computed font — sampling anything
      // else is what produced the misaligned duplicate this comment block
      // above describes.
      const sourceRect = source.getBoundingClientRect();
      const style = getComputedStyle(source);
      const offsetX = sourceRect.left - hostRect.left;
      const offsetY = sourceRect.top - hostRect.top;
      const boxW = sourceRect.width;
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.1;

      const sample = document.createElement("canvas");
      sample.width = cssW * dpr;
      sample.height = cssH * dpr;
      const sctx = sample.getContext("2d");
      if (sctx === null) return;

      sctx.scale(dpr, dpr);
      sctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      sctx.textBaseline = "alphabetic";
      sctx.textAlign = "left";
      sctx.fillStyle = "#000";

      const text = (source.textContent ?? "").trim();
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (sctx.measureText(next).width > boxW && line) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);

      const ascent = parseFloat(style.fontSize) * 0.78; // Cap-height-ish baseline offset for a sans face.
      lines.forEach((l, i) => {
        const w = sctx.measureText(l).width;
        const x = offsetX + (boxW - w) / 2;
        const y = offsetY + i * lineHeight + ascent;
        sctx.fillText(l, x, y);
      });

      const imageData = sctx.getImageData(0, 0, sample.width, sample.height);
      const { data, width: iw, height: ih } = imageData;

      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
      const viewportArea = window.innerWidth * window.innerHeight;
      const ceiling = Math.round(
        Math.min(Math.max((viewportArea / 3200) * (memory / 4), 300), 2200),
      );

      let onAlpha = 0;
      for (let i = 3; i < data.length; i += 4) {
        if ((data[i] ?? 0) > 80) onAlpha++;
      }
      const stride = Math.max(2, Math.round(Math.sqrt(onAlpha / Math.max(ceiling, 1))));

      const particles: Particle[] = [];
      for (let y = 0; y < ih; y += stride) {
        for (let x = 0; x < iw; x += stride) {
          const alpha = data[(y * iw + x) * 4 + 3] ?? 0;
          if (alpha <= 80) continue;
          const px = x / dpr;
          const py = y / dpr;
          particles.push({
            homeX: px,
            homeY: py,
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            isAccent: Math.random() < 0.1,
          });
          if (particles.length >= ceiling) break;
        }
        if (particles.length >= ceiling) break;
      }
      particlesRef.current = particles;

      ctx.scale(dpr, dpr);
      startLoop();
    }

    function startLoop(): void {
      if (ctx === null || canvas === null) return;
      let last = performance.now();

      const primary = getComputedStyle(document.documentElement).getPropertyValue("--color-text-primary").trim() || "#161107";
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#c14100";

      const tick = (now: number): void => {
        if (cancelled || ctx === null || canvas === null) return;
        const dt = Math.min(32, now - last) / 16.67; // normalized to a ~60fps step
        last = now;

        const dprNow = Math.min(window.devicePixelRatio || 1, 2);
        const cssW = canvas.width / dprNow;
        const cssH = canvas.height / dprNow;
        ctx.clearRect(0, 0, cssW, cssH);

        const disperse = disperseRef.current;
        const pointer = pointerRef.current;

        for (const p of particlesRef.current) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < REPEL_RADIUS * REPEL_RADIUS) {
            const dist = Math.sqrt(dist2) || 1;
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force * 0.0016 * dt;
            p.vy += (dy / dist) * force * 0.0016 * dt;
          }

          const targetY = p.homeY - disperse * DISPERSE_STRENGTH;
          p.vx += (p.homeX - p.x) * SPRING_K * dt;
          p.vy += (targetY - p.y) * SPRING_K * dt;
          p.vx *= Math.pow(DAMPING, dt);
          p.vy *= Math.pow(DAMPING, dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        const alpha = Math.max(0, MAX_ALPHA * (1 - disperse * 1.4));
        if (alpha > 0.002) {
          ctx.globalAlpha = alpha;
          for (const p of particlesRef.current) {
            ctx.fillStyle = p.isAccent ? accent : primary;
            ctx.fillRect(p.x, p.y, 1.3, 1.3);
          }
          ctx.globalAlpha = 1;
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    void build();

    const onPointerMove = (e: PointerEvent): void => {
      const rect = host.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onPointerLeave = (): void => {
      pointerRef.current = { x: -9999, y: -9999 };
    };
    const onScroll = (): void => {
      const rect = host.getBoundingClientRect();
      const past = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      disperseRef.current = past;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      void build();
    });
    resizeObserver.observe(host);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [sourceRef, reduced]);

  if (reduced) return null;

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} data-particle-canvas />
    </div>
  );
}

export default HeroParticles;
