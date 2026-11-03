import type { Dataset, SeriesRow } from "../data/types";

export interface Scope {
  region?: string;
  market?: string;
  product?: string;
}

export function marketsInScope(data: Dataset, scope: Scope) {
  return data.markets.filter((market) =>
    (!scope.region || market.regionId === scope.region) && (!scope.market || market.id === scope.market));
}

export function seriesInScope(data: Dataset, scope: Scope): SeriesRow[] {
  const ids = new Set(marketsInScope(data, scope).map((market) => market.id));
  return data.series.filter((row) => ids.has(row.marketId) && (!scope.product || row.productId === scope.product));
}

export function ratio(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator * 100;
}

export function summarize(rows: SeriesRow[]) {
  const sums = rows.reduce((total, row) => ({
    actual: total.actual + row.actual,
    forecast: total.forecast + row.forecast,
    priorYear: total.priorYear + row.priorYear,
    units: total.units + row.units,
  }), { actual: 0, forecast: 0, priorYear: 0, units: 0 });
  return {
    ...sums,
    growth: sums.priorYear === 0 ? null : (sums.actual / sums.priorYear - 1) * 100,
    attainment: ratio(sums.actual, sums.forecast),
    gap: sums.actual - sums.forecast,
  };
}

export function metricsFor(data: Dataset, scope: Scope, period: string) {
  return summarize(seriesInScope(data, scope).filter((row) => row.period === period));
}

export function trendFor(data: Dataset, scope: Scope) {
  const rows = seriesInScope(data, scope);
  return data.meta.periods.map((period) => ({ period, ...summarize(rows.filter((row) => row.period === period)) }));
}

export function scopeName(data: Dataset, scope: Scope) {
  return data.products.find((item) => item.id === scope.product)?.name
    ?? data.markets.find((item) => item.id === scope.market)?.name
    ?? data.regions.find((item) => item.id === scope.region)?.name
    ?? "Portfolio";
}
