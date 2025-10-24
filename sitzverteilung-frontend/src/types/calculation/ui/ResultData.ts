import type { CalculationGroupName } from "@/types/calculation/CalculationGroup.ts";

export interface ResultData {
  name: CalculationGroupName;
  seatsOrVotes: number;
  proportion: number;
  [key: string]: number | boolean | string;
}
