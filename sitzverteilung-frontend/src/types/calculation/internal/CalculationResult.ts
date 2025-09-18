import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";
import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";

export interface CalculationResult {
  methods: Partial<Record<CalculationMethod, CalculationMethodResult>>;
}
