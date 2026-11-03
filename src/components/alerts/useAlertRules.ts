"use client";
import { useRef, useState } from "react";
import type { Dataset } from "@/data/types";
import {
  readAlerts,
  saveAlert,
  type AlertInput,
  type AlertRule,
} from "@/lib/alerts";

export function useAlertRules(data: Dataset) {
  const [rules, setRules] = useState<AlertRule[]>(() => readAlerts(data));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
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
      setFeedback({ kind: "success", message: "Alert saved in this browser." });
    } catch (error) {
      setRules(previous);
      setFeedback({
        kind: "error",
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
