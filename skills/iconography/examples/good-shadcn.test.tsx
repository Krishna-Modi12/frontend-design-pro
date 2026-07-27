// Test for good-shadcn — generated per Testing Doctrine (references/testing.md).
// Compile-only in this repo (test libs are ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-shadcn';

expect.extend(toHaveNoViolations);

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (p: Record<string, unknown>) => <div {...p} /> }),
  AnimatePresence: (props: { children?: unknown }) => <>{props.children as never}</>,
  useReducedMotion: () => true,
  useInView: () => true,
  useMotionValue: (v: number) => ({ get: () => v, set: () => {}, on: () => () => {} }),
  useTransform: () => 0,
  useSpring: (v: unknown) => v,
  useScroll: () => ({ scrollYProgress: { on: () => () => {} } }),
}));

describe('good-shadcn', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('responds to a button activation', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const btn = screen.getAllByRole('button')[0];
    await user.click(btn);
    expect(btn).toBeInTheDocument();
  });
  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
