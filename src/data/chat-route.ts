import { MAX_QUESTION_LENGTH } from "@/lib/chat";
// Fixture-backed SSE endpoint. No LLM or external service is called.
import { pickFixture } from "./fixtures";
import { type ChatEvent, ANSWER_KIND, CHAT_EVENT_TYPE } from "./types";

const TOKEN_DELAY_MS = 35;
const TEXT = {
  invalidJson: "Send a JSON question.",
  invalidQuestion: `Question must contain 1–${MAX_QUESTION_LENGTH} characters.`,
  failed: "Something went wrong.",
} as const;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: TEXT.invalidJson }, { status: 400 });
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("question" in body) ||
    typeof body.question !== "string" ||
    !body.question.trim() ||
    body.question.length > MAX_QUESTION_LENGTH
  ) {
    return Response.json({ error: TEXT.invalidQuestion }, { status: 400 });
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
      if (fixture.kind === ANSWER_KIND.ERROR) {
        controller.enqueue(
          encode({
            type: CHAT_EVENT_TYPE.ERROR,
            message: fixture.error ?? TEXT.failed,
          }),
        );
        controller.close();
        return;
      }
      if (index < tokens.length) {
        await new Promise((resolve) => setTimeout(resolve, TOKEN_DELAY_MS));
        if (cancelled) return;
        if (req.signal.aborted) {
          controller.close();
          return;
        }
        controller.enqueue(
          encode({ type: CHAT_EVENT_TYPE.TOKEN, value: tokens[index++] }),
        );
      } else {
        controller.enqueue(
          encode({
            type: CHAT_EVENT_TYPE.DONE,
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
