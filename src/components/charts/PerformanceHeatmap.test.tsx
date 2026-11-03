import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { data } from "@/data";
import { readView } from "@/lib/view";
import PerformanceHeatmap from "./PerformanceHeatmap";

it("supports arrow-key exploration and selects the exact market and period", () => {
  const update = vi.fn();
  render(
    <PerformanceHeatmap
      data={data}
      view={readView(new URLSearchParams("region=eu&period=2026-03"), data)}
      update={update}
    />,
  );
  const cell = screen.getByRole("button", { name: /Germany, Mar 2026:/ });
  cell.focus();
  fireEvent.keyDown(cell, { key: "ArrowRight" });
  expect(
    screen.getByRole("button", { name: /Germany, Apr 2026:/ }),
  ).toHaveFocus();
  fireEvent.click(cell);
  expect(update).toHaveBeenCalledWith({
    region: "eu",
    market: "de",
    period: "2026-03",
  });
});
