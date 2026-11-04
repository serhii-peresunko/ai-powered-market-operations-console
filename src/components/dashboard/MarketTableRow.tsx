import type { DashboardProps } from "./types";
import type { MarketTableItem } from "@/lib/market-table";
import { money, percent, integer } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { MARKET_TABLE_TEXT as TEXT } from "./copy";

const UI = {
  tableLink: "table-link",
  positive: "positive",
  negative: "negative",
} as const;

export function MarketTableRow({
  row,
  data,
  view,
  update,
  productRows,
}: DashboardProps & { row: MarketTableItem; productRows: boolean }) {
  return (
    <tr
      aria-selected={
        productRows ? row.id === view.product : row.id === view.market
      }
    >
      <th scope="row">
        <button
          className={UI.tableLink}
          onClick={() =>
            update(
              productRows
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
          {productRows && row.id === view.product ? TEXT.selected : ""}
        </button>
      </th>
      {!productRows && (
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
              data.regions.find((region) => region.id === row.market.regionId)
                ?.name
            }
          </button>
        </td>
      )}
      <td>{money(row.actual, data.meta.currency, false)}</td>
      <td>{money(row.forecast, data.meta.currency, false)}</td>
      <td className={row.gap >= 0 ? UI.positive : UI.negative}>
        {row.gap > 0 ? TEXT.positive : ""}
        {money(row.gap, data.meta.currency, false)}
      </td>
      <td>{percent(row.growth, true)}</td>
      <td>{percent(row.attainment)}</td>
      <td>{integer(row.units)}</td>
      {!productRows && (
        <>
          <td>
            {view.period === data.meta.latestPeriod
              ? percent(row.market.kpis.sharePct)
              : TEXT.unavailable}
          </td>
          <td>
            <StatusBadge status={row.market.kpis.status} />
          </td>
        </>
      )}
    </tr>
  );
}
