import type { Group } from "@/types/basedata/Group.ts";

export type CalculationGroupName = string;

export interface CalculationGroup {
  name: CalculationGroupName;
  seatsOrVotes: number;
  partiesInCommittee?: Group[];
}
