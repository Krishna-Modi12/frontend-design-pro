// Runtime stub for `@react-three/fiber`. See ./README.md for why these exist.
//
// A WebGL scene cannot render in jsdom, so this does not try. `Canvas` renders its
// container props — which is where `aria-label` / `aria-hidden` live, the thing
// constraint 3D-04 checks and the only part a test can meaningfully assert — and
// discards the scene graph. Everything inside a Canvas is `<mesh>`,
// `<meshStandardMaterial>` and friends: not DOM elements, and nothing a Testing
// Library query reaches in a real browser either.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

// Canvas props that configure the renderer, not the container element.
const R3F_ONLY = new Set([
  'camera', 'gl', 'dpr', 'shadows', 'frameloop', 'orthographic', 'linear',
  'flat', 'legacy', 'eventPrefix', 'onCreated', 'onPointerMissed', 'scene', 'raycaster',
  'events', 'resize', 'performance',
]);

export function Canvas(props: AnyProps) {
  const domProps: AnyProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (k !== 'children' && !R3F_ONLY.has(k)) domProps[k] = v;
  }
  return React.createElement('div', { 'data-testid': 'r3f-canvas', ...domProps });
}

export const useFrame = (_cb?: unknown, _renderPriority?: number) => {};
export const useThree = (selector?: (s: unknown) => unknown) => {
  const state = {
    camera: { position: { set: () => {} }, lookAt: () => {} },
    gl: { domElement: null, setSize: () => {}, setPixelRatio: () => {} },
    scene: {},
    size: { width: 800, height: 600 },
    viewport: { width: 8, height: 6, factor: 100 },
    clock: { getElapsedTime: () => 0 },
    invalidate: () => {},
  };
  return selector ? selector(state) : state;
};
export const useLoader = () => ({});
export const extend = (_o?: unknown) => {};
export const invalidate = () => {};
export const addEffect = () => () => {};
export const createPortal = (children: React.ReactNode) => children;
