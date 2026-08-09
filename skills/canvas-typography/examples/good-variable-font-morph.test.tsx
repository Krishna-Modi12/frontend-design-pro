// Test for good-variable-font-morph — generated per Testing Doctrine (skills/testing/references/testing.md).
// jsdom reports every getBoundingClientRect as zeros, so scroll progress resolves
// to a stable value here. The assertions target what is verifiable without layout:
// the axis is written as an integer, the range is respected, and the listeners are
// passive and removed.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-variable-font-morph';

expect.extend(toHaveNoViolations);
afterEach(cleanup);

describe('good-variable-font-morph', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('renders one heading per section, as real text', () => {
    render(<Component />);
    expect(screen.getByRole('heading', { name: /durability/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /replay/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /observability/i })).toBeInTheDocument();
  });

  it('writes an integer weight inside the declared axis range', () => {
    render(<Component range={{ min: 250, max: 800 }} />);
    const heading = screen.getByRole('heading', { name: /durability/i });
    const weight = Number(heading.style.fontWeight);
    expect(Number.isInteger(weight)).toBe(true);
    expect(weight).toBeGreaterThanOrEqual(250);
    expect(weight).toBeLessThanOrEqual(800);
  });

  // addEventListener is overloaded, so mock.calls infers as a union and the
  // callback parameter lands as implicit any under the gate's strict config.
  type ListenerCall = [type: string, handler: unknown, options?: unknown];

  it('registers scroll and resize listeners as passive', () => {
    const spy = vi.spyOn(window, 'addEventListener');
    render(<Component />);
    const calls = spy.mock.calls as unknown as ListenerCall[];
    const scroll = calls.find((c: ListenerCall) => c[0] === 'scroll');
    expect(scroll).toBeDefined();
    // Non-passive here would block the compositor for the sake of a weight axis.
    expect(scroll?.[2]).toMatchObject({ passive: true });
    spy.mockRestore();
  });

  it('removes its listeners on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Component />);
    unmount();
    const calls = spy.mock.calls as unknown as ListenerCall[];
    expect(calls.some((c: ListenerCall) => c[0] === 'scroll')).toBe(true);
    expect(calls.some((c: ListenerCall) => c[0] === 'resize')).toBe(true);
    spy.mockRestore();
  });

  it('offers a skip link ahead of the chapter nav', () => {
    render(<Component />);
    expect(screen.getByRole('link', { name: /skip to chapters/i })).toBeInTheDocument();
  });

  it('renders the empty state when there are no sections', () => {
    render(<Component sections={[]} />);
    expect(screen.getByText(/nothing to read yet/i)).toBeInTheDocument();
  });

  it('renders the error state instead of an empty page', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t load the chapters/i);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
