// Runtime stub for `@react-three/drei`. See ./README.md for why these exist.
//
// Every drei export the golds use lives inside <Canvas>, whose children this stub
// chain discards, so these resolve to components that render nothing. The hooks are
// the part that matters: they run during the parent's render and their return shape
// drives real branches — a loader reads `useProgress().progress`, an interaction
// example reads `useGLTF().scene`.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const nullComponent = (_props?: AnyProps) => null;
const passthrough = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

// ── scene helpers ────────────────────────────────────────────────────────────
export const OrbitControls = nullComponent;
export const Environment = nullComponent;
export const Float = nullComponent;
export const Text = nullComponent;
export const Text3D = nullComponent;
export const PerspectiveCamera = nullComponent;
export const ContactShadows = nullComponent;
export const MeshTransmissionMaterial = nullComponent;
export const MeshDistortMaterial = nullComponent;
export const Preload = nullComponent;
export const AdaptiveDpr = nullComponent;
export const BakeShadows = nullComponent;
export const shaderMaterial = () => nullComponent;

// `Html` and `Center`/`Stage` wrap children rather than replacing them. They render
// nothing here for the same reason as the rest: their children are inside a Canvas
// this stub never mounts.
export const Html = passthrough;
export const Center = passthrough;
export const Stage = passthrough;

// ── hooks ────────────────────────────────────────────────────────────────────
export const useGLTF = Object.assign(
  () => ({ scene: { traverse: () => {} }, nodes: {}, materials: {}, animations: [] as unknown[] }),
  { preload: () => {} },
);
export const useAnimations = () => ({ actions: {} as Record<string, unknown>, names: [] as string[], mixer: {} });
export const useTexture = () => ({});
export const useCursor = (_hovered?: boolean) => {};
// A finished load, not a stalled one: the golds branch on `progress`, and a
// half-loaded scene would leave every example asserting against its spinner.
export const useProgress = () => ({ progress: 100, active: false, loaded: 1, total: 1, item: '' });
