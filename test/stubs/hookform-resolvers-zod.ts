// Runtime stub for `@hookform/resolvers/zod`. See ./README.md for why these exist.
// Its own module rather than part of `react-hook-form.tsx`: they are separate
// specifiers, and one file serving both makes their `vi.mock` factories collide.

export const zodResolver = (_schema?: unknown, _schemaOptions?: unknown) =>
  async (values: Record<string, unknown>) => ({ values, errors: {} });

export default zodResolver;
