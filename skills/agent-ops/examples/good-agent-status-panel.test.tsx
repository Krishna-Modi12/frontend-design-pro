// Test for good-agent-status-panel — generated per Testing Doctrine (skills/testing/references/testing.md).
// Compile-only in this repo (test libs are ambient-stubbed); install deps to run:
//   npm i -D vitest @testing-library/react @testing-library/user-event jest-axe jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component from './good-agent-status-panel';

expect.extend(toHaveNoViolations);

describe('good-agent-status-panel', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('renders the empty state when there are no tasks', () => {
    render(<Component tasks={[]} />);
    expect(screen.getByText(/no agent tasks queued/i)).toBeInTheDocument();
  });

  it('renders the error state instead of a silent empty panel', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t load agent status/i);
  });

  it('filters the task queue by role-based select interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    const select = screen.getByRole('combobox', { name: /filter tasks/i });
    await user.selectOptions(select, 'verified');
    expect(screen.getAllByText(/verified/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/update registry row/i)).not.toBeInTheDocument();
  });

  it('flags a shared-file conflict between two tasks owning the same file', () => {
    render(
      <Component
        tasks={[
          { id: 'a', label: 'Task A', status: 'running', file: 'shared.ts' },
          { id: 'b', label: 'Task B', status: 'queued', file: 'shared.ts' },
        ]}
      />
    );
    expect(screen.getAllByText(/shared-file conflict/i).length).toBe(2);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
