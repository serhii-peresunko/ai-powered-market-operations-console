"use client";
import { RiSparklingLine } from "@remixicon/react";
import type { AssistantContext } from "./types";
import { useChat } from "./useChat";
import { useChatScroll } from "./useChatScroll";
import { ChatComposer } from "./ChatComposer";
import { Conversation } from "./Conversation";
import { AssistantWelcome } from "./AssistantWelcome";
import { ASSISTANT_TEXT as TEXT } from "./copy";

const UI = {
  assistantPanel: "assistant-panel",
  assistantHeading: "assistant-heading",
  assistantSymbol: "assistant-symbol",
  demoBadge: "demo-badge",
  conversationScroll: "conversation-scroll",
  srOnly: "sr-only",
  assistantFootnote: "assistant-footnote",
} as const;

export function Assistant(context: AssistantContext) {
  const chat = useChat();
  const { container: scrollRef, onScroll, resume } = useChatScroll(chat.turns);
  function ask(question: string) {
    resume();
    void chat.ask(question);
  }
  return (
    <aside
      id="assistant"
      className={UI.assistantPanel}
      aria-labelledby="assistant-title"
    >
      <header className={UI.assistantHeading}>
        <span className={UI.assistantSymbol}>
          <RiSparklingLine size={21} aria-hidden="true" />
        </span>
        <div>
          <h2 id="assistant-title">{TEXT.title}</h2>
          <p>{TEXT.subtitle}</p>
        </div>
        <span className={UI.demoBadge}>{TEXT.demo}</span>
      </header>
      <div
        ref={scrollRef}
        className={UI.conversationScroll}
        onScroll={onScroll}
      >
        {chat.turns.length === 0 ? (
          <AssistantWelcome onAsk={ask} />
        ) : (
          <Conversation
            {...context}
            turns={chat.turns}
            busy={chat.busy}
            onRetry={ask}
          />
        )}
      </div>
      <div className={UI.srOnly} role="status">
        {chat.busy
          ? TEXT.generating
          : chat.turns.length
            ? TEXT.finished
            : TEXT.ready}
      </div>
      <ChatComposer busy={chat.busy} onAsk={ask} onStop={chat.stop} />
      <p id="chat-help" className={UI.assistantFootnote}>
        {TEXT.footnote}
      </p>
    </aside>
  );
}
