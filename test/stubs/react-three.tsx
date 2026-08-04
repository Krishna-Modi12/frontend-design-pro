// Runtime stubs for the R3F stack: `@react-three/fiber`, `@react-three/drei`
// and `three`. See the header of `motion-react.tsx` for why these exist.
//
// A WebGL scene cannot render in jsdom, so these do not try. `Canvas` renders
// its container props (which is where `aria-label` / `aria-hidden` live — the
// thing 3D-04 checks and the thing a test can meaningfully assert) and drops
// the scene graph. Everything inside a Canvas is `<mesh>`, `<meshStandardMaterial>`
// and friends: not DOM elements, and nothing a Testing Library query reaches.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const R3F_ONLY = new Set([
  'camera', 'gl', 'dpr', 'shadows', 'frameloop', 'orthographic', 'linear',
  'flat', 'legacy', 'eventPrefix', 'onCreated', 'onPointerMissed', 'scene', 'raycaster',
]);

/** Renders the container div with its DOM props; the 3D subtree is discarded. */
export function Canvas(props: AnyProps) {
  const domProps: AnyProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (k !== 'children' && !R3F_ONLY.has(k)) domProps[k] = v;
  }
  return React.createElement('div', { 'data-testid': 'r3f-canvas', ...domProps });
}

export const useFrame = (_cb?: unknown) => {};
export const useThree = () => ({
  camera: { position: { set: () => {} } },
  gl: { domElement: null, setSize: () => {} },
  scene: {},
  size: { width: 800, height: 600 },
  viewport: { width: 8, height: 6, factor: 100 },
  clock: { getElapsedTime: () => 0 },
});
export const useLoader = () => ({});
export const extend = (_o?: unknown) => {};
export const invalidate = () => {};
export const addEffect = () => () => {};

// ── @react-three/drei ────────────────────────────────────────────────────────
// Every drei export used by the golds resolves to a component that renders
// nothing. They live inside <Canvas>, so they have no DOM presence anyway.
const nullComponent = (_props?: AnyProps) => null;

export const OrbitControls = nullComponent;
export const Environment = nullComponent;
export const Float = nullComponent;
export const Text = nullComponent;
export const Text3D = nullComponent;
export const Html = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const useGLTF = Object.assign(() => ({ scene: {}, nodes: {}, materials: {} }), {
  preload: () => {},
});
export const useTexture = () => ({});
export const useProgress = () => ({ progress: 100, active: false, loaded: 1, total: 1 });
export const PerspectiveCamera = nullComponent;
export const ContactShadows = nullComponent;
export const MeshTransmissionMaterial = nullComponent;
export const shaderMaterial = () => nullComponent;
export const Preload = nullComponent;
export const AdaptiveDpr = nullComponent;
export const BakeShadows = nullComponent;
export const Center = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const Stage = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
