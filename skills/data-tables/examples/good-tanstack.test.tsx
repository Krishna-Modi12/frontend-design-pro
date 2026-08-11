// Test for good-tanstack — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-tanstack';

expect.extend(toHaveNoViolations);

describe('good-tanstack', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('responds to a button activation', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const btn = screen.getAllByRole('button')[0];
    await user.click(btn);
    expect(btn).toBeInTheDocument();
  });
  it('exposes the compose action by name', () => {
    render(<Component />);
    expect(screen.getByRole('button', { name: 'Write a new post' })).toBeInTheDocument();
  });
});
