"use client";
import dynamic from "next/dynamic";
import type { Dataset } from "@/shared/types";
import { MarketConsole } from "@/features/dashboard/MarketConsole";
import { useDashboardView } from "@/features/dashboard/useDashboardView";
import { Workspace } from "./Workspace";

const AlertConfigurator = dynamic(
  () => import("@/features/alerts/AlertConfigurator"),
  { ssr: false },
);

export function MarketWorkspace({ data }: { data: Dataset }) {
  const { view, update } = useDashboardView(data);
  return (
    <Workspace marketCount={data.markets.length} currency={data.meta.currency}>
      <MarketConsole
        data={data}
        view={view}
        update={update}
        alerts={<AlertConfigurator data={data} period={view.period} />}
      />
    </Workspace>
  );
}
