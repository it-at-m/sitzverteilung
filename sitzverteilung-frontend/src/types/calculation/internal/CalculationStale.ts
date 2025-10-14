import type { CalculationGroupName } from "@/types/calculation/CalculationGroup.ts";

export interface CalculationStale {
  groupNames: CalculationGroupName[];
  amountSeats: number;
  ratio: number;
}
