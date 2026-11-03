import { describe, expect, it } from "vitest";
import { data } from "@/data";
import { readView, viewParams } from "./view";

describe("URL selection", () => {
  it("round trips a complete view", () => {
    const view = readView(
      new URLSearchParams(
        "market=de&product=veltrix&period=2026-03&mode=analyst&kpi=growth&compare=market:de,market:it&status=at_risk",
      ),
      data,
    );
    expect(view.region).toBe("eu");
    expect(readView(viewParams(view), data)).toEqual(view);
  });
  it("ignores unknown IDs and periods and limits unique comparisons", () => {
    expect(
      readView(
        new URLSearchParams(
          "region=missing&market=missing&product=veltrix&period=2099-01&compare=market:de,market:de,unknown",
        ),
        data,
      ),
    ).toMatchObject({
      region: undefined,
      market: undefined,
      product: undefined,
      period: data.meta.latestPeriod,
      compare: ["market:de"],
    });
  });
  it("lets a citation's market determine its region", () => {
    expect(
      readView(new URLSearchParams("region=apac&market=de"), data).region,
    ).toBe("eu");
  });
});
