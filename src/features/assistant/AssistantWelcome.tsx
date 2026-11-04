import { RiSparklingLine } from "@remixicon/react";
import { ASSISTANT_TEXT as TEXT } from "./copy";

const UI = {
  assistantEmpty: "assistant-empty",
  welcomeSymbol: "welcome-symbol",
  suggestedQuestions: "suggested-questions",
} as const;

export function AssistantWelcome({
  onAsk,
}: {
  onAsk: (question: string) => void;
}) {
  return (
    <div className={UI.assistantEmpty}>
      <span className={UI.welcomeSymbol}>
        <RiSparklingLine size={30} aria-hidden="true" />
      </span>
      <h3>
        {TEXT.fromNumbers}
        <br />
        {TEXT.toUnderstanding}
      </h3>
      <p>
        {TEXT.welcomeDescription}
        <br />
        {TEXT.welcomeHint}
      </p>
      <div className={UI.suggestedQuestions}>
        {TEXT.prompts.map((prompt) => (
          <button key={prompt} onClick={() => onAsk(prompt)}>
            {prompt}
            <span aria-hidden="true">{TEXT.promptIcon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
