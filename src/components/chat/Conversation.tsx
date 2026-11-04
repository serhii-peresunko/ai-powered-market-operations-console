import { RiSparklingLine } from "@remixicon/react";
import { Evidence } from "./Evidence";
import {
  type AssistantContext,
  type ChatTurn,
  CHAT_TURN_STATUS,
} from "./types";

const UI = {
  conversation: "conversation",
  userMessage: "user-message",
  messageLabel: "message-label",
  assistantMessage: "assistant-message",
  answerText: "answer-text",
  generationStatus: "generation-status",
  notice: "notice",
  errorNotice: "notice error-text",
  textButton: "text-button",
} as const;

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
    <ol className={UI.conversation} aria-label="Conversation">
      {turns.map((turn) => (
        <li key={turn.id}>
          <div className={UI.userMessage}>
            <span className={UI.messageLabel}>YOU</span>
            <p>{turn.question}</p>
          </div>
          <article
            className={UI.assistantMessage}
            tabIndex={0}
            aria-label={`AI answer to ${turn.question}`}
          >
            <span className={UI.messageLabel}>
              <RiSparklingLine size={12} aria-hidden="true" />
              AI INTERPRETATION
            </span>
            <p className={UI.answerText}>
              {turn.text ||
                (turn.status === CHAT_TURN_STATUS.STREAMING
                  ? "Reading the evidence…"
                  : "No answer received.")}
            </p>
            {turn.status === CHAT_TURN_STATUS.STREAMING && (
              <p className={UI.generationStatus}>
                Generating… Evidence and confidence pending.
              </p>
            )}
            {turn.status === CHAT_TURN_STATUS.COMPLETE && turn.completion && (
              <Evidence
                data={data}
                view={view}
                completion={turn.completion}
                onNavigate={onNavigate}
              />
            )}
            {turn.status === CHAT_TURN_STATUS.STOPPED && (
              <p className={UI.notice}>
                Stopped · Partial answer, not verified.
              </p>
            )}
            {turn.status === CHAT_TURN_STATUS.ERROR && (
              <p className={UI.errorNotice} role="alert">
                {turn.error}
              </p>
            )}
            {(turn.status === CHAT_TURN_STATUS.ERROR ||
              turn.status === CHAT_TURN_STATUS.STOPPED) && (
              <button
                className={UI.textButton}
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
