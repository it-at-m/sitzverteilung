import type { CalculationMethodRowResult } from "@/types/calculation/ui/CalculationMethodRowResult.ts";

export interface CalculationRowResult {
  groupName: string;
  amountSeats: number;
  proportion: number;
  calculationMethodResults: {
    hareNiemeyer: CalculationMethodRowResult;
    sainteLague: CalculationMethodRowResult;
    dHondt: CalculationMethodRowResult;
  };
}
