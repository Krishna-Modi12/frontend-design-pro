// Test for good-playwright — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-playwright';

expect.extend(toHaveNoViolations);


describe('good-playwright', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('renders a heading for document structure', () => {
    render(<Component />);
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });
  it('names the dashboard heading and its search box', () => {
    render(<Component />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Playwright CI Dashboard/i);
    expect(screen.getByPlaceholderText('Search test suites…')).toBeInTheDocument();
  });
});
