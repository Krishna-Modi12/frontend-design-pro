import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/**
 * Geist self-hosts, which is the property that matters here:
 * `next/font/google` reaches out to fonts.googleapis.com at build time, and
 * this app is built repeatedly in CI (the Pages deploy, the screenshot
 * harness, the verify harness) on runners where a cold font fetch is one more
 * thing that can fail for reasons unrelated to the page. `demo/landing-page`
 * made the same call for the same reason.
 */
export const metadata: Metadata = {
  title: "frontend-design-pro — the design rules an AI agent actually follows",
  description:
    "A skill pack an AI coding agent loads while it writes frontend code. It routes one of 19 skills per request, holds the output to 60 machine-checked constraints, and ships only when all 11 gates pass. Route a request and run the checks in your browser.",
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-bg-page text-text-primary antialiased">{children}</body>
    </html>
  );
}
