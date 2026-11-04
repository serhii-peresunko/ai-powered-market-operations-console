import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { data } from "@/data";
import { readView } from "./view";
import { MarketTable } from "./MarketTable";

it("exposes market and product drill paths with dated source metadata", () => {
  const update = vi.fn();
  const { rerender } = render(
    <MarketTable
      data={data}
      view={readView(new URLSearchParams("mode=analyst"), data)}
      update={update}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Germany" }));
  expect(update).toHaveBeenLastCalledWith({
    region: "eu",
    market: "de",
    product: undefined,
  });
  rerender(
    <MarketTable
      data={data}
      view={readView(
        new URLSearchParams("market=de&period=2026-03&mode=analyst"),
        data,
      )}
      update={update}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Veltrix" }));
  expect(update).toHaveBeenLastCalledWith({ product: "veltrix" });
  expect(
    screen.getByText(
      /market share is unavailable for products or historical periods/,
    ),
  ).toBeInTheDocument();
});
