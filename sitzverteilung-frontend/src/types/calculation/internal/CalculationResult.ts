import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationProportions } from "@/types/calculation/internal/CalculationProportions.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";

export interface CalculationResult {
  seats: CalculationSeatDistribution;
  proportions: CalculationProportions;
  methods: Partial<Record<CalculationMethod, CalculationMethodResult>>;
}
