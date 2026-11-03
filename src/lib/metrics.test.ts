import { describe, expect, it } from "vitest";
import { data } from "../data";
import { fallback, fixtures } from "../data/fixtures";
import { metricsFor, ratio, seriesInScope, summarize, trendFor } from "./metrics";

describe("source integrity", () => {
  it("resolves all fact and citation references", () => {
    for (const row of data.series) {
      expect(data.markets.some((market) => market.id === row.marketId)).toBe(true);
      expect(data.products.some((product) => product.id === row.productId)).toBe(true);
      expect(data.meta.periods).toContain(row.period);
    }
    for (const fixture of [fallback, ...fixtures]) for (const citation of fixture.answer.citations) {
      if (citation.marketId) expect(data.markets.some((market) => market.id === citation.marketId)).toBe(true);
      if (citation.regionId) expect(data.regions.some((region) => region.id === citation.regionId)).toBe(true);
      if (citation.productId) expect(data.products.some((product) => product.id === citation.productId)).toBe(true);
      if (citation.period) expect(data.meta.periods).toContain(citation.period);
    }
  });
});

describe("metrics", () => {
  it("computes percentages from sums rather than averaging percentages", () => {
    const base = { marketId: "a", productId: "p", period: "2026-05", units: 1 };
    const result = summarize([
      { ...base, actual: 100, forecast: 200, priorYear: 50 },
      { ...base, actual: 900, forecast: 900, priorYear: 900 },
    ]);
    expect(result.actual).toBe(1000);
    expect(result.attainment).toBeCloseTo(1000 / 1100 * 100);
    expect(result.growth).toBeCloseTo((1000 / 950 - 1) * 100);
    expect(result.gap).toBe(-100);
  });

  it("does not invent values for zero denominators", () => {
    expect(ratio(1, 0)).toBeNull();
    expect(summarize([])).toMatchObject({ actual: 0, growth: null, attainment: null });
  });

  it("applies source status filters consistently to facts and totals", () => {
    const rows = seriesInScope(data, { status: "off_track" });
    expect(new Set(rows.map((row) => row.marketId))).toEqual(new Set(["de", "es"]));
    expect(metricsFor(data, { status: "off_track" }, "2026-05").actual).toBe(
      metricsFor(data, { market: "de" }, "2026-05").actual + metricsFor(data, { market: "es" }, "2026-05").actual);
  });

  it("filters all hierarchy levels and produces one point per month", () => {
    const rows = seriesInScope(data, { region: "eu", market: "de", product: "veltrix" });
    expect(rows).toHaveLength(24);
    expect(rows.every((row) => row.marketId === "de" && row.productId === "veltrix")).toBe(true);
    expect(trendFor(data, { market: "de" })).toHaveLength(24);
    const total = data.regions.reduce((sum, region) => sum + metricsFor(data, { region: region.id }, data.meta.latestPeriod).actual, 0);
    expect(total).toBe(metricsFor(data, {}, data.meta.latestPeriod).actual);
  });
});
