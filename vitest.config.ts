import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const stub = (p: string) => fileURLToPath(new URL(`./test/stubs/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Gold examples import ~25 peer libraries this repo deliberately does not
    // install — the pack ships no runtime. `skills/*/examples/_stubs.d.ts`
    // satisfies `tsc`, but declaration files do not exist at runtime, so Vite
    // could not resolve these specifiers and 29 of 39 test files failed to load
    // before running a single assertion.
    //
    // Each specifier gets its OWN module under `test/stubs/`. Sharing one file
    // across several specifiers looks tidier and breaks three ways — a module has
    // only one `default` export, a namespace import reads every name in the file,
    // and `vi.mock` keys on the resolved path. `test/stubs/README.md` has the
    // detail and the failures that forced each rule.
    //
    // Test-only: `build_release.py` ships core/, skills/, scripts/, evals/,
    // rules/, install/ and four root files. `test/` and this config are in none
    // of them.
    //
    // Order matters for string patterns: each matches the specifier exactly or as
    // a path prefix, so `gsap/ScrollTrigger` has to precede `gsap`.
    alias: [
      // Project-local shadcn paths. One module for the whole `ui/` namespace — it
      // is one logical package, split across files only by convention.
      { find: /^@\/components\/ui\/.*$/, replacement: stub('shadcn.tsx') },
      { find: '@/components', replacement: stub('shadcn.tsx') },
      { find: '@/lib/utils', replacement: stub('shadcn.tsx') },

      // `framer-motion` is the same package under its former name.
      { find: 'motion/react', replacement: stub('motion-react.tsx') },
      { find: 'framer-motion', replacement: stub('motion-react.tsx') },

      { find: '@react-three/fiber', replacement: stub('react-three-fiber.tsx') },
      { find: '@react-three/drei', replacement: stub('react-three-drei.tsx') },
      { find: 'three', replacement: stub('three.ts') },

      { find: 'gsap/ScrollTrigger', replacement: stub('gsap-scrolltrigger.ts') },
      { find: 'gsap/SplitText', replacement: stub('gsap-splittext.ts') },
      { find: '@gsap/react', replacement: stub('gsap-react.ts') },
      { find: 'gsap', replacement: stub('gsap.ts') },

      { find: 'react-native-gesture-handler', replacement: stub('react-native-gesture-handler.tsx') },
      { find: 'react-native-reanimated', replacement: stub('react-native-reanimated.ts') },
      { find: 'react-native', replacement: stub('react-native.tsx') },

      { find: '@hookform/resolvers/zod', replacement: stub('hookform-resolvers-zod.ts') },
      { find: 'react-hook-form', replacement: stub('react-hook-form.tsx') },
      { find: 'zod', replacement: stub('zod.ts') },

      { find: '@tanstack/react-table', replacement: stub('tanstack-react-table.tsx') },
      { find: '@tanstack/react-query', replacement: stub('tanstack-react-query.tsx') },
      { find: '@tanstack/react-virtual', replacement: stub('tanstack-react-virtual.ts') },

      { find: 'next-themes', replacement: stub('next-themes.tsx') },
      { find: 'next/navigation', replacement: stub('next-navigation.ts') },

      { find: 'lucide-react', replacement: stub('lucide-react.tsx') },
      { find: 'recharts', replacement: stub('recharts.tsx') },
      { find: 'vaul', replacement: stub('vaul.tsx') },
      { find: '@stripe/react-stripe-js', replacement: stub('stripe-react.tsx') },
      { find: '@splinetool/react-spline', replacement: stub('spline.tsx') },
      { find: '@ai-sdk/react', replacement: stub('ai-react.ts') },
      { find: 'storybook/test', replacement: stub('storybook-test.ts') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['skills/*/examples/**/*.test.tsx'],
    // One jsdom environment per worker is expensive; an unbounded pool spawns one
    // per test file. Capped so the run has a predictable memory ceiling on a
    // developer machine rather than one that scales with the example count.
    poolOptions: {
      threads: { minThreads: 1, maxThreads: 4 },
      forks: { minForks: 1, maxForks: 4 },
    },
  },
});
