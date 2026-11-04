"use client";
import { useState } from "react";
import { RiArrowUpLine, RiStopFill } from "@remixicon/react";
import { Button } from "@/components/Button";
import { MAX_QUESTION_LENGTH } from "@/lib/chat";
import { CHAT_COMPOSER_TEXT as TEXT } from "./copy";

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
    const message = question.trim();
    if (busy || !message || message.length > MAX_QUESTION_LENGTH) return;
    onAsk(message);
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
        {TEXT.label}
      </label>
      <textarea
        id="chat-question"
        placeholder={TEXT.placeholder}
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
        <span>{busy ? TEXT.workingWithSourceData : TEXT.keyboardHint}</span>
        {busy ? (
          <Button
            type="button"
            variant="secondary"
            aria-label={TEXT.stopGeneration}
            onClick={onStop}
          >
            <RiStopFill size={16} aria-hidden="true" />
            {TEXT.stop}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!question.trim()}
            aria-label={TEXT.sendMessage}
          >
            <RiArrowUpLine size={17} aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
}
