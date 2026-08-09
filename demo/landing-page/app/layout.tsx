import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * `tokens.css` asks for the families by their literal names ("Geist", "Geist
 * Mono"), which only resolve if something has actually loaded them. The
 * screenshot harness did that with a Google Fonts `@import`; self-hosting them
 * here means the page renders the same typeface with no network request, and no
 * flash of the fallback stack while one is in flight.
 *
 * `globals.css` is what bridges the two — it maps `--font-display` and
 * `--font-mono` onto these variables.
 */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tracepoint — durable execution for the handlers you already wrote",
  description:
    "Tracepoint checkpoints every step of a workflow to an append-only log, so a worker that dies mid-charge resumes on the next line instead of the first one.",
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* The page shell owns body colour and margin — it injects `tokenStyles`
          from lib/tokens.ts, which is also what dashboard and auth-form do. */}
      <body>{children}</body>
    </html>
  );
}
