// Test for good-theme-toggle — generated per Testing Doctrine (skills/testing/references/testing.md).
// The bug this component exists to prevent is invisible in a screenshot: storing a
// resolved boolean instead of the three-way choice. So the assertions target
// storage and the DOM attributes, not appearance.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { loadChoice, resolveChoice } from './good-theme-toggle';

expect.extend(toHaveNoViolations);

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
});

describe('good-theme-toggle', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('offers all three choices as a labelled radio group', () => {
    render(<Component />);
    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /auto/i })).toBeInTheDocument();
  });

  it('persists the CHOICE, not a resolved boolean', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('radio', { name: /dark/i }));
    // "dark", never "true" — a boolean would silently pin anyone who picked auto.
    expect(window.localStorage.getItem('theme')).toBe('dark');

    await user.click(screen.getByRole('radio', { name: /auto/i }));
    expect(window.localStorage.getItem('theme')).toBe('auto');
  });

  it('defaults to auto, and rejects a stored value it no longer supports', () => {
    expect(loadChoice('theme')).toBe('auto');
    window.localStorage.setItem('theme', 'solarized-from-three-versions-ago');
    expect(loadChoice('theme')).toBe('auto');
  });

  it('resolves an explicit choice without consulting the system', () => {
    expect(resolveChoice('light')).toBe('light');
    expect(resolveChoice('dark')).toBe('dark');
  });

  it('writes data-theme and color-scheme onto the document element', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('radio', { name: /dark/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    // Without color-scheme, native scrollbars and form controls stay light.
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('reports the active theme in words', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('radio', { name: /light/i }));
    expect(screen.getByText(/pinned by your choice/i)).toBeInTheDocument();
  });

  it('renders the error state instead of failing silently', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t load theme settings/i);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
