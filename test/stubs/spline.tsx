// Runtime stub for `@splinetool/react-spline`. See ./README.md for why these
// exist. Default export, which is the reason it cannot share a file with `gsap`:
// a module has exactly one default, and both packages want it.
//
// Spline loads a WebGL runtime from a remote scene URL. Neither half is available
// here, so this renders the container and forwards the props the hero gold puts
// on it — `aria-hidden`, `className`, `onLoad` — and drops the ones that are
// Spline's own configuration and would land in the DOM as invalid attributes.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const SPLINE_ONLY = new Set([
  'scene', 'onLoad', 'onError', 'onSplineMouseDown', 'onSplineMouseHover',
  'renderOnDemand', 'onWheel',
]);

export default function Spline(props: AnyProps) {
  const domProps: AnyProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (!SPLINE_ONLY.has(k)) domProps[k] = v;
  }
  // The real component fires onLoad once the scene is ready. Firing it lets the
  // gold leave its own loading state, which is the branch worth rendering.
  const onLoad = props.onLoad as ((app: unknown) => void) | undefined;
  React.useEffect(() => { onLoad?.({}); }, []);
  return React.createElement('div', { 'data-testid': 'spline', ...domProps });
}

export { Spline };
