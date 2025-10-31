export interface MergedSeatOrder {
  seatNumber: string;
  name: string;
  ratio: string;
  minIndex: number;
  maxIndex: number;
}

export interface SeatOrder {
  seatNumber: number;
  name: string;
  ratio: string | undefined;
}
