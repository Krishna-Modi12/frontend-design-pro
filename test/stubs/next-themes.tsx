// Runtime stub for `next-themes`. See ./README.md for why these exist.
//
// Reports light. The dark-mode golds render a three-way theme switcher and mark
// the active option; a fixed resolved theme means the test asserts against a
// known state instead of whatever the last test left behind. `setTheme` is inert
// because next-themes drives the real switch through a `class` on <html>, which
// is a document mutation no assertion in this pack reads.
import * as React from 'react';

export const ThemeProvider = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

export const useTheme = () => ({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  systemTheme: 'light',
  themes: ['light', 'dark', 'system'],
  forcedTheme: undefined as string | undefined,
});
