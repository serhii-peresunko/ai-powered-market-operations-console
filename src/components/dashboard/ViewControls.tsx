"use client";
import type { DashboardProps } from "./types";
import { isStatus, MARKET_STATUS } from "@/data/types";
import { periodLabel } from "@/lib/format";
import { DASHBOARD_MODE } from "@/lib/view";
import { ALL_STATUSES } from "@/lib/metrics";

const UI = {
  viewControls: "view-controls",
  textButton: "text-button",
} as const;

export function ViewControls({ data, view, update }: DashboardProps) {
  return (
    <div className={UI.viewControls}>
      <label>
        Region
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
          <option value="">All regions</option>
          {data.regions.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Market
        <select
          value={view.market ?? ""}
          onChange={(e) =>
            update({ market: e.target.value || undefined, product: undefined })
          }
        >
          <option value="">All markets</option>
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
        Product
        <select
          value={view.product ?? ""}
          disabled={!view.market}
          onChange={(e) => update({ product: e.target.value || undefined })}
        >
          <option value="">All products</option>
          {data.products.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Reporting period
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
          Latest source status
          <select
            value={view.status}
            onChange={(event) => {
              const status = event.target.value;
              if (status === ALL_STATUSES || isStatus(status))
                update({ status, market: undefined, product: undefined });
            }}
          >
            <option value={ALL_STATUSES}>All statuses</option>
            <option value={MARKET_STATUS.ON_TRACK}>On track</option>
            <option value={MARKET_STATUS.AT_RISK}>At risk</option>
            <option value={MARKET_STATUS.OFF_TRACK}>Off track</option>
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
        Reset scope
      </button>
    </div>
  );
}
