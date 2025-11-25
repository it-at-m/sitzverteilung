export type CalculationGroupName = string;

export interface CalculationGroup {
  name: CalculationGroupName;
  seatsOrVotes: number;
  partiesInCommittee: string[];
  partiesInFraction: string[];
}
