import type { ReactNode } from "react";
import { Card } from "@/shared/ui/Card";
import { type Market } from "@/shared/types";
import { type Metrics } from "@/shared/lib/metrics";
import { money, percent, periodLabel } from "@/shared/lib/format";
import { DASHBOARD_SUMMARY_TEXT as TEXT } from "./copy";

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
      label: TEXT.totalRevenue,
      value: money(metrics.actual, currency),
      tone:
        metrics.growth !== null && metrics.growth >= 0
          ? UI.positive
          : UI.negative,
      detail: (
        <>
          {percent(metrics.growth, true)}{" "}
          <span className={UI.metricContext}>{TEXT.vsPriorYear}</span>
        </>
      ),
    },
    {
      label: TEXT.forecastAttainment,
      value: percent(metrics.attainment),
      tone: metrics.gap >= 0 ? UI.positive : UI.negative,
      detail: (
        <>
          {money(metrics.gap, currency)}{" "}
          <span className={UI.metricContext}>{TEXT.vsPlan}</span>
        </>
      ),
    },
    {
      label: TEXT.yearOnYearGrowth,
      value: percent(metrics.growth, true),
      tone: UI.metricContext,
      detail: TEXT.samePeriodPriorYear,
    },
    {
      label: TEXT.marketsToWatch,
      value: (
        <>
          {riskCount}
          <small>{TEXT.totalMarkets(marketCount)}</small>
        </>
      ),
      tone: UI.metricContext,
      detail: TEXT.latestStatus(periodLabel(latestPeriod)),
    },
  ];
  return (
    <section className={UI.kpiGrid} aria-label={TEXT.selectedScopeHealth}>
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
      <strong>{TEXT.sourceNotes(market.name)}</strong>
      <p>
        {market.kpis.anomalies
          .map((a) => TEXT.anomaly(periodLabel(a.period), a.note))
          .join(" ") || TEXT.noAnomalies}{" "}
        {TEXT.sourceDateNote(periodLabel(latestPeriod))}
      </p>
    </div>
  );
}
