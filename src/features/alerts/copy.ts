import { ALERT_MATCH, ALERT_METRIC, type AlertInput } from "./alerts";

export const SAVED_ALERTS_TEXT = {
  conditions: (rule: AlertInput) =>
    [
      rule.growthEnabled ? `Growth < ${rule.growth}%` : "",
      rule.attainmentEnabled ? `Attainment < ${rule.attainment}%` : "",
    ]
      .filter(Boolean)
      .join(rule.match === ALERT_MATCH.ANY ? " OR " : " AND "),
  description: (
    scope: string | undefined,
    match: AlertInput["match"],
    period: string,
  ) =>
    `${scope ?? ""} · ${match === ALERT_MATCH.ANY ? "Any" : "All"} enabled conditions · ${period}`,
  matches: (count: number) => `${count} matching markets`,

  savedAlertRules: "Saved alert rules",
  empty: "No saved rules. Configure one to start watching your markets.",
  allMarkets: "All markets",

  saving: "Saving…",
} as const;

export const ALERT_CONFIGURATOR_TEXT = {
  eyebrow: "DEFINE YOUR SIGNALS",
  title: "Alert thresholds",
  browserLocalDemo: "Browser-local demo",
  description:
    "Configure rules for market totals across all products. Custom rules do not change source status or send notifications.",
} as const;

export const ALERT_FORM_TEXT = {
  configureAnAlert: "Configure an alert",
  alertConfiguration: "Alert configuration",
  alertName: "Alert name",
  marketsBelowPlan: "Markets below plan",
  applyTo: "Apply to",
  allMarkets: "All markets",
  aRegion: "A region",
  aMarket: "A market",
  region: "Region",
  market: "Market",
  chooseTarget: (scope: string) => `Choose ${scope}…`,
  flagAMarketWhen: "Flag a market when",
  yearOnYearGrowthIsBelow: "Year-on-year growth is below",
  forecastAttainmentIsBelow: "Forecast attainment is below",
  combineConditions: "Combine conditions",
  anyEnabledConditionOr: "Any enabled condition (OR)",
  allEnabledConditionsAnd: "All enabled conditions (AND)",
  simulateSaveFailure: "Simulate save failure",
  saving: "Saving…",
  saveAlert: "Save alert",
} as const;

export const ALERT_THRESHOLD_TEXT = {
  thresholdLabel: (field: (typeof ALERT_METRIC)[keyof typeof ALERT_METRIC]) =>
    field === ALERT_METRIC.GROWTH ? "Growth threshold" : "Attainment threshold",
  percentSign: "%",
} as const;
