// React Three Fiber JSX intrinsics (r3f typings live in the stubbed module;
// enumerate the elements the gold examples use so JSX stays strict elsewhere).
import "react";
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      mesh: Record<string, unknown>;
      boxGeometry: Record<string, unknown>;
      planeGeometry: Record<string, unknown>;
      cylinderGeometry: Record<string, unknown>;
      torusGeometry: Record<string, unknown>;
      coneGeometry: Record<string, unknown>;
      ringGeometry: Record<string, unknown>;
      shaderMaterial: Record<string, unknown>;
      meshBasicMaterial: Record<string, unknown>;
      meshPhysicalMaterial: Record<string, unknown>;
      meshNormalMaterial: Record<string, unknown>;
      instancedMesh: Record<string, unknown>;
      primitive: Record<string, unknown>;
      pointLight: Record<string, unknown>;
      spotLight: Record<string, unknown>;
      hemisphereLight: Record<string, unknown>;
      lineBasicMaterial: Record<string, unknown>;

      points: Record<string, unknown>;
      bufferGeometry: Record<string, unknown>;
      bufferAttribute: Record<string, unknown>;
      pointsMaterial: Record<string, unknown>;
      ambientLight: Record<string, unknown>;
      directionalLight: Record<string, unknown>;
      sphereGeometry: Record<string, unknown>;
      torusKnotGeometry: Record<string, unknown>;
      meshStandardMaterial: Record<string, unknown>;
      icosahedronGeometry: Record<string, unknown>;
      group: Record<string, unknown>;
      color: Record<string, unknown>;
      fog: Record<string, unknown>;
    }
  }
}
