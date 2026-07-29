/**
 * Sign-in validation contract.
 *
 * The Zod schema is the single source of truth: `zodResolver(loginSchema)` in
 * LoginForm produces every field message below, so the copy lives in exactly
 * one place and the client cannot drift from the server that shares this file.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter the email address your workspace invite was sent to.")
    .email("Enter a valid email address — for example ana@arclight.io"),
  password: z.string().min(1, "Enter your password to continue."),
  rememberMe: z.boolean(),
});

/**
 * Values `loginSchema` produces.
 *
 * In an app with zod's real type definitions this is a single line:
 *   export type LoginValues = z.infer<typeof loginSchema>;
 * The shared `demo/_stubs.d.ts` stands in for zod's real types, and its `infer`
 * resolves to `any` — using it here would silently untype every form boundary.
 * Writing the parsed shape out keeps `register`, `handleSubmit` and
 * `onAuthenticate` genuinely checked under `tsc --strict`.
 */
export interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Result of a credential exchange. Modelled as a discriminated union so the UI
 * has to handle every branch — a thrown exception can never reach the form.
 */
export type AuthOutcome =
  | { readonly status: "success"; readonly email: string }
  | { readonly status: "rejected" }
  | { readonly status: "rate-limited"; readonly retryAfterSeconds: number }
  | { readonly status: "unavailable" }
  | { readonly status: "offline" };

/** Every outcome that keeps the user on the form. */
export type AuthFailure = Exclude<AuthOutcome, { status: "success" }>;

/**
 * Turns a failed outcome into copy that tells the user what to do next.
 * Rejected credentials never say which of the two fields was wrong — naming it
 * would let an attacker enumerate registered accounts.
 */
export function describeAuthFailure(failure: AuthFailure): string {
  switch (failure.status) {
    case "rejected":
      return "That email and password don’t match an account. Check both, or reset your password.";
    case "rate-limited": {
      const minutes = Math.max(1, Math.ceil(failure.retryAfterSeconds / 60));
      const unit = minutes === 1 ? "minute" : "minutes";
      return `Too many attempts. Sign-in is paused for this account — try again in ${minutes} ${unit}.`;
    }
    case "unavailable":
      return "Sign-in is temporarily down on our side. Nothing is wrong with your credentials — try again in a moment.";
    case "offline":
      return "We could not reach the sign-in service. Check your connection, then try again.";
  }
}

export default loginSchema;
