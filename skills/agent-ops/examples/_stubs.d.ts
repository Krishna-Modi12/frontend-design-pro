/**
 * Ambient module stubs for the gold-example compile check (typecheck_golds.py).
 * Examples are single-file demos importing libraries not installed in this repo;
 * shorthand declarations type those imports as `any` so `tsc --noEmit --strict`
 * verifies OUR code, not vendor typings. Never ship this file in an app —
 * install the real packages and their types instead.
 */

// Test tooling (compile-only stubs; install real packages to run — see README Testing).
declare module "vitest";
declare module "@testing-library/react";
declare module "@testing-library/user-event";
declare module "@testing-library/jest-dom";
declare module "jest-axe";
