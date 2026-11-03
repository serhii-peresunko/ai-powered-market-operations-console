import { ConsoleWithAssistant } from "@/components/chat/ConsoleWithAssistant";
import { data } from "@/data";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="loading-state">Loading market operations…</main>
      }
    >
      <ConsoleWithAssistant data={data} />
    </Suspense>
  );
}
