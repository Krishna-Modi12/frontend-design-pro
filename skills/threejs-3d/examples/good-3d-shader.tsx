// GOLD: custom GLSL shader material — references/threejs-advanced.md
//   • uniforms updated in useFrame by delta/elapsed, never a frame counter (3D-06)
//   • uColor fed from an OKLCH token, never a raw hex literal (3D-05)
//   • shader material built once via useMemo, not per render (3D-03)
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(pos.x * 3.0 + uTime * 1.2) * 0.12
               + sin(pos.y * 2.0 + uTime * 0.9) * 0.08;
    pos.z += wave;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    float sheen = smoothstep(-0.1, 0.2, vWave);
    vec3 tint = mix(uColor * 0.55, uColor, sheen);
    float grid = step(0.97, fract(vUv.x * 18.0)) + step(0.97, fract(vUv.y * 18.0));
    vec3 color = mix(tint, tint + 0.25, clamp(grid, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function WaveSurface({ paused }: { paused: boolean }) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null);
  // Built once — rebuilding a ShaderMaterial every render recompiles the program.
  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("oklch(62% 0.19 276)") },
    }),
    [],
  );

  useFrame((_state: unknown, delta: number) => {
    if (paused || !materialRef.current) return;
    materialRef.current.uniforms.uTime.value = (materialRef.current.uniforms.uTime.value as number) + delta;
  });

  return (
    <mesh rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry args={[4, 4, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export interface ShaderSceneProps {
  /** Skeleton state — drive from real loading; never an artificial delay. */
  isLoading?: boolean;
}

export default function ShaderScene({ isLoading = false }: ShaderSceneProps = {}) {
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
      <main role="alert" className="flex min-h-[100dvh] items-center justify-center bg-[oklch(98%_0.005_240)] p-8">
        <p className="text-sm text-[oklch(45%_0.010_240)]">{error}</p>
      </main>
    );
  }
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-8" aria-busy="true">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-4 h-[56vh] animate-pulse rounded-2xl bg-[oklch(92%_0.005_240)]" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        Displacement Study
      </h1>
      <div
        role="img"
        aria-label="Animated 3D surface: an indigo grid plane rippling under a sine displacement shader. Drag to orbit."
        className="h-[56vh] touch-none overflow-hidden rounded-2xl border border-[oklch(90%_0.005_240)]"
      >
        <Canvas camera={{ position: [0, 2.2, 3.4], fov: 55 }} dpr={[1, 2]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <WaveSurface paused={reduce} />
          <OrbitControls enableDamping enablePan={false} minDistance={2} maxDistance={7} />
        </Canvas>
      </div>
      <button
        type="button"
        onClick={() => setReduce((r) => !r)}
        aria-pressed={reduce}
        className="mt-4 h-11 min-h-[44px] rounded-lg border border-[oklch(90%_0.005_240)] bg-[oklch(99.5%_0.004_255)] px-5 text-sm font-semibold text-[oklch(45%_0.010_240)] transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(60%_0.185_276)]"
      >
        {reduce ? "Resume animation" : "Pause animation"}
      </button>
    </main>
  );
}
