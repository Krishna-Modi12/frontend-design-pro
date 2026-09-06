// Test for good-checkout — generated per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-checkout';

expect.extend(toHaveNoViolations);


describe('good-checkout', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });
  it('responds to a button activation', async () => {
    const user = userEvent.setup();
    render(<Component />);
    // The page opens on its skeleton and swaps in the form when the payment
    // intent resolves — that is the point of the example, so the query has to
    // wait for it rather than read the first frame.
    const [btn] = await screen.findAllByRole('button');
    await user.click(btn);
    expect(btn).toBeInTheDocument();
  });
  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  it('resolves into a named order summary', async () => {
    render(<Component />);
    expect(await screen.findByLabelText('Order summary')).toBeInTheDocument();
  });
});
