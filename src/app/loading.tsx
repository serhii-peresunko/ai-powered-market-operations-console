import { LOADING_TEXT as TEXT } from "./copy";
const UI = {
  loadingState: "loading-state",
} as const;

export default function Loading() {
  return (
    <main className={UI.loadingState} role="status">
      {TEXT.loadingMarketOperations}
    </main>
  );
}
