import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { data } from "@/data";
import { readView } from "../view";

import world from "@/data/world-map.json";

import MarketMap from "./MarketMap";

it("has geographic shapes for every tracked country and permits keyboard drill-down", () => {
  for (const market of data.markets)
    expect(world.some((country) => country.id === market.iso3)).toBe(true);
  const update = vi.fn();
  render(
    <MarketMap
      data={data}
      view={readView(new URLSearchParams(), data)}
      update={update}
    />,
  );
  fireEvent.keyDown(screen.getByRole("button", { name: /Germany:/ }), {
    key: "Enter",
  });
  expect(update).toHaveBeenCalledWith({ region: "eu", market: "de" });
  expect(screen.getByText("View map data table")).toBeInTheDocument();
});
