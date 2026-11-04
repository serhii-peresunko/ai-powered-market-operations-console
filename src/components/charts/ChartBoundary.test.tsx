import { fireEvent, render, screen } from "@testing-library/react";
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

it("lets the user recover from a transient chart error", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  let failed = true;
  function Chart() {
    if (failed) throw new Error("Temporary failure");
    return <p>Recovered revenue chart</p>;
  }
  try {
    render(
      <ChartBoundary>
        <Chart />
      </ChartBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    failed = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry chart" }));
    expect(screen.getByText("Recovered revenue chart")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  } finally {
    log.mockRestore();
  }
});
