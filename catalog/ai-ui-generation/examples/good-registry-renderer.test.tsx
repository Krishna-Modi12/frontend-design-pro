// Test for good-registry-renderer — per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { RenderNode, type UINode } from './good-registry-renderer';

expect.extend(toHaveNoViolations);

describe('good-registry-renderer', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('renders every node type the registry declares', () => {
    render(<Component />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Weekly delivery report');
    expect(screen.getByText('Change failure rate')).toBeInTheDocument();
    expect(screen.getByText('2.1%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open full report' })).toBeInTheDocument();
  });

  it('renders an unknown node visibly instead of throwing or hiding it', () => {
    // The seed payload deliberately contains a `sparkline` the registry does not
    // ship. A generator will emit one of these eventually; silence would make a
    // broken payload look like a correct render.
    expect(screen.queryByText('sparkline')).not.toBeInTheDocument();
    render(<Component />);
    expect(screen.getByRole('note')).toHaveTextContent('sparkline');
  });

  it('does not execute a handler smuggled in as a prop', () => {
    let fired = false;
    const hostile: UINode = {
      type: 'action',
      props: {
        label: 'Continue',
        href: '#ok',
        onClick: () => {
          fired = true;
        },
        dangerouslySetInnerHTML: { __html: '<script>1</script>' },
      },
    };
    const { container } = render(<RenderNode node={hostile} />);
    const link = screen.getByRole('link', { name: 'Continue' });
    link.click();
    // Only `href` and `label` are read off the payload; nothing else crosses.
    expect(fired).toBe(false);
    expect(container.querySelector('script')).toBeNull();
  });

  it('bounds recursion instead of overflowing the stack', () => {
    let deep: UINode = { type: 'text', props: { text: 'bottom' } };
    for (let i = 0; i < 40; i += 1) deep = { type: 'stack', children: [deep] };
    expect(() => render(<RenderNode node={deep} />)).not.toThrow();
    expect(screen.getByText(/Nesting limit reached/)).toBeInTheDocument();
  });

  it('falls back to safe defaults when props are the wrong type', () => {
    const wrong: UINode = { type: 'metric', props: { label: 42, value: null } };
    render(<RenderNode node={wrong} />);
    expect(screen.getByText('Metric')).toBeInTheDocument();
  });

  it('exposes a skeleton via isLoading, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('surfaces a recoverable error as an alert', () => {
    render(<Component error="The model returned malformed JSON." />);
    expect(screen.getByRole('alert')).toHaveTextContent('malformed JSON');
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
