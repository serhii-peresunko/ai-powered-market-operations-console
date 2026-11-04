"use client";
import { type DashboardProps } from "../types";
import { Panel } from "@/shared/ui/Panel";
import { DataTable } from "@/shared/ui/DataTable";
import { ChartBoundary } from "./ChartBoundary";
import {
  comparisonMetrics,
  MAX_COMPARISONS,
  RADAR_SCALE,
} from "../comparisons";
import { money, percent, periodLabel } from "@/shared/lib/format";
import { COMPARISON_RADAR_TEXT as TEXT } from "./copy";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const SERIES_DASHES = [undefined, "3 3", "6 3", "9 3"] as const;

const UI = {
  colors: ["#087f71", "#5268a4", "#a56b27", "#a74e77"],
  grid: { stroke: "#dce5e1" },
  axisTick: { fill: "#61737a", fontSize: 9 },
  swatch: (background: string) => ({ background }),
  series: (color: string, index: number) => ({
    stroke: color,
    fill: color,
    fillOpacity: 0.08,
    strokeWidth: 2,
    strokeDasharray: SERIES_DASHES[index],
  }),
  countChip: "count-chip",
  comparisonPicker: "comparison-picker",
  srOnly: "sr-only",
  comparisonChips: "comparison-chips",
  radarChart: "radar-chart",
  emptyPanel: "empty-panel",
  scaleExplanation: "scale-explanation",
  tableLink: "table-link",
} as const;

export default function ComparisonRadar({
  data,
  view,
  update,
}: DashboardProps) {
  const { options, selected, points } = comparisonMetrics(data, view);

  return (
    <Panel
      id="radar"
      title={TEXT.title}
      eyebrow={TEXT.eyebrow}
      action={
        <>
          <span className={UI.countChip}>{periodLabel(view.period)}</span>
        </>
      }
      description={TEXT.description}
    >
      <label className={UI.comparisonPicker}>
        <span className={UI.srOnly}>{TEXT.addComparison}</span>
        <select
          value=""
          disabled={selected.length >= MAX_COMPARISONS}
          onChange={(event) => {
            if (event.target.value)
              update({ compare: [...view.compare, event.target.value] });
          }}
        >
          <option value="">
            {selected.length >= MAX_COMPARISONS
              ? TEXT.limitReached
              : TEXT.pickerPlaceholder}
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
      <div className={UI.comparisonChips}>
        {selected.map((item, index) => (
          <button
            key={item.id}
            onClick={() =>
              update({ compare: view.compare.filter((id) => id !== item.id) })
            }
            aria-label={TEXT.removeComparison(item.name)}
          >
            <i style={UI.swatch(UI.colors[index])} />
            {item.name}
            <span aria-hidden="true">{TEXT.removeIcon}</span>
          </button>
        ))}
      </div>
      {selected.length > 0 ? (
        <ChartBoundary>
          <div
            className={UI.radarChart}
            role="img"
            aria-label={TEXT.chartLabel(
              selected.map((item) => item.name).join(", "),
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={points} outerRadius="67%">
                <PolarGrid {...UI.grid} />
                <PolarAngleAxis dataKey="axis" tick={UI.axisTick} />
                <PolarRadiusAxis
                  domain={[RADAR_SCALE.min, RADAR_SCALE.max]}
                  tick={false}
                  axisLine={false}
                />
                {selected.map((item, index) => (
                  <Radar
                    key={item.id}
                    name={item.name}
                    dataKey={item.id}
                    {...UI.series(UI.colors[index], index)}
                    isAnimationActive={false}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartBoundary>
      ) : (
        <p className={UI.emptyPanel}>{TEXT.empty}</p>
      )}
      <details className={UI.scaleExplanation}>
        <summary>{TEXT.howToReadTheScales}</summary>
        <p>{TEXT.scaleDescription}</p>
      </details>
      <DataTable
        label={TEXT.tableLabel}
        caption={TEXT.tableCaption(
          periodLabel(view.period),
          data.meta.currency,
        )}
        summary={TEXT.tableSummary}
      >
        <thead>
          <tr>
            <th scope="col">{TEXT.entity}</th>
            <th scope="col">{TEXT.revenue}</th>
            <th scope="col">{TEXT.growth}</th>
            <th scope="col">{TEXT.attainment}</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((item) => (
            <tr key={item.id}>
              <th scope="row">
                <button
                  className={UI.tableLink}
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
