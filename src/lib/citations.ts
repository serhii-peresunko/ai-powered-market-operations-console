import type { Citation, Dataset } from "@/data/types";
import { type DashboardView, DASHBOARD_MODE } from "./view";
import { periodLabel } from "./format";
import { ALL_STATUSES } from "./metrics";

export function resolveCitation(
  data: Dataset,
  view: DashboardView,
  citation: Citation,
): { view: DashboardView; label: string } | null {
  const market = data.markets.find((item) => item.id === citation.marketId);
  const region = data.regions.find((item) => item.id === citation.regionId);
  const product = data.products.find((item) => item.id === citation.productId);
  const period = citation.period ?? data.meta.latestPeriod;
  if (
    (citation.marketId && !market) ||
    (citation.regionId && !region) ||
    (citation.productId && !product) ||
    !data.meta.periods.includes(period) ||
    (!market && !region) ||
    (citation.productId && !market) ||
    (market && region && market.regionId !== region.id)
  )
    return null;
  return {
    view: {
      ...view,
      region: market?.regionId ?? region?.id,
      market: market?.id,
      product: product?.id,
      period,
      mode: DASHBOARD_MODE.ANALYST,
      status: ALL_STATUSES,
    },
    label: [market?.name ?? region?.name, product?.name, periodLabel(period)]
      .filter(Boolean)
      .join(" · "),
  };
}
