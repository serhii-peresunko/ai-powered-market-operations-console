"use client";
import dynamic from "next/dynamic";
import { MarketTable } from "./MarketTable";
import type { DashboardProps } from "./types";
function ChartLoading({ label }: { label: string }) {
  return (
    <div className="chart-loading" role="status">
      {label}
    </div>
  );
}
const RevenueTrend = dynamic(() => import("@/components/charts/RevenueTrend"), {
  ssr: false,
  loading: () => <ChartLoading label="Loading revenue chart…" />,
});
const MarketMap = dynamic(() => import("@/components/charts/MarketMap"), {
  ssr: false,
  loading: () => <ChartLoading label="Loading country map…" />,
});
const ComparisonRadar = dynamic(
  () => import("@/components/charts/ComparisonRadar"),
  {
    ssr: false,
    loading: () => <ChartLoading label="Loading comparison chart…" />,
  },
);
const PerformanceHeatmap = dynamic(
  () => import("@/components/charts/PerformanceHeatmap"),
  {
    ssr: false,
    loading: () => <ChartLoading label="Loading heat map…" />,
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
      {view.mode === "analyst" && (
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
