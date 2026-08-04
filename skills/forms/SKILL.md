---
name: forms
description: Forms and auth — validation, RHF + Zod, error states, checkout, login/signup, OTP/MFA, payments.
version: "14.4.2"
core-deps:
  - core/component-api.md
  - core/accessibility-baseline.md
---

# Forms

## When to Use
Any input-collecting UI: contact, newsletter, checkout, login, signup, password reset, OTP/MFA, multi-step wizards, settings panels. Mentions of React Hook Form, Zod, validation, `aria-describedby`, or Stripe PaymentElement route here.

## Stack
React 19 · TypeScript strict · Tailwind v4 · React Hook Form + Zod · Next.js App Router (default)

## Core Rules
1. **Label everything.** Every input is wired via `htmlFor`/`id` or wraps its control. Placeholders never replace labels — they end with `…` and show an example pattern.
2. **Errors live beside their field**, linked with `aria-describedby`, marked with `aria-invalid`, announced with `role="alert"`. Focus the first invalid field on submit.
3. **Validate on blur**, not on every keystroke. Re-validate on change only after the first error appears.
4. **Error copy is a fix, not a verdict.** "Enter a valid email — for example ana@arclight.io", never "Invalid input".
5. **Submit stays enabled** until the request starts; then disable and show a spinner *inside* the button. Never block paste.
6. **Correct input semantics.** `type` + `inputMode` + `autocomplete` on every field. `spellCheck={false}` on emails, codes and usernames. `autocomplete="off"` on non-auth fields so password managers stay quiet.
7. **Schema-first.** Zod schema is the single source of truth; infer the TS type from it, resolve with `zodResolver`. Discriminated unions for conditional branches.
8. **Four states always.** Loading skeleton (from a real `isLoading` input, never `setTimeout`), empty, error, success.
9. **Unsaved-changes guard** on any form a user can navigate away from.
10. **Touch targets ≥44×44px**, including checkbox/radio hit areas — label and control share one target with no dead zones.

## Patterns
- **RHF + Zod** — `useForm({ resolver: zodResolver(schema) })`, `Controller` for non-native inputs.
- **Multi-step wizard** — one decision per step, 3–5 steps, progress as an `<ol>` with `aria-current="step"`, Back never destroys data.
- **OTP input** — six inputs, `autoComplete="one-time-code"`, paste distributes across boxes, backspace walks backwards, resend countdown in an `aria-live` region.
- **Checkout** — PaymentElement + sticky order summary, trust strip, four states.
- **Server Actions** — `useActionState` for pending/error without client state.

## Examples
`examples/good-form.tsx` (contact, file upload, all states) · `examples/good-rhf.tsx` (multi-step wizard) · `examples/good-auth.tsx` (login/signup/magic link/OAuth) · `examples/good-checkout.tsx` (Stripe) · `examples/good-storybook.tsx` (form with CSF3 stories).

## Reference Index
Load only for the specific task:

| Task | Load |
|---|---|
| RHF API, resolvers, field arrays, Server Actions | `references/react-hook-form.md` |
| Login/OAuth/magic link/OTP/MFA/protected routes | `references/auth-patterns.md` |
| Optimistic UI, rollback, axe checks, error boundaries | `references/verification-loops.md` |

## Constraints
Every input labelled · errors linked via `aria-describedby` · `A11Y-02` focus-visible on interactive elements · four states, no mount-time fake delays · OKLCH tokens · TypeScript strict with exported prop interfaces · WCAG 2.2 AA including §3.3.7 (never re-ask session data).
