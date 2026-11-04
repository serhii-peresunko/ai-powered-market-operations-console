"use client";
import type { DashboardProps } from "./types";
import { useState } from "react";
import { Panel } from "@/components/Panel";
import { DataTable } from "@/components/DataTable";
import { marketMetricsFor, metricsFor } from "@/lib/metrics";
import { money, percent, periodLabel } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

type SortKey = "actual" | "growth" | "attainment" | "gap";
const UI = {
  sortButton: "sort-button",
  fullWidth: "full-width",
  countChip: "count-chip",
  tableLink: "table-link",
  positive: "positive",
  negative: "negative",
  emptyPanel: "empty-panel",
} as const;

export function MarketTable({ data, view, update }: DashboardProps) {
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
    : marketMetricsFor(data, view, view.period).map(
        ({ market, ...metrics }) => ({
          id: market.id,
          name: market.name,
          market,
          ...metrics,
        }),
      );
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
          className={UI.sortButton}
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
    <Panel
      id="analyst-table"
      title={
        <>
          {selectedMarket
            ? `${selectedMarket.name} · Product performance`
            : "Market performance"}
        </>
      }
      eyebrow="THE NUMBERS BEHIND THE SIGNAL"
      titleId="table-title"
      className={UI.fullWidth}
      action={
        <>
          <span className={UI.countChip}>
            {rows.length} {selectedMarket ? "products" : "markets"}
          </span>
        </>
      }
    >
      <DataTable
        label="Detailed performance data"
        caption={
          <>
            {periodLabel(view.period)} · Revenue in {data.meta.currency}. Status
            and market share refer to {periodLabel(data.meta.latestPeriod)};
            market share is unavailable for products or historical periods.
          </>
        }
      >
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
                  className={UI.tableLink}
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
                    className={UI.tableLink}
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
              <td className={row.gap >= 0 ? UI.positive : UI.negative}>
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
      </DataTable>
      {rows.length === 0 && (
        <p className={UI.emptyPanel}>
          No markets match this selection. Change the scope or status filter.
        </p>
      )}
    </Panel>
  );
}
