import { alertThresholds } from "@/lib/alerts";

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
      <div className="condition-row">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
          />
          {label}
        </label>
        <label className="threshold-input">
          <span className="sr-only">
            {field === "growth" ? "Growth" : "Attainment"} threshold
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
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </>
  );
}
