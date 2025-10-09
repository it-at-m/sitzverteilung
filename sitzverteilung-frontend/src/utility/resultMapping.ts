import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";
import type { ResultDataKeys } from "@/types/calculation/ui/ResultDataKeys.ts";

import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

export function mapCalculationResultToResultData(
  calculationResult: CalculationResult
): ResultData[] {
  const resultDataArray: ResultData[] = [];

  for (const groupName in calculationResult.proportions) {
    const proportion = calculationResult.proportions[groupName];

    const resultData: ResultData = {
      name: groupName,
      seatsOrVotes: 0,
      proportion: proportion ?? 0,
      documentation: "",
      "D'Hondt-seats": 0,
      "D'Hondt-stale": 0,
      "Hare/Niemeyer-seats": 0,
      "Hare/Niemeyer-stale": 0,
      "Sainte-Laguë/Schepers-seats": 0,
      "Sainte-Laguë/Schepers-stale": 0,
      "D'Hondt-validation": 0,
      "Hare/Niemeyer-validation": 0,
      "Sainte-Laguë/Schepers-validation": 0,
      staleResults: {
        [CalculationMethod.D_HONDT]: {
          groupNames: [],
          amountSeats: 0,
          ratio: 0,
        },
        [CalculationMethod.HARE_NIEMEYER]: {
          groupNames: [],
          amountSeats: 0,
          ratio: 0,
        },
        [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
          groupNames: [],
          amountSeats: 0,
          ratio: 0,
        },
      },
    };

    for (const method of Object.keys(
      calculationResult.methods
    ) as CalculationMethod[]) {
      const methodResult = calculationResult.methods[method];
      if (methodResult) {
        mapMethodResultToResultData(
          resultData,
          method,
          methodResult,
          groupName
        );
      }
    }

    resultDataArray.push(resultData);
  }
  return resultDataArray;
}

const METHOD_PREFIX_MAP: Record<CalculationMethod, string> = {
  [CalculationMethod.D_HONDT]: "D'Hondt",
  [CalculationMethod.HARE_NIEMEYER]: "Hare/Niemeyer",
  [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: "Sainte-Laguë/Schepers",
};

function mapMethodResultToResultData(
  resultData: ResultData,
  method: CalculationMethod,
  methodResult: CalculationMethodResult,
  groupName: string
) {
  const distribution = methodResult.distribution;
  const stale = methodResult.stale;
  const validation = methodResult.validation;
  const methodPrefix = METHOD_PREFIX_MAP[method];

  const seatKey = `${methodPrefix}-seats` as ResultDataKeys;
  const staleKey = `${methodPrefix}-stale` as ResultDataKeys;
  const validationKey = `${methodPrefix}-validation` as ResultDataKeys;

  resultData[seatKey] = distribution[groupName] || 0;
  resultData[staleKey] = stale?.groupNames.includes(groupName) ? 1 : 0;

  if (validation && validation[groupName]) {
    const validationData = validation[groupName];
    resultData[validationKey] =
      !validationData.overRounding && !validationData.lostSafeSeat ? 1 : 0;
  }

  resultData.staleResults[method] = stale ?? {
    groupNames: [],
    amountSeats: 0,
    ratio: 0,
  };
}
