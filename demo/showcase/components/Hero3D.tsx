"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface Hero3DProps {
  /** Number of particles rendered in the field. */
  particleCount?: number;
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

function ParticleField({ particleCount = 2200 }: Required<Hero3DProps>) {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useReducedMotion();

  const positions = useMemo(() => {
    const array = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, [particleCount]);

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
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y += delta * 0.06;
    pointsRef.current.rotation.x += delta * 0.012;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/**
 * Cinematic WebGL particle field for the hero section. Rotation is fully
 * skipped when the user prefers reduced motion, rendering a static field.
 */
export function Hero3D({ particleCount = 2200 }: Hero3DProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="pointer-events-none"
      aria-hidden="true"
    >
      <ambientLight intensity={0.4} />
      <ParticleField particleCount={particleCount} />
    </Canvas>
  );
}
