import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { CalculationStale } from "@/types/calculation/internal/CalculationStale.ts";

export interface CalculationMethodResult {
  distribution: CalculationSeatDistribution;
  order: CalculationSeatOrder;
  stale?: CalculationStale;
}
