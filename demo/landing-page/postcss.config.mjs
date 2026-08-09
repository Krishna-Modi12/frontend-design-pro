/**
 * Tailwind v4. The plugin moved out of the `tailwindcss` package in v4 — naming
 * `tailwindcss` here instead of `@tailwindcss/postcss` fails the build outright.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
