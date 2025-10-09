import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";

import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

export function mapCalculationResultToResultData(
  calculationResult: CalculationResult
): ResultData[] {
  const resultDataArray: ResultData[] = [];

  for (const groupName in calculationResult.proportions) {
    const seatsOrVotes = calculationResult.proportions[groupName];

    const resultData: ResultData = {
      name: groupName,
      seatsOrVotes: seatsOrVotes,
      proportion: seatsOrVotes,
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
        const distribution = methodResult.distribution;
        const stale = methodResult.stale;
        const validation = methodResult.validation;

        if (method === CalculationMethod.D_HONDT) {
          resultData["D'Hondt-seats"] = distribution[groupName] || 0;
          resultData["D'Hondt-stale"] = stale ? 1 : 0;
          if (validation && validation[groupName]) {
            const validationData = validation[groupName];
            resultData["D'Hondt-validation"] =
              !validationData.overRounding && !validationData.lostSafeSeat
                ? 1
                : 0;
          }
          resultData.staleResults[CalculationMethod.D_HONDT] = {
            groupNames: stale ? stale.groupNames : [],
            amountSeats: stale ? stale.amountSeats : 0,
            ratio: stale ? stale.ratio : 0,
          };
        } else if (method === CalculationMethod.HARE_NIEMEYER) {
          resultData["Hare/Niemeyer-seats"] = distribution[groupName] || 0;
          resultData["Hare/Niemeyer-stale"] = stale ? 1 : 0;
          if (validation && validation[groupName]) {
            const validationData = validation[groupName];
            resultData["Hare/Niemeyer-validation"] =
              !validationData.overRounding && !validationData.lostSafeSeat
                ? 1
                : 0;
          }
          resultData.staleResults[CalculationMethod.HARE_NIEMEYER] = {
            groupNames: stale ? stale.groupNames : [],
            amountSeats: stale ? stale.amountSeats : 0,
            ratio: stale ? stale.ratio : 0,
          };
        } else if (method === CalculationMethod.SAINTE_LAGUE_SCHEPERS) {
          resultData["Sainte-Laguë/Schepers-seats"] =
            distribution[groupName] || 0;
          resultData["Sainte-Laguë/Schepers-stale"] = stale ? 1 : 0;
          if (validation && validation[groupName]) {
            const validationData = validation[groupName];
            resultData["Sainte-Laguë/Schepers-validation"] =
              !validationData.overRounding && !validationData.lostSafeSeat
                ? 1
                : 0;
          }
          resultData.staleResults[CalculationMethod.SAINTE_LAGUE_SCHEPERS] = {
            groupNames: stale ? stale.groupNames : [],
            amountSeats: stale ? stale.amountSeats : 0,
            ratio: stale ? stale.ratio : 0,
          };
        }
      }
    }

    resultDataArray.push(resultData);
  }
  return resultDataArray;
}
