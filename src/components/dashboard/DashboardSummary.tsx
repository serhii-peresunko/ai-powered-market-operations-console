import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import type { Market } from "@/data/types";
import type { Metrics } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";

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
          ? "positive"
          : "negative",
      detail: (
        <>
          {percent(metrics.growth, true)}{" "}
          <span className="metric-context">vs prior year</span>
        </>
      ),
    },
    {
      label: "Forecast attainment",
      value: percent(metrics.attainment),
      tone: metrics.gap >= 0 ? "positive" : "negative",
      detail: (
        <>
          {money(metrics.gap, currency)}{" "}
          <span className="metric-context">vs plan</span>
        </>
      ),
    },
    {
      label: "Year-on-year growth",
      value: percent(metrics.growth, true),
      tone: "metric-context",
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
      tone: "metric-context",
      detail: `Latest source status · ${periodLabel(latestPeriod)}`,
    },
  ];
  return (
    <section className="kpi-grid" aria-label="Selected scope health">
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
    <Card className="metric-card">
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
    <div className="source-detail">
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
