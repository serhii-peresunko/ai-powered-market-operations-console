import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { data } from "@/data";
import { readView } from "@/lib/view";
import { Evidence } from "./Evidence";
import { resolveCitation } from "@/lib/citations";

const view = readView(new URLSearchParams("market=jp&product=calyx"), data);

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
