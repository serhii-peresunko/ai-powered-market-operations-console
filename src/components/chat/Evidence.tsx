import { resolveCitation } from "@/lib/citations";
import { viewParams } from "@/lib/view";
import type { AssistantContext, ChatCompletion } from "./types";

export function Evidence({
  data,
  view,
  completion,
  onNavigate,
}: AssistantContext & { completion: ChatCompletion }) {
  if (completion.kind === "error")
    return (
      <p className="notice error-text">
        The response failed. Treat any text above as incomplete.
      </p>
    );
  return (
    <div className="answer-evidence">
      <div className="confidence-line">
        <span className={`confidence-badge ${completion.confidence}`}>
          {completion.confidence === "high" ? "●" : "◐"}{" "}
          {completion.confidence[0].toUpperCase() +
            completion.confidence.slice(1)}{" "}
          confidence
        </span>
        <span title="Provided by the mock answer fixture; not a calibrated probability.">
          Fixture metadata
        </span>
      </div>
      {completion.kind === "abstain" && (
        <p className="notice">
          Cannot answer from the provided data. No forecast has been generated.
        </p>
      )}
      {(completion.kind === "low_confidence" ||
        completion.confidence === "low") && (
        <p className="notice">
          Directional interpretation. The available evidence does not support a
          precise conclusion.
        </p>
      )}
      {completion.citations.length > 0 ? (
        <>
          <h3 className="evidence-heading">
            VERIFY IN SOURCE DATA <span>{completion.citations.length}</span>
          </h3>
          <ul className="citation-list">
            {completion.citations.map((citation, index) => {
              const target = resolveCitation(data, view, citation);
              return (
                <li key={index}>
                  {target ? (
                    <a
                      href={`?${viewParams(target.view)}#dashboard`}
                      title={citation.label}
                      onClick={(event) => {
                        event.preventDefault();
                        onNavigate(target.view);
                      }}
                    >
                      <span className="citation-number">{index + 1}</span>
                      <span>{target.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="notice">
                      Source unavailable:{" "}
                      {citation.label ?? "Unresolved citation"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="evidence-note">
            Cited evidence supports this answer; it may cover a subset of the
            portfolio.
          </p>
        </>
      ) : (
        <p className="evidence-note">No source citations were provided.</p>
      )}
    </div>
  );
}
