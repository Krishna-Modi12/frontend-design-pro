"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface Hero3DProps {
  /** Number of particles rendered in the field. */
  particleCount?: number;
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
        color: new THREE.Color("oklch(70% 0.25 145)"),
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
    >
      <ambientLight intensity={0.4} />
      <ParticleField particleCount={particleCount} />
    </Canvas>
  );
}
