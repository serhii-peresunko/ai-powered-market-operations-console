"use client";
import { RiSparklingLine } from "@remixicon/react";
import type { AssistantContext } from "./types";
import { useChat } from "./useChat";
import { useChatScroll } from "./useChatScroll";
import { ChatComposer } from "./ChatComposer";
import { Conversation } from "./Conversation";

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
      className="assistant-panel"
      aria-labelledby="assistant-title"
    >
      <header className="assistant-heading">
        <span className="assistant-symbol">
          <RiSparklingLine size={21} aria-hidden="true" />
        </span>
        <div>
          <h2 id="assistant-title">Market assistant</h2>
          <p>AI-generated interpretation</p>
        </div>
        <span className="demo-badge">DEMO</span>
      </header>
      <div ref={scrollRef} className="conversation-scroll" onScroll={onScroll}>
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
      <div className="sr-only" role="status">
        {chat.busy
          ? "Assistant is generating a response."
          : chat.turns.length
            ? "Generation finished. Review the latest answer."
            : "Assistant ready."}
      </div>
      <ChatComposer busy={chat.busy} onAsk={ask} onStop={chat.stop} />
      <p id="chat-help" className="assistant-footnote">
        Fixture-based demo · Verify AI claims against source data.
      </p>
    </aside>
  );
}

function AssistantWelcome({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="assistant-empty">
      <span className="welcome-symbol">
        <RiSparklingLine size={30} aria-hidden="true" />
      </span>
      <h3>
        From numbers
        <br />
        to understanding.
      </h3>
      <p>
        Ask a question about your portfolio.
        <br />
        Follow the evidence behind every answer.
      </p>
      <div className="suggested-questions">
        {[
          "Which markets are at risk?",
          "Why did Germany's revenue dip?",
          "Compare APAC and Europe",
        ].map((prompt) => (
          <button key={prompt} onClick={() => onAsk(prompt)}>
            {prompt}
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
