import type { CalculationGroupName } from "@/types/calculation/internal/CalculationGroup.ts";

export interface CalculationStale {
  groupNames: CalculationGroupName[];
  amountSeats: number;
}
