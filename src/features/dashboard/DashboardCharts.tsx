"use client";
import dynamic from "next/dynamic";
import { MarketTable } from "./MarketTable";
import { type DashboardProps } from "./types";
import { DASHBOARD_MODE } from "@/shared/types";
import { DASHBOARD_CHARTS_TEXT as TEXT } from "./copy";

const UI = {
  chartLoading: "chart-loading",
} as const;

function ChartLoading({ label }: { label: string }) {
  return (
    <div className={UI.chartLoading} role="status">
      {label}
    </div>
  );
}
const RevenueTrend = dynamic(() => import("./charts/RevenueTrend"), {
  ssr: false,
  loading: () => <ChartLoading label={TEXT.loadingRevenueChart} />,
});
const MarketMap = dynamic(() => import("./charts/MarketMap"), {
  ssr: false,
  loading: () => <ChartLoading label={TEXT.loadingCountryMap} />,
});
const ComparisonRadar = dynamic(() => import("./charts/ComparisonRadar"), {
  ssr: false,
  loading: () => <ChartLoading label={TEXT.loadingComparisonChart} />,
});
const PerformanceHeatmap = dynamic(
  () => import("./charts/PerformanceHeatmap"),
  {
    ssr: false,
    loading: () => <ChartLoading label={TEXT.loadingHeatMap} />,
  },
);

export function DashboardCharts({ data, view, update }: DashboardProps) {
  return (
    <>
      <RevenueTrend
        data={data}
        view={view}
        onPeriod={(period) => update({ period })}
      />
      {view.mode === DASHBOARD_MODE.ANALYST && (
        <>
          <MarketMap data={data} view={view} update={update} />
          <ComparisonRadar data={data} view={view} update={update} />
          <PerformanceHeatmap data={data} view={view} update={update} />
          <MarketTable data={data} view={view} update={update} />
        </>
      )}
    </>
  );
}
