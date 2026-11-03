"use client";
import { useState } from "react";
import { Card } from "@/components/Card";
import world from "@/data/world-map.json";
import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { metricsFor } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";

const colors = ["#b55a60", "#d8ac64", "#c8dbba", "#6fa88f", "#247963"];
const metricLabels = { attainment: "Forecast attainment", growth: "Year-on-year growth", revenue: "Revenue" };

export default function MarketMap({ data, view, update }: { data: Dataset; view: DashboardView; update: (patch: Partial<DashboardView>) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const markets = data.markets.filter((market) => (!view.region || market.regionId === view.region) && (view.status === "all" || market.kpis.status === view.status));
  const values = markets.map((market) => {
    const metrics = metricsFor(data, { market: market.id, product: view.product }, view.period);
    return { market, value: view.mapKpi === "revenue" ? metrics.actual : view.mapKpi === "growth" ? metrics.growth : metrics.attainment };
  });
  const maximum = Math.max(1, ...values.map((item) => item.value ?? 0));
  const thresholds = view.mapKpi === "attainment" ? [90, 97, 100, 105] : view.mapKpi === "growth" ? [0, 5, 10, 15] : [maximum * .2, maximum * .4, maximum * .6, maximum * .8];
  const color = (value: number | null) => value === null ? "#e3e9e5" : colors[thresholds.filter((threshold) => value >= threshold).length];
  const format = (value: number | null) => value === null ? "Unavailable" : view.mapKpi === "revenue" ? money(value, data.meta.currency) : percent(value, view.mapKpi === "growth");
  const choose = (market: (typeof data.markets)[number]) => update({ region: market.regionId, market: market.id });
  const active = values.find((item) => item.market.id === hovered) ?? values.find((item) => item.market.id === view.market);

  return <Card className="panel full-width" role="region" aria-labelledby="map-title">
    <div className="panel-heading"><div><p className="eyebrow">A GLOBAL PERSPECTIVE</p><h2 id="map-title">Markets at a glance</h2></div><label className="compact-label">Color by<select value={view.mapKpi} onChange={(event) => { const value = event.target.value; if (value === "attainment" || value === "growth" || value === "revenue") update({ mapKpi: value }); }}>{Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
    <p className="panel-description">{periodLabel(view.period)} · Select a country to drill in. Outlined country is selected; gray countries have no data in this scope.</p>
    <div className="world-map"><svg viewBox="0 0 720 300" role="group" aria-label={`${metricLabels[view.mapKpi]} by country. Tab to tracked countries and press Enter to select.`}>
      <rect width="720" height="300" fill="#f6f9f7" rx="8" />
      {[60, 120, 180, 240].map((y) => <path key={y} d={`M0 ${y}H720`} stroke="#e9efeb" strokeWidth=".5" aria-hidden="true" />)}
      {world.map((country) => {
        const item = values.find((value) => value.market.iso3 === country.id);
        const label = item ? `${item.market.name}: ${format(item.value)} ${metricLabels[view.mapKpi]}` : `${country.name}: no data in current scope`;
        return <path key={country.id} d={country.path} fill={item ? color(item.value) : "#e3e9e5"} stroke={item?.market.id === view.market ? "#142f32" : "#fff"} strokeWidth={item?.market.id === view.market ? 2 : .65} fillRule="evenodd" vectorEffect="non-scaling-stroke" role={item ? "button" : undefined} aria-label={item ? label : undefined} aria-hidden={item ? undefined : true} aria-pressed={item ? item.market.id === view.market : undefined} tabIndex={item ? 0 : undefined} className={item ? "map-country" : undefined} onClick={item ? () => choose(item.market) : undefined} onKeyDown={item ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(item.market); } } : undefined} onFocus={item ? () => setHovered(item.market.id) : undefined} onMouseEnter={item ? () => setHovered(item.market.id) : undefined} onMouseLeave={() => setHovered(null)}><title>{label}</title></path>;
      })}
    </svg></div>
    <p className="map-readout" aria-live="polite">{active ? `${active.market.name} · ${format(active.value)} ${metricLabels[view.mapKpi]}` : `${markets.length} tracked markets in scope · Hover or focus a country to inspect`}</p>
    <div className="map-legend" aria-label="Map color scale">{colors.map((fill, index) => <span key={fill}><i style={{ background: fill }} />{index === 0 ? `< ${format(thresholds[0])}` : index === 4 ? `≥ ${format(thresholds[3])}` : `${format(thresholds[index - 1])} – < ${format(thresholds[index])}`}</span>)}<span><i style={{ background: "#e3e9e5" }} />No data</span></div>
    <details className="data-alternative"><summary>View map data table</summary><div className="table-scroll" tabIndex={0} role="region" aria-label="Country map data"><table><caption>{metricLabels[view.mapKpi]} · {periodLabel(view.period)}. All monetary values in {data.meta.currency}.</caption><thead><tr><th scope="col">Country</th><th scope="col">Region</th><th scope="col">{metricLabels[view.mapKpi]}</th></tr></thead><tbody>{values.map(({ market, value }) => <tr key={market.id} aria-selected={view.market === market.id}><th scope="row"><button className="table-link" onClick={() => choose(market)}>{market.name}{view.market === market.id ? " · Selected" : ""}</button></th><td>{data.regions.find((region) => region.id === market.regionId)?.name}</td><td>{format(value)}</td></tr>)}</tbody></table></div></details>
    <p className="chart-credit">Made with Natural Earth · Public-domain country boundaries</p>
  </Card>;
}
