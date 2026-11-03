import { MarketConsole } from "@/components/dashboard/MarketConsole";
import { data } from "@/data";

export default function Home() {
  return <MarketConsole data={data} />;
}
