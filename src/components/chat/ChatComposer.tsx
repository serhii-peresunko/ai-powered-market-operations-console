"use client";
import { useState } from "react";
import { RiArrowUpLine, RiStopFill } from "@remixicon/react";
import { Button } from "@/components/Button";
import { MAX_QUESTION_LENGTH } from "@/lib/chat";

const UI = {
  composerForm: "composer-form",
  srOnly: "sr-only",
  composerActions: "composer-actions",
} as const;

export function ChatComposer({
  busy,
  onAsk,
  onStop,
}: {
  busy: boolean;
  onAsk: (question: string) => void;
  onStop: () => void;
}) {
  const [question, setQuestion] = useState("");
  function send() {
    if (
      busy ||
      !question.trim() ||
      question.trim().length > MAX_QUESTION_LENGTH
    )
      return;
    onAsk(question);
    setQuestion("");
  }
  return (
    <form
      className={UI.composerForm}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <label htmlFor="chat-question" className={UI.srOnly}>
        Ask about your markets
      </label>
      <textarea
        id="chat-question"
        placeholder="Ask about your markets…"
        maxLength={MAX_QUESTION_LENGTH}
        rows={2}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            send();
          }
        }}
        aria-describedby="chat-help"
      />
      <div className={UI.composerActions}>
        <span>
          {busy
            ? "Working with source data…"
            : "Enter to send · Shift+Enter for a new line"}
        </span>
        {busy ? (
          <Button
            type="button"
            variant="secondary"
            aria-label="Stop generation"
            onClick={onStop}
          >
            <RiStopFill size={16} aria-hidden="true" />
            Stop
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!question.trim()}
            aria-label="Send message"
          >
            <RiArrowUpLine size={17} aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
