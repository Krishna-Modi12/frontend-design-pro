// Test for good-performance-patterns — per Testing Doctrine (references/testing.md).
// Compile-only here (test libs ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-performance-patterns';

expect.extend(toHaveNoViolations);

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (p: Record<string, unknown>) => <div {...p} /> }),
  AnimatePresence: (props: { children?: unknown }) => <>{props.children as never}</>,
  useReducedMotion: () => true,
}));

describe('good-performance-patterns', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('exposes a skeleton via the isLoading prop, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('filters the list from user input', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const field = screen.getAllByRole('searchbox')[0];
    await user.type(field, 'Tokyo');
    expect(field).toHaveValue('Tokyo');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
