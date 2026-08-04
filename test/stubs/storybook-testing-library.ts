// Runtime stub for `@storybook/testing-library`. See ./README.md for why these
// exist.
//
// Deprecated upstream in favour of `storybook/test`. The gold that imports it is
// a Storybook *play function* demonstration: it is authored to be read, and its
// assertions run inside a Storybook runner, not in vitest. Nothing here executes
// during the vitest run — these exist so the module resolves at import time.

type El = unknown;

export const within = (el?: El) => ({
  getByRole: () => el,
  getByText: () => el,
  getByLabelText: () => el,
  getByTestId: () => el,
  queryByRole: () => el,
  findByRole: () => Promise.resolve(el),
  findByText: () => Promise.resolve(el),
});

export const userEvent = {
  click: () => Promise.resolve(),
  dblClick: () => Promise.resolve(),
  type: () => Promise.resolve(),
  clear: () => Promise.resolve(),
  tab: () => Promise.resolve(),
  hover: () => Promise.resolve(),
  unhover: () => Promise.resolve(),
  keyboard: () => Promise.resolve(),
  selectOptions: () => Promise.resolve(),
};

export const waitFor = (fn: () => unknown) => Promise.resolve(fn());
export const screen = within(undefined);
