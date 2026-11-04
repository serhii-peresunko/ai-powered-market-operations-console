import { describe, expect, it } from "vitest";
import { data } from "@/data";
import { comparisonEntities, comparisonMetrics } from "./comparisons";

describe("comparison model", () => {
  it("resolves entity scope and keeps region revenue contributions on one scale", () => {
    const model = comparisonMetrics(data, {
      period: data.meta.latestPeriod,
      compare: data.regions.map((region) => `region:${region.id}`),
    });
    expect(model.selected.reduce((sum, item) => sum + item.actual, 0)).toBe(
      data.series
        .filter((row) => row.period === data.meta.latestPeriod)
        .reduce((sum, row) => sum + row.actual, 0),
    );
    expect(
      comparisonEntities(data).find((item) => item.id === "market:de")?.scope,
    ).toEqual({ region: "eu", market: "de" });
  });

  it("clips only radar coordinates while preserving raw comparison metrics", () => {
    const market = data.markets[0];
    const input = {
      ...data,
      markets: [market],
      series: [
        {
          marketId: market.id,
          productId: data.products[0].id,
          period: data.meta.latestPeriod,
          actual: 200,
          priorYear: 100,
          forecast: 100,
          units: 1,
        },
      ],
    };
    const id = `market:${market.id}`;
    const result = comparisonMetrics(input, {
      period: data.meta.latestPeriod,
      compare: [id],
    });
    expect(result.selected[0]).toMatchObject({
      actual: 200,
      growth: 100,
      attainment: 200,
    });
    expect(result.points[1]).toMatchObject({ [id]: 100 });
    expect(result.points[2]).toMatchObject({ [id]: 100 });
  });
});
