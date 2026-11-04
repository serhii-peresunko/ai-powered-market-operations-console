import { type ChatEvent, type Dataset, CHAT_EVENT_TYPE } from "@/data/types";
import type { DashboardView } from "@/lib/view";

export type ChatCompletion = Extract<
  ChatEvent,
  { type: typeof CHAT_EVENT_TYPE.DONE }
>;

export const CHAT_TURN_STATUS = {
  STREAMING: "streaming",
  COMPLETE: "complete",
  STOPPED: "stopped",
  ERROR: "error",
} as const;
export type ChatTurnStatus =
  (typeof CHAT_TURN_STATUS)[keyof typeof CHAT_TURN_STATUS];

export interface ChatTurn {
  id: string;
  question: string;
  text: string;
  status: ChatTurnStatus;
  error?: string;
  completion?: ChatCompletion;
}

export interface AssistantContext {
  data: Dataset;
  view: DashboardView;
  onNavigate: (view: DashboardView) => void;
}
