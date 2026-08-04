// Runtime stub for `three`. See ./README.md for why these exist.
// Minimal enough to construct and mutate; no rendering, no math correctness.

export class Vector2 {
  constructor(public x = 0, public y = 0) {}
  set(x: number, y: number) { this.x = x; this.y = y; return this; }
}

export class Vector3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v: Vector3) { return this.set(v.x, v.y, v.z); }
  lerp(_v: Vector3, _a: number) { return this; }
}

export class Euler extends Vector3 {}

export class Color {
  constructor(public value: unknown = '#ffffff') {}
  set(v: unknown) { this.value = v; return this; }
}

export class Object3D {
  position = new Vector3();
  rotation = new Euler();
  scale = new Vector3(1, 1, 1);
  visible = true;
  children: Object3D[] = [];
  add(...o: Object3D[]) { this.children.push(...o); return this; }
  lookAt() { return this; }
}

export class Mesh extends Object3D {}
export class Group extends Object3D {}
export class Scene extends Object3D {}
export class PerspectiveCamera extends Object3D {}

export class Clock {
  getElapsedTime() { return 0; }
  getDelta() { return 0.016; }
}

export class Raycaster {
  setFromCamera() {}
  intersectObjects(): unknown[] { return []; }
}

export class ShaderMaterial { constructor(public params: unknown = {}) {} }
export class MeshStandardMaterial { constructor(public params: unknown = {}) {} }
export class BufferGeometry { setAttribute() { return this; } dispose() {} }
export class BufferAttribute { constructor(public array: unknown, public itemSize: number) {} }
export class TextureLoader { load() { return {}; } }

export const MathUtils = {
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  clamp: (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v)),
  degToRad: (d: number) => (d * Math.PI) / 180,
};

export const DoubleSide = 2;
export const FrontSide = 0;
export const BackSide = 1;
export const SRGBColorSpace = 'srgb';
export const ACESFilmicToneMapping = 4;
