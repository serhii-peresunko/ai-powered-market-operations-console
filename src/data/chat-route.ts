import { MAX_QUESTION_LENGTH } from "@/lib/chat";
// Fixture-backed SSE endpoint. No LLM or external service is called.
import { pickFixture } from "./fixtures";
import type { ChatEvent } from "./types";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Send a JSON question." }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("question" in body) ||
    typeof body.question !== "string" ||
    !body.question.trim() ||
    body.question.length > MAX_QUESTION_LENGTH
  ) {
    return Response.json(
      { error: `Question must contain 1–${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 },
    );
  }
  const fixture = pickFixture(body.question.trim());
  const encoder = new TextEncoder();
  const encode = (event: ChatEvent) =>
    encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
  const tokens = fixture.answer.text.match(/\S+\s*/g) ?? [];
  let index = 0;
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (cancelled) return;
      if (req.signal.aborted) {
        controller.close();
        return;
      }
      if (fixture.kind === "error") {
        controller.enqueue(
          encode({
            type: "error",
            message: fixture.error ?? "Something went wrong.",
          }),
        );
        controller.close();
        return;
      }
      if (index < tokens.length) {
        await new Promise((resolve) => setTimeout(resolve, 35));
        if (cancelled) return;
        if (req.signal.aborted) {
          controller.close();
          return;
        }
        controller.enqueue(encode({ type: "token", value: tokens[index++] }));
      } else {
        controller.enqueue(
          encode({
            type: "done",
            kind: fixture.kind,
            citations: fixture.answer.citations,
            confidence: fixture.answer.confidence,
          }),
        );
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
