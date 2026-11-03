"use client";
import type { DashboardProps } from "@/components/dashboard/types";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Panel } from "@/components/Panel";
import { DataTable } from "@/components/DataTable";
import { ChartBoundary } from "./ChartBoundary";
import { comparisonMetrics } from "@/lib/comparisons";
import { money, percent, periodLabel } from "@/lib/format";

const colors = ["#087f71", "#5268a4", "#a56b27", "#a74e77"];

export default function ComparisonRadar({
  data,
  view,
  update,
}: DashboardProps) {
  const { options, selected, points } = comparisonMetrics(data, view);

  return (
    <Panel
      id="radar"
      title="Performance comparison"
      eyebrow="SIDE BY SIDE"
      action={
        <>
          <span className="count-chip">{periodLabel(view.period)}</span>
        </>
      }
      description={
        <>
          Compare up to four markets or regions. Product selection applies to
          every comparison.
        </>
      }
    >
      <label className="comparison-picker">
        <span className="sr-only">Add comparison</span>
        <select
          value=""
          disabled={selected.length >= 4}
          onChange={(event) => {
            if (event.target.value)
              update({ compare: [...view.compare, event.target.value] });
          }}
        >
          <option value="">
            {selected.length >= 4
              ? "Four comparisons selected"
              : "Add a market or region…"}
          </option>
          {options
            .filter((item) => !view.compare.includes(item.id))
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </label>
      <div className="comparison-chips">
        {selected.map((item, index) => (
          <button
            key={item.id}
            onClick={() =>
              update({ compare: view.compare.filter((id) => id !== item.id) })
            }
            aria-label={`Remove ${item.name} from comparison`}
          >
            <i style={{ background: colors[index] }} />
            {item.name}
            <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
      {selected.length > 0 ? (
        <ChartBoundary>
          <div
            className="radar-chart"
            role="img"
            aria-label={`Normalized revenue weight, growth, and attainment for ${selected.map((item) => item.name).join(", ")}. Exact values in the table below.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={points} outerRadius="67%">
                <PolarGrid stroke="#dce5e1" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "#61737a", fontSize: 9 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                {selected.map((item, index) => (
                  <Radar
                    key={item.id}
                    name={item.name}
                    dataKey={item.id}
                    stroke={colors[index]}
                    fill={colors[index]}
                    fillOpacity={0.08}
                    strokeWidth={2}
                    strokeDasharray={index === 0 ? undefined : `${index * 3} 3`}
                    isAnimationActive={false}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartBoundary>
      ) : (
        <p className="empty-panel">
          Add a market or region to begin comparing.
        </p>
      )}
      <details className="scale-explanation">
        <summary>How to read the scales</summary>
        <p>
          All axes run from 0 to 100. Revenue weight is the entity’s share of
          portfolio revenue for this period and product scope. Growth maps −25%
          to 0 and +25% to 100. Attainment maps 0% to 0 and 120% to 100. Values
          outside these ranges are clipped visually; the table retains exact
          values. Unavailable values are omitted from interpretation.
        </p>
      </details>
      <DataTable
        label="Comparison metrics"
        caption={
          <>
            Exact source-derived values · {periodLabel(view.period)} ·{" "}
            {data.meta.currency}. Use the comparison controls above to change
            entities.
          </>
        }
        summary="View comparison data table"
      >
        <thead>
          <tr>
            <th scope="col">Entity</th>
            <th scope="col">Revenue</th>
            <th scope="col">Growth</th>
            <th scope="col">Attainment</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((item) => (
            <tr key={item.id}>
              <th scope="row">
                <button
                  className="table-link"
                  onClick={() => update(item.scope)}
                >
                  {item.name}
                </button>
              </th>
              <td>{money(item.actual, data.meta.currency, false)}</td>
              <td>{percent(item.growth, true)}</td>
              <td>{percent(item.attainment)}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Panel>
  );
}
