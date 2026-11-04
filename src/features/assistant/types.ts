import {
  type ChatEvent,
  type Dataset,
  CHAT_EVENT_TYPE,
  type DashboardView,
} from "@/shared/types";

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
