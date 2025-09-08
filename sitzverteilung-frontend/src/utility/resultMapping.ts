import { ref } from 'vue';
import type {CalculationRowResult} from "@/types/calculation/ui/CalculationRowResult.ts";
import {CalculationMethod} from "@/types/calculation/CalculationMethod.ts";

interface ResultData {
    name: string;
    committeeSeats: number;
    committee: number;
    quota: string;
    hN: boolean;
    sls: boolean;
    dH: boolean;
    hareSeats: number;
    harePatt: number;
    sainteSeats: number;
    saintePatt: number;
    dHSeats: number;
    dHPatt: number;
    documentation: string;
}

export function mapCalculationResultToViewKeyValues(calculationResult: CalculationRowResult) {
    const mappedResult = ref<ResultData>();
    const { groupName, amountSeats, proportion, calculationMethodResults } = calculationResult;

    const hareResult = calculationMethodResults[CalculationMethod.HARE_NIEMEYER];
    const sainteResult = calculationMethodResults[CalculationMethod.SAINTE_LAGUE_SCHEPERS];
    const dhResult = calculationMethodResults[CalculationMethod.D_HONDT];

    mappedResult.value = {
        name: groupName,
        committeeSeats: amountSeats,
        committee: proportion,
        quota: createQuotaText(proportion),
        hN: hareResult.isValid,
        sls: sainteResult.isValid,
        dH: dhResult.isValid,
        hareSeats: hareResult.arrangement[0].seatNumber,
        harePatt: hareResult.arrangement[0].quotient,
        sainteSeats: sainteResult.arrangement[0].seatNumber,
        saintePatt: sainteResult.arrangement[0].quotient,
        dHSeats: dhResult.arrangement[0].seatNumber,
        dHPatt: dhResult.arrangement[0].quotient,
        documentation: createDocumentationText(calculationResult)
    };

    return mappedResult;
}

function createDocumentationText(calculationResult: CalculationRowResult): string {
    const { groupName, calculationMethodResults } = calculationResult;

    const groups: string[] = [];
    Object.entries(calculationMethodResults).forEach(([, methodResult]) => {
        if (methodResult.arrangement[0].quotient != null) {
            groups.push(groupName);
        }
    });

    if (groups.length > 1) {
        return `Losentscheid für ${groups.length} Sitze zwischen: ${groups.join(' - ')}`;
    } else if (groups.length === 1) {
        return `Losentscheid für 1 Sitz: ${groups[0]}`;
    }

    return '';
}

function createQuotaText(proportion: number): string {
    const numStr = Math.abs(proportion).toString();
    return `${numStr[0]} oder ${numStr[0] + 1}`;
}