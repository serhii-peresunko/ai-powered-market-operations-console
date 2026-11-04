import {
  isAnswerKind,
  isConfidence,
  type ChatEvent,
  type Citation,
  CHAT_EVENT_TYPE,
} from "@/data/types";

export const MAX_QUESTION_LENGTH = 1000;
const MAX_EVENT_CHARACTERS = 100_000;
const TEXT = {
  startFailed: "Unable to start the response. Please retry.",
  invalidEvent: "The assistant returned an invalid event. Please retry.",
  incomplete:
    "Connection ended before the response was complete. Please retry.",
  tooLarge: "Assistant event exceeded the supported size.",
} as const;

function ssePayload(frame: string) {
  return frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
}

// One network chunk can contain many events; enforce the limit per frame.
function parseChatFrame(frame: string): ChatEvent | null {
  if (frame.length > MAX_EVENT_CHARACTERS) throw new Error(TEXT.tooLarge);
  const payload = ssePayload(frame);
  if (!payload) return null;
  let value: unknown;
  try {
    value = JSON.parse(payload);
  } catch {
    throw new Error(TEXT.invalidEvent);
  }
  return parseChatEvent(value);
}

export async function streamChat(
  question: string,
  signal: AbortSignal,
  onEvent: (event: ChatEvent) => void,
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });
  if (
    !response.ok ||
    !response.body ||
    !response.headers.get("content-type")?.includes("text/event-stream")
  )
    throw new Error(TEXT.startFailed);
  await consumeChat(response.body, onEvent);
}

function isCitation(value: unknown): value is Citation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return ["marketId", "regionId", "productId", "period", "label"].every(
    (key) => !(key in value) || typeof Reflect.get(value, key) === "string",
  );
}

export function parseChatEvent(value: unknown): ChatEvent {
  if (value && typeof value === "object" && "type" in value) {
    if (
      value.type === CHAT_EVENT_TYPE.TOKEN &&
      "value" in value &&
      typeof value.value === "string"
    )
      return { type: CHAT_EVENT_TYPE.TOKEN, value: value.value };
    if (
      value.type === CHAT_EVENT_TYPE.ERROR &&
      "message" in value &&
      typeof value.message === "string"
    )
      return { type: CHAT_EVENT_TYPE.ERROR, message: value.message };
    if (
      value.type === CHAT_EVENT_TYPE.DONE &&
      "kind" in value &&
      isAnswerKind(value.kind) &&
      "confidence" in value &&
      isConfidence(value.confidence) &&
      "citations" in value &&
      Array.isArray(value.citations) &&
      value.citations.every(isCitation)
    ) {
      return {
        type: CHAT_EVENT_TYPE.DONE,
        kind: value.kind,
        confidence: value.confidence,
        citations: value.citations,
      };
    }
  }
  throw new Error(TEXT.invalidEvent);
}

export async function consumeChat(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ChatEvent) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) throw new Error(TEXT.incomplete);
      buffer += decoder.decode(chunk.value, { stream: true });
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const event = parseChatFrame(frame);
        if (!event) continue;
        if (event.type === CHAT_EVENT_TYPE.ERROR)
          throw new Error(event.message);
        onEvent(event);
        if (event.type === CHAT_EVENT_TYPE.DONE) return;
      }
      if (buffer.length > MAX_EVENT_CHARACTERS) throw new Error(TEXT.tooLarge);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
