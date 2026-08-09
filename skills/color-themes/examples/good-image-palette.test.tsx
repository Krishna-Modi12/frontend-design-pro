// Test for good-image-palette — generated per Testing Doctrine (skills/testing/references/testing.md).
// jsdom decodes no images and provides no 2D context, so the extraction path is
// exercised through its pure functions — which is where the algorithm actually
// lives. The component tests cover the states around it.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Component, { rgbToOklch, medianCut, clustersToSwatches } from './good-image-palette';

expect.extend(toHaveNoViolations);

describe('good-image-palette', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />);
    expect(container).toBeTruthy();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('converts sRGB to OKLCH with the expected anchors', () => {
    const white = rgbToOklch(255, 255, 255);
    expect(white.l).toBeCloseTo(100, 0);
    expect(white.c).toBeLessThan(0.01);

    const black = rgbToOklch(0, 0, 0);
    expect(black.l).toBeCloseTo(0, 0);

    // Mid grey must land near the middle perceptually — this is the property
    // HSL gets wrong and the whole reason for the conversion.
    const grey = rgbToOklch(128, 128, 128);
    expect(grey.l).toBeGreaterThan(45);
    expect(grey.l).toBeLessThan(70);
  });

  it('separates opposite colours instead of averaging them into mud', () => {
    // Half pure red, half pure blue. The mean is a muddy purple present in neither
    // half; median cut must return the two originals.
    const pixels = [
      ...Array.from({ length: 40 }, () => [255, 0, 0]),
      ...Array.from({ length: 40 }, () => [0, 0, 255]),
    ];
    const clusters = medianCut(pixels, 1);
    expect(clusters).toHaveLength(2);

    const reds = clusters.filter((k) => k.r > 200 && k.b < 60);
    const blues = clusters.filter((k) => k.b > 200 && k.r < 60);
    expect(reds).toHaveLength(1);
    expect(blues).toHaveLength(1);
  });

  it('returns 2^depth clusters', () => {
    const pixels = Array.from({ length: 64 }, (_, i) => [i * 3, 255 - i * 2, i]);
    expect(medianCut(pixels, 3)).toHaveLength(8);
  });

  it('emits OKLCH swatches, never hex', () => {
    const pixels = [
      ...Array.from({ length: 30 }, () => [200, 40, 40]),
      ...Array.from({ length: 30 }, () => [30, 30, 34]),
    ];
    const swatches = clustersToSwatches(medianCut(pixels, 2), pixels.length);
    expect(swatches.length).toBeGreaterThan(0);
    for (const s of swatches) {
      expect(s.token).toMatch(/^oklch\(/);
      expect(s.token).not.toContain('#');
      expect(s.weight).toBeGreaterThanOrEqual(0);
      expect(s.weight).toBeLessThanOrEqual(1);
    }
  });

  it('does not hand the accent slot to a near-grey on pixel count alone', () => {
    // A large flat grey region plus a small saturated one: the accent must be
    // the saturated cluster, even though grey dominates the frame.
    const pixels = [
      ...Array.from({ length: 200 }, () => [130, 130, 132]),
      ...Array.from({ length: 20 }, () => [210, 60, 30]),
    ];
    const accent = clustersToSwatches(medianCut(pixels, 2), pixels.length).find(
      (s) => s.role === 'accent'
    );
    expect(accent).toBeDefined();
    const chroma = Number(accent?.token.split(/\s+/)[1]);
    expect(chroma).toBeGreaterThan(0.04);
  });

  it('shows the empty state before any image is chosen', () => {
    render(<Component />);
    expect(screen.getByText(/no palette yet/i)).toBeInTheDocument();
  });

  it('renders the error state instead of a blank palette', () => {
    render(<Component hasError />);
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn.t read the image/i);
  });

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
