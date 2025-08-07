import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import type { CalculationMethodRowResult } from "@/types/calculation/ui/CalculationMethodRowResult.ts";

export interface CalculationRowResult {
  groupName: string;
  amountSeats: number;
  proportion: number;
  calculationMethodResults: Record<
    CalculationMethod,
    CalculationMethodRowResult
  >;
}
