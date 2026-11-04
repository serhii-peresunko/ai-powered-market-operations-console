import type { ReactNode } from "react";
import { RiArrowRightUpLine } from "@remixicon/react";
import { Panel } from "@/components/Panel";
import { StatusBadge } from "./StatusBadge";
import type { Dataset, Market } from "@/data/types";
import type { DashboardProps } from "./types";
import type { marketMetricsFor } from "@/lib/metrics";
import { money, percent } from "@/lib/format";

const UI = {
  countChip: "count-chip",
  riskList: "risk-list",
  emptyPanel: "empty-panel",
  riskRow: "risk-row",
  countryCode: "country-code",
  riskName: "risk-name",
  moversList: "movers-list",
  moverRow: "mover-row",
  marketLink: "market-link",
  positive: "positive",
  negative: "negative",
} as const;

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
            <span className={UI.countChip}>{risks.length} markets</span>
          </>
        }
        description={<>Latest source flags, including off-track markets.</>}
      >
        <div className={UI.riskList}>
          {risks.length === 0 && (
            <p className={UI.emptyPanel}>
              No source-flagged markets in this scope.
            </p>
          )}
          {risks.map((market) => (
            <div key={market.id} className={UI.riskRow}>
              <span className={UI.countryCode}>{market.iso2}</span>
              <button
                className={UI.riskName}
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
        <div className={UI.moversList}>
          {movers.map(({ market, gap, attainment }) => (
            <div key={market.id} className={UI.moverRow}>
              <button
                className={UI.marketLink}
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
              <strong className={gap >= 0 ? UI.positive : UI.negative}>
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
