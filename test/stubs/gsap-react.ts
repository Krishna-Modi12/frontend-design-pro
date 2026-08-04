// Runtime stub for `@gsap/react`. See ./README.md for why these exist.
import * as React from 'react';

/**
 * Runs the callback the way the real hook does — inside a layout effect, once.
 * A `useGSAP` that never invokes its callback would silently skip every animation
 * setup block in the golds, and the tests would pass without having exercised the
 * code they exist for.
 */
export const useGSAP = (callback?: () => void | (() => void), _config?: unknown) => {
  React.useLayoutEffect(() => callback?.(), []);
  return { context: { revert: () => {}, kill: () => {} }, contextSafe: <T,>(f: T) => f };
};

export default useGSAP;
