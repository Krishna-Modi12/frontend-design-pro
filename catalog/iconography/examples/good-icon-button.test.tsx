// Test for good-icon-button — per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { IconButton, StarIcon } from './good-icon-button';

expect.extend(toHaveNoViolations);

describe('good-icon-button', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('gives every icon-only control an accessible name', () => {
    render(<Component />);
    // The whole point of the skill: no control reaches the tree as just "button".
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAccessibleName();
    }
  });

  it('hides the glyph from assistive tech so the label is the only name', () => {
    const { container } = render(
      <IconButton icon={StarIcon} label="Star wordmark-dark.svg" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('Star wordmark-dark.svg');
  });

  it('renames the control when the pressed state flips', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const star = screen.getByRole('button', { name: 'Star og-card-1200x630.png' });
    expect(star).toHaveAttribute('aria-pressed', 'false');
    await user.click(star);
    // Same control, new name — it must not still offer to do what was just done.
    const unstar = screen.getByRole('button', { name: 'Unstar og-card-1200x630.png' });
    expect(unstar).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks a pending control busy and disables it', () => {
    render(<IconButton icon={StarIcon} label="Saving" isPending />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('exposes a skeleton via isLoading, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('surfaces a recoverable error as an alert', () => {
    render(<Component error="The asset service returned 503." />);
    expect(screen.getByRole('alert')).toHaveTextContent('503');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
