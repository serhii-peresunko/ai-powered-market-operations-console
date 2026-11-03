import type { Dataset } from "@/data/types";
import { matchingMarkets, type AlertRule } from "@/lib/alerts";
import { periodLabel } from "@/lib/format";

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
      className="saved-alerts"
      aria-live="polite"
      aria-label="Saved alert rules"
    >
      {rules.length === 0 ? (
        <p className="panel-description">
          No saved rules. Configure one to start watching your markets.
        </p>
      ) : (
        <ul>
          {rules.map((rule) => (
            <li key={rule.id} aria-busy={pendingId === rule.id}>
              <div>
                <strong>{rule.name}</strong>
                <p>
                  {rule.scope === "portfolio"
                    ? "All markets"
                    : (rule.scope === "region"
                        ? data.regions
                        : data.markets
                      ).find((item) => item.id === rule.targetId)?.name}{" "}
                  · {rule.match === "any" ? "Any" : "All"} enabled conditions ·{" "}
                  {periodLabel(period)}
                </p>
                <p>
                  {[
                    rule.growthEnabled ? `Growth < ${rule.growth}%` : "",
                    rule.attainmentEnabled
                      ? `Attainment < ${rule.attainment}%`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(rule.match === "any" ? " OR " : " AND ")}
                </p>
              </div>
              <span className="count-chip">
                {pendingId === rule.id
                  ? "Saving…"
                  : `${matchingMarkets(data, rule, period).length} matching markets`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
