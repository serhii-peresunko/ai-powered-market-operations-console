import { resolveCitation } from "@/lib/citations";
import { viewParams } from "@/lib/view";
import type { AssistantContext, ChatCompletion } from "./types";

const UI = {
  errorNotice: "notice error-text",
  answerEvidence: "answer-evidence",
  confidenceLine: "confidence-line",
  notice: "notice",
  evidenceHeading: "evidence-heading",
  citationList: "citation-list",
  citationNumber: "citation-number",
  evidenceNote: "evidence-note",
  confidence: (confidence: ChatCompletion["confidence"]) =>
    `confidence-badge ${confidence}`,
} as const;

export function Evidence({
  data,
  view,
  completion,
  onNavigate,
}: AssistantContext & { completion: ChatCompletion }) {
  if (completion.kind === "error")
    return (
      <p className={UI.errorNotice}>
        The response failed. Treat any text above as incomplete.
      </p>
    );
  return (
    <div className={UI.answerEvidence}>
      <div className={UI.confidenceLine}>
        <span className={UI.confidence(completion.confidence)}>
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
        <p className={UI.notice}>
          Cannot answer from the provided data. No forecast has been generated.
        </p>
      )}
      {(completion.kind === "low_confidence" ||
        completion.confidence === "low") && (
        <p className={UI.notice}>
          Directional interpretation. The available evidence does not support a
          precise conclusion.
        </p>
      )}
      {completion.citations.length > 0 ? (
        <>
          <h3 className={UI.evidenceHeading}>
            VERIFY IN SOURCE DATA <span>{completion.citations.length}</span>
          </h3>
          <ul className={UI.citationList}>
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
                      <span className={UI.citationNumber}>{index + 1}</span>
                      <span>{target.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className={UI.notice}>
                      Source unavailable:{" "}
                      {citation.label ?? "Unresolved citation"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className={UI.evidenceNote}>
            Cited evidence supports this answer; it may cover a subset of the
            portfolio.
          </p>
        </>
      ) : (
        <p className={UI.evidenceNote}>No source citations were provided.</p>
      )}
    </div>
  );
}
