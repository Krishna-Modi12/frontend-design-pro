// Runtime stubs for the remaining peer specifiers the gold examples import.
// See the header of `motion-react.tsx` for why these exist and why they are
// not shipped. Each is the smallest thing that lets the component render.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

// ── react-hook-form ──────────────────────────────────────────────────────────
// The golds use `register`, `handleSubmit`, `formState` and `control`. This
// returns a form that submits with empty values — enough to render every
// field, its label association and its error slot, which is what the tests
// assert. It is not a validation engine and does not pretend to be.
export function useForm(_opts?: AnyProps) {
  const [errors] = React.useState<Record<string, { message?: string }>>({});
  return {
    register: (name: string) => ({ name, onChange: () => {}, onBlur: () => {}, ref: () => {} }),
    handleSubmit:
      (fn: (v: AnyProps) => unknown) =>
      (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        return fn({});
      },
    formState: { errors, isSubmitting: false, isValid: true, isDirty: false, touchedFields: {} },
    control: {},
    watch: () => undefined,
    setValue: () => {},
    getValues: () => ({}),
    reset: () => {},
    setError: () => {},
    clearErrors: () => {},
    trigger: () => Promise.resolve(true),
  };
}

export const useFormContext = useForm;
export const FormProvider = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const Controller = ({ render }: { render?: (a: AnyProps) => React.ReactNode }) =>
  React.createElement(
    React.Fragment,
    null,
    render?.({ field: { value: '', onChange: () => {}, onBlur: () => {}, name: '', ref: () => {} }, fieldState: {} }),
  );
export const useFieldArray = () => ({ fields: [], append: () => {}, remove: () => {} });

// ── @hookform/resolvers/zod ──────────────────────────────────────────────────
export const zodResolver = (_schema?: unknown) => () => ({ values: {}, errors: {} });

// ── next-themes ──────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const useTheme = () => ({
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
  themes: ['light', 'dark'],
  systemTheme: 'dark',
});

// ── next/navigation ──────────────────────────────────────────────────────────
export const useRouter = () => ({
  push: () => {}, replace: () => {}, back: () => {}, forward: () => {},
  refresh: () => {}, prefetch: () => {},
});
export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const redirect = () => {};
export const notFound = () => {};

// ── @tanstack/react-virtual ──────────────────────────────────────────────────
// Reports zero virtual items: the container renders, the windowed rows do not.
// Row-level assertions belong to the non-virtualised table golds.
export const useVirtualizer = (_opts?: AnyProps) => ({
  getVirtualItems: () => [] as Array<{ index: number; key: number; start: number; size: number }>,
  getTotalSize: () => 0,
  scrollToIndex: () => {},
  measureElement: () => {},
});
export const useWindowVirtualizer = useVirtualizer;

// ── @tanstack/react-query ────────────────────────────────────────────────────
export class QueryClient { constructor(public config?: AnyProps) {} clear() {} }
export const QueryClientProvider = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const useQuery = (_o?: AnyProps) => ({
  data: undefined, isLoading: false, isPending: false, isError: false, error: null, refetch: () => {},
});
export const useMutation = (_o?: AnyProps) => ({
  mutate: () => {}, mutateAsync: () => Promise.resolve(), isPending: false, isError: false, error: null,
});
export const useQueryClient = () => new QueryClient();
export const useSuspenseQuery = useQuery;

// ── @gsap/react ──────────────────────────────────────────────────────────────
export const useGSAP = (_cb?: unknown, _deps?: unknown) => ({ context: {}, contextSafe: (f: unknown) => f });

// ── @storybook/testing-library ───────────────────────────────────────────────
// Deprecated upstream in favour of `storybook/test`. The gold that imports it
// is a Storybook *play function* demonstration — it is authored to be read,
// and its assertions run in a Storybook runner, not in vitest.
export const within = (el?: unknown) => ({
  getByRole: () => el,
  getByText: () => el,
  getByLabelText: () => el,
  findByRole: () => Promise.resolve(el),
});
export const userEvent = {
  click: () => Promise.resolve(),
  type: () => Promise.resolve(),
  tab: () => Promise.resolve(),
  hover: () => Promise.resolve(),
  keyboard: () => Promise.resolve(),
};
export const expect = (_v?: unknown) => ({
  toBeInTheDocument: () => {}, toHaveTextContent: () => {}, toBeVisible: () => {},
});
