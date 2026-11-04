import { MarketWorkspace } from "./_components/MarketWorkspace";
import { data } from "@/data";
import { LOADING_TEXT as TEXT } from "./copy";

import { Suspense } from "react";

const UI = {
  loadingState: "loading-state",
} as const;

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className={UI.loadingState}>{TEXT.loadingMarketOperations}</main>
      }
    >
      <MarketWorkspace data={data} />
    </Suspense>
  );
}
