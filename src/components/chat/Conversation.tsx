import { RiSparklingLine } from "@remixicon/react";
import { Evidence } from "./Evidence";
import {
  type AssistantContext,
  type ChatTurn,
  CHAT_TURN_STATUS,
} from "./types";
import { CONVERSATION_TEXT as TEXT } from "./copy";

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
    <ol className={UI.conversation} aria-label={TEXT.conversation}>
      {turns.map((turn) => (
        <li key={turn.id}>
          <div className={UI.userMessage}>
            <span className={UI.messageLabel}>{TEXT.you}</span>
            <p>{turn.question}</p>
          </div>
          <article
            className={UI.assistantMessage}
            tabIndex={0}
            aria-label={TEXT.answerLabel(turn.question)}
          >
            <span className={UI.messageLabel}>
              <RiSparklingLine size={12} aria-hidden="true" />
              {TEXT.aiInterpretation}
            </span>
            <p className={UI.answerText}>
              {turn.text ||
                (turn.status === CHAT_TURN_STATUS.STREAMING
                  ? TEXT.reading
                  : TEXT.empty)}
            </p>
            {turn.status === CHAT_TURN_STATUS.STREAMING && (
              <p className={UI.generationStatus}>{TEXT.generating}</p>
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
              <p className={UI.notice}>{TEXT.stopped}</p>
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
                {TEXT.retryQuestion}
              </button>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}
