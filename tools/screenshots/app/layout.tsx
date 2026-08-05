import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "frontend-design-pro — demo capture harness",
};

/**
 * Deliberately almost empty. Every demo page owns its own shell — surface colour,
 * type face, skip link, landmarks — so anything added here would show up in a
 * screenshot as something the demo did not actually produce.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
