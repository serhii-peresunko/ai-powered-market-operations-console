import { z } from "zod";
import type { Dataset } from "@/data/types";
import { metricsFor } from "./metrics";

export function alertSchema(data: Dataset) {
  return z.object({
    name: z.string().trim().min(3, "Use at least 3 characters.").max(60, "Use at most 60 characters."),
    scope: z.enum(["portfolio", "region", "market"]),
    targetId: z.string(),
    growthEnabled: z.boolean(),
    growth: z.string(),
    attainmentEnabled: z.boolean(),
    attainment: z.string(),
    match: z.enum(["any", "all"]),
  }).superRefine((value, context) => {
    if (!value.growthEnabled && !value.attainmentEnabled) context.addIssue({ code: "custom", path: ["conditions"], message: "Enable at least one condition." });
    if (value.scope !== "portfolio" && !(value.scope === "region" ? data.regions : data.markets).some((item) => item.id === value.targetId)) context.addIssue({ code: "custom", path: ["targetId"], message: `Select a valid ${value.scope}.` });
    for (const [field, enabled, minimum] of [["growth", value.growthEnabled, -100], ["attainment", value.attainmentEnabled, 0]] as const) {
      const number = Number(value[field]);
      if (enabled && (!value[field].trim() || !Number.isFinite(number) || number < minimum || number > 200)) context.addIssue({ code: "custom", path: [field], message: `Enter a percentage from ${minimum} to 200.` });
    }
  });
}

export type AlertInput = z.infer<ReturnType<typeof alertSchema>>;
export type AlertRule = AlertInput & { id: string };
export const alertStorageKey = "market-ops-alerts-v1";
export const initialAlert: AlertInput = { name: "", scope: "portfolio", targetId: "", growthEnabled: true, growth: "0", attainmentEnabled: true, attainment: "95", match: "any" };

export function matchingMarkets(data: Dataset, rule: AlertInput, period: string) {
  return data.markets.filter((market) => {
    if (rule.scope === "region" && market.regionId !== rule.targetId) return false;
    if (rule.scope === "market" && market.id !== rule.targetId) return false;
    const metrics = metricsFor(data, { market: market.id }, period);
    const matches = [
      ...(rule.growthEnabled ? [metrics.growth !== null && metrics.growth < Number(rule.growth)] : []),
      ...(rule.attainmentEnabled ? [metrics.attainment !== null && metrics.attainment < Number(rule.attainment)] : []),
    ];
    return matches.length > 0 && (rule.match === "all" ? matches.every(Boolean) : matches.some(Boolean));
  });
}

export function readAlerts(data: Dataset): AlertRule[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(alertStorageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((value: unknown) => {
      if (!value || typeof value !== "object" || !("id" in value) || typeof value.id !== "string") return [];
      const parsed = alertSchema(data).safeParse(value);
      return parsed.success ? [{ ...parsed.data, id: value.id }] : [];
    });
  } catch { return []; }
}

export async function saveAlert(rule: AlertRule, existing: AlertRule[], fail: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (fail) throw new Error("Demo save failed. Your previous rules were restored. Retry when ready.");
  localStorage.setItem(alertStorageKey, JSON.stringify([...existing, rule]));
}
