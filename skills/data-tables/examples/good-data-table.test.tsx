// Test for good-data-table — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-data-table';

expect.extend(toHaveNoViolations);


describe('good-data-table', () => {
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
  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it('names the table region and offers a search box', () => {
    render(<Component />);
    // The accessible name sits on the <section> wrapping the table, so this is
    // a region rather than a table — assert where the name actually is.
    expect(screen.getByRole('region', { name: 'User management table' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or email…')).toBeInTheDocument();
  });
});
