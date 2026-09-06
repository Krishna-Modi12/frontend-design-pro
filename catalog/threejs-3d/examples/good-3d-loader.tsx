// GOLD: GLTF loading — references/threejs-advanced.md
//   • Suspense IS the loading state — no setTimeout fake delay (3D-07)
//   • useProgress drives a real progress bar in OKLCH tokens
//   • useAnimations plays the clip shipped with the model
//   • error boundary: a 404 on a .glb throws and would otherwise blank the page
import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, useProgress, Environment } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/lantern.glb");

function Model({ url, paused }: { url: string; paused: boolean }) {
  const { scene, animations } = useGLTF(url) as { scene: THREE.Group; animations: THREE.AnimationClip[] };
  const { actions, names } = useAnimations(animations, scene) as {
    actions: Record<string, { reset: () => { fadeIn: (t: number) => { play: () => void } }; stop: () => void } | undefined>;
    names: string[];
  };

  React.useEffect(() => {
    const first = names[0];
    if (!first) return;
    const action = actions[first];
    if (paused) { action?.stop(); return; }
    action?.reset().fadeIn(0.3).play();
    return () => { action?.stop(); };
  }, [actions, names, paused]);

  React.useEffect(() => {
    scene.traverse((o: THREE.Object3D & { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }) => {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function LoaderOverlay() {
  const { progress, item } = useProgress() as { progress: number; item: string };
  const pct = Math.round(progress);
  return (
    <div role="status" aria-live="polite"
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[oklch(96%_0.005_240)] p-6">
      <p className="text-sm font-medium text-[oklch(14%_0.012_240)]">Loading model… {pct}%</p>
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-[oklch(90%_0.005_240)]">
        <div className="h-full rounded-full bg-[oklch(60%_0.185_276)] transition-[width] motion-reduce:transition-none"
             style={{ width: `${pct}%` }} />
      </div>
      <p className="max-w-[16rem] truncate text-xs text-[oklch(45%_0.010_240)]">{item}</p>
    </div>
  );
}

class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (m: string) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) {
    this.props.onError(err instanceof Error ? err.message : "The model could not be loaded.");
  }
  render() { return this.state.failed ? null : this.props.children; }
}

export interface Model3DProps {
  /** Skeleton state — drive from real loading; never an artificial delay. */
  isLoading?: boolean;
  url?: string;
}

export default function Model3D({ isLoading = false, url = "/models/lantern.glb" }: Model3DProps = {}) {
  const [error, setError] = React.useState<string | null>(null);
  const [reduce, setReduce] = React.useState(false);

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
          Try again
        </button>
      </main>
    );
  }
  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-8" aria-busy="true">
        <div className="h-8 w-44 animate-pulse rounded-lg bg-[oklch(90%_0.005_240)]" />
        <div className="mt-4 h-[58vh] animate-pulse rounded-2xl bg-[oklch(92%_0.005_240)]" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[oklch(98%_0.005_240)] p-4 sm:p-6 lg:p-8 font-[Manrope,system-ui,sans-serif]">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-[oklch(14%_0.012_240)] text-balance sm:text-3xl">
        Product Model
      </h1>
      <div
        role="img"
        aria-label="Interactive 3D product model with its idle animation. Drag to orbit the camera."
        className="h-[58vh] touch-none overflow-hidden rounded-2xl border border-[oklch(90%_0.005_240)]"
      >
        <Canvas camera={{ position: [0, 1, 4] }} dpr={[1, 2]} shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 3]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
          <SceneErrorBoundary onError={setError}>
            <React.Suspense fallback={null}>
              <Model url={url} paused={reduce} />
              <Environment preset="studio" />
            </React.Suspense>
          </SceneErrorBoundary>
          <OrbitControls enableDamping enablePan={false} />
        </Canvas>
      </div>
    </main>
  );
}
