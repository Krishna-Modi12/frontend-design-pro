// Test for good-rhf — generated per Testing Doctrine (references/testing.md).
// Compile-only in this repo (test libs are ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-rhf';

expect.extend(toHaveNoViolations);

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: () => (p: Record<string, unknown>) => <div {...p} /> }),
  AnimatePresence: (props: { children?: unknown }) => <>{props.children as never}</>,
  useReducedMotion: () => true,
  useInView: () => true,
  useMotionValue: (v: number) => ({ get: () => v, set: () => {}, on: () => () => {} }),
  useTransform: () => 0,
  useSpring: (v: unknown) => v,
  useScroll: () => ({ scrollYProgress: { on: () => () => {} } }),
}));

vi.mock('react-hook-form', () => ({
  useForm: () => ({ register: () => ({ name: 'f', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }), handleSubmit: (fn: () => void) => (e: { preventDefault?: () => void }) => { e?.preventDefault?.(); fn?.(); }, formState: { errors: {}, isValid: true }, control: {}, watch: () => undefined, getValues: () => ({}), reset: vi.fn(), trigger: vi.fn(), setValue: vi.fn() }),
  Controller: ({ render }: { render: (a: unknown) => unknown }) => render({ field: { onChange: vi.fn(), value: '', name: 'f', ref: vi.fn() }, fieldState: {} }) as never,
  useFieldArray: () => ({ fields: [], append: vi.fn(), remove: vi.fn() }),
}));
vi.mock('@hookform/resolvers/zod', () => ({ zodResolver: () => () => ({ values: {}, errors: {} }) }));

describe('good-rhf', () => {
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
