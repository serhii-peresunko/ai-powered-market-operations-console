import type { Dataset } from "@/data/types";
import { MAP_KPI, type DashboardView, type MapKpi } from "./view";
import { marketMetricsFor, type Metrics } from "./metrics";
import { FORMAT, money, percent } from "./format";

// Fixed percentage bands retain their meaning when the selected scope changes.
const ATTAINMENT_THRESHOLDS = [90, 97, 100, 105] as const;
const GROWTH_THRESHOLDS = [0, 5, 10, 15] as const;
// Revenue uses five equal bands relative to the largest market in scope.
const REVENUE_BAND_FRACTIONS = [0.2, 0.4, 0.6, 0.8] as const;
const MINIMUM_REVENUE_SCALE = 1;

export function mapThresholds(kpi: MapKpi, values: (number | null)[]) {
  if (kpi === MAP_KPI.ATTAINMENT) return [...ATTAINMENT_THRESHOLDS];
  if (kpi === MAP_KPI.GROWTH) return [...GROWTH_THRESHOLDS];
  const maximum = Math.max(
    MINIMUM_REVENUE_SCALE,
    ...values.map((value) => value ?? 0),
  );
  return REVENUE_BAND_FRACTIONS.map((fraction) => maximum * fraction);
}

export function mapBand(value: number | null, thresholds: number[]) {
  if (value === null) return null;
  return thresholds.filter((threshold) => value >= threshold).length;
}

function metricValue(metrics: Metrics, kpi: MapKpi) {
  if (kpi === MAP_KPI.REVENUE) return metrics.actual;
  if (kpi === MAP_KPI.GROWTH) return metrics.growth;
  return metrics.attainment;
}

export function formatMapValue(
  value: number | null,
  kpi: MapKpi,
  currency: string,
) {
  if (value === null) return FORMAT.missingValue;
  if (kpi === MAP_KPI.REVENUE) return money(value, currency);
  return percent(value, kpi === MAP_KPI.GROWTH);
}

export function marketMapData(data: Dataset, view: DashboardView) {
  const metrics = marketMetricsFor(
    data,
    { ...view, market: undefined },
    view.period,
  );
  const values = metrics.map((item) => metricValue(item, view.mapKpi));
  const thresholds = mapThresholds(view.mapKpi, values);
  const format = (value: number | null) =>
    formatMapValue(value, view.mapKpi, data.meta.currency);
  const rows = metrics.map((item, index) => ({
    market: item.market,
    value: values[index],
    formattedValue: format(values[index]),
    band: mapBand(values[index], thresholds),
    regionName: data.regions.find(
      (region) => region.id === item.market.regionId,
    )?.name,
  }));
  const legend = Array.from({ length: thresholds.length + 1 }, (_, band) => ({
    band,
    lower: band === 0 ? null : format(thresholds[band - 1]),
    upper: band === thresholds.length ? null : format(thresholds[band]),
  }));
  return { rows, legend };
}

export type MapRow = ReturnType<typeof marketMapData>["rows"][number];
