"use client";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/Card";
import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { metricsFor } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";

const colors = ["#087f71", "#5268a4", "#a56b27", "#a74e77"];
const clamp = (value: number) => Math.max(0, Math.min(100, value));

export default function ComparisonRadar({ data, view, update }: { data: Dataset; view: DashboardView; update: (patch: Partial<DashboardView>) => void }) {
  const options = [...data.regions.map((item) => ({ id: `region:${item.id}`, name: item.name })), ...data.markets.map((item) => ({ id: `market:${item.id}`, name: item.name }))];
  const selected = options.filter((item) => view.compare.includes(item.id)).map((item) => {
    const [kind, id] = item.id.split(":");
    return { ...item, ...metricsFor(data, { ...(kind === "market" ? { market: id } : { region: id }), product: view.product }, view.period) };
  });
  const portfolio = metricsFor(data, { product: view.product }, view.period).actual;
  const points = [
    { axis: "Revenue weight", ...Object.fromEntries(selected.map((item) => [item.id, portfolio === 0 ? 0 : item.actual / portfolio * 100])) },
    { axis: "YoY growth", ...Object.fromEntries(selected.map((item) => [item.id, item.growth === null ? 0 : clamp((item.growth + 25) * 2)])) },
    { axis: "Attainment", ...Object.fromEntries(selected.map((item) => [item.id, item.attainment === null ? 0 : clamp(item.attainment / 120 * 100)])) },
  ];

  return <Card className="panel" role="region" aria-labelledby="radar-title">
    <div className="panel-heading"><div><p className="eyebrow">SIDE BY SIDE</p><h2 id="radar-title">Performance comparison</h2></div><span className="count-chip">{periodLabel(view.period)}</span></div>
    <p className="panel-description">Compare up to four markets or regions. Product selection applies to every comparison.</p>
    <label className="comparison-picker"><span className="sr-only">Add comparison</span><select value="" disabled={selected.length >= 4} onChange={(event) => { if (event.target.value) update({ compare: [...view.compare, event.target.value] }); }}><option value="">{selected.length >= 4 ? "Four comparisons selected" : "Add a market or region…"}</option>{options.filter((item) => !view.compare.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <div className="comparison-chips">{selected.map((item, index) => <button key={item.id} onClick={() => update({ compare: view.compare.filter((id) => id !== item.id) })} aria-label={`Remove ${item.name} from comparison`}><i style={{ background: colors[index] }} />{item.name}<span aria-hidden="true">×</span></button>)}</div>
    {selected.length > 0 ? <div className="radar-chart" role="img" aria-label={`Normalized revenue weight, growth, and attainment for ${selected.map((item) => item.name).join(", ")}. Exact values in the table below.`}><ResponsiveContainer width="100%" height="100%"><RadarChart data={points} outerRadius="67%"><PolarGrid stroke="#dce5e1" /><PolarAngleAxis dataKey="axis" tick={{ fill: "#61737a", fontSize: 9 }} /><PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />{selected.map((item, index) => <Radar key={item.id} name={item.name} dataKey={item.id} stroke={colors[index]} fill={colors[index]} fillOpacity={.08} strokeWidth={2} strokeDasharray={index === 0 ? undefined : `${index * 3} 3`} isAnimationActive={false} />)}</RadarChart></ResponsiveContainer></div> : <p className="empty-panel">Add a market or region to begin comparing.</p>}
    <details className="scale-explanation"><summary>How to read the scales</summary><p>All axes run from 0 to 100. Revenue weight is the entity’s share of portfolio revenue for this period and product scope. Growth maps −25% to 0 and +25% to 100. Attainment maps 0% to 0 and 120% to 100. Values outside these ranges are clipped visually; the table retains exact values. Unavailable values are omitted from interpretation.</p></details>
    <details className="data-alternative"><summary>View comparison data table</summary><div className="table-scroll" tabIndex={0} role="region" aria-label="Comparison metrics"><table><caption>Exact source-derived values · {periodLabel(view.period)} · {data.meta.currency}. Use the comparison controls above to change entities.</caption><thead><tr><th scope="col">Entity</th><th scope="col">Revenue</th><th scope="col">Growth</th><th scope="col">Attainment</th></tr></thead><tbody>{selected.map((item) => <tr key={item.id}><th scope="row">{item.name}</th><td>{money(item.actual, data.meta.currency, false)}</td><td>{percent(item.growth, true)}</td><td>{percent(item.attainment)}</td></tr>)}</tbody></table></div></details>
  </Card>;
}
