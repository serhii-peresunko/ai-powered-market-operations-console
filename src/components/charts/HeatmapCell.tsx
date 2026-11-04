import type { CSSProperties, KeyboardEvent } from "react";
import type { HeatmapCellData } from "@/lib/heatmap";
import { periodLabel, percent } from "@/lib/format";
import { PERFORMANCE_HEATMAP_TEXT as TEXT } from "./copy";

const UI = { selected: "heatmap-cell selected", cell: "heatmap-cell" } as const;

export function HeatmapCell({
  cell,
  market,
  selected,
  tabIndex,
  position,
  style,
  onFocus,
  onKeyDown,
  onSelect,
}: {
  cell: HeatmapCellData;
  market: string;
  selected: boolean;
  tabIndex: number;
  position: string;
  style: CSSProperties;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onSelect: () => void;
}) {
  const description = {
    value: cell.displayValue,
    market,
    period: periodLabel(cell.period),
    variance: percent(cell.variance, true),
    anomaly: cell.anomaly?.note,
  };
  return (
    <td>
      <button
        style={style}
        data-cell={position}
        className={selected ? UI.selected : UI.cell}
        tabIndex={tabIndex}
        aria-pressed={selected}
        aria-label={TEXT.cellLabel(description)}
        title={TEXT.cellTitle(description)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onClick={onSelect}
      >
        {cell.displayValue}
        {cell.anomaly && <sup>{TEXT.anomalyMarker}</sup>}
      </button>
    </td>
  );
}
