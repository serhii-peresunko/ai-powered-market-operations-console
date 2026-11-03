"use client";
import { useEffect, useRef } from "react";
import type { ChatTurn } from "./types";

export function useChatScroll(turns: ChatTurn[]) {
  const container = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  useEffect(() => {
    if (following.current && container.current)
      container.current.scrollTop = container.current.scrollHeight;
  }, [turns]);

  function onScroll() {
    const element = container.current;
    if (element)
      following.current =
        element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  }
  return {
    container,
    onScroll,
    resume: () => {
      following.current = true;
    },
  };
}
