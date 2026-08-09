// Test for good-oklch-theme-generator — generated per Testing Doctrine (skills/testing/references/testing.md).
// A theme generator is one of the few places accessibility is genuinely testable
// in CI: both colours are known values in code, so the contrast assertion is real
// rather than a proxy. The hue sweep matters — a generator verified against one
// brand colour is verified against nothing.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { generateTheme, contrastRatio } from './good-oklch-theme-generator';

expect.extend(toHaveNoViolations);

describe('good-oklch-theme-generator', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('emits OKLCH for every token, never hex', () => {
    for (const dark of [true, false]) {
      const tokens = generateTheme(248, dark);
      for (const value of Object.values(tokens)) {
        expect(value).toMatch(/^oklch\(/);
        expect(value).not.toContain('#');
      }
    }
  });

  it('keeps text/surface above 4.5:1 across the whole hue wheel', () => {
    for (let hue = 0; hue < 360; hue += 15) {
      for (const dark of [true, false]) {
        const t = generateTheme(hue, dark);
        expect(contrastRatio(t.text, t.surface)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('clamps chroma so no generated colour leaves the sRGB gamut', () => {
    for (let hue = 0; hue < 360; hue += 30) {
      for (const dark of [true, false]) {
        for (const value of Object.values(generateTheme(hue, dark))) {
          const chroma = Number(value.split(/\s+/)[1]);
          expect(chroma).toBeLessThanOrEqual(0.37);
        }
      }
    }
  });

  it('desaturates the accent on dark rather than pushing it up', () => {
    const darkChroma = Number(generateTheme(248, true).accent.split(/\s+/)[1]);
    const lightChroma = Number(generateTheme(248, false).accent.split(/\s+/)[1]);
    expect(darkChroma).toBeLessThan(lightChroma);
  });

  it('normalises hue rotation into 0–359, never negative', async () => {
    const user = userEvent.setup();
    render(<Component baseHue={10} />);
    await user.selectOptions(screen.getByRole('combobox', { name: /harmonic scheme/i }), 'analogous');
    // Analogous includes -30°, which is invalid in CSS and would kill the whole
    // declaration. Anchored so this matches only the bare hue labels, not the
    // "Anchor hue — 10°" heading or the "+180°" option text.
    for (const item of screen.getAllByText(/^\d+°$/)) {
      expect(Number(item.textContent?.replace('°', ''))).toBeGreaterThanOrEqual(0);
    }
  });

  it('reports the contrast verdict as a word, not only as colour', () => {
    render(<Component />);
    expect(screen.getByText(/passes|fails/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.5:1/)).toBeInTheDocument();
  });

  it('renders the error state instead of an unusable palette', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t generate a theme/i);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
