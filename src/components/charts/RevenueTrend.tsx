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
      className="full-width"
      action={
        <>
          <span className="count-chip">24 months · {data.meta.currency}</span>
        </>
      }
      description={
        <>
          {scopeName(data, view)} · Actual revenue against plan and the prior
          year. Selected: {periodLabel(view.period)}.
        </>
      }
    >
      <div className="chart-legend">
        <span>
          <i className="legend-actual" />
          Actual
        </span>
        <span>
          <i className="legend-forecast" />
          Forecast
        </span>
        <span>
          <i className="legend-prior" />
          Prior year
        </span>
      </div>
      <ChartBoundary>
        <div
          className="trend-chart"
          role="group"
          aria-label="Revenue over 24 months; use arrow keys to explore or open the data table below."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ left: 3, right: 12, top: 12, bottom: 0 }}
              accessibilityLayer
            >
              <CartesianGrid
                vertical={false}
                stroke="#e9eeeb"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="period"
                tickFormatter={(period: string) => periodLabel(period, true)}
                tick={{ fontSize: 9, fill: "#61737a" }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  money(value, data.meta.currency)
                }
                tick={{ fontSize: 9, fill: "#61737a" }}
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
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#e1e8e8",
                  fontSize: 11,
                }}
              />
              <ReferenceLine
                x={view.period}
                stroke="#597b70"
                strokeDasharray="2 4"
              />
              <Line
                type="monotone"
                dataKey="priorYear"
                name="Prior year"
                stroke="#9a8558"
                strokeWidth={1.5}
                strokeDasharray="2 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#647c95"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#087f71"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
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
                  className="table-link"
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
