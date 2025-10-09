import {CalculationMethod} from "@/types/calculation/CalculationMethod.ts";
import type {CalculationStale} from "@/types/calculation/internal/CalculationStale.ts";

export interface ResultData {
    name: string;
    seatsOrVotes: number;
    proportion: number;
    documentation: string;
    "D'Hondt-seats": number;
    "D'Hondt-stale": number;
    "Hare/Niemeyer-seats": number;
    "Hare/Niemeyer-stale": number;
    "Sainte-Laguë/Schepers-seats": number;
    "Sainte-Laguë/Schepers-stale": number;
    "D'Hondt-validation": number;
    "Hare/Niemeyer-validation": number;
    "Sainte-Laguë/Schepers-validation": number;
    staleResults: Record<CalculationMethod, CalculationStale>;
}
