import { type Dataset } from "@/shared/types";
import { matchingMarkets, type AlertRule, ALERT_SCOPE } from "./alerts";
import { periodLabel } from "@/shared/lib/format";
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
                  {TEXT.description(
                    rule.scope === ALERT_SCOPE.PORTFOLIO
                      ? TEXT.allMarkets
                      : (rule.scope === ALERT_SCOPE.REGION
                          ? data.regions
                          : data.markets
                        ).find((item) => item.id === rule.targetId)?.name,
                    rule.match,
                    periodLabel(period),
                  )}
                </p>
                <p>{TEXT.conditions(rule)}</p>
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
