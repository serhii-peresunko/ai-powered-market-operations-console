import {
  ALL_STATUSES,
  type Dataset,
  type SeriesRow,
  type Scope,
} from "../types";

const PERCENT_BASE = 100;
const TEXT = { portfolio: "Portfolio" } as const;

export function marketsInScope(data: Dataset, scope: Scope) {
  return data.markets.filter(
    (market) =>
      (!scope.region || market.regionId === scope.region) &&
      (!scope.market || market.id === scope.market) &&
      (!scope.status ||
        scope.status === ALL_STATUSES ||
        market.kpis.status === scope.status),
  );
}

export function seriesInScope(data: Dataset, scope: Scope): SeriesRow[] {
  const ids = new Set(marketsInScope(data, scope).map((market) => market.id));
  return data.series.filter(
    (row) =>
      ids.has(row.marketId) &&
      (!scope.product || row.productId === scope.product),
  );
}

export function ratio(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : (numerator / denominator) * PERCENT_BASE;
}

export function summarize(rows: SeriesRow[]) {
  const sums = rows.reduce(
    (total, row) => ({
      actual: total.actual + row.actual,
      forecast: total.forecast + row.forecast,
      priorYear: total.priorYear + row.priorYear,
      units: total.units + row.units,
    }),
    { actual: 0, forecast: 0, priorYear: 0, units: 0 },
  );
  return {
    ...sums,
    growth:
      sums.priorYear === 0
        ? null
        : (sums.actual / sums.priorYear - 1) * PERCENT_BASE,
    attainment: ratio(sums.actual, sums.forecast),
    gap: sums.actual - sums.forecast,
  };
}

export function metricsFor(data: Dataset, scope: Scope, period: string) {
  return summarize(
    seriesInScope(data, scope).filter((row) => row.period === period),
  );
}

export type Metrics = ReturnType<typeof summarize>;

export function marketMetricsFor(data: Dataset, scope: Scope, period: string) {
  const markets = marketsInScope(data, scope);
  const rowsByMarket = new Map(
    markets.map((market) => [market.id, [] as SeriesRow[]]),
  );
  // Visit the facts once, rather than scanning all facts for every market.
  for (const row of data.series) {
    if (
      row.period === period &&
      (!scope.product || row.productId === scope.product)
    ) {
      rowsByMarket.get(row.marketId)?.push(row);
    }
  }
  return markets.map((market) => ({
    market,
    ...summarize(rowsByMarket.get(market.id) ?? []),
  }));
}

export function trendFor(data: Dataset, scope: Scope) {
  const rowsByPeriod = new Map(
    data.meta.periods.map((period) => [period, [] as SeriesRow[]]),
  );
  for (const row of seriesInScope(data, scope)) {
    rowsByPeriod.get(row.period)?.push(row);
  }
  return data.meta.periods.map((period) => ({
    period,
    ...summarize(rowsByPeriod.get(period) ?? []),
  }));
}

export function scopeName(data: Dataset, scope: Scope) {
  return (
    data.products.find((item) => item.id === scope.product)?.name ??
    data.markets.find((item) => item.id === scope.market)?.name ??
    data.regions.find((item) => item.id === scope.region)?.name ??
    TEXT.portfolio
  );
}
