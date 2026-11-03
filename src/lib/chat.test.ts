// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { ChatEvent } from "@/data/types";
import { consumeChat, parseChatEvent } from "./chat";

const final = { type: "done", kind: "normal", confidence: "high", citations: [] };
function stream(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({ start(controller) { chunks.forEach((chunk) => controller.enqueue(chunk)); controller.close(); } });
}

describe("SSE consumption", () => {
  it("handles byte boundaries inside Unicode and CRLF frames", async () => {
    const encoded = new TextEncoder().encode(`: keepalive\r\n\r\ndata: ${JSON.stringify({ type: "token", value: "€ revenue " })}\r\n\r\ndata: ${JSON.stringify(final)}\r\n\r\n`);
    const events: ChatEvent[] = [];
    await consumeChat(stream(Array.from(encoded, (byte) => Uint8Array.of(byte))), (event) => events.push(event));
    expect(events).toEqual([{ type: "token", value: "€ revenue " }, final]);
  });
  it("handles several events per chunk and ignores events after completion", async () => {
    const input = new TextEncoder().encode(`data: {"type":"token","value":"Hello "}\n\ndata: ${JSON.stringify(final)}\n\ndata: broken\n\n`);
    const events: ChatEvent[] = [];
    await consumeChat(stream([input]), (event) => events.push(event));
    expect(events).toHaveLength(2);
  });
  it("rejects premature EOF, invalid metadata, malformed JSON, and error events", async () => {
    for (const input of ["", 'data: {"type":"token","value":"Partial"}\n\n', 'data: broken\n\n', 'data: {"type":"error","message":"Try again"}\n\n']) {
      await expect(consumeChat(stream([new TextEncoder().encode(input)]), () => undefined)).rejects.toBeInstanceOf(Error);
    }
    expect(() => parseChatEvent({ ...final, confidence: "certain" })).toThrow();
    expect(() => parseChatEvent({ ...final, citations: [{ marketId: 3 }] })).toThrow();
  });
});
