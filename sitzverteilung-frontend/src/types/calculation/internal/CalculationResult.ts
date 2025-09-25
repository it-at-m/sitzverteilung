import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationProportions } from "@/types/calculation/internal/CalculationProportions.ts";

export interface CalculationResult {
  proportions: CalculationProportions;
  methods: Partial<Record<CalculationMethod, CalculationMethodResult>>;
}
