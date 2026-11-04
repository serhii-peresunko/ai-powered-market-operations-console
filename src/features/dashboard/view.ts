import {
  type Dataset,
  type DashboardView,
  isStatus,
  isMapKpi,
  ALL_STATUSES,
  DASHBOARD_MODE,
  MAP_KPI,
} from "@/shared/types";
import { comparisonEntities, MAX_COMPARISONS } from "./comparisons";

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
          ].slice(0, MAX_COMPARISONS),
  };
}
