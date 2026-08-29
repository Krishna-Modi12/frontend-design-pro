"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface Hero3DProps {
  /** Number of particles rendered in the field. */
  particleCount?: number;
  /**
   * Freezes the field for deterministic capture (`visual-regression.mjs`,
   * `verify-showcase.mjs`): replaces `Math.random()` with a seeded PRNG for
   * particle positions, and skips the `useFrame` rotation update the same
   * way `reducedMotion` already does — seeding only the positions would
   * still leave the rotation angle at capture time dependent on how much
   * wall-clock time had passed since mount. Real visitors never pass this;
   * omitting it is byte-identical to this prop's behavior before it existed.
   */
  seed?: number;
}

/** Opt-in `?particleSeed=N` freezes the field without any caller having to
    thread a prop through — mirrors `home/`'s `?world=signature` override,
    read the same way: synchronously off `window.location.search`, not in an
    effect. There is nothing to hydrate against — the seed only ever affects
    an imperative WebGL buffer, never text or an attribute React renders —
    so there is no mismatch to guard against by delaying the read. */
function readSeedFromUrl(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = new URLSearchParams(window.location.search).get("particleSeed");
  if (raw === null) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** mulberry32 — a tiny, deterministic PRNG. Not cryptographic, not meant to
    be: this exists only so a fixed seed reproduces the exact same particle
    field across runs for pixel-diffing, the same role `Math.random()` plays
    for every real visitor. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `THREE.Color`'s constructor/`setStyle()` doesn't parse `oklch()` — it fails
    silently and leaves the colour at its default, which is why the particle
    field was rendering white/gray instead of the accent. A 1x1 canvas
    `fillStyle`/`getImageData` round-trip forces the browser's own CSS colour
    parser to do the conversion instead of hand-rolling OKLCH math: pixels
    have no colour space to preserve, so `getImageData` always returns
    concrete 0-255 RGBA regardless of what `fillStyle` accepted. */
function resolveCssColor(value: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return value;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Reads the live `--color-accent` token rather than duplicating its value,
    so the particle field can never drift from the accent again. */
function readAccentColor(): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color("rgb(0, 195, 11)");
  const value = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
  return new THREE.Color(resolveCssColor(value || "oklch(70% 0.25 145)"));
}

function ParticleField({ particleCount = 2200, seed }: Hero3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();
  const frozen = reducedMotion || seed !== undefined;

  const positions = useMemo(() => {
    const random = seed !== undefined ? mulberry32(seed) : Math.random;
    const array = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 4 + random() * 6;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(random() * 2 - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, [particleCount, seed]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: readAccentColor(),
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.75,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!pointsRef.current || frozen) return;
    pointsRef.current.rotation.y += delta * 0.06;
    pointsRef.current.rotation.x += delta * 0.012;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/**
 * Cinematic WebGL particle field for the hero section. Rotation is fully
 * skipped when the user prefers reduced motion — or when `seed` is set,
 * which freezes the field the same way for deterministic capture — leaving
 * a static field either way.
 */
export function Hero3D({ particleCount = 2200, seed }: Hero3DProps) {
  const resolvedSeed = seed ?? readSeedFromUrl();
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="pointer-events-none"
      aria-hidden="true"
    >
      <ambientLight intensity={0.4} />
      <ParticleField particleCount={particleCount} seed={resolvedSeed} />
    </Canvas>
  );
}
