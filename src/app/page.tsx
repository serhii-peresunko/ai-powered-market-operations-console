import { MarketConsole } from "@/components/dashboard/MarketConsole";
import { data } from "@/data";
import { Suspense } from "react";

export default function Home() {
  return <Suspense fallback={<main className="loading-state">Loading market operations…</main>}><MarketConsole data={data} /></Suspense>;
}
