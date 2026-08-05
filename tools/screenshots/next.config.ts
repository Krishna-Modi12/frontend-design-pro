import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

/**
 * The demos live outside this directory and are imported in place — never copied,
 * so a capture can never be taken against a stale duplicate. That puts the repo
 * root inside the module graph, which is what `outputFileTracingRoot` has to say.
 */
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

const harnessModules = fileURLToPath(new URL("./node_modules", import.meta.url));

const config: NextConfig = {
  outputFileTracingRoot: repoRoot,

  /**
   * The demos are imported where they live, so webpack resolves their bare
   * specifiers (`zod`, `lucide-react`, `recharts`, `@hookform/resolvers/zod`)
   * from `demo/`'s location — walking up to a repo root that deliberately
   * installs none of them. Adding this package's node_modules as a fallback
   * lets them find the real libraries without being copied in here, which is
   * what keeps a capture honest: there is only ever one copy of each demo.
   *
   * It is appended, not prepended, and the order is load-bearing. Putting it
   * first shadows Next's own resolution of `react` in development, and the dev
   * server then dies inside RootLayout with "Cannot read properties of
   * undefined (reading 'recentlyCreatedOwnerStacks')" — React's owner-stack
   * machinery, which only exists in dev, which is why production builds looked
   * fine throughout. Appended, normal node resolution wins wherever it can
   * succeed, and the fallback only answers for files that have no node_modules
   * above them at all.
   */
  webpack: (webpackConfig) => {
    const existing = webpackConfig.resolve.modules ?? ["node_modules"];
    webpackConfig.resolve.modules = [...existing, harnessModules];
    return webpackConfig;
  },

  // StrictMode double-invokes effects in development. Harmless for correctness,
  // but it doubles the simulated fetches the demos run on mount and makes the
  // "has it settled yet" question during capture needlessly murky.
  reactStrictMode: false,

  // The dev-tools badge renders bottom-left and would land in every image.
  // Captures run against a production build as well, which is belt and braces.
  devIndicators: false,

  // Type checking here would be misleading: `tsc -p demo/tsconfig.json` already
  // checks the demos against `demo/_stubs.d.ts`, and `npm run demos:typecheck`
  // checks them against real vendor typings, which is the stricter of the two.
  // This build exists to produce pixels.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default config;
