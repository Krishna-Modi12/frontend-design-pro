import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(80, "Keep it under 80 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  company: z
    .string()
    .trim()
    .max(120, "Keep it under 120 characters.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more — at least 20 characters.")
    .max(2000, "Keep it under 2000 characters."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
