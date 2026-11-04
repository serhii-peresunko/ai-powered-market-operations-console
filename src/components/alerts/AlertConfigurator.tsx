"use client";
import type { Dataset } from "@/data/types";
import { Panel } from "@/components/Panel";
import { AlertForm } from "./AlertForm";
import { SavedAlerts } from "./SavedAlerts";
import { useAlertRules, ALERT_FEEDBACK } from "./useAlertRules";

const UI = {
  fullWidth: "full-width",
  countChip: "count-chip",
  errorNotice: "notice error-text",
  successNotice: "success-notice",
} as const;

export default function AlertConfigurator({
  data,
  period,
}: {
  data: Dataset;
  period: string;
}) {
  const { rules, pendingId, feedback, save } = useAlertRules(data);
  return (
    <Panel
      id="alerts"
      className={UI.fullWidth}
      eyebrow="DEFINE YOUR SIGNALS"
      title="Alert thresholds"
      action={<span className={UI.countChip}>Browser-local demo</span>}
      description="Configure rules for market totals across all products. Custom rules do not change source status or send notifications."
    >
      <AlertForm data={data} pending={pendingId !== null} onSave={save} />
      {feedback && (
        <p
          className={
            feedback.kind === ALERT_FEEDBACK.ERROR
              ? UI.errorNotice
              : UI.successNotice
          }
          role={feedback.kind === ALERT_FEEDBACK.ERROR ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
      <SavedAlerts
        data={data}
        period={period}
        rules={rules}
        pendingId={pendingId}
      />
    </Panel>
  );
}
