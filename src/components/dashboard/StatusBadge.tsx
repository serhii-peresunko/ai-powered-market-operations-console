import type { Status } from "@/data/types";
export const statusLabels: Record<Status, string> = {
  on_track: "On track",
  at_risk: "At risk",
  off_track: "Off track",
};
const UI = {
  status: (status: Status) => `status-badge ${status}`,
} as const;

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={UI.status(status)}>
      <span aria-hidden="true">{status === "on_track" ? "✓" : "!"}</span>
      {statusLabels[status]}
    </span>
  );
}
