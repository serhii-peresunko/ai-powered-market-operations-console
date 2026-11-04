"use client";
import type { DashboardProps } from "@/components/dashboard/types";
import { useState } from "react";
import { Panel } from "@/components/Panel";
import { DataTable } from "@/components/DataTable";
import world from "@/data/world-map.json";
import { marketMetricsFor } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";
import { MAP_KPI, isMapKpi } from "@/lib/view";

const metricLabels = {
  [MAP_KPI.ATTAINMENT]: "Forecast attainment",
  [MAP_KPI.GROWTH]: "Year-on-year growth",
  [MAP_KPI.REVENUE]: "Revenue",
};

const UI = {
  colors: ["#b55a60", "#d8ac64", "#c8dbba", "#6fa88f", "#247963"],
  missingFill: "#e3e9e5",
  background: { fill: "#f6f9f7", rx: 8 },
  grid: { stroke: "#e9efeb", strokeWidth: 0.5 },
  country: { stroke: "#fff", strokeWidth: 0.65 },
  selectedCountry: { stroke: "#142f32", strokeWidth: 2 },
  swatch: (background: string) => ({ background }),
  compactLabel: "compact-label",
  worldMap: "world-map",
  mapCountry: "map-country",
  mapReadout: "map-readout",
  mapLegend: "map-legend",
  tableLink: "table-link",
  chartCredit: "chart-credit",
} as const;

export default function MarketMap({ data, view, update }: DashboardProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const values = marketMetricsFor(
    data,
    { ...view, market: undefined },
    view.period,
  ).map((metrics) => ({
    market: metrics.market,
    value:
      view.mapKpi === MAP_KPI.REVENUE
        ? metrics.actual
        : view.mapKpi === MAP_KPI.GROWTH
          ? metrics.growth
          : metrics.attainment,
  }));
  const maximum = Math.max(1, ...values.map((item) => item.value ?? 0));
  const thresholds =
    view.mapKpi === MAP_KPI.ATTAINMENT
      ? [90, 97, 100, 105]
      : view.mapKpi === MAP_KPI.GROWTH
        ? [0, 5, 10, 15]
        : [maximum * 0.2, maximum * 0.4, maximum * 0.6, maximum * 0.8];
  const color = (value: number | null) =>
    value === null
      ? UI.missingFill
      : UI.colors[thresholds.filter((threshold) => value >= threshold).length];
  const format = (value: number | null) =>
    value === null
      ? "Unavailable"
      : view.mapKpi === MAP_KPI.REVENUE
        ? money(value, data.meta.currency)
        : percent(value, view.mapKpi === MAP_KPI.GROWTH);
  const choose = (market: (typeof data.markets)[number]) =>
    update({ region: market.regionId, market: market.id });
  const active =
    values.find((item) => item.market.id === hovered) ??
    values.find((item) => item.market.id === view.market);

  return (
    <Panel
      id="map"
      title="Markets at a glance"
      eyebrow="A GLOBAL PERSPECTIVE"
      action={
        <>
          <label className={UI.compactLabel}>
            Color by
            <select
              value={view.mapKpi}
              onChange={(event) => {
                const value = event.target.value;
                if (isMapKpi(value)) update({ mapKpi: value });
              }}
            >
              {Object.entries(metricLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </>
      }
      description={
        <>
          {periodLabel(view.period)} · Select a country to drill in. Outlined
          country is selected; gray countries have no data in this scope.
        </>
      }
    >
      <div className={UI.worldMap}>
        <svg
          viewBox="0 0 720 300"
          role="group"
          aria-label={`${metricLabels[view.mapKpi]} by country. Tab to tracked countries and press Enter to select.`}
        >
          <rect width="720" height="300" {...UI.background} />
          {[60, 120, 180, 240].map((y) => (
            <path key={y} d={`M0 ${y}H720`} {...UI.grid} aria-hidden="true" />
          ))}
          {world.map((country) => {
            const item = values.find(
              (value) => value.market.iso3 === country.id,
            );
            const label = item
              ? `${item.market.name}: ${format(item.value)} ${metricLabels[view.mapKpi]}`
              : `${country.name}: no data in current scope`;
            return (
              <path
                key={country.id}
                d={country.path}
                fill={item ? color(item.value) : UI.missingFill}
                {...(item && item.market.id === view.market
                  ? UI.selectedCountry
                  : UI.country)}
                fillRule="evenodd"
                vectorEffect="non-scaling-stroke"
                role={item ? "button" : undefined}
                aria-label={item ? label : undefined}
                aria-hidden={item ? undefined : true}
                aria-pressed={item ? item.market.id === view.market : undefined}
                tabIndex={item ? 0 : undefined}
                className={item ? UI.mapCountry : undefined}
                onClick={item ? () => choose(item.market) : undefined}
                onKeyDown={
                  item
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          choose(item.market);
                        }
                      }
                    : undefined
                }
                onFocus={item ? () => setHovered(item.market.id) : undefined}
                onMouseEnter={
                  item ? () => setHovered(item.market.id) : undefined
                }
                onMouseLeave={() => setHovered(null)}
              >
                <title>{label}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <p className={UI.mapReadout} aria-live="polite">
        {active
          ? `${active.market.name} · ${format(active.value)} ${metricLabels[view.mapKpi]}`
          : `${values.length} tracked markets in scope · Hover or focus a country to inspect`}
      </p>
      <div className={UI.mapLegend} aria-label="Map color scale">
        {UI.colors.map((fill, index) => (
          <span key={fill}>
            <i style={UI.swatch(fill)} />
            {index === 0
              ? `< ${format(thresholds[0])}`
              : index === 4
                ? `≥ ${format(thresholds[3])}`
                : `${format(thresholds[index - 1])} – < ${format(thresholds[index])}`}
          </span>
        ))}
        <span>
          <i style={UI.swatch(UI.missingFill)} />
          No data
        </span>
      </div>
      <DataTable
        label="Country map data"
        caption={
          <>
            {metricLabels[view.mapKpi]} · {periodLabel(view.period)}. All
            monetary values in {data.meta.currency}.
          </>
        }
        summary="View map data table"
      >
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Region</th>
            <th scope="col">{metricLabels[view.mapKpi]}</th>
          </tr>
        </thead>
        <tbody>
          {values.map(({ market, value }) => (
            <tr key={market.id} aria-selected={view.market === market.id}>
              <th scope="row">
                <button className={UI.tableLink} onClick={() => choose(market)}>
                  {market.name}
                  {view.market === market.id ? " · Selected" : ""}
                </button>
              </th>
              <td>
                {
                  data.regions.find((region) => region.id === market.regionId)
                    ?.name
                }
              </td>
              <td>{format(value)}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      <p className={UI.chartCredit}>
        Made with Natural Earth · Public-domain country boundaries
      </p>
    </Panel>
  );
}
