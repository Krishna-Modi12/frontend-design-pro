// Test for good-spotlight-card — per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { SpotlightCard } from './good-spotlight-card';

expect.extend(toHaveNoViolations);

describe('good-spotlight-card', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('keeps the effect layer out of the accessibility tree', () => {
    const { container } = render(
      <SpotlightCard>
        <h2>Postgres</h2>
      </SpotlightCard>,
    );
    // Decorative by construction: if this layer were ever exposed, a screen
    // reader would announce a gradient.
    const layer = container.querySelector('[aria-hidden="true"]');
    expect(layer).toBeInTheDocument();
    expect(layer).toHaveClass('pointer-events-none');
  });

  it('renders real content, not a canvas the effect depends on', () => {
    render(<Component />);
    // The cards must be readable with every visual effect stripped away.
    expect(screen.getByRole('heading', { name: 'Postgres' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Configure' })).toHaveLength(3);
  });

  it('does not re-render on pointer movement', () => {
    // The position is written to CSS custom properties on a ref, so React state
    // never changes — the DOM node identity survives the interaction.
    const { container } = render(
      <SpotlightCard>
        <h2>Sentry</h2>
      </SpotlightCard>,
    );
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    // jsdom dispatches the event; the handler must not throw without layout.
    expect(() => article?.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }))).not.toThrow();
    expect(container.querySelector('article')).toBe(article);
  });

  it('exposes a skeleton via isLoading, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('surfaces a recoverable error as an alert', () => {
    render(<Component error="The integrations registry timed out." />);
    expect(screen.getByRole('alert')).toHaveTextContent('timed out');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
