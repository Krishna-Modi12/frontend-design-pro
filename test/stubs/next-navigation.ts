// Runtime stub for `next/navigation`. See ./README.md for why these exist.
// There is no router in jsdom; navigation is recorded nowhere and asserted by
// nothing. These exist so a component that calls `useRouter()` at the top of its
// body can render at all.

export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
});

export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const redirect = () => {};
export const permanentRedirect = () => {};
export const notFound = () => {};
