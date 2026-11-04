"use client";
import type { Dataset } from "@/data/types";
import { Button } from "@/components/Button";
import { type AlertInput, ALERT_MATCH, ALERT_METRIC } from "@/lib/alerts";
import { AlertThreshold } from "./AlertThreshold";
import { AlertScopeFields } from "./AlertScopeFields";
import { AlertFieldError } from "./AlertFieldError";
import { useAlertForm } from "./useAlertForm";
import { ALERT_FORM_TEXT as TEXT } from "./copy";

const UI = {
  alertDetails: "alert-details",
  srOnly: "sr-only",
  conditionFields: "condition-fields",
  matchField: "form-field match-field",
  alertActions: "alert-actions",
  demoFailure: "demo-failure",
} as const;

export function AlertForm({
  data,
  pending,
  onSave,
}: {
  data: Dataset;
  pending: boolean;
  onSave: (values: AlertInput, fail: boolean) => Promise<void>;
}) {
  const {
    values,
    errors,
    simulateFailure,
    setSimulateFailure,
    change,
    submit,
  } = useAlertForm(data, pending, onSave);
  return (
    <details className={UI.alertDetails}>
      <summary>{TEXT.configureAnAlert}</summary>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={pending}>
          <legend className={UI.srOnly}>{TEXT.alertConfiguration}</legend>
          <AlertScopeFields
            data={data}
            values={values}
            errors={errors}
            onChange={change}
          />
          <fieldset
            id="alert-conditions"
            className={UI.conditionFields}
            tabIndex={-1}
            aria-describedby={
              errors.conditions ? "alert-conditions-error" : undefined
            }
          >
            <legend>{TEXT.flagAMarketWhen}</legend>
            <AlertThreshold
              field={ALERT_METRIC.GROWTH}
              label={TEXT.yearOnYearGrowthIsBelow}
              enabled={values.growthEnabled}
              value={values.growth}
              error={errors.growth}
              onToggle={(growthEnabled) => change({ growthEnabled })}
              onChange={(growth) => change({ growth })}
            />
            <AlertThreshold
              field={ALERT_METRIC.ATTAINMENT}
              label={TEXT.forecastAttainmentIsBelow}
              enabled={values.attainmentEnabled}
              value={values.attainment}
              error={errors.attainment}
              onToggle={(attainmentEnabled) => change({ attainmentEnabled })}
              onChange={(attainment) => change({ attainment })}
            />
            <AlertFieldError field="conditions" error={errors.conditions} />
            <label className={UI.matchField}>
              {TEXT.combineConditions}
              <select
                value={values.match}
                onChange={(event) => {
                  const match = event.target.value;
                  if (match === ALERT_MATCH.ANY || match === ALERT_MATCH.ALL)
                    change({ match });
                }}
              >
                <option value={ALERT_MATCH.ANY}>
                  {TEXT.anyEnabledConditionOr}
                </option>
                <option value={ALERT_MATCH.ALL}>
                  {TEXT.allEnabledConditionsAnd}
                </option>
              </select>
            </label>
          </fieldset>
          <div className={UI.alertActions}>
            <label className={UI.demoFailure}>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(event) => setSimulateFailure(event.target.checked)}
              />
              {TEXT.simulateSaveFailure}
            </label>
            <Button type="submit" isLoading={pending} loadingText={TEXT.saving}>
              {TEXT.saveAlert}
            </Button>
          </div>
        </fieldset>
      </form>
    </details>
  );
}
