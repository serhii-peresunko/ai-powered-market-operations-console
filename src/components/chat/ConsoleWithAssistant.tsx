"use client";
import { RiSparklingLine } from "@remixicon/react";
import type { Dataset } from "@/data/types";
import { MarketConsole } from "@/components/dashboard/MarketConsole";
import { Assistant } from "./Assistant";
import { CONSOLE_WITH_ASSISTANT_TEXT as TEXT } from "./copy";

const UI = {
  insightNote: "insight-note",
} as const;

export function ConsoleWithAssistant({ data }: { data: Dataset }) {
  return (
    <MarketConsole
      data={data}
      renderAssistant={(view, onNavigate) => (
        <Assistant data={data} view={view} onNavigate={onNavigate} />
      )}
      assistantHint={
        <div className={UI.insightNote}>
          <RiSparklingLine size={17} aria-hidden="true" />
          <span>{TEXT.hint}</span>
        </div>
      }
    />
  );
}
