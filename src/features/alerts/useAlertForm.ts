import { useState, type FormEvent } from "react";
import { type Dataset } from "@/shared/types";
import { alertSchema, initialAlert, type AlertInput } from "./alerts";

export function useAlertForm(
  data: Dataset,
  pending: boolean,
  onSave: (values: AlertInput, fail: boolean) => Promise<void>,
) {
  const [values, setValues] = useState<AlertInput>(initialAlert);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [simulateFailure, setSimulateFailure] = useState(false);
  const change = (patch: Partial<AlertInput>) =>
    setValues((previous) => ({ ...previous, ...patch }));
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

  return {
    values,
    errors,
    simulateFailure,
    setSimulateFailure,
    change,
    submit,
  };
}
