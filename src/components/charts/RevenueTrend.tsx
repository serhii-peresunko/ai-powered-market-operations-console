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
      title="Revenue trajectory"
      eyebrow="PERFORMANCE OVER TIME"
      className={UI.fullWidth}
      action={
        <>
          <span className={UI.countChip}>24 months · {data.meta.currency}</span>
        </>
      }
      description={
        <>
          {scopeName(data, view)} · Actual revenue against plan and the prior
          year. Selected: {periodLabel(view.period)}.
        </>
      }
    >
      <div className={UI.chartLegend}>
        <span>
          <i className={UI.legendActual} />
          Actual
        </span>
        <span>
          <i className={UI.legendForecast} />
          Forecast
        </span>
        <span>
          <i className={UI.legendPrior} />
          Prior year
        </span>
      </div>
      <ChartBoundary>
        <div
          className={UI.trendChart}
          role="group"
          aria-label="Revenue over 24 months; use arrow keys to explore or open the data table below."
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
                    : "Unavailable"
                }
                contentStyle={UI.tooltip}
              />
              <ReferenceLine x={view.period} {...UI.selectedPeriod} />
              <Line
                type="monotone"
                dataKey="priorYear"
                name="Prior year"
                {...UI.priorYear}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                {...UI.forecast}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                {...UI.actual}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartBoundary>
      <DataTable
        label="Revenue data table"
        caption={
          <>
            {scopeName(data, view)} revenue in {data.meta.currency}. Select a
            period to focus the dashboard.
          </>
        }
        summary="View revenue data table"
      >
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Actual</th>
            <th scope="col">Forecast</th>
            <th scope="col">Prior year</th>
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
