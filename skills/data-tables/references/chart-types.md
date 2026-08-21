# Chart Types & Data Visualization

Source: nextlevelbuilder/ui-ux-pro-max-skill (25 chart types)

## Contents

- [Selection Guide](#selection-guide)
- [Performance Thresholds](#performance-thresholds)
- [Recommended Libraries](#recommended-libraries)
- [Accessibility Rules](#accessibility-rules)
- [Color in Charts](#color-in-charts)
- [Chart Selection Decision Tree](#chart-selection-decision-tree)
- [Accessibility Requirements Per Chart Type](#accessibility-requirements-per-chart-type)
- [Recharts Implementation Patterns](#recharts-implementation-patterns)
- [Color Rules for Data Visualization](#color-rules-for-data-visualization)
- [When NOT to Use Each Chart (Anti-Patterns)](#when-not-to-use-each-chart-anti-patterns)
- [Animation Guidelines for Charts](#animation-guidelines-for-charts)
- [Responsive Patterns for Charts](#responsive-patterns-for-charts)

---

## Selection Guide

| Data question | Chart type | Accessibility |
|--------------|------------|--------------|
| Trend over time | Line chart | AA |
| Category comparison (≤15 items) | Bar chart | AAA |
| Part-to-whole (≤5 slices) | Pie/Donut | A |
| Part-to-whole (accessible) | Waffle chart | AAA |
| Distribution | Box plot | AA |
| Correlation | Scatter plot | A |
| Real-time monitoring | Streaming area | AA |
| KPI dashboard (3-10 items) | Bullet chart | AAA |
| Financial OHLC | Candlestick | AA |
| Geographic | Choropleth map | B |
| Hierarchy | Treemap | A |
| Flow/process | Sankey | B |
| Multi-axis comparison | Radar (5-8 axes, 2-3 datasets max) | A |
| Proportional 100% | Stacked bar | AA |
| Funnel progression | Funnel chart | AA |

## Performance Thresholds

| Data points | Renderer | Strategy |
|------------|----------|----------|
| < 1,000 | SVG (Recharts) | Direct render |
| 1,000 – 10,000 | Canvas + downsampling | Aggregate visible range |
| > 10,000 | Canvas + hexbin/heatmap | Aggregate to intervals |

## Recommended Libraries

- **Recharts** — React-native, declarative, good for dashboards
- **Chart.js** — Lightweight, canvas-based, broad chart types
- **D3.js** — Maximum flexibility, steep learning curve
- **Plotly** — Interactive scientific/financial charts
- **ApexCharts** — Good defaults, responsive

## Accessibility Rules

- Always include `aria-label` on chart containers
- Provide data table alternative for screen readers
- Never rely on color alone — add patterns, labels, or icons
- Minimum 3:1 contrast between adjacent chart elements
- Include axis labels and chart title
- Tabular data fallback: `<table>` with `sr-only` class

## Color in Charts

- Use sequential palette for ordered data (light → dark)
- Use categorical palette for distinct groups (max 7 colors)
- Avoid red-green pairs (color blindness)
- Use opacity variations of single hue for related series

---

## Chart Selection Decision Tree

Use this "Use X when…" guide to pick the right chart before reaching for a library.

**Bar chart** — use when comparing discrete categories side-by-side; when the number of items is ≤15; when exact values matter and labels must be legible. Horizontal bars when category names are long.

**Line chart** — use when data has a continuous time axis; when showing trends, rates of change, or multiple series evolving together. Do not use for unordered categories.

**Area chart** — use when showing cumulative volume over time; when stacked areas represent part-to-whole evolution. Avoid with more than 4 series (overlap becomes unreadable).

**Scatter plot** — use when exploring correlation or clustering between two continuous variables. Add a regression line when the relationship is the point. Requires color + shape encoding for a third variable.

**Pie / Donut** — use only when ≤5 slices and exact proportions matter less than "roughly half" perception. Donut variant preferred (adds a label anchor in the center). Never use when values are close in magnitude.

**Heatmap** — use for two-dimensional frequency or magnitude (time-of-day × day-of-week, user activity grids). Color scale must be sequential OKLCH; always include a legend.

**Treemap** — use for hierarchical part-to-whole when you have 10–100 items. Labels must be clipped gracefully. Not useful for comparing similar-sized items.

**Funnel chart** — use for conversion stages where each step is a subset of the previous. Always show absolute counts alongside percentages.

**Gauge / Radial** — use for single KPI vs. a target or threshold (e.g., 78% of quota). Keep to one metric per gauge; label the value numerically inside the arc.

**Candlestick** — use for financial OHLC (open, high, low, close) data. Requires tabular-nums font. Green/red color must be supplemented with up/down arrows for colorblind users.

**Histogram** — use when showing the distribution of a single continuous variable across bins. Bin width must be consistent; avoid gaps between bars.

**Radar / Spider** — use for comparing an entity across 5–8 qualitative dimensions (e.g., skill profiles, product feature scores). Limit to 2–3 overlapping datasets.

**Sankey** — use for flow between nodes (budget allocation, user journeys, energy). Best for 5–15 nodes; more creates visual noise. Left-to-right flow convention.

**Waterfall** — use to show sequential addition/subtraction contributing to a total (e.g., revenue bridge, cost breakdown). Color: positive contributions green, negative red/pink, total blue.

**Sparkline** — use as an inline trend indicator within a table cell or metric card. No axes, no labels — context comes from surrounding UI. Width ≥ 80px, height 24–32px.

---

## Accessibility Requirements Per Chart Type

All charts must meet WCAG 2.1 AA at minimum. Healthcare dashboards target AAA.

### Keyboard Navigation
- Chart container must be focusable (`tabIndex={0}`).
- Arrow keys should navigate between data points when focus is inside the chart.
- Press Enter on a data point to reveal a tooltip with the exact value.
- Provide a "View as table" toggle button adjacent to each chart.

### ARIA Patterns
```jsx
// Minimal aria pattern for any chart container
<div
  role="img"
  aria-label="Monthly revenue from Jan–Dec 2025. Peak in November at $142k."
  aria-describedby="chart-revenue-table"
>
  {/* chart */}
</div>
<table id="chart-revenue-table" className="sr-only">
  {/* full data table */}
</table>
```

- `role="img"` on the SVG/canvas wrapper.
- `aria-label` must state chart type, time range, and one key insight.
- `aria-describedby` links to the hidden data table.
- For interactive charts (tooltips, zoom), use `aria-live="polite"` on a status region.

### Color Contrast for Data Series
- Adjacent series bars/lines: ≥ 3:1 contrast ratio against each other AND against the background.
- Axis text: ≥ 4.5:1 against chart background.
- Grid lines: may be as low as 1.5:1 (decorative) but must not interfere with data.

### Alternative Text for Screen Readers
- Short alt: chart type + subject + key takeaway (fits in `aria-label`).
- Long desc: full data table or prose summary in `aria-describedby` element.
- Never use "Chart 1" or "Graph" alone as alt text.

---

## Recharts Implementation Patterns

### ResponsiveContainer (always required)
```jsx
import { ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={320}>
  {/* any Recharts chart */}
</ResponsiveContainer>
```
Always wrap charts in `ResponsiveContainer`. Never set fixed pixel widths on the chart itself.

### LineChart
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={320}>
  <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="oklch(85% 0 0)" />
    <XAxis dataKey="month" tick={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }} />
    <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="revenue" stroke="oklch(55% 0.2 264)" strokeWidth={2} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

### BarChart
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={320}>
  <BarChart data={data} barCategoryGap="30%">
    <CartesianGrid strokeDasharray="3 3" stroke="oklch(85% 0 0)" vertical={false} />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip cursor={{ fill: 'oklch(96% 0 0)' }} />
    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
      {data.map((entry, index) => (
        <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

### AreaChart
```jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={320}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="oklch(55% 0.2 264)" stopOpacity={0.25} />
        <stop offset="95%" stopColor="oklch(55% 0.2 264)" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="oklch(85% 0 0)" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area type="monotone" dataKey="value" stroke="oklch(55% 0.2 264)" fill="url(#gradRevenue)" strokeWidth={2} />
  </AreaChart>
</ResponsiveContainer>
```

### PieChart / Donut
```jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={280}>
  <PieChart>
    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
      {data.map((entry, index) => (
        <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value) => [`${value}%`, '']} />
    <Legend iconType="circle" iconSize={10} />
  </PieChart>
</ResponsiveContainer>
```
`innerRadius > 0` makes it a donut — always preferred for accessibility (center label space).

---

## Color Rules for Data Visualization

### OKLCH Categorical Palette (up to 8 series)
```js
const PALETTE = [
  'oklch(55% 0.20 264)',  // blue
  'oklch(65% 0.18 145)',  // green
  'oklch(70% 0.16 55)',   // amber
  'oklch(60% 0.22 310)',  // purple
  'oklch(65% 0.20 20)',   // orange-red
  'oklch(70% 0.14 195)',  // cyan
  'oklch(60% 0.18 340)',  // pink
  'oklch(50% 0.12 85)',   // olive
];
```

### Colorblind-Safe Rules
- Never pair red and green as the only distinguishing colors. Use red + blue or blue + orange instead.
- Deuteranopia affects ~6% of males — always add a secondary differentiator (pattern, shape, label).
- Use the Okabe-Ito palette as a reference: `#E69F00`, `#56B4E9`, `#009E73`, `#F0E442`, `#0072B2`, `#D55E00`, `#CC79A7`.

### Texture / Pattern as Secondary Differentiator
- Add `strokeDasharray` variations to line series: `"0"` (solid), `"6 2"` (dashed), `"2 2"` (dotted).
- For bar charts, use SVG `<pattern>` fills as a fallback when printing in black-and-white.
- For pie slices, vary opacity (1.0, 0.8, 0.6) when palette is unavailable.

### Sequential Palettes (single-hue)
- Light → dark within one hue for ordered magnitude (e.g., heatmaps).
- Use OKLCH lightness from 90% (low) → 35% (high): `oklch(90% 0.12 264)` → `oklch(35% 0.22 264)`.
- Always include a color legend with min/max labels.

---

## When NOT to Use Each Chart (Anti-Patterns)

- **Pie chart with >5 slices** — perception of angular differences breaks down. Use a bar chart instead.
- **3D charts** — distort proportions, add no information, and fail accessibility. Never use 3D bars, 3D pie, or 3D surface charts in UI.
- **Dual Y-axis** — misleads readers by implying a relationship between unrelated scales. Use two separate charts stacked vertically.
- **Stacked area with many series** — bottom series readable, top series incomprehensible. Limit to 3 series or use 100% stacked bar.
- **Radar with >8 axes** — angular gaps become meaningless. Switch to a heatmap or table.
- **Donut with a single slice** — just use a progress arc or gauge instead.
- **Bar chart for continuous data** — use a histogram with consistent bin widths instead.
- **Scatter with thousands of overlapping points** — use hexbin aggregation or a density heatmap.
- **Candlestick without volume bars** — always show volume as a secondary indicator beneath OHLC.
- **Funnel showing increases** — funnels only represent attrition. If a stage grows, you're using the wrong chart.

---

## Animation Guidelines for Charts

### On Mount (enter animations only)
- **Bar charts**: stagger bar entrance 80ms delay per bar from left to right. Use `animationBegin` and `animationDuration` in Recharts.
  ```jsx
  <Bar animationBegin={0} animationDuration={600} animationEasing="ease-out" />
  ```
- **Line charts**: draw the line from left to right. Use `strokeDasharray` + `strokeDashoffset` CSS animation or Recharts `animationDuration`.
- **Pie/Donut**: rotate from 0° to full arc. Duration: 600ms, easing: `ease-out`.
- **Area charts**: fade in + grow from baseline. Duration: 500ms.

### On Update (data changes)
- No entrance animation on data updates — jarring re-entrance confuses users.
- For real-time charts: slide new data in from the right; remove old data by sliding left.
- Number tickers (e.g., total revenue): animate value change with `useSpring` or CSS counter. Duration: 300ms.

### Accessibility for Animation
- Wrap all chart animations in `@media (prefers-reduced-motion: reduce)` guard:
  ```jsx
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  <Bar animationDuration={prefersReduced ? 0 : 600} />
  ```

---

## Responsive Patterns for Charts

### Breakpoint Behavior
- **Mobile (<640px)**: hide legend (show tooltip only), reduce tick density (every 3rd label), switch from grouped bar to stacked bar, use sparklines for summary rows in cards.
- **Tablet (640–1024px)**: show condensed legend (icon only, no text), reduce margin/padding, simplify axis labels (abbreviate months: Jan vs January).
- **Desktop (>1024px)**: full legend, full tick labels, hover interactions enabled.

### Simplifying Tick Labels on Mobile
```jsx
<XAxis
  tickFormatter={(value, index) => {
    // On mobile, show every other label
    if (window.innerWidth < 640 && index % 2 !== 0) return '';
    return value;
  }}
  interval={0}
/>
```

### Sparklines for Mobile Summary Views
- Use sparklines (no axes, no labels) in metric cards as mobile replacements for full charts.
- Minimum size: 80×24px. Show only the trend line, no fill.
- Pair with a direction indicator (▲ +12%) so the trend is readable without the chart.

### Legend Placement
- Desktop: right-side legend for line/area charts; bottom legend for pie/bar.
- Mobile: move legend to top (compact icon row) or hide and rely on tooltip.
- Never overlap legend with chart data.

### Touch Targets for Interactive Charts
- Tooltip trigger area: minimum 44×44px per data point on mobile.
- For bar charts, the entire bar column is the touch target — extend to full chart height if bars are narrow.
- Pinch-to-zoom for time-series charts on mobile requires `<ZoomableChart>` wrapper with `touch-action: pan-y`.
