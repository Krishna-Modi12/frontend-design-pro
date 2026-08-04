// Runtime stub for `motion/react` (and `framer-motion`, the same package under
// its former name). See ./README.md for why these exist.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

// Props that belong to the animation library, not the DOM. Passing these
// through produces React "unknown prop" warnings and, for `transition`, an
// invalid HTML attribute.
const MOTION_ONLY = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants', 'whileHover',
  'whileTap', 'whileInView', 'whileFocus', 'whileDrag', 'viewport', 'layout',
  'layoutId', 'drag', 'dragConstraints', 'dragElastic', 'onAnimationComplete',
  'custom', 'style3d', 'transformTemplate',
]);

function stripMotionProps(props: AnyProps): AnyProps {
  const out: AnyProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (!MOTION_ONLY.has(k)) out[k] = v;
  }
  return out;
}

/** `motion.div`, `motion.button`, `motion.li`… resolved lazily by tag name. */
export const motion: Record<string, React.ComponentType<AnyProps>> = new Proxy(
  {},
  {
    get: (_target, tag: string) => {
      const Component = React.forwardRef<unknown, AnyProps>((props, ref) =>
        React.createElement(tag, { ...stripMotionProps(props), ref }),
      );
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  },
) as Record<string, React.ComponentType<AnyProps>>;

export function AnimatePresence({ children }: { children?: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export const LazyMotion = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const domAnimation = {};
export const MotionConfig = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

// Tests assert reduced-motion branches, so this returns true — the accessible
// path is the one worth exercising by default. Individual tests override it
// with vi.mock where they need the animated branch.
export const useReducedMotion = () => true;
export const useInView = () => true;
export const useAnimationControls = () => ({ start: () => Promise.resolve(), stop: () => {}, set: () => {} });
export const useAnimation = useAnimationControls;

export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: () => {},
  on: () => () => {},
});
export const useTransform = () => useMotionValue(0);
export const useSpring = (v: unknown) => v;
export const useScroll = () => ({
  scrollY: useMotionValue(0),
  scrollYProgress: useMotionValue(0),
});
export const useMotionValueEvent = () => {};
export const useVelocity = () => useMotionValue(0);
export const stagger = () => 0;
export const animate = () => ({ stop: () => {} });
