"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/Panel";
import { DataTable } from "@/components/DataTable";
import { ChartBoundary } from "./ChartBoundary";
import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { scopeName, trendFor } from "@/lib/metrics";
import { money, periodLabel } from "@/lib/format";
import { REVENUE_TREND_TEXT as TEXT } from "./copy";

const UI = {
  margin: { left: 3, right: 12, top: 12, bottom: 0 },
  grid: { vertical: false, stroke: "#e9eeeb", strokeDasharray: "3 3" },
  axisTick: { fontSize: 9, fill: "#61737a" },
  tooltip: { borderRadius: 8, borderColor: "#e1e8e8", fontSize: 11 },
  selectedPeriod: { stroke: "#597b70", strokeDasharray: "2 4" },
  priorYear: { stroke: "#9a8558", strokeWidth: 1.5, strokeDasharray: "2 4" },
  forecast: { stroke: "#647c95", strokeWidth: 1.5, strokeDasharray: "6 4" },
  actual: { stroke: "#087f71", strokeWidth: 2.5, activeDot: { r: 4 } },
  fullWidth: "full-width",
  countChip: "count-chip",
  chartLegend: "chart-legend",
  legendActual: "legend-actual",
  legendForecast: "legend-forecast",
  legendPrior: "legend-prior",
  trendChart: "trend-chart",
  tableLink: "table-link",
} as const;

export default function RevenueTrend({
  data,
  view,
  onPeriod,
}: {
  data: Dataset;
  view: DashboardView;
  onPeriod: (period: string) => void;
}) {
  const points = trendFor(data, view);
  return (
    <Panel
      id="trend"
      title={TEXT.title}
      eyebrow={TEXT.eyebrow}
      className={UI.fullWidth}
      action={
        <>
          <span className={UI.countChip}>
            {TEXT.history}
            {data.meta.currency}
          </span>
        </>
      }
      description={
        <>
          {scopeName(data, view)}
          {TEXT.description}
          {periodLabel(view.period)}
          {TEXT.fullStop}
        </>
      }
    >
      <div className={UI.chartLegend}>
        <span>
          <i className={UI.legendActual} />
          {TEXT.actual}
        </span>
        <span>
          <i className={UI.legendForecast} />
          {TEXT.forecast}
        </span>
        <span>
          <i className={UI.legendPrior} />
          {TEXT.priorYear}
        </span>
      </div>
      <ChartBoundary>
        <div
          className={UI.trendChart}
          role="group"
          aria-label={TEXT.chartLabel}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={UI.margin} accessibilityLayer>
              <CartesianGrid {...UI.grid} />
              <XAxis
                dataKey="period"
                tickFormatter={(period: string) => periodLabel(period, true)}
                tick={UI.axisTick}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  money(value, data.meta.currency)
                }
                tick={UI.axisTick}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                labelFormatter={(label) =>
                  typeof label === "string" ? periodLabel(label) : String(label)
                }
                formatter={(value) =>
                  typeof value === "number"
                    ? money(value, data.meta.currency, false)
                    : TEXT.unavailable
                }
                contentStyle={UI.tooltip}
              />
              <ReferenceLine x={view.period} {...UI.selectedPeriod} />
              <Line
                type="monotone"
                dataKey="priorYear"
                name={TEXT.priorYear}
                {...UI.priorYear}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name={TEXT.forecast}
                {...UI.forecast}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name={TEXT.actual}
                {...UI.actual}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartBoundary>
      <DataTable
        label={TEXT.tableLabel}
        caption={
          <>
            {scopeName(data, view)}
            {TEXT.revenueIn}
            {data.meta.currency}
            {TEXT.tableHint}
          </>
        }
        summary={TEXT.tableSummary}
      >
        <thead>
          <tr>
            <th scope="col">{TEXT.period}</th>
            <th scope="col">{TEXT.actual}</th>
            <th scope="col">{TEXT.forecast}</th>
            <th scope="col">{TEXT.priorYear}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.period} aria-selected={point.period === view.period}>
              <th scope="row">
                <button
                  className={UI.tableLink}
                  onClick={() => onPeriod(point.period)}
                >
                  {periodLabel(point.period)}
                  {point.period === view.period ? " · Selected" : ""}
                </button>
              </th>
              <td>{money(point.actual, data.meta.currency, false)}</td>
              <td>{money(point.forecast, data.meta.currency, false)}</td>
              <td>{money(point.priorYear, data.meta.currency, false)}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Panel>
  );
}
