// Test for good-react-native — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-react-native';

expect.extend(toHaveNoViolations);

describe('good-react-native', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('renders a heading for document structure', () => {
    render(<Component />);
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });
  it('names the primary navigation and the dashboard heading', () => {
    render(<Component />);
    expect(screen.getByLabelText('Primary navigation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Training Dashboard/i);
  });
});
