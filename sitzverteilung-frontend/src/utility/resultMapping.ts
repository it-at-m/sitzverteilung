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
  return Object.keys(calculationResult.proportions).map((groupName) => {
    const proportion = calculationResult.proportions[groupName];
    const seatsOrVotes = calculationResult.seats[groupName];

    const resultData: ResultData = {
      name: groupName,
      seatsOrVotes: seatsOrVotes ?? 0,
      proportion: formatToThreeDecimals(proportion ?? 0),
    };

    AVAILABLE_METHODS.forEach((method) => {
      const methodResult = calculationResult.methods[method];
      if (methodResult) {
        setMethodResultDataOfResultData(
          resultData,
          method,
          methodResult,
          groupName
        );
      }
    });

    return resultData;
  });
}

function setMethodResultDataOfResultData(
  resultData: ResultData,
  method: CalculationMethod,
  methodResult: CalculationMethodResult,
  groupName: string
) {
  const { distribution, stale, validation } = methodResult;

  const seatKey: ResultDataKeys =
    `${method}${ResultDataSuffix.seatsSuffix}` as ResultDataKeys;
  const staleKey: ResultDataKeys =
    `${method}${ResultDataSuffix.staleSuffix}` as ResultDataKeys;
  const validationKey: ResultDataKeys =
    `${method}${ResultDataSuffix.validationSuffix}` as ResultDataKeys;

  resultData[seatKey as keyof ResultData] = distribution[groupName] ?? 0;
  resultData[staleKey as keyof ResultData] =
    stale?.groupNames.includes(groupName) ?? false;

  const validationData = validation?.[groupName];
  resultData[validationKey as keyof ResultData] = validationData
    ? !validationData.committeeInvalid.length &&
      !validationData.overRounding &&
      !validationData.lostSafeSeat
    : false;
}

function formatToThreeDecimals(num?: number): number {
  if (!Number.isFinite(num)) return 0;
  return Math.round(((num as number) + Number.EPSILON) * 1000) / 1000;
}
