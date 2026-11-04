import { expect, it } from "vitest";
import { data } from "@/data";
import { readView } from "../view";
import { heatmapRows, varianceBand } from "./heatmap";

it("keeps the legend boundary behavior and missing ratios distinct", () => {
  expect([null, -10, -2, 2, 10].map(varianceBand)).toEqual([
    "unavailable",
    "severeMiss",
    "nearPlan",
    "nearPlan",
    "ahead",
  ]);
});

it("keeps source anomaly markers even when a source note is empty", () => {
  const market = data.markets[0];
  const period = data.meta.latestPeriod;
  const input = {
    ...data,
    markets: [
      {
        ...market,
        kpis: {
          ...market.kpis,
          anomalies: [{ period, type: "dip", note: "" }],
        },
      },
    ],
  };
  const [row] = heatmapRows(input, readView(new URLSearchParams(), input));
  expect(row.cells.find((cell) => cell.period === period)?.anomaly).toEqual({
    period,
    type: "dip",
    note: "",
  });
});
