"use client";
import { useRef, useState } from "react";
import type { Dataset } from "@/data/types";
import {
  readAlerts,
  saveAlert,
  type AlertInput,
  type AlertRule,
} from "@/lib/alerts";

export const ALERT_FEEDBACK = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export function useAlertRules(data: Dataset) {
  const [rules, setRules] = useState<AlertRule[]>(() => readAlerts(data));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: (typeof ALERT_FEEDBACK)[keyof typeof ALERT_FEEDBACK];
    message: string;
  } | null>(null);
  const inFlight = useRef(false);

  async function save(values: AlertInput, simulateFailure: boolean) {
    if (inFlight.current) return;
    inFlight.current = true;
    const rule = { ...values, id: crypto.randomUUID() };
    const previous = rules;
    setFeedback(null);
    setRules([...previous, rule]);
    setPendingId(rule.id);
    try {
      await saveAlert(rule, previous, simulateFailure);
      setFeedback({
        kind: ALERT_FEEDBACK.SUCCESS,
        message: "Alert saved in this browser.",
      });
    } catch (error) {
      setRules(previous);
      setFeedback({
        kind: ALERT_FEEDBACK.ERROR,
        message:
          error instanceof Error
            ? error.message
            : "Save failed. Previous rules restored.",
      });
    } finally {
      inFlight.current = false;
      setPendingId(null);
    }
  }

  return { rules, pendingId, feedback, save };
}
