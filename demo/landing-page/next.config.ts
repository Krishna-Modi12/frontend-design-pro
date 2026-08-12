import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * `output: "export"` is opt-in through NEXT_OUTPUT_EXPORT, not the default.
 *
 * This file used to say there was no static export at all. Two things stood in
 * the way and only one of them was ever permanent:
 *
 *   - The metric strip reads `/api/site/overview` on mount, and an export drops
 *     dynamic route handlers — the endpoint would 404 and the page would render
 *     its error state forever. Solved: the handler is `force-static`, so Next
 *     evaluates it at build time and writes the response into the output.
 *   - `tools/screenshots/lib/next-server.mjs` starts every demo with
 *     `next start`, which refuses to run at all against an exported build. That
 *     one is permanent, and it is why the export is opt-in rather than default:
 *     `npm run screenshots` and `npm run demos:verify` are the only checks in
 *     this repo that render anything, and an unconditional export takes both
 *     down.
 *
 * So: `next dev`, `next start` and the harnesses all keep the server build they
 * need, and only the Pages workflow asks for the export.
 */
const isExport = process.env.NEXT_OUTPUT_EXPORT === "1";

/**
 * A project Pages site is served from /<repo>, and Next bakes asset URLs in at
 * build time. Empty in dev and under `next start`, which serve from the root.
 */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * This app is nested inside a repo that has its own lockfile, so Next infers
   * the repo root as the workspace root and traces the wrong tree. Pinning it
   * here keeps the build self-contained — and keeps it honest, since the parent
   * repo deliberately installs none of these dependencies.
   */
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),

  ...(isExport ? { output: "export" as const, images: { unoptimized: true } } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
