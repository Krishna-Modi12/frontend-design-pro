import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * `output: "export"` is opt-in through NEXT_OUTPUT_EXPORT, never the default —
 * copied verbatim from `demo/landing-page/next.config.ts`, for the reason
 * recorded there: `tools/screenshots/lib/next-server.mjs` starts this app with
 * `next start` for the verify/capture harnesses, and `next start` refuses to
 * run at all against an exported build. Making the export unconditional would
 * take down `npm run pages:verify` and `npm run screenshots` together.
 *
 *   npm run build                      → server build; `next start` works
 *   NEXT_OUTPUT_EXPORT=1 npm run build → static export in out/
 */
const isExport = process.env.NEXT_OUTPUT_EXPORT === "1";

/**
 * A project Pages site is served from /<repo>, not from the domain root — this
 * app fills the top level of THAT path (`/frontend-design-pro/`), one level
 * above `demo/showcase` and `demo/landing-page` (`/frontend-design-pro/showcase`,
 * `/frontend-design-pro/landing-page`), not the true domain root. So
 * `pages.yml` sets `NEXT_BASE_PATH` to the bare repo path for this job — the
 * same `$BASE_PATH` the other two exports get, just with no further suffix —
 * and this is empty only in dev and under `next start`, which serve from `/`.
 * An earlier draft of this comment treated "no suffix" as "no prefix" and left
 * `NEXT_BASE_PATH` unset in CI, which would have baked every asset URL as
 * `/_next/...` instead of `/frontend-design-pro/_next/...` — a 200 that
 * renders as unstyled HTML, not a build failure.
 */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * This app is nested inside a repo that has its own lockfile, so Next infers
   * the repo root as the workspace root and traces the wrong tree. Pinning it
   * here keeps the build self-contained, matching every other app under this
   * repo that has its own `package.json`.
   */
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),

  ...(isExport ? { output: "export" as const, images: { unoptimized: true } } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
