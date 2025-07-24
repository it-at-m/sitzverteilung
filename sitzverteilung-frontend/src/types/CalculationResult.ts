export type CalculationResult = CalculationResultRow[];

export interface CalculationResultRow {
    groupName: string;
    amountSeats: number;
    proportion: number;
    calculationMethodResults: {
        hareNiemeyer: CalculationMethodResult;
        sainteLague: CalculationMethodResult;
        dHondt: CalculationMethodResult;
    };
}

export interface CalculationMethodResult {
    isValid: boolean;
    amountAllocatedSeats: number;
    isStale: string; // Maybe split into two separate numeric attributes
    arrangement: SeatPosition[]
}

export interface SeatPosition {
    seatNumber: number;
    quotient: number;
}