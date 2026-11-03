import { describe, expect, it } from "vitest";
import { data } from "@/data";
import { alertSchema, initialAlert, matchingMarkets } from "./alerts";

describe("alert validation", () => {
  const valid = { ...initialAlert, name: "Watch underperformance" };
  it("requires a condition, a valid scope, and enabled numeric thresholds", () => {
    for (const input of [{ ...valid, growthEnabled: false, attainmentEnabled: false }, { ...valid, scope: "market", targetId: "missing" }, { ...valid, growth: "" }, { ...valid, attainment: "-1" }]) expect(alertSchema(data).safeParse(input).success).toBe(false);
    expect(alertSchema(data).safeParse({ ...valid, growthEnabled: false, growth: "" }).success).toBe(true);
  });
  it("matches AND/OR conditions and limits the selected scope", () => {
    const base = { ...valid, scope: "market" as const, targetId: "de", growth: "0", attainment: "100" };
    expect(matchingMarkets(data, base, "2026-05").map((market) => market.id)).toEqual(["de"]);
    expect(matchingMarkets(data, { ...base, growth: "-99", match: "all" }, "2026-05")).toHaveLength(0);
    expect(matchingMarkets(data, { ...base, growth: "-99", match: "any" }, "2026-05")).toHaveLength(1);
  });
});
