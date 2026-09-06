// Test for good-hero-spline — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-hero-spline';

expect.extend(toHaveNoViolations);

describe('good-hero-spline', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('renders a heading for document structure', () => {
    render(<Component />);
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
  });
  it('describes the 3D scene to assistive tech', () => {
    render(<Component />);
    const described = screen.getAllByRole('img');
    expect(described.length).toBeGreaterThan(0);
    described.forEach((el: HTMLElement) => expect(el).toHaveAccessibleName());
  });
});
