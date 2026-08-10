/**
 * Tailwind v4. The PostCSS plugin moved out of the `tailwindcss` package in v4 —
 * naming `tailwindcss` here instead of `@tailwindcss/postcss` fails the build
 * outright. There is no `autoprefixer` entry either: v4 prefixes through
 * Lightning CSS, so adding one is a second pass over work already done.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
