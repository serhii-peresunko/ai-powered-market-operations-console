import source from "./data.json";
import { isStatus, type Dataset } from "./types";

// Only the JSON string unions need narrowing; TypeScript checks the rest of the shape.
export const data: Dataset = {
  ...source,
  markets: source.markets.map((market) => {
    const status = market.kpis.status;
    if (!isStatus(status)) throw new Error(`Invalid status for ${market.id}`);
    return { ...market, kpis: { ...market.kpis, status } };
  }),
};
