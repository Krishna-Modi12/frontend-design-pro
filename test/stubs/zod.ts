// Runtime stub for `zod`. See ./README.md for why these exist.
//
// Zod is imported three different ways across the golds — `import { z }`,
// `import * as z`, and occasionally a default — so this exports the builders
// at the top level (satisfying the namespace form), collects them into a `z`
// object (the named form), and default-exports the same object.
//
// It validates nothing. The golds use zod to declare shape and error copy;
// the tests assert that fields render with their labels and error slots, not
// that validation is correct — that is zod's own test suite's job.

type Schema = Record<string, unknown>;

function makeSchema(): Schema {
  const s: Schema = {};
  const chain = () => s;
  for (const k of [
    'min', 'max', 'length', 'email', 'url', 'uuid', 'regex', 'optional', 'nullable',
    'nullish', 'default', 'trim', 'toLowerCase', 'positive', 'nonnegative', 'int',
    'gt', 'gte', 'lt', 'lte', 'refine', 'superRefine', 'transform', 'describe',
    'catch', 'brand', 'readonly', 'nonempty', 'extend', 'merge', 'pick', 'omit',
    'partial', 'required', 'array', 'or', 'and', 'pipe', 'startsWith', 'endsWith',
    'includes', 'datetime', 'finite', 'safe', 'multipleOf', 'step',
  ]) {
    s[k] = chain;
  }
  s.parse = (v: unknown) => v;
  s.parseAsync = (v: unknown) => Promise.resolve(v);
  s.safeParse = (v: unknown) => ({ success: true, data: v });
  s.safeParseAsync = (v: unknown) => Promise.resolve({ success: true, data: v });
  s.shape = {};
  s._def = {};
  return s;
}

export const string = makeSchema;
export const number = makeSchema;
export const boolean = makeSchema;
export const date = makeSchema;
export const bigint = makeSchema;
export const symbol = makeSchema;
export const object = makeSchema;
export const array = makeSchema;
export const tuple = makeSchema;
export const record = makeSchema;
export const map = makeSchema;
export const set = makeSchema;
export const union = makeSchema;
export const discriminatedUnion = makeSchema;
export const intersection = makeSchema;
export const literal = makeSchema;
export const nativeEnum = makeSchema;
export const optional = makeSchema;
export const nullable = makeSchema;
export const any = makeSchema;
export const unknown = makeSchema;
export const never = makeSchema;
export const voidType = makeSchema;
export const instanceOf = makeSchema;
export const custom = makeSchema;
export const preprocess = makeSchema;
export const lazy = makeSchema;
const enumFn = makeSchema;
export { enumFn as enum };
export const coerce = { string: makeSchema, number: makeSchema, boolean: makeSchema, date: makeSchema, bigint: makeSchema };

export const z = {
  string, number, boolean, date, bigint, symbol, object, array, tuple, record,
  map, set, union, discriminatedUnion, intersection, literal, nativeEnum,
  optional, nullable, any, unknown, never, instanceof: instanceOf, custom,
  preprocess, lazy, enum: enumFn, coerce, void: voidType,
};

export default z;

// `z.infer<typeof schema>` appears in the golds as a type position only; the
// runtime never sees it, so no runtime counterpart is needed here.
