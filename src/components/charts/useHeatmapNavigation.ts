import { useRef, useState, type KeyboardEvent } from "react";

export function useHeatmapNavigation(
  rowCount: number,
  columnCount: number,
  initialColumn: number,
) {
  const table = useRef<HTMLTableElement>(null);
  const [focused, setFocused] = useState({ row: 0, col: initialColumn });
  const focusRow = Math.min(focused.row, rowCount - 1);

  function move(
    event: KeyboardEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) {
    let nextRow = row;
    let nextCol = col;
    switch (event.key) {
      case "ArrowUp":
        nextRow--;
        break;
      case "ArrowDown":
        nextRow++;
        break;
      case "ArrowLeft":
        nextCol--;
        break;
      case "ArrowRight":
        nextCol++;
        break;
      case "Home":
        nextCol = 0;
        break;
      case "End":
        nextCol = columnCount - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    nextRow = Math.max(0, Math.min(rowCount - 1, nextRow));
    nextCol = Math.max(0, Math.min(columnCount - 1, nextCol));
    setFocused({ row: nextRow, col: nextCol });
    table.current
      ?.querySelector<HTMLButtonElement>(`[data-cell="${nextRow}-${nextCol}"]`)
      ?.focus();
  }
  return {
    table,
    focused: { row: focusRow, col: focused.col },
    setFocused,
    move,
  };
}
