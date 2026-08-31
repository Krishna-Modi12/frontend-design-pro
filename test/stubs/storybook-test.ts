// Runtime stub for `storybook/test` (was `@storybook/test`, and
// `@storybook/testing-library` / `@storybook/jest` before that). See ./README.md.
//
// The gold that imports it is a Storybook *play function* demonstration: it is
// authored to be read, and its assertions run inside the Storybook / Vitest test
// addon, not in this repo's vitest run. Nothing here executes during the vitest
// run — these exist so the module resolves at import time.

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

const matchers = {
  toBeInTheDocument: () => {},
  toBeVisible: () => {},
  toBeDisabled: () => {},
  toHaveFocus: () => {},
  toHaveAttribute: (_n?: string, _v?: string) => {},
  toHaveAccessibleName: () => {},
  toHaveTextContent: (_t?: unknown) => {},
  not: null as unknown as Record<string, () => void>,
};
matchers.not = { ...matchers };
export const expect = (_actual?: unknown) => matchers;

export const fn = () => {
  const spy = (..._args: unknown[]) => undefined;
  return Object.assign(spy, {
    mock: { calls: [] as unknown[][] },
    mockReturnValue: () => spy,
    mockImplementation: () => spy,
  });
};
