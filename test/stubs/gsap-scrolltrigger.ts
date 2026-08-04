// Runtime stub for `gsap/ScrollTrigger`. See ./README.md for why these exist.
// Its own module because `vi.mock('gsap/ScrollTrigger')` and `vi.mock('gsap')`
// resolve to different paths only if the files are different.

export const ScrollTrigger = {
  create: () => ({ kill: () => {}, refresh: () => {}, disable: () => {}, enable: () => {} }),
  batch: () => [] as unknown[],
  refresh: () => {},
  update: () => {},
  killAll: () => {},
  getAll: () => [] as unknown[],
  register: () => {},
  // Plugin identity: gsap.registerPlugin() reads this on real plugins.
  name: 'ScrollTrigger',
};

export default ScrollTrigger;
