"use client";
import type { DashboardProps } from "./types";
import { isStatus, MARKET_STATUS } from "@/data/types";
import { periodLabel } from "@/lib/format";
import { DASHBOARD_MODE } from "@/lib/view";
import { ALL_STATUSES } from "@/lib/metrics";
import { VIEW_CONTROLS_TEXT as TEXT } from "./copy";

const UI = {
  viewControls: "view-controls",
  textButton: "text-button",
} as const;

export function ViewControls({ data, view, update }: DashboardProps) {
  return (
    <div className={UI.viewControls}>
      <label>
        {TEXT.region}
        <select
          value={view.region ?? ""}
          onChange={(e) =>
            update({
              region: e.target.value || undefined,
              market: undefined,
              product: undefined,
            })
          }
        >
          <option value="">{TEXT.allRegions}</option>
          {data.regions.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {TEXT.market}
        <select
          value={view.market ?? ""}
          onChange={(e) =>
            update({ market: e.target.value || undefined, product: undefined })
          }
        >
          <option value="">{TEXT.allMarkets}</option>
          {data.markets
            .filter((item) => !view.region || item.regionId === view.region)
            .map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </label>
      <label>
        {TEXT.product}
        <select
          value={view.product ?? ""}
          disabled={!view.market}
          onChange={(e) => update({ product: e.target.value || undefined })}
        >
          <option value="">{TEXT.allProducts}</option>
          {data.products.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {TEXT.reportingPeriod}
        <select
          value={view.period}
          onChange={(e) => update({ period: e.target.value })}
        >
          {data.meta.periods.toReversed().map((period) => (
            <option value={period} key={period}>
              {periodLabel(period)}
            </option>
          ))}
        </select>
      </label>
      {view.mode === DASHBOARD_MODE.ANALYST && (
        <label>
          {TEXT.latestSourceStatus}
          <select
            value={view.status}
            onChange={(event) => {
              const status = event.target.value;
              if (status === ALL_STATUSES || isStatus(status))
                update({ status, market: undefined, product: undefined });
            }}
          >
            <option value={ALL_STATUSES}>{TEXT.allStatuses}</option>
            <option value={MARKET_STATUS.ON_TRACK}>{TEXT.onTrack}</option>
            <option value={MARKET_STATUS.AT_RISK}>{TEXT.atRisk}</option>
            <option value={MARKET_STATUS.OFF_TRACK}>{TEXT.offTrack}</option>
          </select>
        </label>
      )}
      <button
        type="button"
        className={UI.textButton}
        onClick={() =>
          update({
            region: undefined,
            market: undefined,
            product: undefined,
            status: ALL_STATUSES,
          })
        }
      >
        {TEXT.resetScope}
      </button>
    </div>
  );
}
