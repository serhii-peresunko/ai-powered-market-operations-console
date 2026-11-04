const UI = {
  loadingState: "loading-state",
} as const;

export default function Loading() {
  return (
    <main className={UI.loadingState} role="status">
      Loading market operations…
    </main>
  );
}
