import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import type { Market } from "@/data/types";
import type { Metrics } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";

const UI = {
  positive: "positive",
  negative: "negative",
  metricContext: "metric-context",
  kpiGrid: "kpi-grid",
  metricCard: "metric-card",
  sourceDetail: "source-detail",
} as const;

export function DashboardSummary({
  metrics,
  currency,
  latestPeriod,
  riskCount,
  marketCount,
}: {
  metrics: Metrics;
  currency: string;
  latestPeriod: string;
  riskCount: number;
  marketCount: number;
}) {
  const cards = [
    {
      label: "Total revenue",
      value: money(metrics.actual, currency),
      tone:
        metrics.growth !== null && metrics.growth >= 0
          ? UI.positive
          : UI.negative,
      detail: (
        <>
          {percent(metrics.growth, true)}{" "}
          <span className={UI.metricContext}>vs prior year</span>
        </>
      ),
    },
    {
      label: "Forecast attainment",
      value: percent(metrics.attainment),
      tone: metrics.gap >= 0 ? UI.positive : UI.negative,
      detail: (
        <>
          {money(metrics.gap, currency)}{" "}
          <span className={UI.metricContext}>vs plan</span>
        </>
      ),
    },
    {
      label: "Year-on-year growth",
      value: percent(metrics.growth, true),
      tone: UI.metricContext,
      detail: "Same period, prior year",
    },
    {
      label: "Markets to watch",
      value: (
        <>
          {riskCount}
          <small> / {marketCount}</small>
        </>
      ),
      tone: UI.metricContext,
      detail: `Latest source status · ${periodLabel(latestPeriod)}`,
    },
  ];
  return (
    <section className={UI.kpiGrid} aria-label="Selected scope health">
      {cards.map((card) => (
        <HealthMetric key={card.label} {...card} />
      ))}
    </section>
  );
}

function HealthMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  tone: string;
}) {
  return (
    <Card className={UI.metricCard}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span className={tone}>{detail}</span>
    </Card>
  );
}

export function SourceNotes({
  market,
  latestPeriod,
}: {
  market: Market;
  latestPeriod: string;
}) {
  return (
    <div className={UI.sourceDetail}>
      <strong>Source notes · {market.name}</strong>
      <p>
        {market.kpis.anomalies
          .map((a) => `${periodLabel(a.period)}: ${a.note}`)
          .join(" ") || "No anomalies marked in the supplied data."}{" "}
        These are market-level notes; latest status is dated{" "}
        {periodLabel(latestPeriod)}.
      </p>
    </div>
  );
}
