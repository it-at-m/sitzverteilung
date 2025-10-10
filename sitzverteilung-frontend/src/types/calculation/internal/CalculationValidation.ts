import type { CalculationGroupName } from "@/types/calculation/internal/CalculationGroup.ts";

export interface ValidationData {
  overRounding: boolean;
  lostSafeSeat: boolean;
  committeeInvalid: CalculationGroupName[];
}

export type CalculationValidation = Record<
  CalculationGroupName,
  ValidationData
>;
