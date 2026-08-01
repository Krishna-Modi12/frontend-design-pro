// Test for good-surgical-change — per Testing Doctrine (references/testing.md).
// Compile-only here (test libs ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { EmailField } from './good-surgical-change';

expect.extend(toHaveNoViolations);

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => (p: Record<string, unknown>) => <div {...p} /> }),
  AnimatePresence: (props: { children?: unknown }) => <>{props.children as never}</>,
  useReducedMotion: () => true,
}));

describe('good-surgical-change', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('exposes a skeleton via the isLoading prop, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('accepts typed input through the controlled onChange contract', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EmailField value="" onChange={onChange} />);
    await user.type(screen.getByLabelText(/work email/i), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('wires the error message to the input via aria-describedby and announces it', () => {
    render(<EmailField value="nope" onChange={() => {}} error="Enter a valid email" />);
    const input = screen.getByLabelText(/work email/i);
    const alert = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
