// Runtime stub for `recharts`. See ./README.md for why these exist.
//
// Recharts measures its container, and jsdom reports every element as 0×0, so
// recharts renders nothing here even when it is genuinely installed. A labelled
// placeholder is more honest than an empty <svg> that looks like a chart in a
// snapshot and contains no marks.
import * as React from 'react';

type AnyProps = Record<string, unknown>;

const wrapper = (testid?: string) => ({ children, ...rest }: AnyProps) =>
  React.createElement(
    'div',
    testid ? { 'data-testid': testid, ...rest } : rest,
    children as React.ReactNode,
  );

/** Axes, grids, tooltips and series render no DOM of their own. */
const none = (_p?: AnyProps) => null;

export const ResponsiveContainer = wrapper('chart');
export const AreaChart = wrapper();
export const LineChart = wrapper();
export const BarChart = wrapper();
export const PieChart = wrapper();
export const RadarChart = wrapper();
export const ComposedChart = wrapper();

export const Area = none;
export const Line = none;
export const Bar = none;
export const Pie = none;
export const Cell = none;
export const Radar = none;
export const CartesianGrid = none;
export const XAxis = none;
export const YAxis = none;
export const PolarGrid = none;
export const PolarAngleAxis = none;
export const Tooltip = none;
export const Legend = none;
export const ReferenceLine = none;
export const Brush = none;
