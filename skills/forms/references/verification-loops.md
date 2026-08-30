# Verification Loops — Reference

Patterns for building data integrity, validation, and error-recovery loops into React/Next.js UIs.

---

## Contents

- [1. Client-Side Validation](#1-client-side-validation)
- [2. Server-Side Validation](#2-server-side-validation)
- [3. Optimistic UI + Rollback](#3-optimistic-ui--rollback)
- [4. Data Integrity Checks](#4-data-integrity-checks)
- [5. API Response Validation](#5-api-response-validation)
- [6. E2E State Verification (TanStack Query)](#6-e2e-state-verification-tanstack-query)
- [7. Accessibility Verification](#7-accessibility-verification)
- [8. Visual Regression Patterns](#8-visual-regression-patterns)
- [9. Error Boundaries](#9-error-boundaries)
- [10. Anti-Patterns](#10-anti-patterns)
- [Quick Reference](#quick-reference)

---

## 1. Client-Side Validation

### Zod Schema + React Hook Form

```ts
// schemas/profile.ts
import { z } from "zod"

export const ProfileSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(32, "Max 32 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  email: z.string().email("Invalid email address"),
  age: z.coerce.number().int().min(13, "Must be 13 or older").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
})

export type ProfileInput = z.infer<typeof ProfileSchema>
```

```tsx
// components/ProfileForm.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProfileSchema, type ProfileInput } from "@/schemas/profile"

export function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    mode: "onBlur",          // validate field when focus leaves
    reValidateMode: "onChange", // re-validate on change after first error
    defaultValues: { username: "", email: "" },
  })

  const onSubmit = async (data: ProfileInput) => {
    const result = await updateProfile(data)
    if (result.error?.field) {
      // surface server-returned field errors back into RHF
      setError(result.error.field as keyof ProfileInput, {
        message: result.error.message,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      {errors.username && <p role="alert">{errors.username.message}</p>}

      <input {...register("email")} type="email" />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <button disabled={isSubmitting}>Save</button>
    </form>
  )
}
```

### When to Validate

| Strategy | `mode` | UX Fit |
|---|---|---|
| `onSubmit` | `"onSubmit"` | Short forms, low friction |
| `onBlur` | `"onBlur"` | Standard; catches typos on exit |
| `onChange` | `"onChange"` | Real-time feedback; high-friction for passwords |
| Hybrid | `mode: "onBlur"`, `reValidateMode: "onChange"` | Best overall — quiet until first touch |

### Form-Level vs Field-Level

```ts
// Field-level: attach to individual field
const { register } = useForm()
// <input {...register("email", { required: "Required" })} />

// Form-level (preferred for complex rules): use Zod superRefine
const Schema = z
  .object({ password: z.string(), confirm: z.string() })
  .superRefine(({ password, confirm }, ctx) => {
    if (password !== confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirm"],
      })
    }
  })
```

---

## 2. Server-Side Validation

### Server Actions with Zod

```ts
// app/actions/profile.ts
"use server"

import { z } from "zod"
import { ProfileSchema } from "@/schemas/profile"

type ActionResult =
  | { success: true; data: ProfileInput }
  | { success: false; errors: Record<string, string[]> }

export async function updateProfileAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = ProfileSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const data = await db.profile.update({ data: parsed.data })
    return { success: true, data }
  } catch (err) {
    if (isUniqueConstraintError(err, "username")) {
      return {
        success: false,
        errors: { username: ["Username already taken"] },
      }
    }
    throw err // let error boundary catch unexpected failures
  }
}
```

### `useActionState` for Server Errors (React 19)

```tsx
// React 19: useActionState replaces useFormState
import { useActionState } from "react"
import { updateProfileAction } from "@/app/actions/profile"

export function ProfileForm() {
  const [state, action, isPending] = useActionState(updateProfileAction, null)

  return (
    <form action={action}>
      <input name="username" />
      {state?.errors?.username?.map((msg) => (
        <p key={msg} role="alert">{msg}</p>
      ))}

      <input name="email" type="email" />
      {state?.errors?.email?.map((msg) => (
        <p key={msg} role="alert">{msg}</p>
      ))}

      <button disabled={isPending}>Save</button>
    </form>
  )
}
```

---

## 3. Optimistic UI + Rollback

### `useOptimistic` (React 19)

```tsx
import { useOptimistic, useTransition } from "react"

type Todo = { id: string; text: string; done: boolean }

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, applyOptimistic] = useOptimistic(
    todos,
    (current, { id, done }: { id: string; done: boolean }) =>
      current.map((t) => (t.id === id ? { ...t, done } : t))
  )
  const [, startTransition] = useTransition()

  const toggle = (id: string, done: boolean) => {
    startTransition(async () => {
      applyOptimistic({ id, done })      // instant UI update
      try {
        await toggleTodoAction(id, done) // server mutation
      } catch {
        // React automatically reverts optimistic state on throw
        // Show toast to notify user
        toast.error("Failed to update — change reverted")
      }
    })
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id} style={{ opacity: todo.done ? 0.5 : 1 }}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={(e) => toggle(todo.id, e.target.checked)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

### Undo Pattern (5-second window)

```tsx
function useUndoableDelete<T extends { id: string }>(deleteAction: (id: string) => Promise<void>) {
  const [pendingDelete, setPendingDelete] = useState<T | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const scheduleDelete = (item: T) => {
    setPendingDelete(item)
    timerRef.current = setTimeout(async () => {
      await deleteAction(item.id)
      setPendingDelete(null)
    }, 5000)
  }

  const undo = () => {
    clearTimeout(timerRef.current)
    setPendingDelete(null)
  }

  return { pendingDelete, scheduleDelete, undo }
}

// Usage
const { pendingDelete, scheduleDelete, undo } = useUndoableDelete(deleteComment)
// Render item as "pending" if pendingDelete?.id === item.id
// Show toast with <button onClick={undo}>Undo</button>
```

---

## 4. Data Integrity Checks

### Invariant Assertions

```ts
// lib/invariant.ts
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`)
  }
}

export function assertDefined<T>(
  value: T | null | undefined,
  name: string
): asserts value is T {
  invariant(value != null, `${name} must be defined`)
}

// Usage in component
const user = useUser()
assertDefined(user, "user") // TypeScript now knows user is non-null
const greeting = `Hello, ${user.name}`
```

### `safeParse` vs `parse`

```ts
// parse — throws ZodError on failure; use when failure is a programming error
const config = ConfigSchema.parse(process.env) // safe at startup, crash fast

// safeParse — returns Result; use for user input or external data
const result = ProfileSchema.safeParse(formData)
if (!result.success) {
  // result.error.flatten() gives { fieldErrors, formErrors }
  return { errors: result.error.flatten().fieldErrors }
}
const profile = result.data // fully typed

// parseAsync — for schemas with async refinements
const result = await AsyncSchema.safeParseAsync(data)
```

---

## 5. API Response Validation

Always validate third-party API responses before touching state. Never trust shape.

```ts
// lib/api/github.ts
import { z } from "zod"

const GithubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string().url(),
  public_repos: z.number(),
  followers: z.number(),
})

export type GithubUser = z.infer<typeof GithubUserSchema>

export async function fetchGithubUser(username: string): Promise<GithubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const json = await res.json()

  // Validate before use — API can change shape silently
  const parsed = GithubUserSchema.safeParse(json)
  if (!parsed.success) {
    // Log full error server-side, surface generic message to client
    console.error("GitHub response validation failed:", parsed.error.format())
    throw new Error("Unexpected GitHub API response shape")
  }

  return parsed.data
}
```

### Partial Validation for Large Responses

```ts
// Only extract and validate what you need
const PartialSchema = z.object({
  items: z.array(
    z.object({ id: z.string(), name: z.string() }).passthrough() // allow extra keys
  ),
  total: z.number(),
})
```

---

## 6. E2E State Verification (TanStack Query)

### Invalidate + Refetch After Mutation

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,

    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] })
      const previous = queryClient.getQueryData(["profile"])
      queryClient.setQueryData(["profile"], (old: Profile) => ({ ...old, ...newData }))
      return { previous } // context for rollback
    },

    // Rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["profile"], context.previous)
      }
      toast.error("Update failed — changes reverted")
    },

    // Always sync with server after settle (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}
```

### Verifying UI Reflects Server State

```ts
// After a mutation that affects multiple queries, invalidate all related keys
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ["profile"] })
  queryClient.invalidateQueries({ queryKey: ["user-stats"] })
  queryClient.invalidateQueries({ queryKey: ["notifications"] })
},

// For critical flows, refetchQueries instead of invalidateQueries
// to await the server round-trip before proceeding
onSuccess: async () => {
  await queryClient.refetchQueries({ queryKey: ["profile"] })
  router.push("/dashboard") // navigate only after confirmed sync
}
```

### Stale-While-Revalidate Configuration

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,        // 30s before background refetch
      gcTime: 1000 * 60 * 5,       // 5m before cache eviction
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
  },
})
```

---

## 7. Accessibility Verification

### Automated Checks in Development

```ts
// lib/axe.ts — load only in development
export async function initAxe() {
  if (process.env.NODE_ENV !== "development") return
  const { default: axe } = await import("@axe-core/react")
  const { default: React } = await import("react")
  const { default: ReactDOM } = await import("react-dom")
  // Reports violations to browser console
  axe(React, ReactDOM, 1000)
}

// app/layout.tsx
import { initAxe } from "@/lib/axe"
initAxe() // top-level call, runs once
```

```json
// .eslintrc — jsx-a11y ruleset
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/no-autofocus": "off",
    "jsx-a11y/interactive-supports-focus": "error"
  }
}
```

### Focus Management After State Changes

```tsx
// Move focus to first error after failed submission
const firstErrorRef = useRef<HTMLElement>(null)
const { formState: { errors } } = useForm()

useEffect(() => {
  if (Object.keys(errors).length > 0) {
    firstErrorRef.current?.focus()
  }
}, [errors])

// Move focus to confirmation after async action completes
const confirmRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (mutationState === "success") {
    confirmRef.current?.focus()
  }
}, [mutationState])

// Return focus to trigger after modal closes
const triggerRef = useRef<HTMLButtonElement>(null)
useEffect(() => {
  if (!modalOpen) {
    triggerRef.current?.focus()
  }
}, [modalOpen])
```

### ARIA Live Regions for Async State

```tsx
// Announce loading/success/error states to screen readers
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isPending && "Saving changes…"}
  {isSuccess && "Changes saved successfully."}
  {isError && "Failed to save changes. Please try again."}
</div>
```

---

## 8. Visual Regression Patterns

### Snapshot Testing with Vitest

```tsx
// components/__tests__/ProfileForm.test.tsx
import { render } from "@testing-library/react"
import { ProfileForm } from "../ProfileForm"

it("renders empty form state", () => {
  const { container } = render(<ProfileForm />)
  expect(container).toMatchSnapshot()
})

it("renders validation errors", async () => {
  const { getByRole, findByRole } = render(<ProfileForm />)
  fireEvent.click(getByRole("button", { name: /save/i }))
  await findByRole("alert")
  expect(container).toMatchSnapshot()
})
```

### Storybook + Chromatic Integration

```tsx
// components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./Button"

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = { args: { children: "Save" } }
export const Loading: Story = { args: { children: "Saving…", disabled: true, "aria-busy": true } }
export const Destructive: Story = { args: { children: "Delete", variant: "destructive" } }
export const WithError: Story = {
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p role="alert">Something went wrong</p>
      </div>
    ),
  ],
}
```

```yaml
# .github/workflows/chromatic.yml
- name: Chromatic visual regression
  uses: chromaui/action@v1
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    exitZeroOnChanges: true   # flag changes; don't fail CI
    onlyChanged: true         # only test stories affected by diff
```

---

## 9. Error Boundaries

### React 19 Error Boundary Component

```tsx
// components/ErrorBoundary.tsx
"use client"

import { Component, type ReactNode } from "react"
import { captureException } from "@/lib/monitoring"

type Props = {
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  children: ReactNode
}

type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, { componentStack: info.componentStack })
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      return typeof this.props.fallback === "function"
        ? this.props.fallback(error, this.reset)
        : this.props.fallback
    }
    return this.props.children
  }
}
```

```tsx
// Next.js: app/error.tsx (auto-wraps route segment)
"use client"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

```tsx
// Granular boundary around risky components
<ErrorBoundary
  fallback={(error, reset) => (
    <div role="alert">
      <p>Chart failed to load: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <ExpensiveChart data={data} />
</ErrorBoundary>
```

### Async Error Boundaries with Suspense

```tsx
// Pair Suspense + ErrorBoundary for async data components
<ErrorBoundary fallback={<ChartError />}>
  <Suspense fallback={<ChartSkeleton />}>
    <AsyncChart /> {/* throws promise while loading, throws Error on failure */}
  </Suspense>
</ErrorBoundary>
```

---

## 10. Anti-Patterns

### Silent Failures

```ts
// BAD — swallowed error, user has no idea what happened
async function save(data: unknown) {
  try {
    await api.post("/profile", data)
  } catch {
    // nothing
  }
}

// GOOD — surface the error
async function save(data: unknown) {
  try {
    await api.post("/profile", data)
    toast.success("Saved")
  } catch (err) {
    toast.error("Save failed — please try again")
    captureException(err)
    throw err // re-throw so React Query / error boundary can handle
  }
}
```

### No Rollback on Optimistic Update

```ts
// BAD — optimistic state never reverts on failure
onMutate: (newData) => {
  queryClient.setQueryData(["profile"], newData)
},
// missing onError rollback

// GOOD — always pair onMutate with onError rollback + onSettled invalidation
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ["profile"] })
  const previous = queryClient.getQueryData(["profile"])
  queryClient.setQueryData(["profile"], (old) => ({ ...old, ...newData }))
  return { previous }
},
onError: (_err, _vars, context) => {
  queryClient.setQueryData(["profile"], context?.previous)
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ["profile"] })
},
```

### Unchecked API Responses

```ts
// BAD — blindly spreading API data into state
const data = await fetch("/api/user").then((r) => r.json())
setUser(data) // data could be { error: "Unauthorized" }

// GOOD — validate before touching state
const json = await fetch("/api/user").then((r) => r.json())
const result = UserSchema.safeParse(json)
if (!result.success) {
  setError("Failed to load user data")
  return
}
setUser(result.data)
```

### Validation Only on Submit

```ts
// BAD — users discover all errors at once after filling a long form
const { handleSubmit } = useForm({ mode: "onSubmit" })

// GOOD — validate progressively; errors appear when field is left
const { handleSubmit } = useForm({
  mode: "onBlur",
  reValidateMode: "onChange",
})
```

### Missing ARIA on Dynamic Content

```tsx
// BAD — error injected into DOM silently; screen readers miss it
{hasError && <p>Something went wrong</p>}

// GOOD — live region announces change to screen readers
<div aria-live="assertive" role="alert">
  {hasError && "Something went wrong"}
</div>
```

### Throwing in `useEffect` Without Boundary

```tsx
// BAD — unhandled promise rejection, no user feedback
useEffect(() => {
  fetchData().then(setData) // rejection goes nowhere
}, [])

// GOOD — surface errors through state
useEffect(() => {
  fetchData()
    .then(setData)
    .catch((err) => {
      setError(err)
      captureException(err)
    })
}, [])
```

---

## Quick Reference

| Concern | Tool | Key Call |
|---|---|---|
| Client schema | Zod + RHF | `zodResolver(Schema)` |
| Server validation | Zod + Server Action | `Schema.safeParse(formData)` |
| Optimistic UI | `useOptimistic` | auto-reverts on throw |
| Query rollback | TanStack Query | `onMutate` → `onError` → `onSettled` |
| API shape guard | Zod | `Schema.safeParse(json)` |
| Runtime assertion | Custom invariant | `invariant(cond, msg)` |
| a11y dev check | axe-core | `axe(React, ReactDOM, 1000)` |
| a11y lint | jsx-a11y ESLint | `plugin:jsx-a11y/recommended` |
| Focus after error | `useEffect` + `.focus()` | fire on `errors` change |
| Visual regression | Storybook + Chromatic | `chromaui/action@v1` |
| Error boundary | `ErrorBoundary` class | `getDerivedStateFromError` |
| Route error | `app/error.tsx` | `reset()` to retry |
