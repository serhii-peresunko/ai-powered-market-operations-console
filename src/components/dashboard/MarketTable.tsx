"use client";
import { useState } from "react";
import { Card } from "@/components/Card";
import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";
import { marketsInScope, metricsFor } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

type SortKey = "actual" | "growth" | "attainment" | "gap";
export function MarketTable({
  data,
  view,
  update,
}: {
  data: Dataset;
  view: DashboardView;
  update: (patch: Partial<DashboardView>) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>({
    key: "actual",
    ascending: false,
  });
  const selectedMarket = data.markets.find(
    (market) => market.id === view.market,
  );
  const rows = selectedMarket
    ? data.products.map((product) => ({
        id: product.id,
        name: product.name,
        market: selectedMarket,
        ...metricsFor(
          data,
          {
            market: selectedMarket.id,
            product: product.id,
            status: view.status,
          },
          view.period,
        ),
      }))
    : marketsInScope(data, view).map((market) => ({
        id: market.id,
        name: market.name,
        market,
        ...metricsFor(data, { market: market.id }, view.period),
      }));
  rows.sort((a, b) => {
    const av = a[sort.key],
      bv = b[sort.key];
    if (av === null) return bv === null ? 0 : 1;
    if (bv === null) return -1;
    return (sort.ascending ? 1 : -1) * (av - bv);
  });
  function heading(key: SortKey, label: string) {
    return (
      <th
        scope="col"
        aria-sort={
          sort.key !== key
            ? "none"
            : sort.ascending
              ? "ascending"
              : "descending"
        }
      >
        <button
          className="sort-button"
          onClick={() =>
            setSort({
              key,
              ascending: sort.key === key ? !sort.ascending : false,
            })
          }
        >
          {label}{" "}
          <span aria-hidden="true">
            {sort.key === key ? (sort.ascending ? "↑" : "↓") : "↕"}
          </span>
        </button>
      </th>
    );
  }
  return (
    <Card
      id="analyst-table"
      className="panel full-width"
      role="region"
      aria-labelledby="table-title"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">THE NUMBERS BEHIND THE SIGNAL</p>
          <h2 id="table-title">
            {selectedMarket
              ? `${selectedMarket.name} · Product performance`
              : "Market performance"}
          </h2>
        </div>
        <span className="count-chip">
          {rows.length} {selectedMarket ? "products" : "markets"}
        </span>
      </div>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Detailed performance data"
      >
        <table>
          <caption>
            {periodLabel(view.period)} · Revenue in {data.meta.currency}. Status
            and market share refer to {periodLabel(data.meta.latestPeriod)};
            market share is unavailable for products or historical periods.
          </caption>
          <thead>
            <tr>
              <th scope="col">{selectedMarket ? "Product" : "Market"}</th>
              {!selectedMarket && <th scope="col">Region</th>}
              {heading("actual", "Revenue")}
              <th scope="col">Forecast</th>
              {heading("gap", "Variance")}
              {heading("growth", "Growth")}
              {heading("attainment", "Attainment")}
              <th scope="col">Units</th>
              {!selectedMarket && (
                <>
                  <th scope="col">Market share</th>
                  <th scope="col">Latest status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                aria-selected={
                  selectedMarket
                    ? row.id === view.product
                    : row.id === view.market
                }
              >
                <th scope="row">
                  <button
                    className="table-link"
                    onClick={() =>
                      update(
                        selectedMarket
                          ? { product: row.id }
                          : {
                              region: row.market.regionId,
                              market: row.id,
                              product: undefined,
                            },
                      )
                    }
                  >
                    {row.name}
                    {selectedMarket && row.id === view.product
                      ? " · Selected"
                      : ""}
                  </button>
                </th>
                {!selectedMarket && (
                  <td>
                    <button
                      className="table-link"
                      onClick={() =>
                        update({
                          region: row.market.regionId,
                          market: undefined,
                          product: undefined,
                        })
                      }
                    >
                      {
                        data.regions.find(
                          (region) => region.id === row.market.regionId,
                        )?.name
                      }
                    </button>
                  </td>
                )}
                <td>{money(row.actual, data.meta.currency, false)}</td>
                <td>{money(row.forecast, data.meta.currency, false)}</td>
                <td className={row.gap >= 0 ? "positive" : "negative"}>
                  {row.gap > 0 ? "+" : ""}
                  {money(row.gap, data.meta.currency, false)}
                </td>
                <td>{percent(row.growth, true)}</td>
                <td>{percent(row.attainment)}</td>
                <td>{row.units.toLocaleString("en-US")}</td>
                {!selectedMarket && (
                  <>
                    <td>
                      {view.period === data.meta.latestPeriod
                        ? percent(row.market.kpis.sharePct)
                        : "Unavailable"}
                    </td>
                    <td>
                      <StatusBadge status={row.market.kpis.status} />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="empty-panel">
          No markets match this selection. Change the scope or status filter.
        </p>
      )}
    </Card>
  );
}
