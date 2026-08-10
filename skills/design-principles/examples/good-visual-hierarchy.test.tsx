// Test for good-visual-hierarchy — per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-visual-hierarchy';

expect.extend(toHaveNoViolations);

describe('good-visual-hierarchy', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('offers exactly one primary action', () => {
    render(<Component />);
    // The secondary path is a link, not a second button. Two competing buttons
    // is the defect this example exists to demonstrate the absence of.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button')).toHaveAccessibleName('Publish release');
    expect(screen.getByRole('link', { name: 'Review the diff' })).toBeInTheDocument();
  });

  it('declares a single top-level heading with subordinate sections', () => {
    render(<Component />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Included changes');
  });

  it('uses a description list so the stat labels are programmatically paired', () => {
    const { container } = render(<Component />);
    expect(container.querySelectorAll('dt')).toHaveLength(3);
    expect(container.querySelectorAll('dd')).toHaveLength(3);
  });

  it('keeps the touch target at 44px on both actions', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toHaveClass('h-11');
    expect(screen.getByRole('link', { name: 'Review the diff' })).toHaveClass('h-11');
  });

  it('exposes a skeleton via isLoading, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('surfaces a recoverable error as an alert', () => {
    render(<Component error="The release manifest is unreadable." />);
    expect(screen.getByRole('alert')).toHaveTextContent('unreadable');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
