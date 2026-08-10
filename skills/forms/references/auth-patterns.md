# Auth UI Patterns Reference

Source: frontend-design-pro skill (internal)  
Version: 10.15.0

---

## 1. Auth UI Principles

- **Clear error states**: Show inline field errors and form-level errors distinctly. Field errors sit below the input; form-level errors (wrong credentials) appear above the submit button.
- **Loading states on submit**: Replace button text with a spinner + label ("Signing in…") while the request is in flight. Never freeze the UI silently.
- **Never disable submit before attempt**: Only disable while `isPending`. Showing a greyed-out button before the user tries trains them to ignore it. Let them attempt and show errors after.
- **Never reveal which field is wrong**: Always say "Invalid email or password" — never "Password incorrect" or "No account found". This prevents user enumeration attacks.
- **Optimistic redirects**: Start the redirect animation before the server confirms (when safe). For login, push to dashboard immediately on success; roll back on error.
- **Accessibility**: All error messages use `role="alert"` or `aria-live="polite"`. Focus moves to the first error on submission failure.

---

## 2. Login Form

```tsx
// components/auth/LoginForm.tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginValues) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Never reveal which field is wrong
        setFormError("Invalid email or password. Please try again.");
        return;
      }

      router.push("/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="off"
            spellCheck={false}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            {...register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && <Spinner />}
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
```

---

## 3. Sign-up Form

```tsx
// components/auth/SignUpForm.tsx
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!password) return { level: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const level = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  return { level, label: labels[level] };
}

const strengthColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
const strengthTextColors = ["", "text-red-600", "text-orange-500", "text-yellow-600", "text-green-600"];

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  const onSubmit = (data: SignUpValues) => {
    startTransition(async () => {
      // call your sign-up server action here
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="su-email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="su-email"
          type="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={!!errors.email}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("email")}
        />
        {errors.email && <p role="alert" className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="su-password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="su-password"
          type="password"
          autoComplete="new-password"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={!!errors.password}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("password")}
        />
        {/* Strength indicator */}
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors duration-300 ${
                    i <= strength.level ? strengthColors[strength.level] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            {strength.label && (
              <p className={`text-xs font-medium ${strengthTextColors[strength.level]}`}>
                {strength.label}
              </p>
            )}
          </div>
        )}
        {errors.password && <p role="alert" className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="su-confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
        <input
          id="su-confirm"
          type="password"
          autoComplete="new-password"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={!!errors.confirmPassword}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p role="alert" className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="su-terms"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...register("terms")}
        />
        <label htmlFor="su-terms" className="text-sm text-gray-600">
          I agree to the{" "}
          <a href="/terms" className="text-blue-600 underline hover:text-blue-800">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
        </label>
      </div>
      {errors.terms && <p role="alert" className="text-xs text-red-600">{errors.terms.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending && <Spinner />}
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
```

---

## 4. OAuth Buttons

```tsx
// components/auth/OAuthButtons.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Provider = "github" | "google" | "apple";

interface OAuthButtonProps {
  provider: Provider;
  callbackUrl?: string;
}

const providerConfig: Record<Provider, { label: string; icon: React.ReactNode; className: string }> = {
  github: {
    label: "Continue with GitHub",
    className: "bg-gray-900 text-white hover:bg-gray-700 border-gray-900",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  google: {
    label: "Continue with Google",
    className: "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  apple: {
    label: "Continue with Apple",
    className: "bg-black text-white hover:bg-gray-900 border-black",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
};

function OAuthButton({ provider, callbackUrl = "/dashboard" }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = providerConfig[provider];

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${config.className}`}
    >
      {isLoading ? <Spinner /> : config.icon}
      {isLoading ? "Connecting…" : config.label}
    </button>
  );
}

export function OAuthButtons({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="space-y-3">
      <OAuthButton provider="google" callbackUrl={callbackUrl} />
      <OAuthButton provider="github" callbackUrl={callbackUrl} />
      <OAuthButton provider="apple" callbackUrl={callbackUrl} />
    </div>
  );
}
```

---

## 5. Magic Link Form

```tsx
// components/auth/MagicLinkForm.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type Values = z.infer<typeof schema>;

export function MagicLinkForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const sendLink = (email: string) => {
    startTransition(async () => {
      await signIn("email", { email, redirect: false });
      setSentEmail(email);
      setSent(true);
      setResendCountdown(60);
      setStatusMessage("Magic link sent. Check your inbox.");
    });
  };

  const onSubmit = (data: Values) => sendLink(data.email);

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setStatusMessage("Resending magic link…");
    sendLink(sentEmail);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        {/* Accessible live announcement */}
        <div aria-live="polite" className="sr-only">{statusMessage}</div>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
          <p className="mt-1 text-sm text-gray-500">
            We sent a sign-in link to <strong>{sentEmail}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0 || isPending}
          className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
        >
          {resendCountdown > 0
            ? `Resend in ${resendCountdown}s`
            : isPending
            ? "Sending…"
            : "Resend link"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div aria-live="polite" className="sr-only">{statusMessage}</div>

      <div className="space-y-1">
        <label htmlFor="ml-email" className="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="ml-email"
          type="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("email")}
        />
        {errors.email && <p role="alert" className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending && <Spinner />}
        {isPending ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
```

---

## 6. Password Reset Flow

Three screen states managed in a single component:

```tsx
// components/auth/PasswordReset.tsx
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Screen = "request" | "check-email" | "new-password";

// --- Screen 1: Email entry ---
const requestSchema = z.object({ email: z.string().email("Enter a valid email") });
type RequestValues = z.infer<typeof requestSchema>;

function RequestScreen({ onSent }: { onSent: (email: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = (data: RequestValues) => {
    startTransition(async () => {
      await fetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify(data) });
      onSent(data.email);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="pr-email" className="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="pr-email"
          type="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("email")}
        />
        {errors.email && <p role="alert" className="text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
        {isPending && <Spinner />}
        {isPending ? "Sending…" : "Reset password"}
      </button>
    </form>
  );
}

// --- Screen 2: Check email ---
function CheckEmailScreen({ email }: { email: string }) {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">Check your email</h3>
      <p className="text-sm text-gray-500">
        If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
      </p>
    </div>
  );
}

// --- Screen 3: New password form ---
const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type NewPasswordValues = z.infer<typeof newPasswordSchema>;

function NewPasswordScreen({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const strength = getPasswordStrength(password);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
  });

  const watched = watch("password", "");

  const onSubmit = (data: NewPasswordValues) => {
    startTransition(async () => {
      await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
      });
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="np-password" className="block text-sm font-medium text-gray-700">New password</label>
        <input id="np-password" type="password" autoComplete="new-password"
          autoCapitalize="off" spellCheck={false}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("password")} />
        {watched.length > 0 && (
          <div className="flex gap-1 h-1.5 mt-1">
            {[1,2,3,4].map((i) => (
              <div key={i} className={`flex-1 rounded-full transition-colors ${
                i <= strength.level
                  ? ["","bg-red-500","bg-orange-400","bg-yellow-400","bg-green-500"][strength.level]
                  : "bg-gray-200"
              }`} />
            ))}
          </div>
        )}
        {errors.password && <p role="alert" className="text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <div className="space-y-1">
        <label htmlFor="np-confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
        <input id="np-confirm" type="password" autoComplete="new-password"
          autoCapitalize="off" spellCheck={false}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          {...register("confirmPassword")} />
        {errors.confirmPassword && <p role="alert" className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
        {isPending && <Spinner />}
        {isPending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

// Helper (same as in sign-up)
function getPasswordStrength(password: string): { level: 0 | 1 | 2 | 3 | 4 } {
  if (!password) return { level: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return { level: Math.min(4, score) as 0 | 1 | 2 | 3 | 4 };
}

export function PasswordReset({ token }: { token?: string }) {
  const [screen, setScreen] = useState<Screen>(token ? "new-password" : "request");
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div>
      {screen === "request" && (
        <RequestScreen onSent={(email) => { setSentEmail(email); setScreen("check-email"); }} />
      )}
      {screen === "check-email" && <CheckEmailScreen email={sentEmail} />}
      {screen === "new-password" && token && (
        <NewPasswordScreen token={token} onSuccess={() => setScreen("check-email")} />
      )}
    </div>
  );
}
```

---

## 7. Multi-Step Onboarding

```tsx
// components/auth/OnboardingFlow.tsx
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";

const step1Schema = z.object({ name: z.string().min(2, "Name must be at least 2 characters") });
const step2Schema = z.object({ role: z.enum(["engineer", "designer", "manager", "other"], { required_error: "Select a role" }) });
const step3Schema = z.object({ notifications: z.boolean() });

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

const STEPS = ["Profile", "Role", "Preferences"];

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<Partial<Step1 & Step2 & Step3>>({});

  const schemas = [step1Schema, step2Schema, step3Schema];
  const methods = useForm({ resolver: zodResolver(schemas[step]) });

  const advance = methods.handleSubmit((values) => {
    setData((prev) => ({ ...prev, ...values }));
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  });

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const skip = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shrink-0 ${
              i < step ? "bg-blue-600 text-white" :
              i === step ? "border-2 border-blue-600 text-blue-600" :
              "border-2 border-gray-300 text-gray-400"
            }`}>
              {i < step ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step content with animation */}
      <FormProvider {...methods}>
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">What's your name?</h2>
                  <div className="space-y-1">
                    <label htmlFor="ob-name" className="block text-sm font-medium text-gray-700">Full name</label>
                    <input id="ob-name" type="text" autoComplete="name" spellCheck={false}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      {...methods.register("name")} />
                    {methods.formState.errors.name && (
                      <p role="alert" className="text-xs text-red-600">{(methods.formState.errors.name as any)?.message}</p>
                    )}
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">What's your role?</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {(["engineer", "designer", "manager", "other"] as const).map((r) => (
                      <label key={r} className="flex items-center gap-2 rounded-md border border-gray-200 p-3 cursor-pointer hover:border-blue-400 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                        <input type="radio" value={r} className="text-blue-600"
                          {...methods.register("role")} />
                        <span className="text-sm capitalize">{r}</span>
                      </label>
                    ))}
                  </div>
                  {methods.formState.errors.role && (
                    <p role="alert" className="text-xs text-red-600">{(methods.formState.errors.role as any)?.message}</p>
                  )}
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Notification preferences</h2>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded text-blue-600"
                      {...methods.register("notifications")} />
                    <span className="text-sm text-gray-700">Send me product updates and tips</span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </FormProvider>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={back} disabled={step === 0}
          className="text-sm text-gray-500 hover:text-gray-800 disabled:invisible">
          Back
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={skip}
            className="text-sm text-gray-400 hover:text-gray-600">
            Skip
          </button>
          <button type="button" onClick={advance}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {step === STEPS.length - 1 ? "Finish" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Protected Route Patterns

### Next.js middleware.ts

```ts
// middleware.ts
import { auth } from "@/auth"; // NextAuth v5 auth export
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth", "/api/auth"];

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));

  if (!session && !isPublic) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Client-side session guard

```tsx
// components/auth/SessionGuard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <SessionSkeleton />
      </div>
    );
  }

  if (!session) return null;
  return <>{children}</>;
}

function SessionSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-4 animate-pulse">
      <div className="h-10 rounded-lg bg-gray-200" />
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-32 rounded-lg bg-gray-200" />
    </div>
  );
}
```

---

## 9. User Menu / Avatar Dropdown

```tsx
// components/auth/UserMenu.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const user = session?.user;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open user menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {user?.image ? (
          <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {getInitials(user?.name)}
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? "Unknown"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          {/* Menu items */}
          <a href="/settings" role="menuitem"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 outline-none"
            tabIndex={0}>
            Settings
          </a>
          <a href="/billing" role="menuitem"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 outline-none"
            tabIndex={0}>
            Billing
          </a>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 outline-none"
              tabIndex={0}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Auth Error States

| Error code | Cause | UI treatment |
|---|---|---|
| `email-not-verified` | User signed up but never clicked verification email | Show banner with resend button: "Please verify your email. [Resend link]" |
| `rate-limited` | Too many attempts (usually 5 within 15 min) | Show countdown: "Too many attempts. Try again in 8 minutes." Disable form. |
| `account-locked` | Admin-locked or security lock after brute force | "Your account has been locked. Contact support." No retry option. |
| `oauth-error` | Provider returned error (permissions denied, etc.) | "Could not sign in with [Provider]. Try another method or check permissions." |
| `session-expired` | JWT expired mid-session | Toast + redirect: "Your session expired. Please sign in again." |

```tsx
// components/auth/AuthErrorBanner.tsx
"use client";

const ERROR_MESSAGES: Record<string, { heading: string; body: string; action?: React.ReactNode }> = {
  "email-not-verified": {
    heading: "Verify your email",
    body: "Check your inbox for a verification link.",
  },
  "rate-limited": {
    heading: "Too many attempts",
    body: "For your security, access is temporarily restricted. Try again in a few minutes.",
  },
  "account-locked": {
    heading: "Account locked",
    body: "Your account has been locked. Please contact support.",
  },
  "oauth-error": {
    heading: "Sign-in failed",
    body: "There was a problem connecting to the provider. Try again or use a different method.",
  },
  "session-expired": {
    heading: "Session expired",
    body: "Please sign in again to continue.",
  },
};

export function AuthErrorBanner({ code }: { code: string }) {
  const config = ERROR_MESSAGES[code] ?? {
    heading: "Something went wrong",
    body: "An unexpected error occurred. Please try again.",
  };

  return (
    <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-4 py-3 space-y-1">
      <p className="text-sm font-semibold text-red-800">{config.heading}</p>
      <p className="text-sm text-red-700">{config.body}</p>
      {config.action}
    </div>
  );
}

// Usage in a page that receives ?error= from NextAuth:
// const error = searchParams.get("error");
// {error && <AuthErrorBanner code={error} />}
```

---

## 11. Form Security

Apply these attributes to **every** auth input without exception.

| Attribute | Email | Current password | New password | Name/other |
|---|---|---|---|---|
| `spellCheck` | `false` | `false` | `false` | omit |
| `autoCapitalize` | `"off"` | `"off"` | `"off"` | omit |
| `autoComplete` | `"email"` | `"current-password"` | `"new-password"` | `"name"` |
| `autoCorrect` | `"off"` | `"off"` | `"off"` | omit |

**Never block paste.** Disabling paste breaks password managers and is a WCAG failure. If you see `onPaste={(e) => e.preventDefault()}`, remove it.

Reference input for a login password field with all attributes:

```tsx
<input
  type="password"
  autoComplete="current-password"
  autoCapitalize="off"
  autoCorrect="off"
  spellCheck={false}
  // onPaste — do NOT add this
  {...register("password")}
/>
```

Reference input for a new-password field (sign-up / reset):

```tsx
<input
  type="password"
  autoComplete="new-password"
  autoCapitalize="off"
  autoCorrect="off"
  spellCheck={false}
  {...register("password")}
/>
```

Reference input for an email field:

```tsx
<input
  type="email"
  inputMode="email"
  autoComplete="email"
  autoCapitalize="off"
  autoCorrect="off"
  spellCheck={false}
  {...register("email")}
/>
```

---

*Shared `Spinner` component used throughout this file:*

```tsx
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
```

---

## MFA / OTP CODE INPUT

6-digit verification input for TOTP apps, SMS, and email codes.

**Structure** — six separate `<input>` elements in a `role="group"` labeled "Verification code" (one hidden input + styled divs also works, but separate inputs get free caret/selection behavior):
- Each: `inputMode="numeric"` `pattern="[0-9]*"` `maxLength={1}` `autoComplete="one-time-code"` (first input only needs `autoComplete`; it enables iOS/Android SMS auto-fill for the whole group)
- Mobile gets the numeric keyboard automatically from `inputMode="numeric"` — never `type="number"` (spinners, exponent chars)
- Box: 44×52px min, centered text ≥20px, `tabular-nums`

**Behavior:**
- Type digit → auto-focus next box; on the last box, auto-submit if all six filled
- Backspace in empty box → focus previous box and clear it; Backspace in filled box → clear only
- ArrowLeft/ArrowRight move focus; Home/End jump to first/last
- **Paste**: intercept `onPaste` on any box, strip non-digits, distribute across all six from box 1, focus the first empty (or last) box. Never make the user paste six times.
- Select-on-focus (`e.target.select()`) so overtyping replaces

**Error state:** every box gets the error border (`border-[oklch(55%_0.22_25)]`) — never just one box — plus one summary line below linked via `aria-describedby` on the group, `role="alert"`. Clear the error on first new keystroke.

**Resend countdown:** disabled button "Resend code (47s)" counting down from 60; the countdown text lives in an `aria-live="polite"` region that announces at 30s/10s/0s only (announcing every second spams screen readers). At 0s the button enables with plain "Resend code". After resend: confirm via toast or inline text, restart timer.

**Rate-limit copy:** after 3 failed codes, say what happened and when to retry ("Too many attempts. Try again in 5 minutes.") — never a bare "Invalid code" loop. Offer the fallback channel ("Use a backup code" / "Get a call instead") after the second failure.
