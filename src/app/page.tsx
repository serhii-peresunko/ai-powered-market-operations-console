import { ConsoleWithAssistant } from "@/components/chat/ConsoleWithAssistant";
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
      <ConsoleWithAssistant data={data} />
    </Suspense>
  );
}
