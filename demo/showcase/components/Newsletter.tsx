"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterFormValues } from "@/lib/validation";

export interface NewsletterProps {
  onSubscribed?: (values: NewsletterFormValues) => void;
}

export function Newsletter({ onSubscribed }: NewsletterProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    onSubscribed?.(values);
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "newsletter-email-error" : undefined}
          className="w-full rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-text-primary outline-none focus-visible:border-accent"
          {...register("email")}
        />
        {errors.email ? (
          <p id="newsletter-email-error" role="alert" className="mt-1.5 text-sm text-danger">
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg-base hover:bg-accent-dim disabled:opacity-60"
      >
        {isSubmitSuccessful ? "Subscribed" : isSubmitting ? "Joining…" : "Subscribe"}
      </button>
    </form>
  );
}
