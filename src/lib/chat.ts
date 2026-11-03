import { isAnswerKind, isConfidence, type ChatEvent, type Citation } from "@/data/types";

function isCitation(value: unknown): value is Citation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return ["marketId", "regionId", "productId", "period", "label"].every((key) =>
    !(key in value) || typeof Reflect.get(value, key) === "string");
}

export function parseChatEvent(value: unknown): ChatEvent {
  if (value && typeof value === "object" && "type" in value) {
    if (value.type === "token" && "value" in value && typeof value.value === "string") return { type: "token", value: value.value };
    if (value.type === "error" && "message" in value && typeof value.message === "string") return { type: "error", message: value.message };
    if (value.type === "done" && "kind" in value && isAnswerKind(value.kind) && "confidence" in value && isConfidence(value.confidence) &&
        "citations" in value && Array.isArray(value.citations) && value.citations.every(isCitation)) {
      return { type: "done", kind: value.kind, confidence: value.confidence, citations: value.citations };
    }
  }
  throw new Error("The assistant returned an invalid event. Please retry.");
}

export async function consumeChat(body: ReadableStream<Uint8Array>, onEvent: (event: ChatEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) throw new Error("Connection ended before the response was complete. Please retry.");
      buffer += decoder.decode(chunk.value, { stream: true });
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const payload = frame.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
        if (!payload) continue;
        const event = parseChatEvent(JSON.parse(payload) as unknown);
        if (event.type === "error") throw new Error(event.message);
        onEvent(event);
        if (event.type === "done") return;
      }
      if (buffer.length > 100_000) throw new Error("Assistant event exceeded the supported size.");
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
