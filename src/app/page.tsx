import { Card } from "@/components/Card";

export default function Home() {
  return (
    <main className="recovery-page">
      <p className="eyebrow">MARKET OPERATIONS</p>
      <h1>Market operations console</h1>
      <p>A workspace for understanding portfolio performance across markets.</p>
      <Card>
        <h2>Workspace ready</h2>
        <p>
          Shared components, data contracts, formatting, and test setup are in
          place.
        </p>
      </Card>
    </main>
  );
}
