// Runtime stub for `@tanstack/react-virtual`. See ./README.md for why these exist.
//
// Reports zero virtual items. Virtualisation is a function of measured element
// heights, and jsdom measures every element as zero — a real virtualizer would
// also render nothing here. The scroll container renders; the windowed rows do
// not, and row-level assertions belong to the non-virtualised table golds.

interface VirtualItem { index: number; key: number; start: number; size: number; end: number }

export const useVirtualizer = (_opts?: Record<string, unknown>) => ({
  getVirtualItems: () => [] as VirtualItem[],
  getTotalSize: () => 0,
  scrollToIndex: () => {},
  scrollToOffset: () => {},
  measureElement: () => {},
  measure: () => {},
});

export const useWindowVirtualizer = useVirtualizer;
export const defaultRangeExtractor = () => [] as number[];
