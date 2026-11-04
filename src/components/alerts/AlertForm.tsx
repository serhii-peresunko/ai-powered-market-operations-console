"use client";
import { useState, type FormEvent } from "react";
import type { Dataset } from "@/data/types";
import { Button } from "@/components/Button";
import { alertSchema, initialAlert, type AlertInput } from "@/lib/alerts";
import { AlertThreshold } from "./AlertThreshold";

const UI = {
  fieldError: "field-error",
  alertDetails: "alert-details",
  srOnly: "sr-only",
  alertFields: "alert-fields",
  formField: "form-field",
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
  const [values, setValues] = useState<AlertInput>(initialAlert);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [simulateFailure, setSimulateFailure] = useState(false);
  const change = (patch: Partial<AlertInput>) =>
    setValues((previous) => ({ ...previous, ...patch }));
  const error = (field: string) =>
    errors[field] ? (
      <p id={`alert-${field}-error`} className={UI.fieldError}>
        {errors[field]}
      </p>
    ) : null;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const parsed = alertSchema(data).safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      requestAnimationFrame(() =>
        document
          .getElementById(`alert-${String(parsed.error.issues[0].path[0])}`)
          ?.focus(),
      );
      return;
    }
    setErrors({});
    void onSave(parsed.data, simulateFailure);
  }
  return (
    <details className={UI.alertDetails}>
      <summary>Configure an alert</summary>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={pending}>
          <legend className={UI.srOnly}>Alert configuration</legend>
          <div className={UI.alertFields}>
            <label className={UI.formField}>
              Alert name
              <input
                id="alert-name"
                value={values.name}
                maxLength={60}
                onChange={(event) => change({ name: event.target.value })}
                placeholder="Markets below plan"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "alert-name-error" : undefined}
              />
              {error("name")}
            </label>
            <label className={UI.formField}>
              Apply to
              <select
                value={values.scope}
                onChange={(event) => {
                  const scope = event.target.value;
                  if (
                    scope === "portfolio" ||
                    scope === "region" ||
                    scope === "market"
                  )
                    change({ scope, targetId: "" });
                }}
              >
                <option value="portfolio">All markets</option>
                <option value="region">A region</option>
                <option value="market">A market</option>
              </select>
            </label>
            {values.scope !== "portfolio" && (
              <label className={UI.formField}>
                {values.scope === "region" ? "Region" : "Market"}
                <select
                  id="alert-targetId"
                  value={values.targetId}
                  onChange={(event) => change({ targetId: event.target.value })}
                  aria-invalid={Boolean(errors.targetId)}
                  aria-describedby={
                    errors.targetId ? "alert-targetId-error" : undefined
                  }
                >
                  <option value="">Choose {values.scope}…</option>
                  {(values.scope === "region"
                    ? data.regions
                    : data.markets
                  ).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {error("targetId")}
              </label>
            )}
          </div>
          <fieldset
            id="alert-conditions"
            className={UI.conditionFields}
            tabIndex={-1}
            aria-describedby={
              errors.conditions ? "alert-conditions-error" : undefined
            }
          >
            <legend>Flag a market when</legend>
            <AlertThreshold
              field="growth"
              label="Year-on-year growth is below"
              enabled={values.growthEnabled}
              value={values.growth}
              error={errors.growth}
              onToggle={(growthEnabled) => change({ growthEnabled })}
              onChange={(growth) => change({ growth })}
            />
            <AlertThreshold
              field="attainment"
              label="Forecast attainment is below"
              enabled={values.attainmentEnabled}
              value={values.attainment}
              error={errors.attainment}
              onToggle={(attainmentEnabled) => change({ attainmentEnabled })}
              onChange={(attainment) => change({ attainment })}
            />
            {error("conditions")}
            <label className={UI.matchField}>
              Combine conditions
              <select
                value={values.match}
                onChange={(event) => {
                  const match = event.target.value;
                  if (match === "any" || match === "all") change({ match });
                }}
              >
                <option value="any">Any enabled condition (OR)</option>
                <option value="all">All enabled conditions (AND)</option>
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
              Simulate save failure
            </label>
            <Button type="submit" isLoading={pending} loadingText="Saving…">
              Save alert
            </Button>
          </div>
        </fieldset>
      </form>
    </details>
  );
}
