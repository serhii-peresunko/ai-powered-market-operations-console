import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { data } from "@/data";
import type { DashboardView } from "@/shared/types";
import { Evidence } from "./Evidence";
import { resolveCitation } from "./citations";

const view: DashboardView = {
  region: "apac",
  market: "jp",
  product: "calyx",
  period: data.meta.latestPeriod,
  mode: "executive",
  mapKpi: "attainment",
  status: "all",
  compare: ["region:eu", "region:apac"],
};

describe("answer evidence", () => {
  it("opens exact source scope and clears incompatible filters", () => {
    const navigate = vi.fn();
    render(
      <Evidence
        data={data}
        view={view}
        onNavigate={navigate}
        completion={{
          type: "done",
          kind: "normal",
          confidence: "high",
          citations: [
            { marketId: "de", productId: "veltrix", period: "2026-03" },
          ],
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole("link", { name: /Germany · Veltrix · Mar 2026/ }),
    );
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "eu",
        market: "de",
        product: "veltrix",
        period: "2026-03",
        status: "all",
        mode: "analyst",
      }),
    );
  });
  it("does not fabricate evidence for abstentions", () => {
    render(
      <Evidence
        data={data}
        view={view}
        onNavigate={vi.fn()}
        completion={{
          type: "done",
          kind: "abstain",
          confidence: "low",
          citations: [],
        }}
      />,
    );
    expect(
      screen.getByText(/Cannot answer from the provided data/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it("rejects unresolved or contradictory citation targets", () => {
    expect(resolveCitation(data, view, { marketId: "missing" })).toBeNull();
    expect(
      resolveCitation(data, view, { marketId: "de", regionId: "apac" }),
    ).toBeNull();
    expect(
      resolveCitation(data, view, { marketId: "de", period: "2030-01" }),
    ).toBeNull();
  });
});

it("preserves browser navigation for modified citation clicks", () => {
  const navigate = vi.fn();
  render(
    <Evidence
      data={data}
      view={view}
      onNavigate={navigate}
      completion={{
        type: "done",
        kind: "normal",
        confidence: "high",
        citations: [
          { marketId: "de", productId: "veltrix", period: "2026-03" },
        ],
      }}
    />,
  );
  const link = screen.getByRole("link", {
    name: /Germany · Veltrix · Mar 2026/,
  });
  for (const modifiers of [
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
  ]) {
    let intercepted = true;
    // Observe React's handling before preventing JSDOM's native navigation.
    document.addEventListener(
      "click",
      (event) => {
        intercepted = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );
    fireEvent.click(link, modifiers);
    expect(intercepted).toBe(false);
  }
  expect(navigate).not.toHaveBeenCalled();
  expect(link).toHaveAttribute("href", expect.stringContaining("market=de"));
});
