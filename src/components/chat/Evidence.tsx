import { CitationList } from "./CitationList";
import type { AssistantContext, ChatCompletion } from "./types";
import { ANSWER_KIND, CONFIDENCE } from "@/data/types";
import { EVIDENCE_TEXT as TEXT } from "./copy";

const UI = {
  errorNotice: "notice error-text",
  answerEvidence: "answer-evidence",
  confidenceLine: "confidence-line",
  notice: "notice",
  evidenceHeading: "evidence-heading",
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
  if (completion.kind === ANSWER_KIND.ERROR)
    return <p className={UI.errorNotice}>{TEXT.failure}</p>;
  return (
    <div className={UI.answerEvidence}>
      <div className={UI.confidenceLine}>
        <span className={UI.confidence(completion.confidence)}>
          {completion.confidence === CONFIDENCE.HIGH
            ? TEXT.highConfidenceIcon
            : TEXT.otherConfidenceIcon}{" "}
          {TEXT.confidenceLabel(completion.confidence)}
        </span>
        <span title={TEXT.metadataHint}>{TEXT.fixtureMetadata}</span>
      </div>
      {completion.kind === ANSWER_KIND.ABSTAIN && (
        <p className={UI.notice}>{TEXT.abstention}</p>
      )}
      {(completion.kind === ANSWER_KIND.LOW_CONFIDENCE ||
        completion.confidence === CONFIDENCE.LOW) && (
        <p className={UI.notice}>{TEXT.uncertainty}</p>
      )}
      {completion.citations.length > 0 ? (
        <>
          <h3 className={UI.evidenceHeading}>
            {TEXT.verifyInSourceData} <span>{completion.citations.length}</span>
          </h3>
          <CitationList
            data={data}
            view={view}
            onNavigate={onNavigate}
            citations={completion.citations}
          />
          <p className={UI.evidenceNote}>{TEXT.sourceNote}</p>
        </>
      ) : (
        <p className={UI.evidenceNote}>{TEXT.noCitations}</p>
      )}
    </div>
  );
}
