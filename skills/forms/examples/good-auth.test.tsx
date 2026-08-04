// Test for good-auth — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-auth';

expect.extend(toHaveNoViolations);


describe('good-auth', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('accepts user input in a text field', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const field = screen.getAllByRole('textbox')[0];
    await user.type(field, 'Ana Ngugi');
    expect(field).toHaveValue('Ana Ngugi');
  });
  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
