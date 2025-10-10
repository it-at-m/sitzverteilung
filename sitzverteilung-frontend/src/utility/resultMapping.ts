import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";

import {
  AVAILABLE_METHODS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";
import { ResultDataSuffix } from "@/types/calculation/ui/ResultDataSuffix.ts";

type Method = (typeof AVAILABLE_METHODS)[number];
type ResultDataKeys = `${Method}${ResultDataSuffix}`;

export function mapCalculationResultToResultData(
  calculationResult: CalculationResult
): ResultData[] {
  const resultDataArray: ResultData[] = [];

  for (const groupName in calculationResult.proportions) {
    const proportion = calculationResult.proportions[groupName];
    const seatsOrVotes = calculationResult.seats[groupName];

    const resultData: ResultData = {
      name: groupName,
      seatsOrVotes: seatsOrVotes ?? 0,
      proportion: proportion ?? 0,
      documentation: "",
    };

    for (const method of AVAILABLE_METHODS) {
      const prefix = method;
      resultData[`${prefix}` + ResultDataSuffix.seatsSuffix] = 0;
      resultData[`${prefix}` + ResultDataSuffix.staleSuffix] = false;
      resultData[`${prefix}` + ResultDataSuffix.validationSuffix] = 0;
    }

    AVAILABLE_METHODS.forEach((method) => {
      const methodResult = calculationResult.methods[method];
      if (methodResult) {
        mapMethodResultToResultData(
          resultData,
          method,
          methodResult,
          groupName
        );
      }
    });

    resultDataArray.push(resultData);
  }
  return resultDataArray;
}

function mapMethodResultToResultData(
  resultData: ResultData,
  method: CalculationMethod,
  methodResult: CalculationMethodResult,
  groupName: string
) {
  const { distribution, stale, validation } = methodResult;

  const seatKey = (`${method}` +
    ResultDataSuffix.seatsSuffix) as ResultDataKeys;
  const staleKey = (`${method}` +
    ResultDataSuffix.staleSuffix) as ResultDataKeys;
  const validationKey = (`${method}` +
    ResultDataSuffix.validationSuffix) as ResultDataKeys;

  resultData[seatKey] = distribution[groupName] || 0;
  resultData[staleKey] = stale?.groupNames.includes(groupName) ?? false;

  if (validation && validation[groupName]) {
    const validationData = validation[groupName];
    resultData[validationKey] =
      validationData.committeeInvalid.length == 0 &&
      !validationData.overRounding &&
      !validationData.lostSafeSeat
        ? 1
        : 0;
  }
}
