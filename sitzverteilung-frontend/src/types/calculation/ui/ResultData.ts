import type { CalculationGroupName } from "@/types/calculation/CalculationGroup.ts";
import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

/**
 * Per-method fields:
 * - `${method}-seats`: assigned seats (number)
 * - `${method}-stale`: whether any stale occurred (boolean)
 * - `${method}-validation`: true if the result is valid (no issues), false otherwise
 */
type CalculationKeys = {
  [method in CalculationMethod as `${method}-seats`]?: number;
} & {
  [method in CalculationMethod as
    | `${method}-stale`
    | `${method}-validation`]?: boolean;
};

interface StaticKeys {
  name: CalculationGroupName;
  seatsOrVotes: number;
  proportion: number;
  documentation: string;
}

export type ResultData = StaticKeys & CalculationKeys;
