import { expect, it } from "vitest";
import { data } from "@/data";
import { fallback, fixtures } from "./fixtures";

it("resolves every assistant citation to canonical entities and periods", () => {
  for (const fixture of [fallback, ...fixtures])
    for (const citation of fixture.answer.citations) {
      if (citation.marketId)
        expect(
          data.markets.some((market) => market.id === citation.marketId),
        ).toBe(true);
      if (citation.regionId)
        expect(
          data.regions.some((region) => region.id === citation.regionId),
        ).toBe(true);
      if (citation.productId)
        expect(
          data.products.some((product) => product.id === citation.productId),
        ).toBe(true);
      if (citation.period) expect(data.meta.periods).toContain(citation.period);
    }
});
