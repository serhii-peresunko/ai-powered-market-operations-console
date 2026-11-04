import { MAX_COMPARISONS, RADAR_SCALE } from "../comparisons";
import { VARIANCE_BAND, VARIANCE_LIMIT } from "./heatmap";
import { FORMAT, percent } from "@/shared/lib/format";

interface CellDescription {
  value: string;
  market: string;
  period: string;
  variance: string;
  anomaly?: string;
}

const monthCount = (count: number) =>
  `${count} ${count === 1 ? "month" : "months"}`;

export const COMPARISON_RADAR_TEXT = {
  removeComparison: (name: string) => `Remove ${name} from comparison`,
  chartLabel: (names: string) =>
    `Normalized revenue weight, growth, and attainment for ${names}. Exact values in the table below.`,
  title: "Performance comparison",
  eyebrow: "SIDE BY SIDE",
  description: `Compare up to ${MAX_COMPARISONS} markets or regions. Product selection applies to every comparison.`,
  addComparison: "Add comparison",
  limitReached: `${MAX_COMPARISONS} comparisons selected`,
  pickerPlaceholder: "Add a market or region…",
  removeIcon: "×",
  empty: "Add a market or region to begin comparing.",
  howToReadTheScales: "How to read the scales",
  scaleDescription: [
    `All axes run from ${RADAR_SCALE.min} to ${RADAR_SCALE.max}.`,
    "Revenue weight is the entity’s share of portfolio revenue for this period and product scope.",
    `Growth maps ${percent(RADAR_SCALE.growthMin, true)} to ${RADAR_SCALE.min} and ${percent(RADAR_SCALE.growthMax, true)} to ${RADAR_SCALE.max}.`,
    `Attainment maps 0% to ${RADAR_SCALE.min} and ${percent(RADAR_SCALE.attainmentMax)} to ${RADAR_SCALE.max}.`,
    "Values outside these ranges are clipped visually; the table retains exact values. Unavailable values are omitted from interpretation.",
  ].join(" "),
  tableLabel: "Comparison metrics",
  tableCaption: (period: string, currency: string) =>
    `Exact source-derived values · ${period} · ${currency}. Use the comparison controls above to change entities.`,
  tableSummary: "View comparison data table",
  entity: "Entity",
  revenue: "Revenue",
  growth: "Growth",
  attainment: "Attainment",
} as const;

export const PERFORMANCE_HEATMAP_TEXT = {
  cellLabel: ({ value, market, period, variance, anomaly }: CellDescription) =>
    `${value}${anomaly !== undefined ? "*" : ""} percent; ${market}, ${period}: ${variance} forecast variance${anomaly !== undefined ? `. Market anomaly: ${anomaly}` : ""}`,
  cellTitle: ({ market, period, variance, anomaly }: CellDescription) =>
    `${market} · ${period} · ${variance}${anomaly !== undefined ? ` · ${anomaly}` : ""}`,
  title: "Forecast variance by market",
  eyebrow: "FIND THE PATTERN",
  history: monthCount,
  description:
    "Actual vs forecast, in %. Select a cell to focus its market and period. Use arrow keys to move; Enter to select. * marks a source anomaly at market level.",
  tableLabel: "Forecast variance heat map and data table",
  tableCaption:
    "Signed forecast variance percentages, by market and month. Numeric values are the accessible alternative to the diverging colors.",
  market: "Market",
  anomalyMarker: "*",
  empty: "No markets match the current filters.",
  legend: [
    {
      band: VARIANCE_BAND.SEVERE_MISS,
      label: `≤ ${percent(VARIANCE_LIMIT.severeMiss, true)}`,
    },
    {
      band: VARIANCE_BAND.BELOW_PLAN,
      label: `> ${percent(VARIANCE_LIMIT.severeMiss, true)} to < ${percent(VARIANCE_LIMIT.belowPlan, true)}`,
    },
    {
      band: VARIANCE_BAND.NEAR_PLAN,
      label: `${percent(VARIANCE_LIMIT.belowPlan, true)} to ${percent(VARIANCE_LIMIT.nearPlan, true)}`,
    },
    {
      band: VARIANCE_BAND.ABOVE_PLAN,
      label: `> ${percent(VARIANCE_LIMIT.nearPlan, true)} to < ${percent(VARIANCE_LIMIT.abovePlan, true)}`,
    },
    {
      band: VARIANCE_BAND.AHEAD,
      label: `≥ ${percent(VARIANCE_LIMIT.abovePlan, true)}`,
    },
  ],
  roundingNote:
    "Cells show rounded percentages; accessible labels and hover text retain one decimal place.",
} as const;

export const MARKET_MAP_TEXT = {
  title: "Markets at a glance",
  eyebrow: "A GLOBAL PERSPECTIVE",
  colorBy: "Color by",
  metrics: {
    attainment: "Forecast attainment",
    growth: "Year-on-year growth",
    revenue: "Revenue",
  },
  description: (period: string) =>
    `${period} · Select a country to drill in. Outlined country is selected; gray countries have no data in this scope.`,
  mapLabel: (metric: string) =>
    `${metric} by country. Tab to tracked countries and press Enter to select.`,
  countryLabel: (name: string, value: string, metric: string) =>
    `${name}: ${value} ${metric}`,
  countryWithoutData: (name: string) => `${name}: no data in current scope`,
  activeReadout: (name: string, value: string, metric: string) =>
    `${name} · ${value} ${metric}`,
  idleReadout: (count: number) =>
    `${count} tracked markets in scope · Hover or focus a country to inspect`,
  legendLabel: "Map color scale",
  bandLabel: (lower: string | null, upper: string | null) => {
    if (lower === null) return `< ${upper}`;
    if (upper === null) return `≥ ${lower}`;
    return `${lower} – < ${upper}`;
  },
  noData: "No data",
  tableLabel: "Country map data",
  tableCaption: (metric: string, period: string, currency: string) =>
    `${metric} · ${period}. All monetary values in ${currency}.`,
  tableSummary: "View map data table",
  country: "Country",
  region: "Region",
  selected: " · Selected",
  credit: "Made with Natural Earth · Public-domain country boundaries",
} as const;

export const REVENUE_TREND_TEXT = {
  selected: " · Selected",
  title: "Revenue trajectory",
  eyebrow: "PERFORMANCE OVER TIME",
  history: (count: number, currency: string) =>
    `${monthCount(count)} · ${currency}`,
  description: (scope: string, period: string) =>
    `${scope} · Actual revenue against plan and the prior year. Selected: ${period}.`,
  actual: "Actual",
  forecast: "Forecast",
  priorYear: "Prior year",
  chartLabel: (count: number) =>
    `Revenue over ${monthCount(count)}; use arrow keys to explore or open the data table below.`,
  unavailable: FORMAT.missingValue,
  tableLabel: "Revenue data table",
  tableCaption: (scope: string, currency: string) =>
    `${scope} revenue in ${currency}. Select a period to focus the dashboard.`,
  tableSummary: "View revenue data table",
  period: "Period",
} as const;

export const CHART_BOUNDARY_TEXT = {
  retry: "Retry chart",
  failure:
    "The chart could not be displayed. Use the data table below to inspect the same values.",
} as const;
