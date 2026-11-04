import { z } from "zod";
import type { Dataset } from "@/data/types";
import { marketMetricsFor } from "./metrics";

export const ALERT_LIMITS = {
  name: { min: 3, max: 60 },
  saveDelayMs: 650,
} as const;
const TEXT = {
  nameTooShort: `Use at least ${ALERT_LIMITS.name.min} characters.`,
  nameTooLong: `Use at most ${ALERT_LIMITS.name.max} characters.`,
  noCondition: "Enable at least one condition.",
  invalidTarget: (scope: string) => `Select a valid ${scope}.`,
  invalidPercentage: (min: number, max: number) =>
    `Enter a percentage from ${min} to ${max}.`,
  saveFailed:
    "Demo save failed. Your previous rules were restored. Retry when ready.",
} as const;

export const ALERT_SCOPE = {
  PORTFOLIO: "portfolio",
  REGION: "region",
  MARKET: "market",
} as const;

export const ALERT_MATCH = {
  ANY: "any",
  ALL: "all",
} as const;

export const ALERT_METRIC = {
  GROWTH: "growth",
  ATTAINMENT: "attainment",
} as const;

export const alertThresholds = {
  [ALERT_METRIC.GROWTH]: { min: -100, max: 200 },
  [ALERT_METRIC.ATTAINMENT]: { min: 0, max: 200 },
} as const;

export function alertSchema(data: Dataset) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(ALERT_LIMITS.name.min, TEXT.nameTooShort)
        .max(ALERT_LIMITS.name.max, TEXT.nameTooLong),
      scope: z.enum([
        ALERT_SCOPE.PORTFOLIO,
        ALERT_SCOPE.REGION,
        ALERT_SCOPE.MARKET,
      ]),
      targetId: z.string(),
      growthEnabled: z.boolean(),
      growth: z.string(),
      attainmentEnabled: z.boolean(),
      attainment: z.string(),
      match: z.enum([ALERT_MATCH.ANY, ALERT_MATCH.ALL]),
    })
    .superRefine((value, context) => {
      if (!value.growthEnabled && !value.attainmentEnabled)
        context.addIssue({
          code: "custom",
          path: ["conditions"],
          message: TEXT.noCondition,
        });
      if (
        value.scope !== ALERT_SCOPE.PORTFOLIO &&
        !(
          value.scope === ALERT_SCOPE.REGION ? data.regions : data.markets
        ).some((item) => item.id === value.targetId)
      )
        context.addIssue({
          code: "custom",
          path: ["targetId"],
          message: TEXT.invalidTarget(value.scope),
        });
      for (const [field, enabled] of [
        [ALERT_METRIC.GROWTH, value.growthEnabled],
        [ALERT_METRIC.ATTAINMENT, value.attainmentEnabled],
      ] as const) {
        const { min, max } = alertThresholds[field];
        const number = Number(value[field]);
        if (
          enabled &&
          (!value[field].trim() ||
            !Number.isFinite(number) ||
            number < min ||
            number > max)
        )
          context.addIssue({
            code: "custom",
            path: [field],
            message: TEXT.invalidPercentage(min, max),
          });
      }
    });
}

export type AlertInput = z.infer<ReturnType<typeof alertSchema>>;
export type AlertRule = AlertInput & { id: string };
export const alertStorageKey = "market-ops-alerts-v1";
export const initialAlert: AlertInput = {
  name: "",
  scope: ALERT_SCOPE.PORTFOLIO,
  targetId: "",
  growthEnabled: true,
  growth: "0",
  attainmentEnabled: true,
  attainment: "95",
  match: ALERT_MATCH.ANY,
};

export function matchingMarkets(
  data: Dataset,
  rule: AlertInput,
  period: string,
) {
  const scope = {
    region: rule.scope === ALERT_SCOPE.REGION ? rule.targetId : undefined,
    market: rule.scope === ALERT_SCOPE.MARKET ? rule.targetId : undefined,
  };
  return marketMetricsFor(data, scope, period)
    .filter((metrics) => {
      const matches = [
        ...(rule.growthEnabled
          ? [metrics.growth !== null && metrics.growth < Number(rule.growth)]
          : []),
        ...(rule.attainmentEnabled
          ? [
              metrics.attainment !== null &&
                metrics.attainment < Number(rule.attainment),
            ]
          : []),
      ];
      return (
        matches.length > 0 &&
        (rule.match === ALERT_MATCH.ALL
          ? matches.every(Boolean)
          : matches.some(Boolean))
      );
    })
    .map(({ market }) => market);
}

export function readAlerts(data: Dataset): AlertRule[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(alertStorageKey) ?? "[]",
    );
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((value: unknown) => {
      if (
        !value ||
        typeof value !== "object" ||
        !("id" in value) ||
        typeof value.id !== "string"
      )
        return [];
      const parsed = alertSchema(data).safeParse(value);
      return parsed.success ? [{ ...parsed.data, id: value.id }] : [];
    });
  } catch {
    return [];
  }
}

export async function saveAlert(
  rule: AlertRule,
  existing: AlertRule[],
  fail: boolean,
) {
  await new Promise((resolve) => setTimeout(resolve, ALERT_LIMITS.saveDelayMs));
  if (fail) throw new Error(TEXT.saveFailed);
  localStorage.setItem(alertStorageKey, JSON.stringify([...existing, rule]));
}
