import { type Status, MARKET_STATUS } from "@/data/types";
import { STATUS_LABELS } from "./copy";

const TEXT = { onTrackIcon: "✓", flaggedIcon: "!" } as const;

const UI = {
  status: (status: Status) => `status-badge ${status}`,
} as const;

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={UI.status(status)}>
      <span aria-hidden="true">
        {status === MARKET_STATUS.ON_TRACK
          ? TEXT.onTrackIcon
          : TEXT.flaggedIcon}
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}
