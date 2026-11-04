import { type Dataset, type DashboardView } from "@/shared/types";
import { metricsFor } from "@/shared/lib/metrics";

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

export const MAX_COMPARISONS = 4;
export const RADAR_SCALE = {
  min: 0,
  max: 100,
  growthMin: -25,
  growthMax: 25,
  attainmentMax: 120,
} as const;
const TEXT = {
  revenue: "Revenue weight",
  growth: "YoY growth",
  attainment: "Attainment",
} as const;

function normalize(value: number | null, minimum: number, maximum: number) {
  if (value === null) return null;
  const scaled = ((value - minimum) / (maximum - minimum)) * RADAR_SCALE.max;
  return Math.max(RADAR_SCALE.min, Math.min(RADAR_SCALE.max, scaled));
}

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
      axis: TEXT.revenue,
      ...Object.fromEntries(
        selected.map((item) => [
          item.id,
          portfolio === 0 ? null : (item.actual / portfolio) * RADAR_SCALE.max,
        ]),
      ),
    },
    {
      axis: TEXT.growth,
      ...Object.fromEntries(
        selected.map((item) => [
          item.id,
          normalize(item.growth, RADAR_SCALE.growthMin, RADAR_SCALE.growthMax),
        ]),
      ),
    },
    {
      axis: TEXT.attainment,
      ...Object.fromEntries(
        selected.map((item) => [
          item.id,
          normalize(item.attainment, 0, RADAR_SCALE.attainmentMax),
        ]),
      ),
    },
  ];
  return { options, selected, points };
}
