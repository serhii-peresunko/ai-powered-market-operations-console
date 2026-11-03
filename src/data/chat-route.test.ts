// @vitest-environment node
import { describe, expect, it } from "vitest";
import { POST } from "./chat-route";
import { pickFixture } from "./fixtures";

describe("mock chat route", () => {
  it("validates input without starting a stream", async () => {
    for (const body of ["broken", "{}", '{"question":"  "}', JSON.stringify({ question: "x".repeat(1001) })]) {
      expect((await POST(new Request("http://localhost/api/chat", { method: "POST", body }))).status).toBe(400);
    }
  });
  it("streams an error event for the error fixture", async () => {
    const response = await POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ question: "force error" }) }));
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(await response.text()).toContain('"type":"error"');
  });
  it("streams a token and permits cancellation", async () => {
    const response = await POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ question: "germany" }) }));
    const reader = response.body!.getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toContain('"type":"token"');
    await reader.cancel();
  });
  it("preserves fixture order and the fallback", () => {
    expect(pickFixture("Which markets are at risk in Germany?").id).toBe("at-risk");
    expect(pickFixture("an unsupported topic").kind).toBe("low_confidence");
    expect(pickFixture("next year").kind).toBe("abstain");
  });
});
