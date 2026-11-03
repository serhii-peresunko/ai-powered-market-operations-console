import type { ReactNode } from "react";
import { RiArrowRightUpLine } from "@remixicon/react";
import { Panel } from "@/components/Panel";
import { StatusBadge } from "./StatusBadge";
import type { Dataset, Market } from "@/data/types";
import type { DashboardProps } from "./types";
import type { marketMetricsFor } from "@/lib/metrics";
import { money, percent } from "@/lib/format";

export function MarketPriorities({
  data,
  rows,
  risks,
  update,
  insight,
}: {
  data: Dataset;
  rows: ReturnType<typeof marketMetricsFor>;
  risks: Market[];
  update: DashboardProps["update"];
  insight?: ReactNode;
}) {
  const movers = [...rows]
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 4);
  return (
    <>
      <Panel
        id="market-detail"
        title="Markets to watch"
        eyebrow="PRIORITIZE"
        action={
          <>
            <span className="count-chip">{risks.length} markets</span>
          </>
        }
        description={<>Latest source flags, including off-track markets.</>}
      >
        <div className="risk-list">
          {risks.length === 0 && (
            <p className="empty-panel">
              No source-flagged markets in this scope.
            </p>
          )}
          {risks.map((market) => (
            <div key={market.id} className="risk-row">
              <span className="country-code">{market.iso2}</span>
              <button
                className="risk-name"
                onClick={() =>
                  update({
                    region: market.regionId,
                    market: market.id,
                    product: undefined,
                  })
                }
              >
                <strong>{market.name}</strong>
                <span>
                  {
                    data.regions.find((region) => region.id === market.regionId)
                      ?.name
                  }
                </span>
              </button>
              <StatusBadge status={market.kpis.status} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        id="largest-forecast-gaps"
        action={<RiArrowRightUpLine size={20} aria-hidden="true" />}
        title="Largest forecast gaps"
        eyebrow="WHAT MOVED THE NEEDLE"
        description={<>Ranked by absolute revenue variance from plan.</>}
      >
        <div className="movers-list">
          {movers.map(({ market, gap, attainment }) => (
            <div key={market.id} className="mover-row">
              <button
                className="market-link"
                onClick={() =>
                  update({
                    region: market.regionId,
                    market: market.id,
                    product: undefined,
                  })
                }
              >
                <strong>{market.name}</strong>
                <span>{percent(attainment)} of forecast</span>
              </button>
              <strong className={gap >= 0 ? "positive" : "negative"}>
                {gap > 0 ? "+" : ""}
                {money(gap, data.meta.currency)}
              </strong>
            </div>
          ))}
        </div>
        {insight}
      </Panel>
    </>
  );
}
