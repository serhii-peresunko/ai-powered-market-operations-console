import { RiSparklingLine } from "@remixicon/react";
import { ASSISTANT_HINT_TEXT as TEXT } from "./copy";

const UI = { insightNote: "insight-note" } as const;

export function AssistantHint() {
  return (
    <div className={UI.insightNote}>
      <RiSparklingLine size={17} aria-hidden="true" />
      <span>{TEXT.hint}</span>
    </div>
  );
}
