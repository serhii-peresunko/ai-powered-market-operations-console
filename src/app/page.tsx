import { MarketConsole } from "@/components/dashboard/MarketConsole";
import { data } from "@/data";
import { Suspense } from "react";
import { LOADING_TEXT as TEXT } from "./copy";


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
      <MarketConsole data={data} />
    </Suspense>
  );
}
