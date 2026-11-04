import { type Status, MARKET_STATUS } from "@/data/types";
export const statusLabels: Record<Status, string> = {
  [MARKET_STATUS.ON_TRACK]: "On track",
  [MARKET_STATUS.AT_RISK]: "At risk",
  [MARKET_STATUS.OFF_TRACK]: "Off track",
};
const UI = {
  status: (status: Status) => `status-badge ${status}`,
} as const;

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={UI.status(status)}>
      <span aria-hidden="true">
        {status === MARKET_STATUS.ON_TRACK ? "✓" : "!"}
      </span>
      {statusLabels[status]}
    </span>
  );
}
