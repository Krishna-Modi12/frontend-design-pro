/* ANTI-EXAMPLE — study the violations, never imitate.
 * Compare against good-3d-scene.tsx, which does all of this correctly.
 * Violations: 3D-01 (no dpr) · 3D-02 (raw requestAnimationFrame) · 3D-03 (geometry rebuilt
 * every render) · 3D-04 (no aria-label on the canvas container) · 3D-05 (raw hex THREE.Color)
 * · 3D-07 (setTimeout fake loading instead of Suspense) · PERF-04 (transition: all)
 * · rerender-no-inline-components (component defined inside a component). */
import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function BadScene() {
  const [loading, setLoading] = React.useState(true);

  // ✗ 3D-07 — fake loading; Suspense already knows when the asset is ready
  React.useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // ✗ 3D-02 — raw rAF inside an R3F component; useFrame exists for exactly this
  React.useEffect(() => {
    let id = 0;
    const tick = () => { id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  // ✗ rerender-no-inline-components — remounts its whole subtree every render
  function Inner() {
    // ✗ 3D-03 — a new geometry and material allocated on every single render
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xff0000) }); // ✗ 3D-05
    return <mesh geometry={geo} material={mat} />;
  }

  useGLTF("/models/thing.glb");

  return (
    // ✗ 3D-04 — no aria-label: the canvas is invisible to assistive technology
    <div className="min-h-[100dvh] transition-all">  {/* ✗ PERF-04 */}
      {loading ? <p>Loading...</p> : null}
      <Canvas>                                        {/* ✗ 3D-01 — no dpr cap */}
        <ambientLight intensity={0.5} />
        <Inner />
      </Canvas>
    </div>
  );
}
