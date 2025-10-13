import type { CalculationGroupName } from "@/types/calculation/CalculationGroup.ts";
import type { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

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
