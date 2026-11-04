"use client";
import { useSearchParams } from "next/navigation";
import { type Dataset, type DashboardView } from "@/shared/types";
import { readView } from "./view";
import { viewParams } from "@/shared/lib/view";

export function useDashboardView(data: Dataset) {
  const params = useSearchParams();
  const view = readView(params, data);
  function update(patch: Partial<DashboardView>) {
    // Consecutive controls can fire before React renders the previous update.
    const current = readView(new URLSearchParams(window.location.search), data);
    const next = readView(viewParams({ ...current, ...patch }), data);
    window.history.pushState(null, "", `?${viewParams(next)}`);
  }
  return { view, update };
}
