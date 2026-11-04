"use client";
import dynamic from "next/dynamic";
import type { Dataset, DashboardView } from "@/shared/types";
import { MarketConsole } from "@/features/dashboard/MarketConsole";
import { useDashboardView } from "@/features/dashboard/useDashboardView";
import { Assistant } from "@/features/assistant/Assistant";
import { AssistantHint } from "@/features/assistant/AssistantHint";
import { Workspace } from "./Workspace";

const AlertConfigurator = dynamic(
  () => import("@/features/alerts/AlertConfigurator"),
  { ssr: false },
);

export function MarketWorkspace({ data }: { data: Dataset }) {
  const { view, update } = useDashboardView(data);
  function openCitation(target: DashboardView) {
    update(target);
    requestAnimationFrame(() => {
      document.getElementById("dashboard-heading")?.focus();
      document.getElementById("dashboard")?.scrollIntoView({ block: "start" });
    });
  }
  return (
    <Workspace
      marketCount={data.markets.length}
      currency={data.meta.currency}
      assistant={
        <Assistant data={data} view={view} onNavigate={openCitation} />
      }
    >
      <MarketConsole
        data={data}
        view={view}
        update={update}
        alerts={<AlertConfigurator data={data} period={view.period} />}
        assistantHint={<AssistantHint />}
      />
    </Workspace>
  );
}
