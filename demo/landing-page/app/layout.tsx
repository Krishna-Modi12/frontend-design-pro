import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/**
 * `geist` rather than `next/font/google`. Both self-host, but the Google loader
 * reaches out to fonts.googleapis.com at build time — and this app is built
 * three times in CI by the screenshot and verify harnesses, on runners where a
 * cold font fetch is one more thing that can fail for reasons unrelated to the
 * page. The package ships the files.
 */
export const metadata: Metadata = {
  title: "frontend-design-pro — AI Skill Pack for Production UI",
  description:
    "2,002-token router. 19 skills. 333k tokens of depth. Machine-enforced anti-slop rules.",
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-surface-page text-ink antialiased">{children}</body>
    </html>
  );
}
