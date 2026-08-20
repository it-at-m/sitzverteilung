import type { CalculationGroupName } from "@/types/calculation/CalculationGroup.ts";

export interface ValidationData {
  overRounding: boolean;
  lostSafeSeat: boolean;
  committeeInvalid: CalculationGroupName[];
  overRoundingWithoutCommittees: Record<string, boolean>;
}

export type CalculationValidation = Record<
  CalculationGroupName,
  ValidationData
>;
