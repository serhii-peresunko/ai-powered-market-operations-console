"use client";
import type { DashboardProps } from "@/components/dashboard/types";
import { useState } from "react";
import { Panel } from "@/components/Panel";
import { DataTable } from "@/components/DataTable";
import world from "@/data/world-map.json";
import { marketMetricsFor } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";

const colors = ["#b55a60", "#d8ac64", "#c8dbba", "#6fa88f", "#247963"];
const metricLabels = {
  attainment: "Forecast attainment",
  growth: "Year-on-year growth",
  revenue: "Revenue",
};

export default function MarketMap({ data, view, update }: DashboardProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const values = marketMetricsFor(
    data,
    { ...view, market: undefined },
    view.period,
  ).map((metrics) => ({
    market: metrics.market,
    value:
      view.mapKpi === "revenue"
        ? metrics.actual
        : view.mapKpi === "growth"
          ? metrics.growth
          : metrics.attainment,
  }));
  const maximum = Math.max(1, ...values.map((item) => item.value ?? 0));
  const thresholds =
    view.mapKpi === "attainment"
      ? [90, 97, 100, 105]
      : view.mapKpi === "growth"
        ? [0, 5, 10, 15]
        : [maximum * 0.2, maximum * 0.4, maximum * 0.6, maximum * 0.8];
  const color = (value: number | null) =>
    value === null
      ? "#e3e9e5"
      : colors[thresholds.filter((threshold) => value >= threshold).length];
  const format = (value: number | null) =>
    value === null
      ? "Unavailable"
      : view.mapKpi === "revenue"
        ? money(value, data.meta.currency)
        : percent(value, view.mapKpi === "growth");
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
          <label className="compact-label">
            Color by
            <select
              value={view.mapKpi}
              onChange={(event) => {
                const value = event.target.value;
                if (
                  value === "attainment" ||
                  value === "growth" ||
                  value === "revenue"
                )
                  update({ mapKpi: value });
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
      <div className="world-map">
        <svg
          viewBox="0 0 720 300"
          role="group"
          aria-label={`${metricLabels[view.mapKpi]} by country. Tab to tracked countries and press Enter to select.`}
        >
          <rect width="720" height="300" fill="#f6f9f7" rx="8" />
          {[60, 120, 180, 240].map((y) => (
            <path
              key={y}
              d={`M0 ${y}H720`}
              stroke="#e9efeb"
              strokeWidth=".5"
              aria-hidden="true"
            />
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
                fill={item ? color(item.value) : "#e3e9e5"}
                stroke={
                  item && item.market.id === view.market ? "#142f32" : "#fff"
                }
                strokeWidth={item && item.market.id === view.market ? 2 : 0.65}
                fillRule="evenodd"
                vectorEffect="non-scaling-stroke"
                role={item ? "button" : undefined}
                aria-label={item ? label : undefined}
                aria-hidden={item ? undefined : true}
                aria-pressed={item ? item.market.id === view.market : undefined}
                tabIndex={item ? 0 : undefined}
                className={item ? "map-country" : undefined}
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
      <p className="map-readout" aria-live="polite">
        {active
          ? `${active.market.name} · ${format(active.value)} ${metricLabels[view.mapKpi]}`
          : `${values.length} tracked markets in scope · Hover or focus a country to inspect`}
      </p>
      <div className="map-legend" aria-label="Map color scale">
        {colors.map((fill, index) => (
          <span key={fill}>
            <i style={{ background: fill }} />
            {index === 0
              ? `< ${format(thresholds[0])}`
              : index === 4
                ? `≥ ${format(thresholds[3])}`
                : `${format(thresholds[index - 1])} – < ${format(thresholds[index])}`}
          </span>
        ))}
        <span>
          <i style={{ background: "#e3e9e5" }} />
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
                <button className="table-link" onClick={() => choose(market)}>
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
      <p className="chart-credit">
        Made with Natural Earth · Public-domain country boundaries
      </p>
    </Panel>
  );
}
