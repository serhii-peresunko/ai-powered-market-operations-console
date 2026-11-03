export type Status = "on_track" | "at_risk" | "off_track";
export type Confidence = "high" | "medium" | "low";
export type AnswerKind = "normal" | "low_confidence" | "abstain" | "error";

export interface Citation {
  marketId?: string;
  regionId?: string;
  productId?: string;
  period?: string;
  label?: string;
}

export interface Market {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  regionId: string;
  kpis: {
    revenue: number;
    growthPct: number;
    sharePct: number;
    forecastAttainmentPct: number;
    status: Status;
    anomalies: { period: string; type: string; note: string }[];
  };
}

export interface SeriesRow {
  marketId: string;
  productId: string;
  period: string;
  actual: number;
  forecast: number;
  units: number;
  priorYear: number;
}

export interface Dataset {
  meta: { currency: string; periods: string[]; latestPeriod: string; generatedAt: string };
  regions: { id: string; name: string }[];
  products: { id: string; name: string }[];
  markets: Market[];
  series: SeriesRow[];
}

export interface Fixture {
  id: string;
  keywords?: string[];
  kind: AnswerKind;
  answer: { text: string; citations: Citation[]; confidence: Confidence };
  error?: string;
}

export type ChatEvent =
  | { type: "token"; value: string }
  | { type: "done"; kind: AnswerKind; citations: Citation[]; confidence: Confidence }
  | { type: "error"; message: string };

export function isStatus(value: unknown): value is Status {
  return value === "on_track" || value === "at_risk" || value === "off_track";
}

export function isConfidence(value: unknown): value is Confidence {
  return value === "high" || value === "medium" || value === "low";
}

export function isAnswerKind(value: unknown): value is AnswerKind {
  return value === "normal" || value === "low_confidence" || value === "abstain" || value === "error";
}
