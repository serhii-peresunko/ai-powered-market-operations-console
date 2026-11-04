import type { Dataset } from "@/data/types";
import type { DashboardView } from "./view";
import { FORMAT } from "./format";
import { marketsInScope, trendFor } from "./metrics";

export const VARIANCE_BAND = {
  UNAVAILABLE: "unavailable",
  SEVERE_MISS: "severeMiss",
  BELOW_PLAN: "belowPlan",
  NEAR_PLAN: "nearPlan",
  ABOVE_PLAN: "abovePlan",
  AHEAD: "ahead",
} as const;

export const VARIANCE_LIMIT = {
  severeMiss: -10,
  belowPlan: -2,
  nearPlan: 2,
  abovePlan: 10,
} as const;
const TEXT = { missing: "—", positive: "+" } as const;

export function varianceBand(variance: number | null) {
  if (variance === null) return VARIANCE_BAND.UNAVAILABLE;
  if (variance <= VARIANCE_LIMIT.severeMiss) return VARIANCE_BAND.SEVERE_MISS;
  if (variance < VARIANCE_LIMIT.belowPlan) return VARIANCE_BAND.BELOW_PLAN;
  if (variance <= VARIANCE_LIMIT.nearPlan) return VARIANCE_BAND.NEAR_PLAN;
  if (variance < VARIANCE_LIMIT.abovePlan) return VARIANCE_BAND.ABOVE_PLAN;
  return VARIANCE_BAND.AHEAD;
}

export function heatmapRows(data: Dataset, view: DashboardView) {
  return marketsInScope(data, { ...view, market: undefined }).map((market) => ({
    market,
    cells: trendFor(data, { market: market.id, product: view.product }).map(
      (point) => {
        const variance =
          point.attainment === null
            ? null
            : point.attainment - FORMAT.percentBase;
        const displayValue =
          variance === null
            ? TEXT.missing
            : `${variance >= 0 ? TEXT.positive : ""}${variance.toFixed(0)}`;
        return {
          period: point.period,
          variance,
          displayValue,
          band: varianceBand(variance),
          anomaly: market.kpis.anomalies.find(
            (item) => item.period === point.period,
          ),
        };
      },
    ),
  }));
}
export type HeatmapCellData = ReturnType<
  typeof heatmapRows
>[number]["cells"][number];
