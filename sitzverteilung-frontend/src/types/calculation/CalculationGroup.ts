export type CalculationGroupName = string;

export interface CalculationGroup {
  name: CalculationGroupName;
  seatsOrVotes: number;
  partiesInUnion: string[];
}
