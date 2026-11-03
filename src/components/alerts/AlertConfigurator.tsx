"use client";
import { useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { Dataset } from "@/data/types";
import {
  alertSchema,
  initialAlert,
  matchingMarkets,
  readAlerts,
  saveAlert,
  type AlertInput,
  type AlertRule,
} from "@/lib/alerts";
import { periodLabel } from "@/lib/format";

export default function AlertConfigurator({
  data,
  period,
}: {
  data: Dataset;
  period: string;
}) {
  const [values, setValues] = useState<AlertInput>(initialAlert);
  const [alerts, setAlerts] = useState<AlertRule[]>(() => readAlerts(data));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const change = (patch: Partial<AlertInput>) =>
    setValues((previous) => ({ ...previous, ...patch }));
  const error = (field: string) =>
    errors[field] ? (
      <p id={`alert-${field}-error`} className="field-error">
        {errors[field]}
      </p>
    ) : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setMessage("");
    const parsed = alertSchema(data).safeParse(values);
    if (!parsed.success) {
      const next = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
      setErrors(next);
      requestAnimationFrame(() =>
        document
          .getElementById(`alert-${String(parsed.error.issues[0].path[0])}`)
          ?.focus(),
      );
      return;
    }
    setErrors({});
    const rule = { ...parsed.data, id: crypto.randomUUID() };
    const previous = alerts;
    setAlerts([...previous, rule]);
    setPending(rule.id);
    try {
      await saveAlert(rule, previous, simulateFailure);
      setFailed(false);
      setMessage("Alert saved in this browser.");
    } catch (cause) {
      setAlerts(previous);
      setFailed(true);
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Save failed. Previous rules restored.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <Card
      id="alerts"
      className="panel full-width"
      role="region"
      aria-labelledby="alerts-title"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DEFINE YOUR SIGNALS</p>
          <h2 id="alerts-title">Alert thresholds</h2>
        </div>
        <span className="count-chip">Browser-local demo</span>
      </div>
      <p className="panel-description">
        Configure rules for market totals across all products. Custom rules do
        not change source status or send notifications.
      </p>
      <details className="alert-details">
        <summary>Configure an alert</summary>
        <form onSubmit={submit} noValidate>
          <fieldset disabled={pending !== null}>
            <legend className="sr-only">Alert configuration</legend>
            <div className="alert-fields">
              <label className="form-field">
                Alert name
                <input
                  id="alert-name"
                  value={values.name}
                  maxLength={60}
                  onChange={(event) => change({ name: event.target.value })}
                  placeholder="Markets below plan"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "alert-name-error" : undefined
                  }
                />
                {error("name")}
              </label>
              <label className="form-field">
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
                <label className="form-field">
                  {values.scope === "region" ? "Region" : "Market"}
                  <select
                    id="alert-targetId"
                    value={values.targetId}
                    onChange={(event) =>
                      change({ targetId: event.target.value })
                    }
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
              className="condition-fields"
              tabIndex={-1}
              aria-describedby={
                errors.conditions ? "alert-conditions-error" : undefined
              }
            >
              <legend>Flag a market when</legend>
              <div className="condition-row">
                <label>
                  <input
                    type="checkbox"
                    checked={values.growthEnabled}
                    onChange={(event) =>
                      change({ growthEnabled: event.target.checked })
                    }
                  />
                  Year-on-year growth is below
                </label>
                <label className="threshold-input">
                  <span className="sr-only">Growth threshold</span>
                  <input
                    id="alert-growth"
                    type="number"
                    min={-100}
                    max={200}
                    step="0.1"
                    value={values.growth}
                    disabled={!values.growthEnabled}
                    onChange={(event) => change({ growth: event.target.value })}
                    aria-invalid={Boolean(errors.growth)}
                    aria-describedby={
                      errors.growth ? "alert-growth-error" : undefined
                    }
                  />
                  <span>%</span>
                </label>
              </div>
              {error("growth")}
              <div className="condition-row">
                <label>
                  <input
                    type="checkbox"
                    checked={values.attainmentEnabled}
                    onChange={(event) =>
                      change({ attainmentEnabled: event.target.checked })
                    }
                  />
                  Forecast attainment is below
                </label>
                <label className="threshold-input">
                  <span className="sr-only">Attainment threshold</span>
                  <input
                    id="alert-attainment"
                    type="number"
                    min={0}
                    max={200}
                    step="0.1"
                    value={values.attainment}
                    disabled={!values.attainmentEnabled}
                    onChange={(event) =>
                      change({ attainment: event.target.value })
                    }
                    aria-invalid={Boolean(errors.attainment)}
                    aria-describedby={
                      errors.attainment ? "alert-attainment-error" : undefined
                    }
                  />
                  <span>%</span>
                </label>
              </div>
              {error("attainment")}
              {error("conditions")}
              <label className="form-field match-field">
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
            <div className="alert-actions">
              <label className="demo-failure">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(event) => setSimulateFailure(event.target.checked)}
                />
                Simulate save failure
              </label>
              <Button
                type="submit"
                isLoading={pending !== null}
                loadingText="Saving…"
              >
                Save alert
              </Button>
            </div>
          </fieldset>
        </form>
      </details>
      {message && (
        <p
          className={failed ? "notice error-text" : "success-notice"}
          role={failed ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <div
        className="saved-alerts"
        aria-live="polite"
        aria-label="Saved alert rules"
      >
        {alerts.length === 0 ? (
          <p className="panel-description">
            No saved rules. Configure one to start watching your markets.
          </p>
        ) : (
          <ul>
            {alerts.map((rule) => (
              <li key={rule.id} aria-busy={pending === rule.id}>
                <div>
                  <strong>{rule.name}</strong>
                  <p>
                    {rule.scope === "portfolio"
                      ? "All markets"
                      : (rule.scope === "region"
                          ? data.regions
                          : data.markets
                        ).find((item) => item.id === rule.targetId)?.name}{" "}
                    · {rule.match === "any" ? "Any" : "All"} enabled conditions
                    · {periodLabel(period)}
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
                  {pending === rule.id
                    ? "Saving…"
                    : `${matchingMarkets(data, rule, period).length} matching markets`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
