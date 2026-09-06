// EXAMPLE: Reference-quality particle-text hero
// Intent: CREATE_COMPONENT · Product: dev-tool · Dials: DV=7 MI=6 VD=3
// Illustrates canvas-typography discipline:
//   • The headline is real DOM text; the canvas is aria-hidden decoration (canvas-2d-typography.md)
//   • getContext("2d") is null-guarded — SSR, jsdom and lost GPU contexts all return null
//   • Particles are sampled from an offscreen canvas, pooled once, never allocated per frame
//   • requestAnimationFrame with a clamped delta; cancelled in the effect cleanup
//   • prefers-reduced-motion paints the assembled final state and never starts the loop
// Key principles on display:
//   • All 4 states: empty (no headline), loading (metrics pending), error (sampling unsupported), success
//   • 44px+ touch targets, visible focus rings
//   • Exported prop interfaces used as types; no `any`
//   • OKLCH tokens only; organic metric values

import { useCallback, useEffect, useRef, useState } from "react";

export interface ParticleHeroProps {
  /** The headline. Rendered as real text, then sampled to drive the particles. */
  headline?: string;
  supporting?: string;
  /** Skeleton state — drive from real data fetching; never an artificial delay. */
  isLoading?: boolean;
  /** Surface a failure instead of a silently blank canvas. */
  hasError?: boolean;
  metrics?: HeroMetric[];
  /** Upper bound on live particles. Density is derived from this, not hard-coded. */
  maxParticles?: number;
}

export interface HeroMetric {
  label: string;
  value: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
}

const DEFAULT_METRICS: HeroMetric[] = [
  { label: "Steps replayed", value: "48.2M" },
  { label: "Median resume", value: "310ms" },
  { label: "Lost workflows", value: "0" },
];

const ACCENT = "oklch(72.4% 0.181 156.3)";
const STIFFNESS = 0.0009;
const DAMPING = 0.88;
const REPEL_RADIUS = 90;
const REPEL_FORCE = 0.42;
const PARTICLE_SIZE = 2;

/**
 * Draws the headline to a detached canvas and returns every sufficiently opaque
 * pixel as a target. `willReadFrequently` keeps the surface in system memory —
 * without it each getImageData forces a GPU readback.
 */
function sampleHeadline(
  text: string,
  width: number,
  height: number,
  budget: number
): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(width));
  off.height = Math.max(1, Math.round(height));
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return [];

  const size = Math.min(width / Math.max(text.length, 1) * 1.6, height * 0.42);
  octx.font = `800 ${Math.round(size)}px Manrope, system-ui, sans-serif`;
  octx.textAlign = "center";
  octx.textBaseline = "middle";
  octx.fillStyle = "oklch(100% 0 0)";
  octx.fillText(text, off.width / 2, off.height / 2);

  const { data } = octx.getImageData(0, 0, off.width, off.height);
  // Step is derived from the sampled area and the budget, so a phone renders
  // legible type rather than the smear a fixed count would produce.
  let step = Math.max(2, Math.round(Math.sqrt((off.width * off.height) / (budget * 5))));
  const targets: Array<{ x: number; y: number }> = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    targets.length = 0;
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        if ((data[(y * off.width + x) * 4 + 3] ?? 0) > 128) targets.push({ x, y });
      }
    }
    if (targets.length <= budget) break;
    step += 1;
  }
  return targets;
}

export default function ParticleHero({
  headline = "Resume, don't restart",
  supporting =
    "Every step of a workflow is checkpointed to an append-only log, so a worker that dies mid-charge picks up on the next line.",
  isLoading = false,
  hasError = false,
  metrics = DEFAULT_METRICS,
  maxParticles = 3200,
}: ParticleHeroProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canvasReady, setCanvasReady] = useState(true);

  // Subscribed rather than read once: the preference can flip while the page is open.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handlePointer = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const clearPointer = useCallback(() => {
    pointerRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading || hasError || headline.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // jsdom, SSR hydration mismatch, or a lost GPU process. The DOM headline
      // below is the real copy, so this degrades to plain type rather than failing.
      setCanvasReady(false);
      return;
    }
    setCanvasReady(true);

    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(rect.width, 1);
    const cssHeight = Math.max(rect.height, 1);
    const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const targets = sampleHeadline(headline, cssWidth, cssHeight, maxParticles);
    if (targets.length === 0) return;

    // Allocated once at full size and reused. Per-frame allocation is what makes
    // particle text stutter rhythmically after a few seconds.
    const pool: Particle[] = targets.map((t) => ({
      x: cssWidth / 2,
      y: cssHeight / 2,
      vx: 0,
      vy: 0,
      tx: t.x,
      ty: t.y,
    }));

    ctx.fillStyle = ACCENT;

    if (reducedMotion) {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      for (const t of targets) ctx.fillRect(t.x, t.y, PARTICLE_SIZE, PARTICLE_SIZE);
      return;
    }

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      // Clamped: a tab returning from the background reports a delta of minutes,
      // and anything integrating over it teleports.
      const delta = Math.min(now - last, 32);
      last = now;
      const dt = delta / 16.67;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      const pointer = pointerRef.current;

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p) continue;

        p.vx += (p.tx - p.x) * STIFFNESS * delta;
        p.vy += (p.ty - p.y) * STIFFNESS * delta;

        if (pointer) {
          const mx = p.x - pointer.x;
          const my = p.y - pointer.y;
          const d2 = mx * mx + my * my;
          // Squared comparison first — the sqrt only runs for particles in range.
          if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / REPEL_RADIUS) * REPEL_FORCE;
            p.vx += (mx / d) * force * dt;
            p.vy += (my / d) * force * dt;
          }
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        ctx.fillRect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [headline, isLoading, hasError, reducedMotion, maxParticles]);

  if (hasError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-2xl border border-[oklch(63.7%_0.208_25.3)] bg-[oklch(20.1%_0.014_248)] p-6 font-[Manrope,system-ui,sans-serif]"
      >
        <h2 className="text-lg font-bold text-[oklch(96.2%_0.005_248)]">Couldn&rsquo;t render the hero</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          The headline text didn&rsquo;t arrive, so there is nothing to set. Retry in a moment.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(17.4%_0.012_248)] p-4">
        <div className="w-full max-w-3xl space-y-6">
          <div className="h-16 w-4/5 animate-pulse rounded-2xl bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-5 w-3/5 animate-pulse rounded-lg bg-[oklch(26.8%_0.014_248)]" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-[oklch(23.1%_0.013_248)]" />
        </div>
      </main>
    );
  }

  if (headline.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[oklch(31.6%_0.015_248)] bg-[oklch(20.1%_0.014_248)] p-8 text-center font-[Manrope,system-ui,sans-serif]">
        <h2 className="text-xl font-bold text-[oklch(96.2%_0.005_248)]">No headline set</h2>
        <p className="mt-2 text-sm text-[oklch(74.8%_0.017_248)]">
          Pass a headline to see it assemble from particles.
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[oklch(17.4%_0.012_248)] px-4 py-16 font-[Manrope,system-ui,sans-serif]">
      {/* @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap') */}
      <section aria-label="Product introduction" className="w-full max-w-3xl">
        <div className="relative">
          {/*
            The canvas is decoration and is hidden from assistive technology.
            The h1 below is the real, selectable, translatable, indexable copy —
            when the context is unavailable it is also the entire visual.
          */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            onPointerMove={handlePointer}
            onPointerLeave={clearPointer}
            className="h-40 w-full rounded-2xl sm:h-56"
          />
          <h1
            className={
              canvasReady
                ? "sr-only"
                : "text-balance text-center text-4xl font-extrabold tracking-tight text-[oklch(96.2%_0.005_248)] sm:text-6xl"
            }
          >
            {headline}
          </h1>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-balance text-center text-base text-[oklch(74.8%_0.017_248)]">
          {supporting}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#quickstart"
            className="inline-flex h-11 items-center rounded-xl bg-[oklch(72.4%_0.181_156.3)] px-5 text-sm font-semibold text-[oklch(17.4%_0.012_248)] outline-none transition-colors duration-200 ease-out hover:bg-[oklch(78.1%_0.166_156.3)] focus-visible:ring-2 focus-visible:ring-[oklch(72.4%_0.181_156.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(17.4%_0.012_248)] motion-reduce:transition-none"
          >
            Start a workflow
          </a>
          <a
            href="#docs"
            className="inline-flex h-11 items-center rounded-xl border border-[oklch(31.6%_0.015_248)] px-5 text-sm font-semibold text-[oklch(96.2%_0.005_248)] outline-none transition-colors duration-200 ease-out hover:border-[oklch(43.9%_0.018_248)] focus-visible:ring-2 focus-visible:ring-[oklch(72.4%_0.181_156.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(17.4%_0.012_248)] motion-reduce:transition-none"
          >
            Read the docs
          </a>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-[oklch(26.8%_0.014_248)] bg-[oklch(20.1%_0.014_248)] p-4 text-center"
            >
              <dt className="text-xs uppercase tracking-wide text-[oklch(63.2%_0.019_248)]">{metric.label}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-[oklch(96.2%_0.005_248)]">{metric.value}</dd>
            </div>
          ))}
        </dl>
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
