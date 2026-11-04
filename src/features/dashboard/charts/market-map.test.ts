import { describe, expect, it } from "vitest";
import { data } from "@/data";
import { MAP_KPI } from "@/shared/types";
import { readView } from "../view";
import { mapThresholds, mapBand, marketMapData } from "./market-map";

describe("market map scales", () => {
  it("keeps percentage bands stable across different scopes", () => {
    expect(mapThresholds(MAP_KPI.ATTAINMENT, [50, 200])).toEqual([
      90, 97, 100, 105,
    ]);
    expect(mapThresholds(MAP_KPI.GROWTH, [-20, 80])).toEqual([0, 5, 10, 15]);
  });
  it("uses fifths of the largest revenue and keeps an empty scale usable", () => {
    expect(mapThresholds(MAP_KPI.REVENUE, [100, 500, null])).toEqual([
      100, 200, 300, 400,
    ]);
    expect(mapThresholds(MAP_KPI.REVENUE, [])).toEqual([0.2, 0.4, 0.6, 0.8]);
    expect(mapThresholds(MAP_KPI.REVENUE, [0, null])).toEqual([
      0.2, 0.4, 0.6, 0.8,
    ]);
  });
  it("places equality in the higher band and preserves unavailable values", () => {
    const thresholds = [90, 97, 100, 105];
    expect(
      [null, 89, 90, 97, 100, 105].map((value) => mapBand(value, thresholds)),
    ).toEqual([null, 0, 1, 2, 3, 4]);
  });
  it("retains the region scope when a selected country is being inspected", () => {
    const view = readView(new URLSearchParams("market=de&kpi=revenue"), data);
    const result = marketMapData(data, view);
    expect(result.rows.map((row) => row.market.id)).toEqual(
      data.markets
        .filter((market) => market.regionId === "eu")
        .map((market) => market.id),
    );
    expect(result.legend).toHaveLength(5);
  });
});
