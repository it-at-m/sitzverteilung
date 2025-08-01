import type { CalculationRowSeatOrder } from "@/types/calculation/ui/CalculationRowSeatOrder.ts";

export interface CalculationMethodRowResult {
  isValid: boolean;
  amountAllocatedSeats: number;
  isStale: string; // Maybe split into two separate numeric attributes
  arrangement: CalculationRowSeatOrder[];
}
