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
// zodResolver is the seam where a schema and a form agree on a type, so a
// shorthand stub here is worse than no stub: it types the resolver as `any`,
// `useForm<T>` accepts it whatever T is, and the one mismatch that matters
// becomes invisible. Real `@hookform/resolvers` returns a resolver keyed to the
// schema's inferred output; this says the same thing, so a schema that has
// drifted from its form's value type fails the demo compile gate here rather
// than in a consumer's `next build`.
declare module "@hookform/resolvers/zod" {
  import type { Resolver } from "react-hook-form";
  import type { z } from "zod";
  export function zodResolver<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
    schemaOptions?: unknown,
    resolverOptions?: unknown,
  ): Resolver<z.infer<TSchema>>;
}
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
// react-hook-form needs more than a shorthand stub: `useForm<Values>()` passes a
// type argument, and a shorthand ambient module types the call as `any`, which
// TypeScript refuses to parameterise (TS2347). The generic below carries the
// form's value type through `register`/`handleSubmit` so OUR code stays checked.
declare module "react-hook-form" {
  export interface FieldError {
    type?: string;
    message?: string;
  }
  /**
   * What a resolver promises: given the form's values, report those values or
   * per-field errors against them. Typing it on TValues is what lets
   * `useForm<LoginValues>` reject a resolver built from a different schema.
   */
  export type Resolver<TValues> = (
    values: TValues,
    context: unknown,
    options: unknown,
  ) =>
    | Promise<{ values: TValues | {}; errors: Record<string, FieldError> }>
    | { values: TValues | {}; errors: Record<string, FieldError> };
  export interface UseFormProps<TValues> {
    resolver?: Resolver<TValues>;
    mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
    reValidateMode?: "onBlur" | "onChange" | "onSubmit";
    defaultValues?: Partial<TValues>;
    values?: Partial<TValues>;
    shouldFocusError?: boolean;
    criteriaMode?: "firstError" | "all";
    delayError?: number;
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
    options?: UseFormProps<TValues>,
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
// cannot be used in a type position.
//
// An earlier version of this stub declared `infer<T> = any`, which is worse than it
// looks. `z.infer` resolving to `any` silently untypes every form boundary, so the
// only way to keep `register`/`handleSubmit` checked was to hand-write the parsed
// shape beside the schema — two declarations of one contract, free to drift, with
// nothing to catch it. They did drift, and the mismatch only surfaced in a real
// `next build`.
//
// So each builder carries its output type in a phantom `_output` field and `infer`
// reads it back, exactly as real zod does. The runtime side stays deliberately
// loose — we type OUR code, not zod's — but the type relationship is now modelled
// rather than erased, and `z.infer<typeof schema>` is once again the single source
// of truth it is in a real project.
declare module "zod" {
  export namespace z {
    /**
     * Phantom carriers. Neither field exists at runtime; they exist so `infer`,
     * `input` and `output` can read the types back.
     *
     * `_input` is tracked separately from `_output` because `.transform()` makes
     * them genuinely different, and a form binds to the INPUT while the parsed
     * result is the OUTPUT. Declaring `input = output` would be a stub asserting
     * something untrue — the same shape of mistake as `infer = any`, which is
     * what put a hand-written duplicate of a schema next to the schema.
     */
    export interface ZodTypeAny {
      readonly _output: unknown;
      readonly _input: unknown;
    }
    export interface ZodType<TOutput, TInput = TOutput> extends ZodTypeAny {
      readonly _output: TOutput;
      readonly _input: TInput;
      optional(): ZodType<TOutput | undefined, TInput | undefined>;
      nullable(): ZodType<TOutput | null, TInput | null>;
      nullish(): ZodType<TOutput | null | undefined, TInput | null | undefined>;
      default(value: TOutput): ZodType<TOutput, TInput | undefined>;
      describe(description: string): ZodType<TOutput, TInput>;
      refine(check: (value: TOutput) => unknown, message?: unknown): ZodType<TOutput, TInput>;
      superRefine(check: (value: TOutput, ctx: unknown) => unknown): ZodType<TOutput, TInput>;
      /** Output changes, input does not — that is the whole point of a transform. */
      transform<TNext>(fn: (value: TOutput) => TNext): ZodType<TNext, TInput>;
      parse(data: unknown): TOutput;
      safeParse(data: unknown):
        | { success: true; data: TOutput }
        | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } };
    }

    // Refinements return the same builder so chains keep their own methods —
    // `z.string().trim().min(1).email()` must stay a ZodString throughout.
    export interface ZodString extends ZodType<string> {
      min(length: number, message?: string): ZodString;
      max(length: number, message?: string): ZodString;
      length(length: number, message?: string): ZodString;
      email(message?: string): ZodString;
      url(message?: string): ZodString;
      uuid(message?: string): ZodString;
      regex(pattern: RegExp, message?: string): ZodString;
      startsWith(value: string, message?: string): ZodString;
      endsWith(value: string, message?: string): ZodString;
      trim(): ZodString;
      toLowerCase(): ZodString;
      nonempty(message?: string): ZodString;
    }
    export interface ZodNumber extends ZodType<number> {
      min(value: number, message?: string): ZodNumber;
      max(value: number, message?: string): ZodNumber;
      gt(value: number, message?: string): ZodNumber;
      lt(value: number, message?: string): ZodNumber;
      int(message?: string): ZodNumber;
      positive(message?: string): ZodNumber;
      nonnegative(message?: string): ZodNumber;
    }
    export interface ZodBoolean extends ZodType<boolean> {}
    export interface ZodArray<TItem, TItemInput = TItem> extends ZodType<TItem[], TItemInput[]> {
      min(length: number, message?: string): ZodArray<TItem, TItemInput>;
      max(length: number, message?: string): ZodArray<TItem, TItemInput>;
      nonempty(message?: string): ZodArray<TItem, TItemInput>;
    }
    /** The shape's builders are mapped to their outputs — this is what makes `infer` work. */
    export interface ZodObject<TShape extends Record<string, ZodTypeAny>>
      extends ZodType<
        { [K in keyof TShape]: TShape[K]["_output"] },
        { [K in keyof TShape]: TShape[K]["_input"] }
      > {
      shape: TShape;
      partial(): ZodType<Partial<{ [K in keyof TShape]: TShape[K]["_output"] }>>;
      extend<TNext extends Record<string, ZodTypeAny>>(shape: TNext): ZodObject<TShape & TNext>;
      pick(mask: Record<string, true>): ZodTypeAny;
      omit(mask: Record<string, true>): ZodTypeAny;
    }

    export type infer<T extends ZodTypeAny> = T["_output"];
    export type input<T extends ZodTypeAny> = T["_input"];
    export type output<T extends ZodTypeAny> = T["_output"];

    export function object<TShape extends Record<string, ZodTypeAny>>(shape: TShape): ZodObject<TShape>;
    export function string(): ZodString;
    export function number(): ZodNumber;
    export function boolean(): ZodBoolean;
    export function date(): ZodType<Date>;
    export function literal<const TValue>(value: TValue): ZodType<TValue>;
    export function enum_<const TValues extends readonly [string, ...string[]]>(
      values: TValues,
    ): ZodType<TValues[number]>;
    export { enum_ as enum };
    export function union<TMembers extends readonly ZodTypeAny[]>(
      types: TMembers,
    ): ZodType<TMembers[number]["_output"]>;
    export function array<TItem extends ZodTypeAny>(
      inner: TItem,
    ): ZodArray<TItem["_output"], TItem["_input"]>;
    export function optional<TInner extends ZodTypeAny>(
      inner: TInner,
    ): ZodType<TInner["_output"] | undefined>;
    export function record<TValue extends ZodTypeAny>(
      value: TValue,
    ): ZodType<Record<string, TValue["_output"]>>;
    export function any(): ZodType<unknown>;
    export function unknown(): ZodType<unknown>;
  }
  export type ZodTypeAny = z.ZodTypeAny;
  export type ZodType<TOutput = unknown> = z.ZodType<TOutput>;
  export type ZodSchema<TOutput = unknown> = z.ZodType<TOutput>;
}


// Test tooling (compile-only stubs; install real packages to run — see README Testing).
declare module "vitest";
declare module "@testing-library/react";
declare module "@testing-library/user-event";
declare module "@testing-library/jest-dom";
declare module "jest-axe";
declare module "@/components";
declare module "next/dynamic";
