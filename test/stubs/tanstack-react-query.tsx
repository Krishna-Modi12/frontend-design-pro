// Runtime stub for `@tanstack/react-query`. See ./README.md for why these exist.
//
// This one actually runs `queryFn`. A stub returning `{ data: undefined,
// isLoading: false }` puts a component into its success branch with nothing to
// render, and `good-tanstack` crashed on `post.title` — the stub reported a state
// no real query client can produce. Starting pending and settling when the promise
// settles is both simpler and honest: the loading branch renders first, exactly as
// it would against a real server, so a test that wants loaded content must wait
// for it.
import * as React from 'react';

type AnyProps = Record<string, unknown>;
type QueryFn = (ctx: AnyProps) => unknown;

export class QueryClient {
  constructor(public config?: AnyProps) {}
  invalidateQueries() { return Promise.resolve(); }
  cancelQueries() { return Promise.resolve(); }
  setQueryData() {}
  getQueryData() { return undefined; }
  removeQueries() {}
  clear() {}
}

export const QueryClientProvider = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

interface State { data: unknown; isLoading: boolean; isError: boolean; error: unknown }

function useSettled(queryFn: QueryFn | undefined, ctx: AnyProps, shape: (d: unknown) => unknown) {
  const [state, setState] = React.useState<State>({
    data: undefined, isLoading: true, isError: false, error: null,
  });
  React.useEffect(() => {
    let live = true;
    Promise.resolve()
      .then(() => queryFn?.(ctx))
      .then(
        (data) => { if (live) setState({ data: shape(data), isLoading: false, isError: false, error: null }); },
        (error) => { if (live) setState({ data: undefined, isLoading: false, isError: true, error }); },
      );
    return () => { live = false; };
    // Deliberately once: refetch-on-key-change is behaviour no gold asserts.
  }, []);
  return state;
}

export function useQuery(options?: AnyProps) {
  const s = useSettled(options?.queryFn as QueryFn | undefined, { queryKey: options?.queryKey }, (d) => d);
  return {
    ...s,
    isPending: s.isLoading,
    isFetching: s.isLoading,
    isSuccess: !s.isLoading && !s.isError,
    status: s.isLoading ? 'pending' : s.isError ? 'error' : 'success',
    refetch: () => Promise.resolve(s),
  };
}

export function useSuspenseQuery(options?: AnyProps) {
  return useQuery(options);
}

export function useInfiniteQuery(options?: AnyProps) {
  // One page. `fetchNextPage` is a no-op because the sentinel that would call it
  // needs IntersectionObserver to fire, and jsdom's has no viewport to intersect.
  const s = useSettled(
    options?.queryFn as QueryFn | undefined,
    { pageParam: options?.initialPageParam ?? 0 },
    (page) => ({ pages: page === undefined ? [] : [page], pageParams: [options?.initialPageParam ?? 0] }),
  );
  return {
    ...s,
    data: s.data ?? { pages: [], pageParams: [] },
    isPending: s.isLoading,
    isFetching: s.isLoading,
    isSuccess: !s.isLoading && !s.isError,
    fetchNextPage: () => Promise.resolve(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: () => Promise.resolve(s),
  };
}

export function useMutation(options?: AnyProps) {
  const mutationFn = options?.mutationFn as ((v: unknown) => unknown) | undefined;
  const mutate = (vars?: unknown) => { void Promise.resolve().then(() => mutationFn?.(vars)); };
  return {
    mutate,
    mutateAsync: (vars?: unknown) => Promise.resolve().then(() => mutationFn?.(vars)),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    reset: () => {},
  };
}

const sharedClient = new QueryClient();
export const useQueryClient = () => sharedClient;
