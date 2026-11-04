import { resolveCitation } from "@/lib/citations";
import { viewParams } from "@/lib/view";
import type { Citation } from "@/data/types";
import type { AssistantContext } from "./types";
import { EVIDENCE_TEXT as TEXT } from "./copy";

const UI = {
  citationList: "citation-list",
  citationNumber: "citation-number",
  notice: "notice",
} as const;

export function CitationList({
  data,
  view,
  onNavigate,
  citations,
}: AssistantContext & { citations: Citation[] }) {
  return (
    <ul className={UI.citationList}>
      {citations.map((citation, index) => {
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
                <span aria-hidden="true">{TEXT.citationIcon}</span>
              </a>
            ) : (
              <span className={UI.notice}>
                {TEXT.sourceUnavailable}{" "}
                {citation.label ?? TEXT.unresolvedCitation}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
