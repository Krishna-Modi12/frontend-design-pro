// Test for good-text-scramble — generated per Testing Doctrine (skills/testing/references/testing.md).
// The scrambled glyphs are deliberately unassertable — they are random by design.
// What IS assertable is the contract around them: the real string is always in the
// DOM, it is never announced character by character, and the loop is cancelled.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-text-scramble';

expect.extend(toHaveNoViolations);
afterEach(cleanup);

describe('good-text-scramble', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('exposes the real phrase to assistive technology, unscrambled', () => {
    const { container } = render(<Component phrases={['Checkpoint committed']} />);
    // Three spans carry the phrase: an invisible one reserving the line box, the
    // animating one, and this. Only this one is exposed — the other two are
    // aria-hidden, so AT reads the string exactly once.
    const accessible = container.querySelector('.sr-only');
    expect(accessible).toHaveTextContent('Checkpoint committed');
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(2);
  });

  it('never puts aria-live on the scrambling text', () => {
    const { container } = render(<Component />);
    // Every intermediate frame would otherwise be announced, one glyph at a time.
    expect(container.querySelector('[aria-live]')).toBeNull();
  });

  it('advances to the next phrase on click', async () => {
    const user = userEvent.setup();
    const { container } = render(<Component phrases={['Checkpoint committed', 'Workflow resumed']} />);
    expect(container.querySelector('.sr-only')).toHaveTextContent('Checkpoint committed');
    await user.click(screen.getByRole('button', { name: /next event/i }));
    expect(container.querySelector('.sr-only')).toHaveTextContent('Workflow resumed');
  });

  it('cancels its animation frame on unmount', () => {
    const spy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<Component />);
    unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('renders the empty state when there are no phrases', () => {
    render(<Component phrases={[]} />);
    expect(screen.getByText(/no phrases to decode/i)).toBeInTheDocument();
  });

  it('renders the error state instead of a blank line', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t load the status feed/i);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
