import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { data } from "@/data";
import { readView } from "@/lib/view";
import { useDashboardView } from "./useDashboardView";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
afterEach(() => window.history.replaceState(null, "", "/"));

it("preserves consecutive filter updates before React renders again", () => {
  window.history.replaceState(null, "", "/?mode=analyst");
  const { result } = renderHook(() => useDashboardView(data));
  act(() => {
    result.current.update({ market: "de" });
    result.current.update({ period: "2026-03" });
    result.current.update({ product: "veltrix" });
  });
  expect(
    readView(new URLSearchParams(window.location.search), data),
  ).toMatchObject({
    region: "eu",
    market: "de",
    product: "veltrix",
    period: "2026-03",
    mode: "analyst",
  });
});
