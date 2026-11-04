import type { Dataset, Status } from "@/data/types";
import { isStatus } from "@/data/types";
import { ALL_STATUSES, type Scope } from "./metrics";
import { comparisonEntities } from "./comparisons";

export const DASHBOARD_MODE = {
  EXECUTIVE: "executive",
  ANALYST: "analyst",
} as const;
export type DashboardMode =
  (typeof DASHBOARD_MODE)[keyof typeof DASHBOARD_MODE];

export const MAP_KPI = {
  ATTAINMENT: "attainment",
  GROWTH: "growth",
  REVENUE: "revenue",
} as const;
export type MapKpi = (typeof MAP_KPI)[keyof typeof MAP_KPI];

export function isMapKpi(value: unknown): value is MapKpi {
  return (
    value === MAP_KPI.ATTAINMENT ||
    value === MAP_KPI.GROWTH ||
    value === MAP_KPI.REVENUE
  );
}

export interface DashboardView extends Scope {
  period: string;
  mode: DashboardMode;
  mapKpi: MapKpi;
  compare: string[];
  status: typeof ALL_STATUSES | Status;
}

export function readView(
  params: Pick<URLSearchParams, "get">,
  data: Dataset,
): DashboardView {
  const region = data.regions.find((item) => item.id === params.get("region"));
  const market = data.markets.find((item) => item.id === params.get("market"));
  const product =
    market && data.products.find((item) => item.id === params.get("product"));
  const period = params.get("period");
  const mapKpi = params.get("kpi");
  const status = params.get("status");
  const compare = params.get("compare");
  const comparisonIds = new Set(
    comparisonEntities(data).map((item) => item.id),
  );
  return {
    region: market?.regionId ?? region?.id,
    market: market?.id,
    product: product ? product.id : undefined,
    period:
      period && data.meta.periods.includes(period)
        ? period
        : data.meta.latestPeriod,
    mode:
      params.get("mode") === DASHBOARD_MODE.ANALYST
        ? DASHBOARD_MODE.ANALYST
        : DASHBOARD_MODE.EXECUTIVE,
    mapKpi: isMapKpi(mapKpi) ? mapKpi : MAP_KPI.ATTAINMENT,
    status: isStatus(status) ? status : ALL_STATUSES,
    compare:
      compare === null
        ? ["region:eu", "region:apac"]
        : [
            ...new Set(
              compare.split(",").filter((id) => comparisonIds.has(id)),
            ),
          ].slice(0, 4),
  };
}

export function viewParams(view: DashboardView) {
  const params = new URLSearchParams();
  if (view.region) params.set("region", view.region);
  if (view.market) params.set("market", view.market);
  if (view.product) params.set("product", view.product);
  params.set("period", view.period);
  params.set("mode", view.mode);
  params.set("kpi", view.mapKpi);
  params.set("compare", view.compare.join(","));
  if (view.status !== ALL_STATUSES) params.set("status", view.status);
  return params;
}
