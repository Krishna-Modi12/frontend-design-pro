/**
 * Mock analytics API for the dashboard demo.
 *
 * Every figure is deliberately irregular. Round fixtures (50%, $10,000) hide
 * alignment, truncation and formatting bugs that real telemetry exposes on day
 * one. Account MRR sums to exactly the "Recurring revenue" KPI so the table and
 * the metric row agree with each other.
 *
 * Swap the three fetch functions for real endpoints — the return types hold.
 */

export type TrendDirection = "up" | "down";
export type MetricFormat = "currency" | "count" | "percent";

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  format: MetricFormat;
  /** Signed change against the comparison window. */
  deltaPct: number;
  direction: TrendDirection;
  /** Falling churn is good news, falling revenue is not — colour follows this, not `direction`. */
  isImprovement: boolean;
  comparison: string;
}

export interface RevenuePoint {
  month: string;
  isoMonth: string;
  revenue: number;
  priorYear: number;
}

export type PlanTier = "Starter" | "Growth" | "Scale" | "Enterprise";
export type AccountHealth = "Healthy" | "Watch" | "At risk";

export interface AccountRow {
  id: string;
  company: string;
  owner: string;
  plan: PlanTier;
  mrr: number;
  /** Share of purchased seats that reached first value, in percent. */
  activation: number;
  health: AccountHealth;
  lastActiveIso: string;
}

export type AccountSortColumn = "company" | "plan" | "mrr" | "activation" | "lastActiveIso";
export type SortDirection = "asc" | "desc";

export interface AccountSort {
  column: AccountSortColumn;
  direction: SortDirection;
}

export interface DashboardSnapshot {
  kpis: KpiMetric[];
  revenue: RevenuePoint[];
  accounts: AccountRow[];
}

/**
 * Chart tokens. Recharts paints SVG through JS props rather than utility
 * classes, so these mirror the CSS custom properties declared in app/page.tsx.
 */
export const chartTokens = {
  current: "oklch(74% 0.132 200)",
  prior: "oklch(80% 0.128 74)",
  grid: "oklch(34% 0.018 264)",
  axisText: "oklch(72% 0.014 264)",
  fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
} as const;

/** Placeholder rows drawn while accounts load — matches a typical response so the table does not shift. */
export const skeletonRowCount = 8;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const preciseCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const countFormatter = new Intl.NumberFormat("en-US");

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return preciseCurrencyFormatter.format(value);
}

export function formatCurrencyCompact(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(`${iso}T00:00:00Z`));
}

const kpiMetrics: KpiMetric[] = [
  {
    id: "recurring-revenue",
    label: "Recurring revenue",
    value: 12847.32,
    format: "currency",
    deltaPct: 6.8,
    direction: "up",
    isImprovement: true,
    comparison: "vs. previous 30 days",
  },
  {
    id: "active-seats",
    label: "Active seats",
    value: 3291,
    format: "count",
    deltaPct: 4.7,
    direction: "up",
    isImprovement: true,
    comparison: "vs. previous 30 days",
  },
  {
    id: "activation-rate",
    label: "Seat activation",
    value: 47.2,
    format: "percent",
    deltaPct: 1.9,
    direction: "up",
    isImprovement: true,
    comparison: "vs. previous 30 days",
  },
  {
    id: "net-churn",
    label: "Net revenue churn",
    value: 2.4,
    format: "percent",
    deltaPct: -0.6,
    direction: "down",
    isImprovement: true,
    comparison: "vs. previous 30 days",
  },
];

const revenueSeries: RevenuePoint[] = [
  { month: "Aug", isoMonth: "2025-08", revenue: 9214.38, priorYear: 7418.92 },
  { month: "Sep", isoMonth: "2025-09", revenue: 9583.14, priorYear: 7702.46 },
  { month: "Oct", isoMonth: "2025-10", revenue: 10127.63, priorYear: 7891.08 },
  { month: "Nov", isoMonth: "2025-11", revenue: 9876.21, priorYear: 8043.77 },
  { month: "Dec", isoMonth: "2025-12", revenue: 10842.55, priorYear: 8320.14 },
  { month: "Jan", isoMonth: "2026-01", revenue: 11039.87, priorYear: 8477.63 },
  { month: "Feb", isoMonth: "2026-02", revenue: 10688.42, priorYear: 8611.29 },
  { month: "Mar", isoMonth: "2026-03", revenue: 11473.06, priorYear: 8894.51 },
  { month: "Apr", isoMonth: "2026-04", revenue: 11902.74, priorYear: 9032.18 },
  { month: "May", isoMonth: "2026-05", revenue: 12218.39, priorYear: 9247.85 },
  { month: "Jun", isoMonth: "2026-06", revenue: 12503.91, priorYear: 9418.62 },
  { month: "Jul", isoMonth: "2026-07", revenue: 12847.32, priorYear: 9602.44 },
];

const accountRows: AccountRow[] = [
  { id: "acc-4821", company: "Northwind Logistics", owner: "Amara Okonkwo", plan: "Enterprise", mrr: 1284.75, activation: 78.4, health: "Healthy", lastActiveIso: "2026-07-27" },
  { id: "acc-4362", company: "Hoshino Optics", owner: "Yuki Sato", plan: "Enterprise", mrr: 1417.6, activation: 83.6, health: "Healthy", lastActiveIso: "2026-07-27" },
  { id: "acc-4699", company: "Palo Verde Health", owner: "Sofía Herrera", plan: "Enterprise", mrr: 1122.4, activation: 71.8, health: "Watch", lastActiveIso: "2026-07-21" },
  { id: "acc-4128", company: "Karoo Water Group", owner: "Zanele Mbeki", plan: "Enterprise", mrr: 2239.52, activation: 74.3, health: "Healthy", lastActiveIso: "2026-07-26" },
  { id: "acc-4763", company: "Kestrel Robotics", owner: "Kenji Watanabe", plan: "Scale", mrr: 742.3, activation: 64.1, health: "Healthy", lastActiveIso: "2026-07-26" },
  { id: "acc-4588", company: "Blackwater Marine", owner: "Lukas Bergström", plan: "Scale", mrr: 688.55, activation: 68.9, health: "Healthy", lastActiveIso: "2026-07-25" },
  { id: "acc-4431", company: "Aurora Fields Co-op", owner: "Hanna Virtanen", plan: "Scale", mrr: 613.9, activation: 61.5, health: "Healthy", lastActiveIso: "2026-07-24" },
  { id: "acc-4288", company: "Sahel Microgrid", owner: "Ibrahim Diallo", plan: "Scale", mrr: 704.25, activation: 59.4, health: "Watch", lastActiveIso: "2026-07-23" },
  { id: "acc-4163", company: "Sundara Textiles", owner: "Arjun Nair", plan: "Scale", mrr: 576.8, activation: 63.7, health: "Watch", lastActiveIso: "2026-07-19" },
  { id: "acc-4017", company: "Accra Grid Labs", owner: "Nadia Osei", plan: "Scale", mrr: 659.45, activation: 55.9, health: "Healthy", lastActiveIso: "2026-07-26" },
  { id: "acc-4655", company: "Meridian Freight", owner: "Ravi Deshpande", plan: "Growth", mrr: 318.6, activation: 52.3, health: "Healthy", lastActiveIso: "2026-07-27" },
  { id: "acc-4540", company: "Fenghuang Analytics", owner: "Wei Chen", plan: "Growth", mrr: 284.95, activation: 44.7, health: "Watch", lastActiveIso: "2026-07-18" },
  { id: "acc-4398", company: "Lagos Ledger", owner: "Tobias Adeyemi", plan: "Growth", mrr: 341.2, activation: 57.8, health: "Healthy", lastActiveIso: "2026-07-24" },
  { id: "acc-4502", company: "Zamalek Textiles", owner: "Fatima Al-Sayed", plan: "Growth", mrr: 262.75, activation: 39.2, health: "At risk", lastActiveIso: "2026-06-24" },
  { id: "acc-4207", company: "Maison Clairveaux", owner: "Chloé Bernard", plan: "Growth", mrr: 297.4, activation: 66.2, health: "Healthy", lastActiveIso: "2026-07-25" },
  { id: "acc-4310", company: "Wisła Foundry", owner: "Marta Kowalczyk", plan: "Growth", mrr: 233.85, activation: 48.9, health: "Watch", lastActiveIso: "2026-07-14" },
  { id: "acc-4051", company: "Hanul Foods", owner: "Seo-yeon Park", plan: "Growth", mrr: 309.1, activation: 46.8, health: "Healthy", lastActiveIso: "2026-07-22" },
  { id: "acc-3985", company: "Levant Data Union", owner: "Omar Khalil", plan: "Growth", mrr: 271.3, activation: 41.3, health: "At risk", lastActiveIso: "2026-06-30" },
  { id: "acc-4611", company: "Cedar & Bay Studio", owner: "Noor Haddad", plan: "Starter", mrr: 78.45, activation: 31.6, health: "At risk", lastActiveIso: "2026-06-29" },
  { id: "acc-4477", company: "Andes Provisions", owner: "Diego Márquez", plan: "Starter", mrr: 92.3, activation: 27.4, health: "Watch", lastActiveIso: "2026-07-11" },
  { id: "acc-4241", company: "Volga Print Works", owner: "Elena Petrova", plan: "Starter", mrr: 64.9, activation: 22.8, health: "At risk", lastActiveIso: "2026-06-17" },
  { id: "acc-4094", company: "Trentino Cicli", owner: "Mateo Rossi", plan: "Starter", mrr: 88.15, activation: 34.1, health: "Watch", lastActiveIso: "2026-07-08" },
  { id: "acc-3942", company: "Lumière Optique", owner: "Camille Dubois", plan: "Starter", mrr: 71.6, activation: 29.7, health: "Watch", lastActiveIso: "2026-07-05" },
  { id: "acc-3908", company: "Iwata Precision", owner: "Haruto Iwata", plan: "Starter", mrr: 83.25, activation: 38.5, health: "Healthy", lastActiveIso: "2026-07-26" },
];

const dashboardSnapshot: DashboardSnapshot = {
  kpis: kpiMetrics,
  revenue: revenueSeries,
  accounts: accountRows,
};

export async function fetchKpiMetrics(): Promise<KpiMetric[]> {
  return dashboardSnapshot.kpis;
}

/**
 * Returns the trailing `monthsBack` months of revenue. The window is validated
 * because it comes from a UI control, and an out-of-range request is a real
 * failure the dashboard has to render rather than swallow.
 */
export async function fetchRevenueSeries(monthsBack: number): Promise<RevenuePoint[]> {
  const retained = dashboardSnapshot.revenue.length;
  if (!Number.isInteger(monthsBack) || monthsBack < 2 || monthsBack > retained) {
    throw new Error(
      `A ${monthsBack}-month revenue window is outside the retained range of 2 to ${retained} months.`,
    );
  }
  return dashboardSnapshot.revenue.slice(retained - monthsBack);
}

export async function fetchAccountRows(): Promise<AccountRow[]> {
  return dashboardSnapshot.accounts;
}

export default dashboardSnapshot;
