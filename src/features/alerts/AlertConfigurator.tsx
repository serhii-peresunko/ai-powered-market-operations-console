"use client";
import { type Dataset } from "@/shared/types";
import { Panel } from "@/shared/ui/Panel";
import { AlertForm } from "./AlertForm";
import { SavedAlerts } from "./SavedAlerts";
import { useAlertRules, ALERT_FEEDBACK } from "./useAlertRules";
import { ALERT_CONFIGURATOR_TEXT as TEXT } from "./copy";

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
      eyebrow={TEXT.eyebrow}
      title={TEXT.title}
      action={<span className={UI.countChip}>{TEXT.browserLocalDemo}</span>}
      description={TEXT.description}
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
