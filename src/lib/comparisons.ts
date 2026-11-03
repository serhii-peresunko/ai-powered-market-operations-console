import type { Dataset } from "@/data/types";
import type { DashboardView } from "./view";
import { metricsFor } from "./metrics";

export function comparisonEntities(data: Dataset) {
  return [
    ...data.regions.map(({ id, name }) => ({
      id: `region:${id}`,
      name,
      scope: { region: id, market: undefined },
    })),
    ...data.markets.map(({ id, name, regionId }) => ({
      id: `market:${id}`,
      name,
      scope: { region: regionId, market: id },
    })),
  ];
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function comparisonMetrics(
  data: Dataset,
  view: Pick<DashboardView, "compare" | "period" | "product">,
) {
  const options = comparisonEntities(data);
  const selected = options
    .filter((item) => view.compare.includes(item.id))
    .map((item) => ({
      ...item,
      ...metricsFor(
        data,
        { ...item.scope, product: view.product },
        view.period,
      ),
    }));
  const portfolio = metricsFor(
    data,
    { product: view.product },
    view.period,
  ).actual;
  const points = [
    {
      axis: "Revenue weight",
      ...Object.fromEntries(
        selected.map((item) => [
          item.id,
          portfolio === 0 ? null : (item.actual / portfolio) * 100,
        ]),
      ),
    },
    {
      axis: "YoY growth",
      ...Object.fromEntries(
        selected.map((item) => [
          item.id,
          item.growth === null ? null : clamp((item.growth + 25) * 2),
        ]),
      ),
    },
    {
      axis: "Attainment",
      ...Object.fromEntries(
        selected.map((item) => [
          item.id,
          item.attainment === null
            ? null
            : clamp((item.attainment / 120) * 100),
        ]),
      ),
    },
  ];
  return { options, selected, points };
}
