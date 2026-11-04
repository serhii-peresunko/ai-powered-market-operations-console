export const COMPARISON_RADAR_TEXT = {
  removeComparison: (name: string) => `Remove ${name} from comparison`,
  chartLabel: (names: string) =>
    `Normalized revenue weight, growth, and attainment for ${names}. Exact values in the table below.`,
  title: "Performance comparison",
  eyebrow: "SIDE BY SIDE",
  description:
    "Compare up to four markets or regions. Product selection applies to every comparison.",
  addComparison: "Add comparison",
  limitReached: "Four comparisons selected",
  pickerPlaceholder: "Add a market or region…",
  removeIcon: "×",
  empty: "Add a market or region to begin comparing.",
  howToReadTheScales: "How to read the scales",
  scaleDescription:
    "All axes run from 0 to 100. Revenue weight is the entity’s share of portfolio revenue for this period and product scope. Growth maps −25% to 0 and +25% to 100. Attainment maps 0% to 0 and 120% to 100. Values outside these ranges are clipped visually; the table retains exact values. Unavailable values are omitted from interpretation.",
  tableLabel: "Comparison metrics",
  exactSourceDerivedValues: "Exact source-derived values · ",
  separator: " ·",
  tableHint: ". Use the comparison controls above to change entities.",
  tableSummary: "View comparison data table",
  entity: "Entity",
  revenue: "Revenue",
  growth: "Growth",
  attainment: "Attainment",
} as const;

export const PERFORMANCE_HEATMAP_TEXT = {
  cellLabel: (
    value: string,
    market: string,
    period: string,
    variance: string,
    anomaly?: string,
  ) =>
    `${value}${anomaly !== undefined ? "*" : ""} percent; ${market}, ${period}: ${variance} forecast variance${anomaly !== undefined ? `. Market anomaly: ${anomaly}` : ""}`,
  cellTitle: (
    market: string,
    period: string,
    variance: string,
    anomaly?: string,
  ) =>
    `${market} · ${period} · ${variance}${anomaly !== undefined ? ` · ${anomaly}` : ""}`,
  title: "Forecast variance by market",
  eyebrow: "FIND THE PATTERN",
  history: "24 months",
  description:
    "Actual vs forecast, in %. Select a cell to focus its market and period. Use arrow keys to move; Enter to select. * marks a source anomaly at market level.",
  tableLabel: "Forecast variance heat map and data table",
  tableCaption:
    "Signed forecast variance percentages, by market and month. Numeric values are the accessible alternative to the diverging colors.",
  market: "Market",
  anomalyMarker: "*",
  empty: "No markets match the current filters.",
  severeMiss: "≤ −10%",
  belowPlan: "−10% to −2%",
  nearPlan: "Within ±2%",
  abovePlan: "+2% to +10%",
  ahead: "≥ +10%",
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
  history: "24 months · ",
  description: " · Actual revenue against plan and the prior year. Selected: ",
  fullStop: ".",
  actual: "Actual",
  forecast: "Forecast",
  priorYear: "Prior year",
  chartLabel:
    "Revenue over 24 months; use arrow keys to explore or open the data table below.",
  unavailable: "Unavailable",
  tableLabel: "Revenue data table",
  revenueIn: " revenue in ",
  tableHint: ". Select a period to focus the dashboard.",
  tableSummary: "View revenue data table",
  period: "Period",
} as const;

export const CHART_BOUNDARY_TEXT = {
  failure:
    "The chart could not be displayed. Use the data table below to inspect the same values.",
} as const;
