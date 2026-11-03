"use client";
import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { periodLabel } from "@/lib/format";

export function ViewControls({ data, view, update }: { data: Dataset; view: DashboardView; update: (patch: Partial<DashboardView>) => void }) {
  return <div className="view-controls">
    <label>Region<select value={view.region ?? ""} onChange={(e) => update({ region: e.target.value || undefined, market: undefined, product: undefined })}><option value="">All regions</option>{data.regions.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    <label>Market<select value={view.market ?? ""} onChange={(e) => update({ market: e.target.value || undefined, product: undefined })}><option value="">All markets</option>{data.markets.filter((item) => !view.region || item.regionId === view.region).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    <label>Product<select value={view.product ?? ""} disabled={!view.market} onChange={(e) => update({ product: e.target.value || undefined })}><option value="">All products</option>{data.products.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    <label>Reporting period<select value={view.period} onChange={(e) => update({ period: e.target.value })}>{data.meta.periods.toReversed().map((period) => <option value={period} key={period}>{periodLabel(period)}</option>)}</select></label>
    <button type="button" className="text-button" onClick={() => update({ region: undefined, market: undefined, product: undefined, status: "all" })}>Reset scope</button>
  </div>;
}
