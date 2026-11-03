"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { RiArrowUpLine, RiSparklingLine, RiStopFill } from "@remixicon/react";
import { Button } from "@/components/Button";
import { consumeChat } from "@/lib/chat";
import type { ChatEvent } from "@/data/types";

export interface ChatTurn {
  id: string;
  question: string;
  text: string;
  status: "streaming" | "complete" | "stopped" | "error";
  error?: string;
  completion?: Extract<ChatEvent, { type: "done" }>;
}

export function Assistant() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  useEffect(() => () => active.current?.abort(), []);
  useEffect(() => { if (follow.current && list.current) list.current.scrollTop = list.current.scrollHeight; }, [turns]);

  async function ask(value: string) {
    const prompt = value.trim();
    if (!prompt || prompt.length > 1000 || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const id = crypto.randomUUID();
    const update = (patch: Partial<ChatTurn>) => setTurns((previous) => previous.map((turn) => turn.id === id ? { ...turn, ...patch } : turn));
    setTurns((previous) => [...previous, { id, question: prompt, text: "", status: "streaming" }]);
    setQuestion("");
    setBusy(true);
    follow.current = true;
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: prompt }), signal: controller.signal });
      if (!response.ok || !response.body || !response.headers.get("content-type")?.includes("text/event-stream")) throw new Error("Unable to start the response. Please retry.");
      await consumeChat(response.body, (event) => {
        if (controller.signal.aborted) return;
        if (event.type === "token") setTurns((previous) => previous.map((turn) => turn.id === id ? { ...turn, text: turn.text + event.value } : turn));
        if (event.type === "done") update({ status: "complete", completion: event });
      });
    } catch (error) {
      update(controller.signal.aborted ? { status: "stopped" } : { status: "error", error: error instanceof Error ? error.message : "Unable to complete the response." });
    } finally {
      if (active.current === controller) { active.current = null; setBusy(false); }
    }
  }

  function submit(event: FormEvent) { event.preventDefault(); void ask(question); }
  return <aside id="assistant" className="assistant-panel" aria-labelledby="assistant-title">
    <header className="assistant-heading"><span className="assistant-symbol"><RiSparklingLine size={21} aria-hidden="true" /></span><div><h2 id="assistant-title">Market assistant</h2><p>AI-generated interpretation</p></div><span className="demo-badge">DEMO</span></header>
    <div ref={list} className="conversation-scroll" onScroll={() => { const element = list.current; if (element) follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80; }}>
      {turns.length === 0 ? <div className="assistant-empty"><span className="welcome-symbol"><RiSparklingLine size={30} aria-hidden="true" /></span><h3>From numbers<br />to understanding.</h3><p>Ask a question about your portfolio.<br />Follow the evidence behind every answer.</p><div className="suggested-questions">{["Which markets are at risk?", "Why did Germany's revenue dip?", "Compare APAC and Europe"].map((prompt) => <button key={prompt} onClick={() => void ask(prompt)}>{prompt}<span aria-hidden="true">↗</span></button>)}</div></div> : <ol className="conversation" aria-label="Conversation">{turns.map((turn) => <li key={turn.id}><div className="user-message"><span className="message-label">YOU</span><p>{turn.question}</p></div><article className="assistant-message" tabIndex={0} aria-label={`AI answer to ${turn.question}`}><span className="message-label"><RiSparklingLine size={12} aria-hidden="true" />AI INTERPRETATION</span><p className="answer-text">{turn.text || (turn.status === "streaming" ? "Reading the evidence…" : "No answer received.")}</p>{turn.status === "streaming" && <p className="generation-status">Generating…</p>}{turn.status === "stopped" && <p className="notice">Stopped · Partial answer, not verified.</p>}{turn.status === "error" && <p className="notice error-text" role="alert">{turn.error}</p>}{(turn.status === "error" || turn.status === "stopped") && <button className="text-button" disabled={busy} onClick={() => void ask(turn.question)}>Retry question</button>}</article></li>)}</ol>}
    </div>
    <div className="sr-only" role="status">{busy ? "Assistant is generating a response." : turns.length ? "Generation finished. Review the latest answer." : "Assistant ready."}</div>
    <form className="composer-form" onSubmit={submit}><label htmlFor="chat-question" className="sr-only">Ask about your markets</label><textarea id="chat-question" placeholder="Ask about your markets…" maxLength={1000} rows={2} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!busy) void ask(question); } }} aria-describedby="chat-help" /><div className="composer-actions"><span>{busy ? "Working with source data…" : "Enter to send · Shift+Enter for a new line"}</span>{busy ? <Button type="button" variant="secondary" aria-label="Stop generation" onClick={() => active.current?.abort()}><RiStopFill size={16} aria-hidden="true" />Stop</Button> : <Button type="submit" disabled={!question.trim()} aria-label="Send message"><RiArrowUpLine size={17} aria-hidden="true" /></Button>}</div></form>
    <p id="chat-help" className="assistant-footnote">Fixture-based demo · Verify AI claims against source data.</p>
  </aside>;
}
