"use client";
import type { DashboardProps } from "./types";
import { isStatus } from "@/data/types";
import { periodLabel } from "@/lib/format";

export function ViewControls({ data, view, update }: DashboardProps) {
  return (
    <div className="view-controls">
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
      {view.mode === "analyst" && (
        <label>
          Latest source status
          <select
            value={view.status}
            onChange={(event) => {
              const status = event.target.value;
              if (status === "all" || isStatus(status))
                update({ status, market: undefined, product: undefined });
            }}
          >
            <option value="all">All statuses</option>
            <option value="on_track">On track</option>
            <option value="at_risk">At risk</option>
            <option value="off_track">Off track</option>
          </select>
        </label>
      )}
      <button
        type="button"
        className="text-button"
        onClick={() =>
          update({
            region: undefined,
            market: undefined,
            product: undefined,
            status: "all",
          })
        }
      >
        Reset scope
      </button>
    </div>
  );
}
