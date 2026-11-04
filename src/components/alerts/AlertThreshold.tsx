import { AlertFieldError } from "./AlertFieldError";
import { alertThresholds } from "@/lib/alerts";
import { ALERT_THRESHOLD_TEXT as TEXT } from "./copy";

const UI = {
  conditionRow: "condition-row",
  thresholdInput: "threshold-input",
  srOnly: "sr-only",
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
          <span className={UI.srOnly}>{TEXT.thresholdLabel(field)}</span>
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
          <span>{TEXT.percentSign}</span>
        </label>
      </div>
      <AlertFieldError field={field} error={error} />
    </>
  );
}
