import type { Dataset } from "@/data/types";
import { ALERT_SCOPE, ALERT_LIMITS, type AlertInput } from "@/lib/alerts";
import { AlertFieldError } from "./AlertFieldError";
import { ALERT_FORM_TEXT as TEXT } from "./copy";

const UI = { alertFields: "alert-fields", formField: "form-field" } as const;

export function AlertScopeFields({
  data,
  values,
  errors,
  onChange,
}: {
  data: Dataset;
  values: AlertInput;
  errors: Record<string, string>;
  onChange: (patch: Partial<AlertInput>) => void;
}) {
  return (
    <div className={UI.alertFields}>
      <label className={UI.formField}>
        {TEXT.alertName}
        <input
          id="alert-name"
          value={values.name}
          maxLength={ALERT_LIMITS.name.max}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder={TEXT.marketsBelowPlan}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "alert-name-error" : undefined}
        />
        <AlertFieldError field="name" error={errors.name} />
      </label>
      <label className={UI.formField}>
        {TEXT.applyTo}
        <select
          value={values.scope}
          onChange={(event) => {
            const scope = event.target.value;
            if (
              scope === ALERT_SCOPE.PORTFOLIO ||
              scope === ALERT_SCOPE.REGION ||
              scope === ALERT_SCOPE.MARKET
            )
              onChange({ scope, targetId: "" });
          }}
        >
          <option value={ALERT_SCOPE.PORTFOLIO}>{TEXT.allMarkets}</option>
          <option value={ALERT_SCOPE.REGION}>{TEXT.aRegion}</option>
          <option value={ALERT_SCOPE.MARKET}>{TEXT.aMarket}</option>
        </select>
      </label>
      {values.scope !== ALERT_SCOPE.PORTFOLIO && (
        <label className={UI.formField}>
          {values.scope === ALERT_SCOPE.REGION ? TEXT.region : TEXT.market}
          <select
            id="alert-targetId"
            value={values.targetId}
            onChange={(event) => onChange({ targetId: event.target.value })}
            aria-invalid={Boolean(errors.targetId)}
            aria-describedby={
              errors.targetId ? "alert-targetId-error" : undefined
            }
          >
            <option value="">{TEXT.chooseTarget(values.scope)}</option>
            {(values.scope === ALERT_SCOPE.REGION
              ? data.regions
              : data.markets
            ).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <AlertFieldError field="targetId" error={errors.targetId} />
        </label>
      )}
    </div>
  );
}
