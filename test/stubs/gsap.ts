// Runtime stub for `gsap`. See ./README.md for why these exist.
// Every method returns a killable tween so cleanup functions in the golds have
// something to call; nothing animates, because jsdom has no layout to animate.

type AnyProps = Record<string, unknown>;

const tween = {
  kill: () => {},
  play: () => {},
  pause: () => {},
  reverse: () => {},
  restart: () => {},
  progress: () => 0,
  revert: () => {},
};

interface Timeline {
  to: () => Timeline;
  from: () => Timeline;
  fromTo: () => Timeline;
  set: () => Timeline;
  add: () => Timeline;
  addLabel: () => Timeline;
  kill: () => void;
  revert: () => void;
}

function makeTimeline(): Timeline {
  const tl: Timeline = {
    to: () => tl,
    from: () => tl,
    fromTo: () => tl,
    set: () => tl,
    add: () => tl,
    addLabel: () => tl,
    kill: () => {},
    revert: () => {},
  };
  return tl;
}

export const gsap = {
  to: () => tween,
  from: () => tween,
  fromTo: () => tween,
  set: () => tween,
  timeline: makeTimeline,
  // `registerPlugin` is called at module scope in the golds, so it has to exist
  // before anything renders.
  registerPlugin: (..._plugins: unknown[]) => {},
  // The callback runs: `gsap.context(() => { … })` is where a gold sets up its
  // animations, and skipping it would skip the code the test is there to exercise.
  context: (fn?: () => void, _scope?: unknown) => {
    fn?.();
    return { revert: () => {}, kill: () => {}, add: (f?: () => void) => f?.() };
  },
  matchMedia: () => ({ add: (_q: unknown, fn?: () => void) => fn?.(), revert: () => {}, kill: () => {} }),
  killTweensOf: () => {},
  getProperty: () => 0,
  // `gsap.utils` is the one part the golds call for its return value rather than
  // its side effect — a marquee builds its `xPercent` out of `wrap` and `unitize`
  // at render time, so these have to be real functions returning real functions.
  utils: {
    toArray: (v: unknown) => (Array.isArray(v) ? v : v ? [v] : []),
    clamp: (lo: number, hi: number, v?: number) => (v === undefined ? lo : Math.min(hi, Math.max(lo, v))),
    wrap: (min: number, max?: number) => {
      const [lo, hi] = max === undefined ? [0, min] : [min, max];
      const span = hi - lo || 1;
      return (v: number) => lo + (((v - lo) % span) + span) % span;
    },
    unitize: (fn: (v: number) => number, unit = '') => (v: number) => `${fn(Number(v) || 0)}${unit}`,
    mapRange: (_a: number, _b: number, c: number) => c,
    snap: (_increment: unknown) => (v: number) => v,
    interpolate: (a: number, _b: number) => a,
    random: (a: number) => a,
    pipe: (...fns: Array<(v: unknown) => unknown>) => (v: unknown) => fns.reduce((acc, f) => f(acc), v),
    selector: () => () => [] as unknown[],
    distribute: () => () => 0,
    shuffle: (v: unknown[]) => v,
  } as AnyProps,
};

export default gsap;
