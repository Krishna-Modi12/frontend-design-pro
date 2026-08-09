import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * Deliberately not `output: "export"`.
 *
 * Two things break under a static export, and the second one is the expensive
 * one. The metric strip reads `/api/site/overview` on mount, and an export drops
 * route handlers — the endpoint would 404 and the page would render its error
 * state permanently. Worse, `tools/screenshots/lib/next-server.mjs` starts every
 * demo with `next start`, which refuses to run at all against an exported build:
 * an export would take `npm run screenshots` and `npm run demos:verify` down
 * with it, and those are the only two checks in this repo that render anything.
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
