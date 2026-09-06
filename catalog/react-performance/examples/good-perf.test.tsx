// Test for good-perf — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-perf';

expect.extend(toHaveNoViolations);


describe('good-perf', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('renders row/list content from data', () => {
    render(<Component />);
    const rows = screen.queryAllByRole('row');
    const items = screen.queryAllByRole('listitem');
    expect(rows.length + items.length).toBeGreaterThan(0);
  });
  it('resolves its loading state into a searchable catalog', async () => {
    render(<Component />);
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    expect(await screen.findByPlaceholderText('Search by name or role…')).toBeInTheDocument();
  });
});
