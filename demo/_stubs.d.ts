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
declare module "@storybook/testing-library";
declare module "@tanstack/react-query";
declare module "@tanstack/react-table";
declare module "@tanstack/react-virtual";
declare module "framer-motion";
declare module "gsap";
declare module "gsap/ScrollTrigger";
declare module "gsap/SplitText";
declare module "lucide-react";
declare module "next-themes";
declare module "next/navigation";
declare module "next/link";
declare module "next/image";
// react-hook-form needs more than a shorthand stub: `useForm<Values>()` passes a
// type argument, and a shorthand ambient module types the call as `any`, which
// TypeScript refuses to parameterise (TS2347). The generic below carries the
// form's value type through `register`/`handleSubmit` so OUR code stays checked.
declare module "react-hook-form" {
  export interface FieldError {
    type?: string;
    message?: string;
  }
  export interface FormState<TValues> {
    errors: { [K in keyof TValues]?: FieldError };
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
  }
  export interface UseFormReturn<TValues> {
    formState: FormState<TValues>;
    handleSubmit(
      onValid: (values: TValues) => void | Promise<void>,
    ): (event?: unknown) => Promise<void>;
    register(name: keyof TValues & string, options?: Record<string, unknown>): Record<string, unknown>;
    setValue(name: keyof TValues & string, value: unknown): void;
    setError(name: keyof TValues & string, error: FieldError): void;
    reset(values?: Partial<TValues>): void;
    watch(name?: keyof TValues & string): any;
    control: unknown;
  }
  export function useForm<TValues = Record<string, unknown>>(
    options?: Record<string, unknown>,
  ): UseFormReturn<TValues>;
  export function useFormContext<TValues = Record<string, unknown>>(): UseFormReturn<TValues>;
  export const Controller: any;
  export const FormProvider: any;
  export const useFieldArray: any;
  export const useWatch: any;
}
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
// zod needs more than a shorthand stub: `z.infer<typeof schema>` is the idiomatic
// react-hook-form pairing, and a shorthand ambient module types `z` as `any`, which
// cannot be used in a type position. A namespace gives the value side (the builder
// chain, deliberately loose — we type OUR code, not zod's) and the type side.
declare module "zod" {
  export namespace z {
    export type infer<T> = any;
    export function object(shape: Record<string, unknown>): any;
    export function string(): any;
    export function number(): any;
    export function boolean(): any;
    export function literal(value: unknown): any;
    export function union(types: unknown[]): any;
    export function array(inner: unknown): any;
    export function optional(inner: unknown): any;
    export function coerce(): any;
  }
  export type ZodType = any;
  export type ZodTypeAny = any;
  export type ZodSchema = any;
}


// Test tooling (compile-only stubs; install real packages to run — see README Testing).
declare module "vitest";
declare module "@testing-library/react";
declare module "@testing-library/user-event";
declare module "@testing-library/jest-dom";
declare module "jest-axe";
declare module "@/components";
declare module "next/dynamic";
