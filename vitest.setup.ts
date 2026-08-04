// Registers @testing-library/jest-dom's matchers (toHaveAttribute, toHaveValue,
// toBeInTheDocument, …) on vitest's expect. Without this every gold test that
// asserts on the DOM fails with "Invalid Chai property".
import '@testing-library/jest-dom/vitest';

// jsdom implements no layout, so these are absent. Components that scroll a
// ref into view or observe intersection are not doing anything wrong — the
// environment simply has no such API, and without these the call throws
// mid-render and fails an otherwise correct component.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
if (!(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver) {
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}
if (!(globalThis as { ResizeObserver?: unknown }).ResizeObserver) {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
