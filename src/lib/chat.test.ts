// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { ChatEvent } from "@/data/types";
import { consumeChat, parseChatEvent } from "./chat";

const final = {
  type: "done",
  kind: "normal",
  confidence: "high",
  citations: [],
};
function stream(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

describe("SSE consumption", () => {
  it("handles byte boundaries inside Unicode and CRLF frames", async () => {
    const encoded = new TextEncoder().encode(
      `: keepalive\r\n\r\ndata: ${JSON.stringify({ type: "token", value: "€ revenue " })}\r\n\r\ndata: ${JSON.stringify(final)}\r\n\r\n`,
    );
    const events: ChatEvent[] = [];
    await consumeChat(
      stream(Array.from(encoded, (byte) => Uint8Array.of(byte))),
      (event) => events.push(event),
    );
    expect(events).toEqual([{ type: "token", value: "€ revenue " }, final]);
  });
  it("handles several events per chunk and ignores events after completion", async () => {
    const input = new TextEncoder().encode(
      `data: {"type":"token","value":"Hello "}\n\ndata: ${JSON.stringify(final)}\n\ndata: broken\n\n`,
    );
    const events: ChatEvent[] = [];
    await consumeChat(stream([input]), (event) => events.push(event));
    expect(events).toHaveLength(2);
  });
  it("rejects premature EOF, invalid metadata, malformed JSON, and error events", async () => {
    for (const input of [
      "",
      'data: {"type":"token","value":"Partial"}\n\n',
      "data: broken\n\n",
      'data: {"type":"error","message":"Try again"}\n\n',
    ]) {
      await expect(
        consumeChat(stream([new TextEncoder().encode(input)]), () => undefined),
      ).rejects.toBeInstanceOf(Error);
    }
    expect(() => parseChatEvent({ ...final, confidence: "certain" })).toThrow();
    expect(() =>
      parseChatEvent({ ...final, citations: [{ marketId: 3 }] }),
    ).toThrow();
  });
});

describe("stream failure recovery", () => {
  it("reports malformed JSON as a readable response error", async () => {
    await expect(
      consumeChat(
        stream([new TextEncoder().encode("data: broken\n\n")]),
        () => undefined,
      ),
    ).rejects.toThrow("The assistant returned an invalid event. Please retry.");
  });

  it("rejects oversized complete frames before delivering them and cancels the source", async () => {
    const input = new TextEncoder().encode(
      `data: ${JSON.stringify({ type: "token", value: "x".repeat(100_001) })}\n\n`,
    );
    const cancel = vi.fn();
    const events = vi.fn();
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(input);
      },
      cancel,
    });
    await expect(consumeChat(source, events)).rejects.toThrow(
      "Assistant event exceeded the supported size.",
    );
    expect(events).not.toHaveBeenCalled();
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("rejects oversized unterminated frames", async () => {
    await expect(
      consumeChat(
        stream([new TextEncoder().encode("data: " + "x".repeat(100_001))]),
        () => undefined,
      ),
    ).rejects.toThrow("Assistant event exceeded the supported size.");
  });

  it("accepts large network chunks containing individually valid frames", async () => {
    const token = { type: "token", value: "x".repeat(1000) };
    const chunk = new TextEncoder().encode(
      `data: ${JSON.stringify(token)}\n\n`.repeat(110) +
        `data: ${JSON.stringify(final)}\n\n`,
    );
    const events: ChatEvent[] = [];
    await consumeChat(stream([chunk]), (event) => events.push(event));
    expect(events).toHaveLength(111);
    expect(events.at(-1)).toEqual(final);
  });
});
