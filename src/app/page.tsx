import { ConsoleWithAssistant } from "@/components/chat/ConsoleWithAssistant";
import { data } from "@/data";
import { Suspense } from "react";

const UI = {
  loadingState: "loading-state",
} as const;

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className={UI.loadingState}>Loading market operations…</main>
      }
    >
      <ConsoleWithAssistant data={data} />
    </Suspense>
  );
}
