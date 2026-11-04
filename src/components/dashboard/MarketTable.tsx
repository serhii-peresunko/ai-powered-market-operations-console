"use client";
import type { DashboardProps } from "./types";
import { useMemo, useState } from "react";
import { Panel } from "@/components/Panel";
import { DataTable } from "@/components/DataTable";
import {
  marketTableData,
  SORT_KEY,
  type SortKey,
  type MarketSort,
} from "@/lib/market-table";
import { periodLabel } from "@/lib/format";
import { MarketTableRow } from "./MarketTableRow";
import { MARKET_TABLE_TEXT as TEXT } from "./copy";

const UI = {
  sortButton: "sort-button",
  fullWidth: "full-width",
  countChip: "count-chip",
  emptyPanel: "empty-panel",
} as const;

export function MarketTable({ data, view, update }: DashboardProps) {
  const [sort, setSort] = useState<MarketSort>({
    key: SORT_KEY.REVENUE,
    ascending: false,
  });
  const { rows, selectedMarket } = useMemo(
    () => marketTableData(data, view, sort),
    [data, view, sort],
  );
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
            {sort.key === key
              ? sort.ascending
                ? TEXT.ascending
                : TEXT.descending
              : TEXT.unsorted}
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
          {selectedMarket ? TEXT.productTitle(selectedMarket.name) : TEXT.title}
        </>
      }
      eyebrow={TEXT.eyebrow}
      titleId="table-title"
      className={UI.fullWidth}
      action={
        <>
          <span className={UI.countChip}>
            {TEXT.rowCount(rows.length, Boolean(selectedMarket))}
          </span>
        </>
      }
    >
      <DataTable
        label={TEXT.tableLabel}
        caption={TEXT.tableCaption(
          periodLabel(view.period),
          data.meta.currency,
          periodLabel(data.meta.latestPeriod),
        )}
      >
        <thead>
          <tr>
            <th scope="col">{selectedMarket ? TEXT.product : TEXT.market}</th>
            {!selectedMarket && <th scope="col">{TEXT.region}</th>}
            {heading(SORT_KEY.REVENUE, TEXT.revenue)}
            <th scope="col">{TEXT.forecast}</th>
            {heading(SORT_KEY.GAP, TEXT.variance)}
            {heading(SORT_KEY.GROWTH, TEXT.growth)}
            {heading(SORT_KEY.ATTAINMENT, TEXT.attainment)}
            <th scope="col">{TEXT.units}</th>
            {!selectedMarket && (
              <>
                <th scope="col">{TEXT.marketShare}</th>
                <th scope="col">{TEXT.latestStatus}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MarketTableRow
              key={row.id}
              row={row}
              data={data}
              view={view}
              update={update}
              productRows={Boolean(selectedMarket)}
            />
          ))}
        </tbody>
      </DataTable>
      {rows.length === 0 && <p className={UI.emptyPanel}>{TEXT.empty}</p>}
    </Panel>
  );
}
