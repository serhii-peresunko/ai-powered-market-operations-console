"use client";
import type { Dataset } from "@/data/types";
import { Panel } from "@/components/Panel";
import { AlertForm } from "./AlertForm";
import { SavedAlerts } from "./SavedAlerts";
import { useAlertRules } from "./useAlertRules";

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
      className="full-width"
      eyebrow="DEFINE YOUR SIGNALS"
      title="Alert thresholds"
      action={<span className="count-chip">Browser-local demo</span>}
      description="Configure rules for market totals across all products. Custom rules do not change source status or send notifications."
    >
      <AlertForm data={data} pending={pendingId !== null} onSave={save} />
      {feedback && (
        <p
          className={
            feedback.kind === "error" ? "notice error-text" : "success-notice"
          }
          role={feedback.kind === "error" ? "alert" : "status"}
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
