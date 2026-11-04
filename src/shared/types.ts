export const MARKET_STATUS = {
  ON_TRACK: "on_track",
  AT_RISK: "at_risk",
  OFF_TRACK: "off_track",
} as const;
export type Status = (typeof MARKET_STATUS)[keyof typeof MARKET_STATUS];

export const CONFIDENCE = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;
export type Confidence = (typeof CONFIDENCE)[keyof typeof CONFIDENCE];

export const ANSWER_KIND = {
  NORMAL: "normal",
  LOW_CONFIDENCE: "low_confidence",
  ABSTAIN: "abstain",
  ERROR: "error",
} as const;
export type AnswerKind = (typeof ANSWER_KIND)[keyof typeof ANSWER_KIND];

export const CHAT_EVENT_TYPE = {
  TOKEN: "token",
  DONE: "done",
  ERROR: "error",
} as const;

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
  meta: {
    currency: string;
    periods: string[];
    latestPeriod: string;
    generatedAt: string;
  };
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
  | { type: typeof CHAT_EVENT_TYPE.TOKEN; value: string }
  | {
      type: typeof CHAT_EVENT_TYPE.DONE;
      kind: AnswerKind;
      citations: Citation[];
      confidence: Confidence;
    }
  | { type: typeof CHAT_EVENT_TYPE.ERROR; message: string };

export function isStatus(value: unknown): value is Status {
  return (
    value === MARKET_STATUS.ON_TRACK ||
    value === MARKET_STATUS.AT_RISK ||
    value === MARKET_STATUS.OFF_TRACK
  );
}

export function isConfidence(value: unknown): value is Confidence {
  return (
    value === CONFIDENCE.HIGH ||
    value === CONFIDENCE.MEDIUM ||
    value === CONFIDENCE.LOW
  );
}

export function isAnswerKind(value: unknown): value is AnswerKind {
  return (
    value === ANSWER_KIND.NORMAL ||
    value === ANSWER_KIND.LOW_CONFIDENCE ||
    value === ANSWER_KIND.ABSTAIN ||
    value === ANSWER_KIND.ERROR
  );
}

export const ALL_STATUSES = "all";

export interface Scope {
  region?: string;
  market?: string;
  product?: string;
  status?: typeof ALL_STATUSES | Status;
}

export const DASHBOARD_MODE = {
  EXECUTIVE: "executive",
  ANALYST: "analyst",
} as const;
export type DashboardMode =
  (typeof DASHBOARD_MODE)[keyof typeof DASHBOARD_MODE];

export const MAP_KPI = {
  ATTAINMENT: "attainment",
  GROWTH: "growth",
  REVENUE: "revenue",
} as const;
export type MapKpi = (typeof MAP_KPI)[keyof typeof MAP_KPI];

export function isMapKpi(value: unknown): value is MapKpi {
  return (
    value === MAP_KPI.ATTAINMENT ||
    value === MAP_KPI.GROWTH ||
    value === MAP_KPI.REVENUE
  );
}

export interface DashboardView extends Scope {
  period: string;
  mode: DashboardMode;
  mapKpi: MapKpi;
  compare: string[];
  status: typeof ALL_STATUSES | Status;
}
