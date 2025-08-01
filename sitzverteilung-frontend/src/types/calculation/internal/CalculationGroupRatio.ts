import type { CalculationGroupName } from "@/types/calculation/internal/CalculationGroup.ts";

export interface CalculationGroupRatio {
  groupName: CalculationGroupName;
  value: number;
}
