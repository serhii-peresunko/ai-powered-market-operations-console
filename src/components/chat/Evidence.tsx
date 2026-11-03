import type { ChatEvent, Citation, Dataset } from "@/data/types";
import { periodLabel } from "@/lib/format";
import { viewParams, type DashboardView } from "@/lib/view";

export function citationView(data: Dataset, view: DashboardView, citation: Citation): DashboardView | null {
  const market = data.markets.find((item) => item.id === citation.marketId);
  const region = data.regions.find((item) => item.id === citation.regionId);
  if ((citation.marketId && !market) || (citation.regionId && !region) ||
      (citation.productId && !data.products.some((item) => item.id === citation.productId)) ||
      (citation.period && !data.meta.periods.includes(citation.period)) ||
      (!market && !region) || (citation.productId && !market) || (market && region && market.regionId !== region.id)) return null;
  return { ...view, region: market?.regionId ?? region?.id, market: market?.id, product: citation.productId, period: citation.period ?? data.meta.latestPeriod, mode: "analyst", status: "all" };
}

export function Evidence({ data, view, completion, onNavigate }: {
  data: Dataset;
  view: DashboardView;
  completion: Extract<ChatEvent, { type: "done" }>;
  onNavigate: (view: DashboardView) => void;
}) {
  if (completion.kind === "error") return <p className="notice error-text">The response failed. Treat any text above as incomplete.</p>;
  return <div className="answer-evidence">
    <div className="confidence-line"><span className={`confidence-badge ${completion.confidence}`}>{completion.confidence === "high" ? "●" : "◐"} {completion.confidence[0].toUpperCase() + completion.confidence.slice(1)} confidence</span><span title="Provided by the mock answer fixture; not a calibrated probability.">Fixture metadata</span></div>
    {completion.kind === "abstain" && <p className="notice">Cannot answer from the provided data. No forecast has been generated.</p>}
    {(completion.kind === "low_confidence" || completion.confidence === "low") && <p className="notice">Directional interpretation. The available evidence does not support a precise conclusion.</p>}
    {completion.citations.length > 0 ? <><h3 className="evidence-heading">VERIFY IN SOURCE DATA <span>{completion.citations.length}</span></h3><ul className="citation-list">{completion.citations.map((citation, index) => {
      const target = citationView(data, view, citation);
      const entity = data.markets.find((item) => item.id === citation.marketId)?.name ?? data.regions.find((item) => item.id === citation.regionId)?.name;
      const product = data.products.find((item) => item.id === citation.productId)?.name;
      const label = [entity, product, citation.period ? periodLabel(citation.period) : periodLabel(data.meta.latestPeriod)].filter(Boolean).join(" · ");
      return <li key={index}>{target ? <a href={`?${viewParams(target)}#dashboard`} title={citation.label} onClick={(event) => { event.preventDefault(); onNavigate(target); }}><span className="citation-number">{index + 1}</span><span>{label}</span><span aria-hidden="true">↗</span></a> : <span className="notice">Source unavailable: {citation.label ?? "Unresolved citation"}</span>}</li>;
    })}</ul><p className="evidence-note">Cited evidence supports this answer; it may cover a subset of the portfolio.</p></> : <p className="evidence-note">No source citations were provided.</p>}
  </div>;
}
