"use client";
import type { ReactNode } from "react";
import { MARKET_STATUS } from "@/shared/types";
import { marketMetricsFor, metricsFor } from "@/shared/lib/metrics";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSummary, SourceNotes } from "./DashboardSummary";
import { DashboardCharts } from "./DashboardCharts";
import { MarketPriorities } from "./MarketPriorities";
import type { DashboardProps } from "./types";
import { MARKET_CONSOLE_TEXT as TEXT } from "./copy";

const UI = {
  dashboardMain: "dashboard-main",
  dashboardGrid: "dashboard-grid",
  dashboardFooter: "dashboard-footer",
} as const;

export function MarketConsole({
  data,
  view,
  update,
  alerts,
  assistantHint,
}: DashboardProps & {
  alerts: ReactNode;
  assistantHint?: ReactNode;
}) {
  const metrics = metricsFor(data, view, view.period);
  const rows = marketMetricsFor(data, view, view.period);
  const risks = rows
    .filter(({ market }) => market.kpis.status !== MARKET_STATUS.ON_TRACK)
    .map(({ market }) => market);
  const selectedMarket = data.markets.find(
    (market) => market.id === view.market,
  );
  return (
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
      {alerts}
      <footer className={UI.dashboardFooter}>
        {TEXT.sourceOfTruthCanonicalDataset}{" "}
        <span>{TEXT.generated(data.meta.generatedAt)}</span>
      </footer>
    </main>
  );
}
