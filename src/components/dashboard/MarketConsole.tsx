"use client";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { type Dataset, MARKET_STATUS } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { marketMetricsFor, metricsFor } from "@/lib/metrics";
import { Workspace } from "@/components/layout/Workspace";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSummary, SourceNotes } from "./DashboardSummary";
import { DashboardCharts } from "./DashboardCharts";
import { MarketPriorities } from "./MarketPriorities";
import { useDashboardView } from "./useDashboardView";

const AlertConfigurator = dynamic(
  () => import("@/components/alerts/AlertConfigurator"),
  { ssr: false },
);

const UI = {
  dashboardMain: "dashboard-main",
  dashboardGrid: "dashboard-grid",
  dashboardFooter: "dashboard-footer",
} as const;

export function MarketConsole({
  data,
  renderAssistant,
  assistantHint,
}: {
  data: Dataset;
  renderAssistant?: (
    view: DashboardView,
    onNavigate: (target: DashboardView) => void,
  ) => ReactNode;
  assistantHint?: ReactNode;
}) {
  const { view, update } = useDashboardView(data);
  const metrics = metricsFor(data, view, view.period);
  const rows = marketMetricsFor(data, view, view.period);
  const risks = rows
    .filter(({ market }) => market.kpis.status !== MARKET_STATUS.ON_TRACK)
    .map(({ market }) => market);
  const selectedMarket = data.markets.find(
    (market) => market.id === view.market,
  );
  const assistant = renderAssistant?.(view, (target) => {
    update(target);
    requestAnimationFrame(() => {
      document.getElementById("dashboard-heading")?.focus();
      document.getElementById("dashboard")?.scrollIntoView({ block: "start" });
    });
  });
  return (
    <Workspace marketCount={data.markets.length} assistant={assistant}>
      <main id="dashboard" tabIndex={-1} className={UI.dashboardMain}>
        <DashboardHeader data={data} view={view} update={update} />
        <DashboardSummary
          metrics={metrics}
          currency={data.meta.currency}
          latestPeriod={data.meta.latestPeriod}
          marketCount={rows.length}
          riskCount={risks.length}
        />
        {selectedMarket && (
          <SourceNotes
            market={selectedMarket}
            latestPeriod={data.meta.latestPeriod}
          />
        )}
        <div className={UI.dashboardGrid}>
          <DashboardCharts data={data} view={view} update={update} />
          <MarketPriorities
            data={data}
            rows={rows}
            risks={risks}
            update={update}
            insight={assistantHint}
          />
        </div>
        <AlertConfigurator data={data} period={view.period} />
        <footer className={UI.dashboardFooter}>
          Source of truth: canonical dataset{" "}
          <span>Generated {data.meta.generatedAt}</span>
        </footer>
      </main>
    </Workspace>
  );
}
