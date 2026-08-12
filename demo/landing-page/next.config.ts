import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * `output: "export"` is opt-in through NEXT_OUTPUT_EXPORT, never the default.
 *
 * The brief asks for a static export, and a static export is available — but it
 * cannot be the default, for one reason that is not going away:
 * `tools/screenshots/lib/next-server.mjs` starts every demo with `next start`,
 * and `next start` refuses to run at all against an exported build. Making the
 * export unconditional takes down `npm run screenshots` and `npm run
 * demos:verify` together, and those are the only two checks in this repo that
 * render anything. Every other gate reads source.
 *
 * The metric strip's route handler is `force-static`, so Next evaluates it at
 * build time and writes the response into the output — the endpoint survives
 * the export rather than 404-ing the page into its error state forever.
 *
 *   npm run build                      → server build; `next start` works
 *   NEXT_OUTPUT_EXPORT=1 npm run build → static export in out/
 */
const isExport = process.env.NEXT_OUTPUT_EXPORT === "1";

/**
 * A project Pages site is served from /<repo>, and Next bakes asset URLs in at
 * build time. Empty in dev and under `next start`, which serve from the root.
 *
 * Two variables, deliberately, and the workflow sets both to the same value.
 * `basePath` rewrites links and assets but does **not** rewrite a raw `fetch`,
 * so the metric strip has to prefix its own request — and a client component
 * can only read an env var that survives into the bundle, which means the
 * `NEXT_PUBLIC_` prefix. This file is server-side and takes the private name.
 * See `app/page.tsx`.
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
