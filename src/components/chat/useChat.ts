"use client";
import { useEffect, useRef, useState } from "react";
import { MAX_QUESTION_LENGTH, streamChat } from "@/lib/chat";
import { type ChatTurn, CHAT_TURN_STATUS } from "./types";
import { CHAT_EVENT_TYPE } from "@/data/types";

export function useChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  function patchTurn(id: string, patch: (turn: ChatTurn) => Partial<ChatTurn>) {
    setTurns((previous) =>
      previous.map((turn) =>
        turn.id === id ? { ...turn, ...patch(turn) } : turn,
      ),
    );
  }

  async function ask(value: string) {
    const question = value.trim();
    if (!question || question.length > MAX_QUESTION_LENGTH || active.current)
      return;
    const controller = new AbortController();
    const id = crypto.randomUUID();
    active.current = controller;
    setBusy(true);
    setTurns((previous) => [
      ...previous,
      { id, question, text: "", status: CHAT_TURN_STATUS.STREAMING },
    ]);
    try {
      await streamChat(question, controller.signal, (event) => {
        if (controller.signal.aborted) return;
        if (event.type === CHAT_EVENT_TYPE.TOKEN)
          patchTurn(id, (turn) => ({ text: turn.text + event.value }));
        if (event.type === CHAT_EVENT_TYPE.DONE)
          patchTurn(id, () => ({
            status: CHAT_TURN_STATUS.COMPLETE,
            completion: event,
          }));
      });
      if (controller.signal.aborted)
        patchTurn(id, () => ({
          status: CHAT_TURN_STATUS.STOPPED,
          completion: undefined,
        }));
    } catch (error) {
      patchTurn(id, () =>
        controller.signal.aborted
          ? { status: CHAT_TURN_STATUS.STOPPED, completion: undefined }
          : {
              status: CHAT_TURN_STATUS.ERROR,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to complete the response.",
            },
      );
    } finally {
      if (active.current === controller) {
        active.current = null;
        setBusy(false);
      }
    }
  }

  return { turns, busy, ask, stop: () => active.current?.abort() };
}
