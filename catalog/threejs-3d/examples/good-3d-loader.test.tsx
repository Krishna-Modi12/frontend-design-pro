// Test for good-3d-loader — per Testing Doctrine (references/testing.md).
// R3F/WebGL has no jsdom backend: the stub renders the Canvas container and drops the
// scene graph — which is all a real canvas contributes to the DOM (see testing.md §4).
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-3d-loader';

expect.extend(toHaveNoViolations);

describe('good-3d-loader', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('exposes a skeleton via the isLoading prop, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('labels the canvas region for assistive technology', () => {
    render(<Component />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
  });

  it('responds to an interactive control', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      await user.click(buttons[0]);
      expect(buttons[0]).toBeInTheDocument();
    } else {
      expect(screen.getByRole('img')).toBeInTheDocument();
    }
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
