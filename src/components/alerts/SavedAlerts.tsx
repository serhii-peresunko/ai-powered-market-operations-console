import type { Dataset } from "@/data/types";
import {
  matchingMarkets,
  type AlertRule,
  ALERT_SCOPE,
  ALERT_MATCH,
} from "@/lib/alerts";
import { periodLabel } from "@/lib/format";
import { SAVED_ALERTS_TEXT as TEXT } from "./copy";

const UI = {
  savedAlerts: "saved-alerts",
  panelDescription: "panel-description",
  countChip: "count-chip",
} as const;

export function SavedAlerts({
  data,
  period,
  rules,
  pendingId,
}: {
  data: Dataset;
  period: string;
  rules: AlertRule[];
  pendingId: string | null;
}) {
  return (
    <div
      className={UI.savedAlerts}
      aria-live="polite"
      aria-label={TEXT.savedAlertRules}
    >
      {rules.length === 0 ? (
        <p className={UI.panelDescription}>{TEXT.empty}</p>
      ) : (
        <ul>
          {rules.map((rule) => (
            <li key={rule.id} aria-busy={pendingId === rule.id}>
              <div>
                <strong>{rule.name}</strong>
                <p>
                  {rule.scope === ALERT_SCOPE.PORTFOLIO
                    ? TEXT.allMarkets
                    : (rule.scope === ALERT_SCOPE.REGION
                        ? data.regions
                        : data.markets
                      ).find((item) => item.id === rule.targetId)?.name}{" "}
                  {TEXT.separator}
                  {rule.match === ALERT_MATCH.ANY ? TEXT.any : TEXT.all}
                  {TEXT.enabledConditions}
                  {periodLabel(period)}
                </p>
                <p>
                  {[
                    rule.growthEnabled ? TEXT.growthCondition(rule.growth) : "",
                    rule.attainmentEnabled
                      ? TEXT.attainmentCondition(rule.attainment)
                      : "",
                  ]
                    .filter(Boolean)
                    .join(rule.match === ALERT_MATCH.ANY ? TEXT.or : TEXT.and)}
                </p>
              </div>
              <span className={UI.countChip}>
                {pendingId === rule.id
                  ? TEXT.saving
                  : TEXT.matches(matchingMarkets(data, rule, period).length)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
