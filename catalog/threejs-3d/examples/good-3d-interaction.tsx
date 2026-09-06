// GOLD: R3F interaction — references/threejs-interaction.md
//   • pointer events with stopPropagation (no hits through occluded meshes)
//   • useCursor for hover · emissive + scale for selection (never colour alone)
//   • parallel keyboard path — selection is reachable without a pointer
//   • auto-motion gated behind prefers-reduced-motion
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useCursor } from "@react-three/drei";
import * as THREE from "three";

export interface Shape { id: string; label: string; position: [number, number, number]; hue: number }
const SHAPES: Shape[] = [
  { id: "core", label: "Core module", position: [-1.9, 0, 0], hue: 276 },
  { id: "edge", label: "Edge runtime", position: [0, 0, 0], hue: 162 },
  { id: "store", label: "Data store", position: [1.9, 0, 0], hue: 25 },
];
const IDLE = new THREE.Color("oklch(0% 0 0)");

function Node({ shape, selected, onSelect }: { shape: Shape; selected: boolean; onSelect: (id: string) => void }) {
  const ref = React.useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);
  useCursor(hovered);
  const base = React.useMemo(() => new THREE.Color(`oklch(62% 0.17 ${shape.hue})`), [shape.hue]);
  const glow = React.useMemo(() => new THREE.Color(`oklch(72% 0.19 ${shape.hue})`), [shape.hue]);

  useFrame((_state: unknown, delta: number) => {
    if (!ref.current) return;
    const target = selected ? 1.25 : hovered ? 1.1 : 1;
    const s = ref.current.scale;
    s.set(s.x + (target - s.x) * Math.min(delta * 8, 1), s.y + (target - s.y) * Math.min(delta * 8, 1), s.z + (target - s.z) * Math.min(delta * 8, 1));
  });

  return (
    <mesh
      ref={ref}
      position={shape.position}
      castShadow
      onPointerOver={(e: { stopPropagation: () => void }) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onSelect(shape.id); }}
    >
      <icosahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color={base} emissive={selected ? glow : IDLE} emissiveIntensity={selected ? 0.7 : 0} roughness={0.4} />
    </mesh>
  );
}

export interface Interactive3DProps {
  /** Skeleton state — drive from real loading; never an artificial delay. */
  isLoading?: boolean;
}

export default function Interactive3D({ isLoading = false }: Interactive3DProps = {}) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const active = SHAPES.find((s) => s.id === selected) ?? null;

  if (error) {
    return (
      <main role="alert" className="flex min-h-[100dvh] items-center justify-center bg-[oklch(98%_0.005_240)] p-8">
        <p className="text-sm text-[oklch(45%_0.010_240)]">{error}</p>
      </main>
    );
  }
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-8" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-4 h-[55vh] animate-pulse rounded-2xl bg-[oklch(92%_0.005_240)]" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        System Topology
      </h1>
      <div
        role="img"
        aria-label="Interactive 3D diagram: three faceted nodes — core module, edge runtime and data store — selectable by click or by the buttons below."
        className="h-[55vh] touch-none overflow-hidden rounded-2xl border border-[oklch(90%_0.005_240)]"
      >
        <Canvas camera={{ position: [0, 1.4, 5.5], fov: 55 }} dpr={[1, 2]} shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
          {SHAPES.map((s) => (
            <Node key={s.id} shape={s} selected={selected === s.id} onSelect={setSelected} />
          ))}
          <OrbitControls enableDamping enablePan={false} minDistance={3} maxDistance={9} />
        </Canvas>
      </div>

      {/* Parallel keyboard path — the 3D selection is not the only way in. */}
      <ul aria-label="Select a node" className="mt-4 flex flex-wrap gap-2">
        {SHAPES.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={selected === s.id}
              onClick={() => setSelected(s.id)}
              className={`h-11 rounded-lg border px-4 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)] ${
                selected === s.id
                  ? "border-[oklch(60%_0.185_276)] bg-[oklch(94%_0.03_276)] text-[oklch(30%_0.12_276)]"
                  : "border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] text-[oklch(45%_0.010_240)]"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="mt-3 text-sm text-[oklch(45%_0.010_240)]">
        {active ? `${active.label} selected.` : "No node selected."}
      </p>
    </main>
  );
}
