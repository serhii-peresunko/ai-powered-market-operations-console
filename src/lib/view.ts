import type { Dataset, Status } from "@/data/types";
import { isStatus } from "@/data/types";
import type { Scope } from "./metrics";
import { comparisonEntities } from "./comparisons";

export interface DashboardView extends Scope {
  period: string;
  mode: "executive" | "analyst";
  mapKpi: "attainment" | "growth" | "revenue";
  compare: string[];
  status: "all" | Status;
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
    mode: params.get("mode") === "analyst" ? "analyst" : "executive",
    mapKpi: mapKpi === "growth" || mapKpi === "revenue" ? mapKpi : "attainment",
    status: isStatus(status) ? status : "all",
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
  if (view.status !== "all") params.set("status", view.status);
  return params;
}
