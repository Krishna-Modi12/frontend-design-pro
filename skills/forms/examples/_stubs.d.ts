/**
 * Ambient module stubs for the gold-example compile check (typecheck_golds.py).
 * Examples are single-file demos importing libraries not installed in this repo;
 * shorthand declarations type those imports as `any` so `tsc --noEmit --strict`
 * verifies OUR code, not vendor typings. Never ship this file in an app —
 * install the real packages and their types instead.
 */
declare module "@/components/ui/*";
declare module "@/lib/utils";
declare module "@gsap/react";
declare module "@hookform/resolvers/zod";
declare module "@react-three/drei";
declare module "@react-three/fiber";
declare module "@splinetool/react-spline";
declare module "storybook/test";
declare module "@tanstack/react-query";
declare module "@tanstack/react-table";
declare module "@tanstack/react-virtual";
declare module "motion/react";
declare module "gsap";
declare module "gsap/ScrollTrigger";
declare module "gsap/SplitText";
declare module "lucide-react";
declare module "next-themes";
declare module "next/navigation";
declare module "next/link";
declare module "next/image";
declare module "react-hook-form";
declare module "react-native";
declare module "react-native-gesture-handler";
declare module "react-native-reanimated";
declare module "recharts";
declare module "three" {
  export type Vec3 = { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
  export class Color { r: number; g: number; b: number; constructor(c?: string | number); set(c: string | number): this; setHSL(h: number, s: number, l: number): this; lerp(c: Color, a: number): this }
  export class Object3D { rotation: Vec3; position: Vec3; scale: Vec3; visible: boolean; traverse(cb: (o: Object3D & Record<string, unknown>) => void): void }
  export class Mesh extends Object3D { material: Record<string, unknown>; geometry: Record<string, unknown> }
  export class Group extends Object3D {}
  export class Points extends Object3D {}
  export class BufferGeometry { dispose(): void }
  export class BoxGeometry extends BufferGeometry { constructor(w?: number, h?: number, d?: number) }
  export class SphereGeometry extends BufferGeometry { constructor(r?: number, ws?: number, hs?: number) }
  export class PlaneGeometry extends BufferGeometry { constructor(w?: number, h?: number) }
  export class Material { dispose(): void }
  export class MeshStandardMaterial extends Material { constructor(p?: Record<string, unknown>) }
  export class ShaderMaterial extends Material {
    constructor(p?: Record<string, unknown>);
    uniforms: Record<string, { value: unknown }>;
  }
  export class IcosahedronGeometry extends BufferGeometry { constructor(r?: number, d?: number) }
  export class TorusKnotGeometry extends BufferGeometry { constructor(...a: number[]) }
  export class Vector2 { constructor(x?: number, y?: number); set(x: number, y: number): this; x: number; y: number }
  export class Vector3 { constructor(x?: number, y?: number, z?: number); set(x: number, y: number, z: number): this; x: number; y: number; z: number }
  export class Clock { getElapsedTime(): number }
  export class Texture { dispose(): void }
  export class AnimationClip { name: string }
  export const ACESFilmicToneMapping: number;
  export const DoubleSide: number;
  export const FrontSide: number;
  export const BackSide: number;
  export const SRGBColorSpace: string;
}
declare module "vaul";
declare module "zod";


// Test tooling (compile-only stubs; install real packages to run — see README Testing).
declare module "vitest";
declare module "@testing-library/react";
declare module "@testing-library/user-event";
declare module "@testing-library/jest-dom";
declare module "jest-axe";
declare module "@/components";
