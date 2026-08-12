import type { NextConfig } from "next";

/**
 * `output: "export"` is opt-in through NEXT_OUTPUT_EXPORT, not the default.
 *
 * GitHub Pages needs a static export. Nothing else here does, and making the
 * export unconditional would break the two checks that matter most:
 * `tools/screenshots/lib/next-server.mjs` starts every demo with `next start`,
 * which refuses to run at all against an exported build, so `npm run
 * screenshots` and `npm run demos:verify` would both go down with it — and
 * those are the only checks in this repo that render anything. Same reasoning
 * that keeps demo/landing-page on a server build; see its next.config.ts.
 *
 * The cost of that split is real: Gate 9 builds the server output while Pages
 * ships the export, so the thing users actually load is not the thing the gate
 * checked. `.github/workflows/pages.yml` is what closes it — it asserts the
 * export produced HTML and that the asset URLs carry the base path, which is
 * precisely the failure this file can cause and Gate 9 cannot see.
 */
const isExport = process.env.NEXT_OUTPUT_EXPORT === "1";

/**
 * A project Pages site is served from /<repo>, not from the root, and Next
 * bakes asset URLs in at build time — so the prefix has to be known now, not
 * resolved in the browser. Empty everywhere else: `next dev` and Gate 9 both
 * serve from the root, and a stray prefix would break them instead.
 */
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export" as const,
        // An export has no server to optimize on demand. Nothing here uses
        // next/image today, so this changes nothing yet — it is here so that
        // adding one later fails in review rather than at deploy time.
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
