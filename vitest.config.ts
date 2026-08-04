import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const stub = (p: string) => fileURLToPath(new URL(`./test/stubs/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Gold examples import peer libraries this repo deliberately does not
    // install — the pack ships no runtime. `skills/*/examples/_stubs.d.ts`
    // satisfies `tsc`, but declaration files do not exist at runtime, so Vite
    // could not resolve these specifiers and 29 of 39 test files failed to
    // load before running a single assertion.
    //
    // These aliases point each specifier at a small real module under
    // `test/stubs/`. They are test-only: `build_release.py` ships core/,
    // skills/, scripts/, evals/, rules/ and four root files — `test/` and this
    // config are in none of them.
    alias: [
      // Project-local shadcn paths — resolved before the bare specifiers so
      // `@/components/ui/anything` lands on the primitives stub.
      { find: /^@\/components\/ui\/.*$/, replacement: stub('shadcn.tsx') },
      { find: '@/lib/utils', replacement: stub('shadcn.tsx') },

      { find: 'motion/react', replacement: stub('motion-react.tsx') },
      { find: 'framer-motion', replacement: stub('motion-react.tsx') },

      { find: '@react-three/fiber', replacement: stub('react-three.tsx') },
      { find: '@react-three/drei', replacement: stub('react-three.tsx') },
      { find: 'three', replacement: stub('three.ts') },

      { find: 'react-native-gesture-handler', replacement: stub('vendor.tsx') },
      { find: 'react-native-reanimated', replacement: stub('vendor.tsx') },
      { find: 'react-native', replacement: stub('react-native.tsx') },

      { find: 'react-hook-form', replacement: stub('misc.tsx') },
      { find: '@hookform/resolvers/zod', replacement: stub('misc.tsx') },
      { find: 'next-themes', replacement: stub('misc.tsx') },
      { find: 'next/navigation', replacement: stub('misc.tsx') },
      { find: '@tanstack/react-virtual', replacement: stub('misc.tsx') },
      { find: '@tanstack/react-query', replacement: stub('misc.tsx') },
      { find: '@gsap/react', replacement: stub('misc.tsx') },
      { find: '@storybook/testing-library', replacement: stub('misc.tsx') },

      { find: 'zod', replacement: stub('zod.ts') },
      { find: 'lucide-react', replacement: stub('vendor.tsx') },
      { find: 'recharts', replacement: stub('vendor.tsx') },
      { find: '@tanstack/react-table', replacement: stub('vendor.tsx') },
      { find: 'gsap/ScrollTrigger', replacement: stub('vendor.tsx') },
      { find: 'gsap/SplitText', replacement: stub('vendor.tsx') },
      { find: 'gsap', replacement: stub('vendor.tsx') },
      { find: 'vaul', replacement: stub('vendor.tsx') },
      { find: '@stripe/react-stripe-js', replacement: stub('vendor.tsx') },
      { find: '@splinetool/react-spline', replacement: stub('vendor.tsx') },
      { find: 'ai/react', replacement: stub('vendor.tsx') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['skills/*/examples/**/*.test.tsx'],
    // One jsdom environment per worker is expensive. Unbounded, 39 of them
    // exhaust memory on a 16 GB machine and the pool starts reporting
    // "Worker exited unexpectedly" — a resource failure that reads exactly
    // like a component crash and sends you debugging the wrong thing.
    poolOptions: {
      threads: { minThreads: 1, maxThreads: 4 },
      forks: { minForks: 1, maxForks: 4 },
    },
  },
});
