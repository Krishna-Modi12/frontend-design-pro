// GOLD: complete R3F scene — references/threejs-fundamentals.md
//   • dpr={[1,2]} capped pixel ratio · ACES tone mapping · shadows
//   • OKLCH colours via THREE.Color, never raw hex
//   • labelled container (canvas is opaque to screen readers)
//   • delta-driven useFrame, gated behind prefers-reduced-motion
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const BRAND = new THREE.Color("oklch(60% 0.185 276)");
const SURFACE = new THREE.Color("oklch(98% 0.005 240)");

function SpinningCube({ paused }: { paused: boolean }) {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame((_state: unknown, delta: number) => {
    if (paused || !ref.current) return;
    ref.current.rotation.y += delta * 0.35;
    ref.current.rotation.x += delta * 0.12;
  });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color={BRAND} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

export interface Scene3DProps {
  /** Skeleton state — drive from real asset loading; never an artificial delay. */
  isLoading?: boolean;
  className?: string;
}

export default function Scene3D({ isLoading = false, className = "" }: Scene3DProps = {}) {
  const [reduce, setReduce] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (error) {
    return (
      <main role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[oklch(98%_0.005_240)] p-8">
        <p className="text-sm text-[oklch(45%_0.010_240)]">{error}</p>
        <button type="button" onClick={() => setError(null)}
          className="h-11 rounded-lg bg-[oklch(60%_0.185_276)] px-5 text-sm font-semibold text-[oklch(98%_0.005_240)] transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2">
          Reload scene
        </button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-8" aria-busy="true">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-4 h-[60vh] animate-pulse rounded-2xl bg-[oklch(92%_0.005_240)]" />
      </main>
    );
  }

  return (
    <main className={`min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif] ${className}`}>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        Material Study
      </h1>
      <div
        role="img"
        aria-label="Interactive 3D scene: a slowly rotating indigo cube lit from the upper right, on a neutral studio backdrop. Drag to orbit the camera."
        tabIndex={0}
        className="h-[60vh] touch-none overflow-hidden rounded-2xl border border-[oklch(90%_0.005_240)] bg-[oklch(96%_0.005_240)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)]"
      >
        <Canvas
          camera={{ position: [0, 1.2, 4.5], fov: 60 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          dpr={[1, 2]}
          shadows
          onCreated={({ scene }: { scene: { background: THREE.Color | null } }) => { scene.background = SURFACE; }}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
          <SpinningCube paused={reduce} />
          <ContactShadows position={[0, -1.1, 0]} opacity={0.35} blur={2.4} far={4} />
          <Environment preset="city" />
          <OrbitControls enableDamping enablePan={false} minDistance={2.5} maxDistance={8} autoRotate={!reduce} autoRotateSpeed={0.6} />
        </Canvas>
      </div>
      <p className="mt-3 text-sm text-[oklch(45%_0.010_240)]">
        Drag to orbit · scroll to zoom. Motion pauses automatically when reduced motion is preferred.
      </p>
    </main>
  );
}
