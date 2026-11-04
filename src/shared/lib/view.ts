import { ALL_STATUSES, type DashboardView } from "../types";

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
