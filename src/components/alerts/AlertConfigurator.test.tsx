import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { data } from "@/data";
import { alertStorageKey } from "@/lib/alerts";
import AlertConfigurator from "./AlertConfigurator";

afterEach(() => { localStorage.clear(); vi.useRealTimers(); });

it("adds optimistically, rolls back on failure, preserves input, then retries successfully", async () => {
  render(<AlertConfigurator data={data} period="2026-05" />);
  fireEvent.click(screen.getByText("Configure an alert"));
  fireEvent.change(screen.getByLabelText("Alert name"), { target: { value: "Watch Europe" } });
  fireEvent.click(screen.getByLabelText("Simulate save failure"));
  vi.useFakeTimers();
  fireEvent.click(screen.getByRole("button", { name: "Save alert" }));
  expect(screen.getByText("Watch Europe")).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(700));
  expect(screen.queryByText("Watch Europe")).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent("previous rules were restored");
  expect(screen.getByLabelText("Alert name")).toHaveValue("Watch Europe");
  expect(localStorage.getItem(alertStorageKey)).toBeNull();
  fireEvent.click(screen.getByLabelText("Simulate save failure"));
  fireEvent.click(screen.getByRole("button", { name: "Save alert" }));
  await act(() => vi.advanceTimersByTimeAsync(700));
  vi.useRealTimers();
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Alert saved"));
  expect(localStorage.getItem(alertStorageKey)).toContain("Watch Europe");
});
