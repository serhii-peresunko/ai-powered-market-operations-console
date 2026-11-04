"use client";
import type { DashboardProps } from "@/components/dashboard/types";
import { useRef, useState, type KeyboardEvent } from "react";
import { Panel } from "@/components/Panel";
import { marketsInScope, trendFor } from "@/lib/metrics";
import { percent, periodLabel } from "@/lib/format";

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
  selectedCell: "heatmap-cell selected",
  heatmapCell: "heatmap-cell",
  emptyPanel: "empty-panel",
  mapLegend: "map-legend",
  chartCredit: "chart-credit",
} as const;

function cellColors(variance: number | null) {
  if (variance === null) return UI.cells.unavailable;
  if (variance <= -10) return UI.cells.severeMiss;
  if (variance < -2) return UI.cells.belowPlan;
  if (variance <= 2) return UI.cells.nearPlan;
  if (variance < 10) return UI.cells.abovePlan;
  return UI.cells.ahead;
}

export default function PerformanceHeatmap({
  data,
  view,
  update,
}: DashboardProps) {
  const table = useRef<HTMLTableElement>(null);
  const [focused, setFocused] = useState({
    row: 0,
    col: data.meta.periods.indexOf(view.period),
  });
  const markets = marketsInScope(data, { ...view, market: undefined });
  const rows = markets.map((market) => ({
    market,
    points: trendFor(data, { market: market.id, product: view.product }),
  }));
  const focusRow = Math.min(focused.row, rows.length - 1);
  function move(
    event: KeyboardEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) {
    let nextRow = row,
      nextCol = col;
    switch (event.key) {
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "Home":
        nextCol = 0;
        break;
      case "End":
        nextCol = data.meta.periods.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    nextRow = Math.max(0, Math.min(rows.length - 1, nextRow));
    nextCol = Math.max(0, Math.min(data.meta.periods.length - 1, nextCol));
    setFocused({ row: nextRow, col: nextCol });
    table.current
      ?.querySelector<HTMLButtonElement>(`[data-cell="${nextRow}-${nextCol}"]`)
      ?.focus();
  }
  return (
    <Panel
      id="heatmap"
      title="Forecast variance by market"
      eyebrow="FIND THE PATTERN"
      className={UI.fullWidth}
      action={
        <>
          <span className={UI.countChip}>24 months</span>
        </>
      }
      description={
        <>
          Actual vs forecast, in %. Select a cell to focus its market and
          period. Use arrow keys to move; Enter to select. * marks a source
          anomaly at market level.
        </>
      }
      descriptionId="heatmap-help"
    >
      <div
        className={UI.heatmapScroll}
        tabIndex={0}
        role="region"
        aria-label="Forecast variance heat map and data table"
      >
        <table
          ref={table}
          className={UI.heatmap}
          aria-describedby="heatmap-help"
        >
          <caption className={UI.srOnly}>
            Signed forecast variance percentages, by market and month. Numeric
            values are the accessible alternative to the diverging colors.
          </caption>
          <thead>
            <tr>
              <th scope="col">Market</th>
              {data.meta.periods.map((period) => (
                <th key={period} scope="col">
                  <span>{periodLabel(period, true)}</span>
                  <small>{period.slice(2, 4)}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ market, points }, row) => (
              <tr key={market.id}>
                <th scope="row">{market.name}</th>
                {points.map((point, col) => {
                  const variance =
                    point.attainment === null ? null : point.attainment - 100;
                  const displayValue =
                    variance === null
                      ? "—"
                      : `${variance >= 0 ? "+" : ""}${variance.toFixed(0)}`;
                  const selected =
                    market.id === view.market && point.period === view.period;
                  const anomaly = market.kpis.anomalies.find(
                    (item) => item.period === point.period,
                  );
                  return (
                    <td key={point.period}>
                      <button
                        style={cellColors(variance)}
                        data-cell={`${row}-${col}`}
                        className={selected ? UI.selectedCell : UI.heatmapCell}
                        tabIndex={
                          row === focusRow && col === focused.col ? 0 : -1
                        }
                        aria-pressed={selected}
                        aria-label={`${displayValue}${anomaly ? "*" : ""} percent; ${market.name}, ${periodLabel(point.period)}: ${percent(variance, true)} forecast variance${anomaly ? `. Market anomaly: ${anomaly.note}` : ""}`}
                        title={`${market.name} · ${periodLabel(point.period)} · ${percent(variance, true)}${anomaly ? ` · ${anomaly.note}` : ""}`}
                        onFocus={() => setFocused({ row, col })}
                        onKeyDown={(event) => move(event, row, col)}
                        onClick={() =>
                          update({
                            region: market.regionId,
                            market: market.id,
                            period: point.period,
                          })
                        }
                      >
                        {displayValue}
                        {anomaly && <sup>*</sup>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className={UI.emptyPanel}>No markets match the current filters.</p>
      )}
      <div className={UI.mapLegend}>
        <span>
          <i style={UI.swatch(UI.cells.severeMiss.background)} />≤ −10%
        </span>
        <span>
          <i style={UI.swatch(UI.cells.belowPlan.background)} />
          −10% to −2%
        </span>
        <span>
          <i style={UI.swatch(UI.cells.nearPlan.background)} />
          Within ±2%
        </span>
        <span>
          <i style={UI.swatch(UI.cells.abovePlan.background)} />
          +2% to +10%
        </span>
        <span>
          <i style={UI.swatch(UI.cells.ahead.background)} />≥ +10%
        </span>
      </div>
      <p className={UI.chartCredit}>
        Cells show rounded percentages; accessible labels and hover text retain
        one decimal place.
      </p>
    </Panel>
  );
}
