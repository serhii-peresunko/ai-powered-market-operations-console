import { type Dataset, type DashboardView } from "@/shared/types";

export interface DashboardProps {
  data: Dataset;
  view: DashboardView;
  update: (patch: Partial<DashboardView>) => void;
}
