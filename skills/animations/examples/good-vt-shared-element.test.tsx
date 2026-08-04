// Test for good-vt-shared-element — per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-vt-shared-element';

expect.extend(toHaveNoViolations);


describe('good-vt-shared-element', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('exposes a skeleton via the isLoading prop, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('opens the detail view when a release is activated', async () => {
    const user = userEvent.setup();
    render(<Component />);
    // Opening a release replaces the list with the detail pane, so the button
    // that was clicked is gone by design — asserting it survived was asserting
    // the transition had not happened.
    const [release] = screen.getAllByRole('button');
    await user.click(release);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(release).not.toBeInTheDocument();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
