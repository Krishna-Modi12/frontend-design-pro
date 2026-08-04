// Runtime stub for `react-native-reanimated`. See ./README.md for why these exist.
//
// The worklet functions return their input, so an animated style resolves to the
// style object it would settle on. That is the useful half: the golds derive real
// layout values through these, and a stub returning `{}` would silently drop them.

type AnyProps = Record<string, unknown>;

export const useSharedValue = <T,>(initial: T) => ({ value: initial });

export const useAnimatedStyle = (factory: () => AnyProps) => {
  // Worklets read `.value` off shared values, which the stub above provides. If
  // one reaches for a native-only API it throws, and an empty style is a better
  // outcome than an unmountable component.
  try { return factory(); } catch { return {}; }
};

export const withSpring = <T,>(v: T) => v;
export const withTiming = <T,>(v: T) => v;
export const withDelay = <T,>(_ms: number, v: T) => v;
export const withSequence = <T,>(...v: T[]) => v[v.length - 1];
export const withRepeat = <T,>(v: T) => v;
export const runOnJS = <T extends (...a: never[]) => unknown>(fn: T) => fn;
export const useAnimatedScrollHandler = () => () => {};
export const interpolate = (v: number) => v;
export const Extrapolate = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };

export default { createAnimatedComponent: <T,>(c: T) => c };
