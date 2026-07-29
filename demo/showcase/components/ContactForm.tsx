"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/validation";

export interface ContactFormProps {
  onSubmitted?: (values: ContactFormValues) => void;
}

export function ContactForm({ onSubmitted }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    onSubmitted?.(values);
    reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-text-muted">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className="mt-1.5 w-full rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-text-primary outline-none focus-visible:border-accent"
            {...register("name")}
          />
          {errors.name ? (
            <p id="contact-name-error" role="alert" className="mt-1.5 text-sm text-danger">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-text-muted">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className="mt-1.5 w-full rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-text-primary outline-none focus-visible:border-accent"
            {...register("email")}
          />
          {errors.email ? (
            <p id="contact-email-error" role="alert" className="mt-1.5 text-sm text-danger">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="contact-company" className="block text-sm font-medium text-text-muted">
          Company <span className="text-text-faint">(optional)</span>
        </label>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          aria-invalid={errors.company ? "true" : "false"}
          aria-describedby={errors.company ? "contact-company-error" : undefined}
          className="mt-1.5 w-full rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-text-primary outline-none focus-visible:border-accent"
          {...register("company")}
        />
        {errors.company ? (
          <p id="contact-company-error" role="alert" className="mt-1.5 text-sm text-danger">
            {errors.company.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-text-muted">
          What are you trying to measure?
        </label>
        <textarea
          id="contact-message"
          rows={4}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-bg-surface px-3.5 py-2.5 text-text-primary outline-none focus-visible:border-accent"
          {...register("message")}
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className="mt-1.5 text-sm text-danger">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg-base hover:bg-accent-dim disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>

      {isSubmitSuccessful ? (
        <p role="status" className="text-sm text-accent">
          Thanks — someone from the team will reply within one business day.
        </p>
      ) : null}
    </form>
  );
}
