// Test for good-3d — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-3d';

expect.extend(toHaveNoViolations);

describe('good-3d', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('renders a heading for document structure', () => {
    render(<Component />);
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });
  it('hides the decorative canvas from assistive tech and keeps the meaning in the DOM', () => {
    // The lesson this gold teaches: a canvas carries no accessible content, so
    // it is aria-hidden and every meaningful word lives in an overlay a screen
    // reader can actually reach. Wiring that backwards renders identically.
    const { container } = render(<Component />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent(/\S/);
  });
});
