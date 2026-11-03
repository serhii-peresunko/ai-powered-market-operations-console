import type { Status } from "@/data/types";
export const statusLabels: Record<Status, string> = { on_track: "On track", at_risk: "At risk", off_track: "Off track" };
export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge ${status}`}><span aria-hidden="true">{status === "on_track" ? "✓" : "!"}</span>{statusLabels[status]}</span>;
}
