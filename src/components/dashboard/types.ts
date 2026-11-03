import type { Dataset } from "@/data/types";
import type { DashboardView } from "@/lib/view";

export interface DashboardProps {
  data: Dataset;
  view: DashboardView;
  update: (patch: Partial<DashboardView>) => void;
}
