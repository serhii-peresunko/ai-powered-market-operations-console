import { RiSparklingLine } from "@remixicon/react";
import { Evidence } from "./Evidence";
import type { AssistantContext, ChatTurn } from "./types";

export function Conversation({
  turns,
  busy,
  onRetry,
  data,
  view,
  onNavigate,
}: AssistantContext & {
  turns: ChatTurn[];
  busy: boolean;
  onRetry: (question: string) => void;
}) {
  return (
    <ol className="conversation" aria-label="Conversation">
      {turns.map((turn) => (
        <li key={turn.id}>
          <div className="user-message">
            <span className="message-label">YOU</span>
            <p>{turn.question}</p>
          </div>
          <article
            className="assistant-message"
            tabIndex={0}
            aria-label={`AI answer to ${turn.question}`}
          >
            <span className="message-label">
              <RiSparklingLine size={12} aria-hidden="true" />
              AI INTERPRETATION
            </span>
            <p className="answer-text">
              {turn.text ||
                (turn.status === "streaming"
                  ? "Reading the evidence…"
                  : "No answer received.")}
            </p>
            {turn.status === "streaming" && (
              <p className="generation-status">
                Generating… Evidence and confidence pending.
              </p>
            )}
            {turn.status === "complete" && turn.completion && (
              <Evidence
                data={data}
                view={view}
                completion={turn.completion}
                onNavigate={onNavigate}
              />
            )}
            {turn.status === "stopped" && (
              <p className="notice">Stopped · Partial answer, not verified.</p>
            )}
            {turn.status === "error" && (
              <p className="notice error-text" role="alert">
                {turn.error}
              </p>
            )}
            {(turn.status === "error" || turn.status === "stopped") && (
              <button
                className="text-button"
                disabled={busy}
                onClick={() => onRetry(turn.question)}
              >
                Retry question
              </button>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}
