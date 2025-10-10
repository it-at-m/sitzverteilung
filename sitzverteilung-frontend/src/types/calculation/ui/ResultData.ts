export interface ResultData {
  name: string;
  seatsOrVotes: number;
  proportion: number;
  documentation: string;
  [key: string]: number | boolean | string;
}
