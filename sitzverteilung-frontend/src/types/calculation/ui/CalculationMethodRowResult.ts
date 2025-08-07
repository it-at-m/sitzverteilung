import type { CalculationRowSeatOrder } from "@/types/calculation/ui/CalculationRowSeatOrder.ts";

export interface CalculationMethodRowResult {
  isValid: boolean;
  amountAllocatedSeats: number;
  isStale: string;
  arrangement: CalculationRowSeatOrder[];
}
