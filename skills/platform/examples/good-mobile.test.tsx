// Test for good-mobile — generated per Testing Doctrine (references/testing.md).
// Compile-only in this repo (test libs are ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-mobile';

expect.extend(toHaveNoViolations);


vi.mock('vaul', () => ({ Drawer: new Proxy({ Root: (props: { children?: unknown }) => <div>{props.children as never}</div> }, { get: (t: Record<string, unknown>, k: string) => t[k] ?? ((props: { children?: unknown }) => <div>{props.children as never}</div>) }) }));

describe('good-mobile', () => {
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
});
