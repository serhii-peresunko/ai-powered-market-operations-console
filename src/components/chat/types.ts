import type { ChatEvent, Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";

export type ChatCompletion = Extract<ChatEvent, { type: "done" }>;

export interface ChatTurn {
  id: string;
  question: string;
  text: string;
  status: "streaming" | "complete" | "stopped" | "error";
  error?: string;
  completion?: ChatCompletion;
}

export interface AssistantContext {
  data: Dataset;
  view: DashboardView;
  onNavigate: (view: DashboardView) => void;
}
