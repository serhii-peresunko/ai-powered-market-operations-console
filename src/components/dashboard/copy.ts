import { MARKET_STATUS, type Status } from "@/data/types";
import { FORMAT } from "@/lib/format";

export const STATUS_LABELS = {
  [MARKET_STATUS.ON_TRACK]: "On track",
  [MARKET_STATUS.AT_RISK]: "At risk",
  [MARKET_STATUS.OFF_TRACK]: "Off track",
} satisfies Record<Status, string>;

export const DASHBOARD_HEADER_TEXT = {
  drillPath: "Drill path",
  portfolio: "Portfolio",
  breadcrumbSeparator: "/",
  sourceIcon: "●",
  canonicalDataset: "Canonical dataset",
  eyebrow: "YOUR PORTFOLIO, IN FOCUS",
  title: (scope: string) => `${scope} overview`,
  description: "The signals that matter. The context to act.",
  reportingPeriod: "REPORTING PERIOD",
  sourceNote: (period: string, currency: string) =>
    `Source data · ${period} · All revenue in ${currency}`,
  syntheticAssignmentDataset: "Synthetic assignment dataset",
  audienceView: "Audience view",
  executiveOverview: "Executive overview",
  analystDeepDive: "Analyst deep-dive",
  executiveDescription: "Health, trends & priorities",
  analystDescription: "Full metrics & every drill path",
  latestStatusFilter: (status: string) => `Latest status filter: ${status}`,
  clearFilter: "Clear filter",
} as const;

export const VIEW_CONTROLS_TEXT = {
  region: "Region",
  allRegions: "All regions",
  market: "Market",
  allMarkets: "All markets",
  product: "Product",
  allProducts: "All products",
  reportingPeriod: "Reporting period",
  latestSourceStatus: "Latest source status",
  allStatuses: "All statuses",
  resetScope: "Reset scope",
} as const;

export const DASHBOARD_SUMMARY_TEXT = {
  latestStatus: (period: string) => `Latest source status · ${period}`,
  anomaly: (period: string, note: string) => `${period}: ${note}`,
  totalRevenue: "Total revenue",
  vsPriorYear: "vs prior year",
  forecastAttainment: "Forecast attainment",
  vsPlan: "vs plan",
  yearOnYearGrowth: "Year-on-year growth",
  samePeriodPriorYear: "Same period, prior year",
  marketsToWatch: "Markets to watch",
  totalMarkets: (count: number) => ` / ${count}`,
  selectedScopeHealth: "Selected scope health",
  sourceNotes: (market: string) => `Source notes · ${market}`,
  noAnomalies: "No anomalies marked in the supplied data.",
  sourceDateNote: (period: string) =>
    `These are market-level notes; latest status is dated ${period}.`,
} as const;

export const MARKET_TABLE_TEXT = {
  productTitle: (name: string) => `${name} · Product performance`,
  rowCount: (count: number, products: boolean) =>
    `${count} ${products ? "products" : "markets"}`,
  positive: "+",
  ascending: "↑",
  descending: "↓",
  unsorted: "↕",
  selected: " · Selected",
  title: "Market performance",
  eyebrow: "THE NUMBERS BEHIND THE SIGNAL",
  tableLabel: "Detailed performance data",
  tableCaption: (period: string, currency: string, sourcePeriod: string) =>
    `${period} · Revenue in ${currency}. Status and market share refer to ${sourcePeriod}; market share is unavailable for products or historical periods.`,
  product: "Product",
  market: "Market",
  region: "Region",
  revenue: "Revenue",
  forecast: "Forecast",
  variance: "Variance",
  growth: "Growth",
  attainment: "Attainment",
  units: "Units",
  marketShare: "Market share",
  latestStatus: "Latest status",
  unavailable: FORMAT.missingValue,
  empty: "No markets match this selection. Change the scope or status filter.",
} as const;

export const MARKET_PRIORITIES_TEXT = {
  positive: "+",
  marketsToWatch: "Markets to watch",
  riskEyebrow: "PRIORITIZE",
  marketCount: (count: number) => `${count} markets`,
  riskDescription: "Latest source flags, including off-track markets.",
  empty: "No source-flagged markets in this scope.",
  largestForecastGaps: "Largest forecast gaps",
  moversEyebrow: "WHAT MOVED THE NEEDLE",
  moversDescription: "Ranked by absolute revenue variance from plan.",
  attainment: (value: string) => `${value} of forecast`,
} as const;

export const DASHBOARD_CHARTS_TEXT = {
  loadingRevenueChart: "Loading revenue chart…",
  loadingCountryMap: "Loading country map…",
  loadingComparisonChart: "Loading comparison chart…",
  loadingHeatMap: "Loading heat map…",
} as const;

export const MARKET_CONSOLE_TEXT = {
  sourceOfTruthCanonicalDataset: "Source of truth: canonical dataset",
  generated: (date: string) => `Generated ${date}`,
} as const;
