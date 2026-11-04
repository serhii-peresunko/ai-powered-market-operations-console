"use client";
import { useMemo, useState } from "react";
import { type Market, isMapKpi } from "@/shared/types";
import { type DashboardProps } from "../types";
import { Panel } from "@/shared/ui/Panel";
import { DataTable } from "@/shared/ui/DataTable";
import { marketMapData } from "./market-map";
import { periodLabel } from "@/shared/lib/format";
import { MarketMapCanvas } from "./MarketMapCanvas";
import { MARKET_MAP_TEXT as TEXT } from "./copy";

const UI = {
  colors: ["#b55a60", "#d8ac64", "#c8dbba", "#6fa88f", "#247963"],
  missingFill: "#e3e9e5",
  swatch: (background: string) => ({ background }),
  compactLabel: "compact-label",
  readout: "map-readout",
  legend: "map-legend",
  tableLink: "table-link",
  credit: "chart-credit",
} as const;

export default function MarketMap({ data, view, update }: DashboardProps) {
  const [hoveredMarket, setHoveredMarket] = useState<string | null>(null);
  const { rows, legend } = useMemo(
    () => marketMapData(data, view),
    [data, view],
  );
  const metricLabel = TEXT.metrics[view.mapKpi];
  const period = periodLabel(view.period);
  const active =
    rows.find((row) => row.market.id === hoveredMarket) ??
    rows.find((row) => row.market.id === view.market);
  const color = (band: number | null) =>
    band === null ? UI.missingFill : UI.colors[band];
  const choose = (market: Market) =>
    update({ region: market.regionId, market: market.id });

  return (
    <Panel
      id="map"
      title={TEXT.title}
      eyebrow={TEXT.eyebrow}
      action={
        <label className={UI.compactLabel}>
          {TEXT.colorBy}
          <select
            value={view.mapKpi}
            onChange={(event) => {
              const value = event.target.value;
              if (isMapKpi(value)) update({ mapKpi: value });
            }}
          >
            {Object.entries(TEXT.metrics).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      }
      description={TEXT.description(period)}
    >
      <MarketMapCanvas
        rows={rows}
        selectedMarket={view.market}
        metricLabel={metricLabel}
        color={color}
        onChoose={choose}
        onHover={setHoveredMarket}
      />
      <p className={UI.readout} aria-live="polite">
        {active
          ? TEXT.activeReadout(
              active.market.name,
              active.formattedValue,
              metricLabel,
            )
          : TEXT.idleReadout(rows.length)}
      </p>
      <div className={UI.legend} aria-label={TEXT.legendLabel}>
        {legend.map(({ band, lower, upper }) => (
          <span key={band}>
            <i style={UI.swatch(color(band))} />
            {TEXT.bandLabel(lower, upper)}
          </span>
        ))}
        <span>
          <i style={UI.swatch(UI.missingFill)} />
          {TEXT.noData}
        </span>
      </div>
      <DataTable
        label={TEXT.tableLabel}
        caption={TEXT.tableCaption(metricLabel, period, data.meta.currency)}
        summary={TEXT.tableSummary}
      >
        <thead>
          <tr>
            <th scope="col">{TEXT.country}</th>
            <th scope="col">{TEXT.region}</th>
            <th scope="col">{metricLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ market, formattedValue, regionName }) => (
            <tr key={market.id} aria-selected={view.market === market.id}>
              <th scope="row">
                <button className={UI.tableLink} onClick={() => choose(market)}>
                  {market.name}
                  {view.market === market.id ? TEXT.selected : ""}
                </button>
              </th>
              <td>{regionName}</td>
              <td>{formattedValue}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      <p className={UI.credit}>{TEXT.credit}</p>
    </Panel>
  );
}
