// Test for good-research-to-build — generated per Testing Doctrine (references/testing.md).
// Compile-only in this repo (test libs are ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-research-to-build';

expect.extend(toHaveNoViolations);


describe('good-research-to-build', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('renders a heading for document structure', () => {
    render(<Component />);
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });
  it('attributes every extracted constraint to a source', () => {
    render(<Component constraints={[{ source: 'motion.dev', value: '0.4s', label: 'Entrance' }]} />);
    expect(screen.getByText(/from motion\.dev/)).toBeTruthy();
  });
  it('renders the empty state rather than inventing values', () => {
    render(<Component constraints={[]} />);
    expect(screen.getByText(/Nothing extracted yet/)).toBeTruthy();
  });
  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
