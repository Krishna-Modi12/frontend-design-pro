// Test for good-particle-hero — generated per Testing Doctrine (skills/testing/references/testing.md).
// jsdom implements <canvas> but not its 2D context, so getContext("2d") returns
// null here exactly as it does under SSR and on a lost GPU process. That is not
// a gap to mock away — it is the degradation path this component is built around,
// so the tests assert it instead.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-particle-hero';

expect.extend(toHaveNoViolations);

describe('good-particle-hero', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('keeps the headline in the DOM, not only on the canvas', () => {
    render(<Component headline="Resume, don't restart" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/resume, don't restart/i);
  });

  it('falls back to visible text when the 2D context is unavailable', () => {
    render(<Component headline="Durable execution" />);
    // No context in jsdom, so the h1 must not stay visually hidden — otherwise
    // the headline would be invisible to everyone rather than only to AT.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).not.toContain('sr-only');
  });

  it('hides the decorative canvas from assistive technology', () => {
    const { container } = render(<Component />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the empty state when there is no headline', () => {
    render(<Component headline="" />);
    expect(screen.getByText(/no headline set/i)).toBeInTheDocument();
  });

  it('renders the error state instead of a silently blank canvas', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t render the hero/i);
  });

  it('renders every metric passed to it', () => {
    render(<Component metrics={[{ label: 'Steps replayed', value: '48.2M' }]} />);
    expect(screen.getByText('48.2M')).toBeInTheDocument();
    expect(screen.getByText('Steps replayed')).toBeInTheDocument();
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
