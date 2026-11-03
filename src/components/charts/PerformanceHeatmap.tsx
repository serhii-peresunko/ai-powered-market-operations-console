"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { Card } from "@/components/Card";
import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { trendFor } from "@/lib/metrics";
import { percent, periodLabel } from "@/lib/format";

function cellColors(variance: number | null) {
  if (variance === null) return { background: "#edf1ef", color: "#61737a" };
  if (variance <= -10) return { background: "#a94c56", color: "#fff" };
  if (variance < -2) return { background: "#f0d8d1", color: "#81373c" };
  if (variance <= 2) return { background: "#edf1e9", color: "#4c6258" };
  if (variance < 10) return { background: "#c9e3d1", color: "#255b46" };
  return { background: "#33785c", color: "#fff" };
}

export default function PerformanceHeatmap({
  data,
  view,
  update,
}: {
  data: Dataset;
  view: DashboardView;
  update: (patch: Partial<DashboardView>) => void;
}) {
  const table = useRef<HTMLTableElement>(null);
  const [focused, setFocused] = useState({
    row: 0,
    col: data.meta.periods.indexOf(view.period),
  });
  const markets = data.markets.filter(
    (market) =>
      (!view.region || market.regionId === view.region) &&
      (view.status === "all" || view.status === market.kpis.status),
  );
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
    <Card
      className="panel full-width"
      role="region"
      aria-labelledby="heatmap-title"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FIND THE PATTERN</p>
          <h2 id="heatmap-title">Forecast variance by market</h2>
        </div>
        <span className="count-chip">24 months</span>
      </div>
      <p id="heatmap-help" className="panel-description">
        Actual vs forecast, in %. Select a cell to focus its market and period.
        Use arrow keys to move; Enter to select. * marks a source anomaly at
        market level.
      </p>
      <div
        className="heatmap-scroll table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Forecast variance heat map and data table"
      >
        <table ref={table} className="heatmap" aria-describedby="heatmap-help">
          <caption className="sr-only">
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
                        className={
                          selected ? "heatmap-cell selected" : "heatmap-cell"
                        }
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
                        {variance === null
                          ? "—"
                          : `${variance >= 0 ? "+" : ""}${variance.toFixed(0)}`}
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
        <p className="empty-panel">No markets match the current filters.</p>
      )}
      <div className="map-legend">
        <span>
          <i style={{ background: "#a94c56" }} />≤ −10%
        </span>
        <span>
          <i style={{ background: "#f0d8d1" }} />
          −10% to −2%
        </span>
        <span>
          <i style={{ background: "#edf1e9" }} />
          Within ±2%
        </span>
        <span>
          <i style={{ background: "#c9e3d1" }} />
          +2% to +10%
        </span>
        <span>
          <i style={{ background: "#33785c" }} />≥ +10%
        </span>
      </div>
      <p className="chart-credit">
        Cells show rounded percentages; accessible labels and hover text retain
        one decimal place.
      </p>
    </Card>
  );
}
