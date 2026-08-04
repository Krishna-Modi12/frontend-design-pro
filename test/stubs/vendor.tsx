// Runtime stubs for the remaining uninstalled peer libraries.
// See `motion-react.tsx` for why these exist and why they are not shipped.
import * as React from 'react';

type AnyProps = Record<string, unknown>;
const el = (tag: string, extra: AnyProps = {}) => ({ children, ...rest }: AnyProps) =>
  React.createElement(tag, { ...extra, ...rest }, children as React.ReactNode);
const nul = (_p?: AnyProps) => null;

// ── zod ──────────────────────────────────────────────────────────────────────
// A chainable schema builder that validates nothing. The golds use zod to
// declare shape and error copy; the tests assert that the form renders and
// that error slots exist, not that validation logic is correct — that is zod's
// own test suite's job, not this pack's.
type Schema = Record<string, unknown> & { parse: (v: unknown) => unknown };
function makeSchema(): Schema {
  const s = {} as Schema;
  const chain = () => s;
  for (const k of [
    'min', 'max', 'length', 'email', 'url', 'uuid', 'regex', 'optional', 'nullable',
    'default', 'trim', 'toLowerCase', 'positive', 'nonnegative', 'int', 'gte', 'lte',
    'refine', 'superRefine', 'transform', 'describe', 'catch', 'brand', 'readonly', 'nonempty',
  ]) {
    (s as Record<string, unknown>)[k] = chain;
  }
  s.parse = (v: unknown) => v;
  (s as Record<string, unknown>).safeParse = (v: unknown) => ({ success: true, data: v });
  (s as Record<string, unknown>).parseAsync = (v: unknown) => Promise.resolve(v);
  (s as Record<string, unknown>).shape = {};
  (s as Record<string, unknown>).extend = chain;
  (s as Record<string, unknown>).merge = chain;
  (s as Record<string, unknown>).pick = chain;
  (s as Record<string, unknown>).omit = chain;
  (s as Record<string, unknown>).partial = chain;
  return s;
}
export const z = {
  string: makeSchema, number: makeSchema, boolean: makeSchema, date: makeSchema,
  object: makeSchema, array: makeSchema, enum: makeSchema, nativeEnum: makeSchema,
  union: makeSchema, literal: makeSchema, coerce: { number: makeSchema, date: makeSchema },
  any: makeSchema, unknown: makeSchema, record: makeSchema, tuple: makeSchema,
  optional: makeSchema, instanceof: makeSchema,
};

// ── lucide-react ─────────────────────────────────────────────────────────────
// Icons render as an aria-hidden <svg>, which is what the pack's own
// iconography rules require of decorative icons.
const icon = (name: string) => {
  const C = (props: AnyProps) =>
    React.createElement('svg', { 'aria-hidden': 'true', 'data-icon': name, ...props });
  C.displayName = name;
  return C;
};
export const Bell = icon('Bell');
export const Check = icon('Check');
export const ChevronDown = icon('ChevronDown');
export const ChevronUp = icon('ChevronUp');
export const ChevronsUpDown = icon('ChevronsUpDown');
export const Loader2 = icon('Loader2');
export const Monitor = icon('Monitor');
export const Moon = icon('Moon');
export const MoreHorizontal = icon('MoreHorizontal');
export const Plus = icon('Plus');
export const Search = icon('Search');
export const Settings = icon('Settings');
export const Sun = icon('Sun');
export const Trash2 = icon('Trash2');
export const TrendingDown = icon('TrendingDown');
export const TrendingUp = icon('TrendingUp');
export const Users = icon('Users');

// ── recharts ─────────────────────────────────────────────────────────────────
// Charts measure their container, which jsdom reports as 0×0, so recharts
// renders nothing even when installed. Rendering a labelled placeholder is
// more honest than pretending an SVG chart exists.
export const ResponsiveContainer = ({ children }: AnyProps) =>
  React.createElement('div', { 'data-testid': 'chart' }, children as React.ReactNode);
export const AreaChart = el('div');
export const Area = nul;
export const CartesianGrid = nul;
export const XAxis = nul;
export const YAxis = nul;
export const Tooltip = nul;
export const Legend = nul;
export const Line = nul;
export const LineChart = el('div');
export const Bar = nul;
export const BarChart = el('div');

// ── @tanstack/react-table ────────────────────────────────────────────────────
export const flexRender = (c: unknown, props: AnyProps) =>
  typeof c === 'function' ? React.createElement(c as React.ComponentType<AnyProps>, props) : (c as React.ReactNode);
export const getCoreRowModel = () => () => ({ rows: [] });
export const getSortedRowModel = () => () => ({ rows: [] });
export const getFilteredRowModel = () => () => ({ rows: [] });
export const getPaginationRowModel = () => () => ({ rows: [] });
export const useReactTable = (opts: AnyProps) => {
  const data = (opts?.data as unknown[]) ?? [];
  const columns = (opts?.columns as AnyProps[]) ?? [];
  const headers = columns.map((c, i) => ({
    id: String(c.id ?? c.accessorKey ?? i),
    isPlaceholder: false,
    column: { columnDef: c, getCanSort: () => false, getIsSorted: () => false, toggleSorting: () => {}, getToggleSortingHandler: () => () => {} },
    getContext: () => ({}),
  }));
  return {
    getHeaderGroups: () => [{ id: 'hg', headers }],
    getRowModel: () => ({
      rows: data.map((row, i) => ({
        id: String(i),
        original: row,
        getIsSelected: () => false,
        getVisibleCells: () =>
          columns.map((c, j) => ({
            id: `${i}-${j}`,
            column: { columnDef: c },
            getContext: () => ({ row: { original: row, getValue: (k: string) => (row as AnyProps)?.[k] } }),
          })),
      })),
    }),
    getState: () => ({ sorting: [], pagination: { pageIndex: 0, pageSize: 10 } }),
    setPageIndex: () => {}, nextPage: () => {}, previousPage: () => {},
    getCanNextPage: () => false, getCanPreviousPage: () => false, getPageCount: () => 1,
  };
};

// ── gsap ─────────────────────────────────────────────────────────────────────
const tween = { kill: () => {}, play: () => {}, pause: () => {}, progress: () => 0, revert: () => {} };
const gsapObj = {
  to: () => tween, from: () => tween, fromTo: () => tween, set: () => tween,
  timeline: () => ({ to: () => gsapObj.timeline(), from: () => gsapObj.timeline(), fromTo: () => gsapObj.timeline(), add: () => gsapObj.timeline(), kill: () => {}, revert: () => {} }),
  registerPlugin: () => {}, context: (fn?: () => void) => { fn?.(); return { revert: () => {}, kill: () => {} }; },
  utils: { toArray: (v: unknown) => (Array.isArray(v) ? v : []), clamp: () => 0 },
  killTweensOf: () => {}, matchMedia: () => ({ add: () => {}, revert: () => {} }),
};
export const gsap = gsapObj;
export default gsapObj;
export const ScrollTrigger = { create: () => ({ kill: () => {} }), refresh: () => {}, killAll: () => {}, getAll: () => [] as unknown[], register: () => {} };
export const SplitText = class { chars: unknown[] = []; words: unknown[] = []; lines: unknown[] = []; revert() {} };

// ── vaul ─────────────────────────────────────────────────────────────────────
const Root = ({ children }: AnyProps) => React.createElement(React.Fragment, null, children as React.ReactNode);
export const Drawer = Object.assign(Root, {
  Root,
  Trigger: ({ children, ...r }: AnyProps) => React.createElement('button', { type: 'button', ...r }, children as React.ReactNode),
  Portal: Root,
  Overlay: el('div'),
  Content: ({ children, ...r }: AnyProps) => React.createElement('div', { role: 'dialog', ...r }, children as React.ReactNode),
  Title: el('h2'),
  Description: el('p'),
  Close: ({ children, ...r }: AnyProps) => React.createElement('button', { type: 'button', ...r }, children as React.ReactNode),
});

// ── @stripe/react-stripe-js ──────────────────────────────────────────────────
export const Elements = ({ children }: AnyProps) => React.createElement(React.Fragment, null, children as React.ReactNode);
export const PaymentElement = () => React.createElement('div', { 'data-testid': 'payment-element' });
export const useStripe = () => ({ confirmPayment: () => Promise.resolve({ error: undefined }) });
export const useElements = () => ({ getElement: () => null, submit: () => Promise.resolve({ error: undefined }) });

// ── react-native-reanimated / gesture-handler ────────────────────────────────
export const useSharedValue = (v: unknown) => ({ value: v });
export const useAnimatedStyle = (fn: () => AnyProps) => { try { return fn(); } catch { return {}; } };
export const withSpring = (v: unknown) => v;
export const withTiming = (v: unknown) => v;
export const Gesture = {
  Pan: () => ({ onUpdate: () => Gesture.Pan(), onEnd: () => Gesture.Pan(), onBegin: () => Gesture.Pan() }),
  Tap: () => ({ onEnd: () => Gesture.Tap() }),
  Simultaneous: () => ({}),
};
export const GestureDetector = ({ children }: AnyProps) => React.createElement(React.Fragment, null, children as React.ReactNode);

// ── @splinetool/react-spline / ai/react ──────────────────────────────────────
export const Spline = (props: AnyProps) => React.createElement('div', { 'data-testid': 'spline', ...props });
export const useChat = () => ({
  messages: [] as unknown[], input: '', handleInputChange: () => {}, handleSubmit: () => {},
  isLoading: false, error: undefined, append: () => Promise.resolve(null), stop: () => {},
});
