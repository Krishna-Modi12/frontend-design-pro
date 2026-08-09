import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * Deliberately not `output: "export"`. The page fetches `/api/site/overview` on
 * mount, and a static export drops route handlers — the endpoint would 404 and
 * the page would render its error state, which is the one thing a screenshot of
 * it must not show. The route is three lines over a committed fixture; keeping a
 * server is cheaper than teaching the page to live without one.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * This app is nested inside a repo that has its own lockfile, so Next infers
   * the repo root as the workspace root and traces the wrong tree. Pinning it
   * here keeps the build self-contained — and keeps it honest, since the parent
   * repo deliberately installs none of these dependencies.
   */
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
};

export default nextConfig;
