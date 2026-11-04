import source from "./data.json";
import { isStatus, type Dataset } from "@/shared/types";

const TEXT = {
  invalidStatus: (market: string) => `Invalid status for ${market}`,
};

// Only the JSON string unions need narrowing; TypeScript checks the rest of the shape.
export const data: Dataset = {
  ...source,
  markets: source.markets.map((market) => {
    const status = market.kpis.status;
    if (!isStatus(status)) throw new Error(TEXT.invalidStatus(market.id));
    return { ...market, kpis: { ...market.kpis, status } };
  }),
};
