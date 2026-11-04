import { type Dataset, type DashboardView } from "@/shared/types";
import { marketMetricsFor, metricsFor } from "@/shared/lib/metrics";

export const SORT_KEY = {
  REVENUE: "actual",
  GROWTH: "growth",
  ATTAINMENT: "attainment",
  GAP: "gap",
} as const;
export type SortKey = (typeof SORT_KEY)[keyof typeof SORT_KEY];
export interface MarketSort {
  key: SortKey;
  ascending: boolean;
}

export function marketTableData(
  data: Dataset,
  view: DashboardView,
  sort: MarketSort,
) {
  const selectedMarket = data.markets.find(
    (market) => market.id === view.market,
  );
  const rows = selectedMarket
    ? data.products.map((product) => ({
        id: product.id,
        name: product.name,
        market: selectedMarket,
        ...metricsFor(
          data,
          {
            market: selectedMarket.id,
            product: product.id,
            status: view.status,
          },
          view.period,
        ),
      }))
    : marketMetricsFor(data, view, view.period).map(
        ({ market, ...metrics }) => ({
          id: market.id,
          name: market.name,
          market,
          ...metrics,
        }),
      );
  rows.sort((a, b) => {
    const left = a[sort.key];
    const right = b[sort.key];
    // Missing ratios stay last, in either sort direction.
    if (left === null) return right === null ? 0 : 1;
    if (right === null) return -1;
    return (sort.ascending ? 1 : -1) * (left - right);
  });
  return { rows, selectedMarket };
}
export type MarketTableItem = ReturnType<
  typeof marketTableData
>["rows"][number];
