import { describe, expect, it } from "vitest";
import { data } from "../data";
import {
  metricsFor,
  marketMetricsFor,
  ratio,
  seriesInScope,
  summarize,
  trendFor,
} from "./metrics";

describe("source integrity", () => {
  it("resolves all fact references", () => {
    for (const row of data.series) {
      expect(data.markets.some((market) => market.id === row.marketId)).toBe(
        true,
      );
      expect(
        data.products.some((product) => product.id === row.productId),
      ).toBe(true);
      expect(data.meta.periods).toContain(row.period);
    }
  });
});

describe("metrics", () => {
  it("projects market metrics with the same scope used by charts and tables", () => {
    const rows = marketMetricsFor(
      data,
      { region: "eu", product: "veltrix", status: "off_track" },
      "2026-03",
    );
    expect(rows.map(({ market }) => market.id)).toEqual(["de", "es"]);
    expect(rows.find(({ market }) => market.id === "de")).toMatchObject(
      metricsFor(data, { market: "de", product: "veltrix" }, "2026-03"),
    );
  });
  it("computes percentages from sums rather than averaging percentages", () => {
    const base = { marketId: "a", productId: "p", period: "2026-05", units: 1 };
    const result = summarize([
      { ...base, actual: 100, forecast: 200, priorYear: 50 },
      { ...base, actual: 900, forecast: 900, priorYear: 900 },
    ]);
    expect(result.actual).toBe(1000);
    expect(result.attainment).toBeCloseTo((1000 / 1100) * 100);
    expect(result.growth).toBeCloseTo((1000 / 950 - 1) * 100);
    expect(result.gap).toBe(-100);
  });

  it("does not invent values for zero denominators", () => {
    expect(ratio(1, 0)).toBeNull();
    expect(summarize([])).toMatchObject({
      actual: 0,
      growth: null,
      attainment: null,
    });
  });

  it("applies source status filters consistently to facts and totals", () => {
    const rows = seriesInScope(data, { status: "off_track" });
    expect(new Set(rows.map((row) => row.marketId))).toEqual(
      new Set(["de", "es"]),
    );
    expect(metricsFor(data, { status: "off_track" }, "2026-05").actual).toBe(
      metricsFor(data, { market: "de" }, "2026-05").actual +
        metricsFor(data, { market: "es" }, "2026-05").actual,
    );
  });

  it("filters all hierarchy levels and produces one point per month", () => {
    const rows = seriesInScope(data, {
      region: "eu",
      market: "de",
      product: "veltrix",
    });
    expect(rows).toHaveLength(24);
    expect(
      rows.every((row) => row.marketId === "de" && row.productId === "veltrix"),
    ).toBe(true);
    expect(trendFor(data, { market: "de" })).toHaveLength(24);
    const total = data.regions.reduce(
      (sum, region) =>
        sum +
        metricsFor(data, { region: region.id }, data.meta.latestPeriod).actual,
      0,
    );
    expect(total).toBe(metricsFor(data, {}, data.meta.latestPeriod).actual);
  });
});

describe("sparse facts", () => {
  it("retains scoped markets that have no matching facts", () => {
    const input = {
      ...data,
      series: data.series.filter((row) => row.marketId === "de"),
    };
    const rows = marketMetricsFor(
      input,
      { region: "eu" },
      data.meta.latestPeriod,
    );
    expect(rows.map((row) => row.market.id)).toEqual(
      data.markets
        .filter((market) => market.regionId === "eu")
        .map((market) => market.id),
    );
    expect(rows.find((row) => row.market.id === "fr")).toMatchObject({
      actual: 0,
      forecast: 0,
      priorYear: 0,
      units: 0,
      growth: null,
      attainment: null,
      gap: 0,
    });
    expect(rows.find((row) => row.market.id === "de")).toMatchObject(
      metricsFor(input, { market: "de" }, data.meta.latestPeriod),
    );
  });

  it("retains reporting periods that have no matching facts", () => {
    const [missingPeriod, populatedPeriod] = data.meta.periods;
    const input = {
      ...data,
      series: data.series.filter((row) => row.period === populatedPeriod),
    };
    const points = trendFor(input, { region: "eu", product: "veltrix" });
    expect(points.map((point) => point.period)).toEqual(data.meta.periods);
    expect(
      points.find((point) => point.period === missingPeriod),
    ).toMatchObject({ actual: 0, growth: null, attainment: null });
    expect(
      points.find((point) => point.period === populatedPeriod),
    ).toMatchObject(
      metricsFor(input, { region: "eu", product: "veltrix" }, populatedPeriod),
    );
  });
});
