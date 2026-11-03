import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ChartBoundary } from "./ChartBoundary";

it("keeps the accessible alternative available when chart rendering fails", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  function Broken(): never {
    throw new Error("Chart failed");
  }
  try {
    render(
      <>
        <ChartBoundary>
          <Broken />
        </ChartBoundary>
        <table>
          <caption>Revenue alternative</caption>
          <tbody>
            <tr>
              <td>42</td>
            </tr>
          </tbody>
        </table>
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use the data table below",
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  } finally {
    log.mockRestore();
  }
});
