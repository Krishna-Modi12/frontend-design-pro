/**
 * Compile-time contract for the sign-in types. No runtime code, no test runner —
 * `tsc -p demo/tsconfig.json` either accepts this file or it does not, so the
 * demo compile gate carries the assertion for free.
 *
 * It exists because the failure it guards against is silent. `LoginValues` used
 * to be hand-written beside `loginSchema`, and the two drifted until
 * `zodResolver(loginSchema)` no longer satisfied `Resolver<LoginValues>` against
 * zod's real types — visible only in a consumer's `next build`, never here.
 * `LoginValues` is now `z.infer<typeof loginSchema>`, which cannot drift.
 *
 * The remaining risk is the stub degrading rather than the schema moving: if
 * `demo/_stubs.d.ts` ever resolves `z.infer` back to `any`, every downstream
 * check passes vacuously and the gate goes quiet while proving nothing. The
 * `IsAny` assertion below is the tripwire for exactly that.
 */

import { z } from "zod";
import { loginSchema } from "./validation";
import type { LoginValues } from "./validation";

/** `0 extends 1 & T` is only true when T is `any` — the one type that absorbs both. */
type IsAny<T> = 0 extends 1 & T ? true : false;

/** Mutual assignability. `[T]` tuples stop naked unions distributing. */
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/** If this stops compiling, the stub has gone vacuous — fix the stub, not this line. */
const loginValuesIsNotAny: IsAny<LoginValues> = false;

/** The inferred shape is the contract every consumer of this module codes against. */
const loginValuesMatchesSchema: Exact<
  LoginValues,
  { email: string; password: string; rememberMe: boolean }
> = true;

/** The schema is the source `LoginValues` is derived from, so the two cannot disagree. */
const schemaOutputIsLoginValues: Exact<
  ReturnType<typeof loginSchema.parse>,
  LoginValues
> = true;

/**
 * `loginSchema` has no `.transform()`, so its input and output coincide — but the
 * stub must be able to tell them apart, or it is asserting something untrue about
 * every schema that does transform. A form binds to the input; the parsed result
 * is the output. Declaring the two identical is the same shape of mistake as
 * `infer = any`: quiet, and only expensive later.
 */
const transformedSchema = loginSchema.transform((values) => values.email);
const transformChangesOutput: Exact<z.infer<typeof transformedSchema>, string> = true;
const transformKeepsInput: Exact<z.input<typeof transformedSchema>, LoginValues> = true;

export type { LoginValues };
export {
  loginValuesIsNotAny,
  loginValuesMatchesSchema,
  schemaOutputIsLoginValues,
  transformChangesOutput,
  transformKeepsInput,
};
