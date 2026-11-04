"use client";
import { useRef, useState } from "react";
import { type Dataset } from "@/shared/types";
import {
  readAlerts,
  saveAlert,
  type AlertInput,
  type AlertRule,
} from "./alerts";

export const ALERT_FEEDBACK = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

const TEXT = {
  saved: "Alert saved in this browser.",
  failed: "Save failed. Previous rules restored.",
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
        message: TEXT.saved,
      });
    } catch (error) {
      setRules(previous);
      setFeedback({
        kind: ALERT_FEEDBACK.ERROR,
        message: error instanceof Error ? error.message : TEXT.failed,
      });
    } finally {
      inFlight.current = false;
      setPendingId(null);
    }
  }

  return { rules, pendingId, feedback, save };
}
