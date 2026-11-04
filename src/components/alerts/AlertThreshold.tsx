import { alertThresholds, ALERT_METRIC } from "@/lib/alerts";

const UI = {
  conditionRow: "condition-row",
  thresholdInput: "threshold-input",
  srOnly: "sr-only",
  fieldError: "field-error",
} as const;

export function AlertThreshold({
  field,
  label,
  enabled,
  value,
  error,
  onToggle,
  onChange,
}: {
  field: keyof typeof alertThresholds;
  label: string;
  enabled: boolean;
  value: string;
  error?: string;
  onToggle: (enabled: boolean) => void;
  onChange: (value: string) => void;
}) {
  const limits = alertThresholds[field];
  const errorId = `alert-${field}-error`;
  return (
    <>
      <div className={UI.conditionRow}>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
          />
          {label}
        </label>
        <label className={UI.thresholdInput}>
          <span className={UI.srOnly}>
            {field === ALERT_METRIC.GROWTH ? "Growth" : "Attainment"} threshold
          </span>
          <input
            id={`alert-${field}`}
            type="number"
            {...limits}
            step="0.1"
            value={value}
            disabled={!enabled}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
          <span>%</span>
        </label>
      </div>
      {error && (
        <p id={errorId} className={UI.fieldError}>
          {error}
        </p>
      )}
    </>
  );
}
