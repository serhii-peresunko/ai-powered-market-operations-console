"use client";
import type { DashboardProps } from "@/components/dashboard/types";
import { useMemo } from "react";
import { useHeatmapNavigation } from "./useHeatmapNavigation";
import { Panel } from "@/components/Panel";
import { heatmapRows } from "@/lib/heatmap";
import { periodLabel } from "@/lib/format";
import { HeatmapCell } from "./HeatmapCell";
import { PERFORMANCE_HEATMAP_TEXT as TEXT } from "./copy";

const UI = {
  cells: {
    unavailable: { background: "#edf1ef", color: "#61737a" },
    severeMiss: { background: "#a94c56", color: "#fff" },
    belowPlan: { background: "#f0d8d1", color: "#81373c" },
    nearPlan: { background: "#edf1e9", color: "#4c6258" },
    abovePlan: { background: "#c9e3d1", color: "#255b46" },
    ahead: { background: "#33785c", color: "#fff" },
  },
  swatch: (background: string) => ({ background }),
  fullWidth: "full-width",
  countChip: "count-chip",
  heatmapScroll: "heatmap-scroll table-scroll",
  heatmap: "heatmap",
  srOnly: "sr-only",
  emptyPanel: "empty-panel",
  mapLegend: "map-legend",
  chartCredit: "chart-credit",
} as const;

export default function PerformanceHeatmap({
  data,
  view,
  update,
}: DashboardProps) {
  const rows = useMemo(() => heatmapRows(data, view), [data, view]);
  const { table, focused, setFocused, move } = useHeatmapNavigation(
    rows.length,
    data.meta.periods.length,
    data.meta.periods.indexOf(view.period),
  );
  return (
    <Panel
      id="heatmap"
      title={TEXT.title}
      eyebrow={TEXT.eyebrow}
      className={UI.fullWidth}
      action={
        <>
          <span className={UI.countChip}>
            {TEXT.history(data.meta.periods.length)}
          </span>
        </>
      }
      description={TEXT.description}
      descriptionId="heatmap-help"
    >
      <div
        className={UI.heatmapScroll}
        tabIndex={0}
        role="region"
        aria-label={TEXT.tableLabel}
      >
        <table
          ref={table}
          className={UI.heatmap}
          aria-describedby="heatmap-help"
        >
          <caption className={UI.srOnly}>{TEXT.tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{TEXT.market}</th>
              {data.meta.periods.map((period) => (
                <th key={period} scope="col">
                  <span>{periodLabel(period, true)}</span>
                  <small>{period.slice(2, 4)}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ market, cells }, row) => (
              <tr key={market.id}>
                <th scope="row">{market.name}</th>
                {cells.map((cell, col) => (
                  <HeatmapCell
                    key={cell.period}
                    cell={cell}
                    market={market.name}
                    selected={
                      market.id === view.market && cell.period === view.period
                    }
                    tabIndex={
                      row === focused.row && col === focused.col ? 0 : -1
                    }
                    position={`${row}-${col}`}
                    style={UI.cells[cell.band]}
                    onFocus={() => setFocused({ row, col })}
                    onKeyDown={(event) => move(event, row, col)}
                    onSelect={() =>
                      update({
                        region: market.regionId,
                        market: market.id,
                        period: cell.period,
                      })
                    }
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className={UI.emptyPanel}>{TEXT.empty}</p>}
      <div className={UI.mapLegend}>
        {TEXT.legend.map(({ band, label }) => (
          <span key={band}>
            <i style={UI.swatch(UI.cells[band].background)} />
            {label}
          </span>
        ))}
      </div>
      <p className={UI.chartCredit}>{TEXT.roundingNote}</p>
    </Panel>
  );
}
