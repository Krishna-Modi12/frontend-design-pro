// Test for good-audited-panel — per Testing Doctrine (references/testing.md).
// Peer libraries resolve to `test/stubs/` here — this repo installs none of them.
// In a project that has the real ones, this file runs unchanged against those.
//
// These assert the *craft contract*, not pixels: a jsdom test cannot see a
// shadow or measure a truncation. What it can prove is that the structures the
// review rules depend on are present and wired — the min-w-0 shrink chain, the
// locale formatters, translate="no" on identifiers, and all four states.
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { DeploymentPanel, StatusBadge } from './good-audited-panel';

expect.extend(toHaveNoViolations);

describe('good-audited-panel', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('names the panel via its own heading', () => {
    render(<Component />);
    const panel = screen.getByRole('region', { name: 'Recent deployments' });
    expect(panel).toBeInTheDocument();
  });

  it('keeps the truncation chain intact — min-w-0 on the shrinking flex child', () => {
    // Rule 6. `truncate` on a flex child is inert unless an ancestor opts out of
    // min-width:auto, so the two classes are one contract, not two choices.
    const { container } = render(<Component />);
    const shrinker = container.querySelector('.min-w-0');
    expect(shrinker).not.toBeNull();
    expect(shrinker?.querySelector('.truncate')).not.toBeNull();
  });

  it('marks identifiers untranslatable', () => {
    // Rule 10 — a branch name rewritten by machine translation cannot resolve.
    const { container } = render(<Component />);
    const untranslatable = container.querySelectorAll('[translate="no"]');
    expect(untranslatable.length).toBeGreaterThan(0);
    const labels: string[] = [];
    untranslatable.forEach((node: HTMLElement) => labels.push(node.textContent ?? ''));
    expect(labels).toContain('main');
  });

  it('formats time through Intl rather than a hardcoded string', () => {
    const { container } = render(<Component />);
    const stamps = container.querySelectorAll('time[datetime]');
    expect(stamps.length).toBeGreaterThan(0);
    // The machine-readable value is the ISO input; the visible text is whatever
    // the reader's locale renders, so it is deliberately not asserted here.
    expect(stamps[0].getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('states status in text, never in colour alone', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('ends in-progress copy with an ellipsis character, not three dots', () => {
    render(<StatusBadge status="building" />);
    const label = screen.getByText(/Building/);
    expect(label.textContent).toContain('…');
    expect(label.textContent).not.toContain('...');
  });

  it('exposes a skeleton via isLoading, with no artificial delay', () => {
    const { container } = render(<Component isLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('surfaces a recoverable error as an alert whose action names the fix', () => {
    render(
      <Component error="The build log service is unreachable. Your running deployments are unaffected." />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('unreachable');
    expect(
      within(alert).getByRole('button', { name: 'Load deployments again' }),
    ).toBeInTheDocument();
  });

  it('offers a way forward when there is nothing to list', () => {
    render(<Component deployments={[]} />);
    expect(screen.getByText(/Nothing has shipped/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect a repository' })).toBeInTheDocument();
  });

  it('gives every row action a unique accessible name', () => {
    render(<Component />);
    const buttons: HTMLElement[] = screen.getAllByRole('button');
    const names = buttons
      .map((button: HTMLElement) => button.textContent?.trim() ?? '')
      .filter((name: string) => name.length > 0);
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
  });

  it('reports the deployment that was actioned, not just that one was', async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    render(<DeploymentPanel onRedeploy={(id) => seen.push(id)} />);
    await user.click(screen.getAllByRole('button', { name: /^Redeploy/ })[0]);
    expect(seen).toEqual(['dpl_7c41']);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
