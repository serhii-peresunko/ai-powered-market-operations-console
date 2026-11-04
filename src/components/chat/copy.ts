export const ASSISTANT_TEXT = {
  prompts: [
    "Which markets are at risk?",
    "Why did Germany's revenue dip?",
    "Compare APAC and Europe",
  ],
  title: "Market assistant",
  subtitle: "AI-generated interpretation",
  demo: "DEMO",
  generating: "Assistant is generating a response.",
  finished: "Generation finished. Review the latest answer.",
  ready: "Assistant ready.",
  footnote: "Fixture-based demo · Verify AI claims against source data.",
  fromNumbers: "From numbers",
  toUnderstanding: "to understanding.",
  welcomeDescription: "Ask a question about your portfolio.",
  welcomeHint: "Follow the evidence behind every answer.",
  promptIcon: "↗",
} as const;

export const CONVERSATION_TEXT = {
  answerLabel: (question: string) => `AI answer to ${question}`,
  conversation: "Conversation",
  you: "YOU",
  aiInterpretation: "AI INTERPRETATION",
  reading: "Reading the evidence…",
  empty: "No answer received.",
  generating: "Generating… Evidence and confidence pending.",
  stopped: "Stopped · Partial answer, not verified.",
  retryQuestion: "Retry question",
} as const;

export const EVIDENCE_TEXT = {
  highConfidenceIcon: "●",
  otherConfidenceIcon: "◐",
  confidenceLabels: { high: "High", medium: "Medium", low: "Low" },
  failure: "The response failed. Treat any text above as incomplete.",
  confidence: "confidence",
  metadataHint:
    "Provided by the mock answer fixture; not a calibrated probability.",
  fixtureMetadata: "Fixture metadata",
  abstention:
    "Cannot answer from the provided data. No forecast has been generated.",
  uncertainty:
    "Directional interpretation. The available evidence does not support a precise conclusion.",
  verifyInSourceData: "VERIFY IN SOURCE DATA ",
  citationIcon: "↗",
  sourceUnavailable: "Source unavailable:",
  unresolvedCitation: "Unresolved citation",
  sourceNote:
    "Cited evidence supports this answer; it may cover a subset of the portfolio.",
  noCitations: "No source citations were provided.",
} as const;

export const CHAT_COMPOSER_TEXT = {
  label: "Ask about your markets",
  placeholder: "Ask about your markets…",
  workingWithSourceData: "Working with source data…",
  keyboardHint: "Enter to send · Shift+Enter for a new line",
  stopGeneration: "Stop generation",
  stop: "Stop",
  sendMessage: "Send message",
} as const;

export const CONSOLE_WITH_ASSISTANT_TEXT = {
  hint: "Have a question about a market? Explore the evidence with the assistant.",
} as const;
