import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type {
  MergedSeatOrder,
  SeatOrder,
} from "@/types/calculation/ui/MergedSeatOrder.ts";
import type { ResultData } from "@/types/calculation/ui/ResultData.ts";

import { UNION_TYPE_PREFIXES } from "@/types/basedata/Union.ts";
import {
  AVAILABLE_METHODS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";
import { ResultDataSuffix } from "@/types/calculation/ui/ResultDataSuffix.ts";
import {
  formatVisiblePrecision,
  roundToExactDecimals,
} from "@/utility/numberFormatter.ts";

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
      proportion: roundToExactDecimals(proportion ?? 0, 3),
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

/**
 * Merges seat orders by combining seats with same ratio into a single element and returning a combined index and name
 * NOTE: seatOrders must be pre sorted by seatNumber!
 *
 * @param seatOrders seatOrders to merge
 * @param isLineBreakNeeded determine whether ot not the seatOrders os seperated by a line break or comma
 */
export function mapToMergedSeatOrders(
  seatOrders: SeatOrder[],
  isLineBreakNeeded: boolean
): MergedSeatOrder[] {
  return Object.values(
    seatOrders.reduce<Record<string, MergedSeatOrder>>((acc, currentOrder) => {
      const key = currentOrder.ratio;
      if (!key) {
        return acc;
      }

      if (!acc[key]) {
        acc[key] = {
          ratio: key,
          seatNumber: `${currentOrder.seatNumber}`,
          name: currentOrder.name,
          minIndex: currentOrder.seatNumber,
          maxIndex: currentOrder.seatNumber,
        };
      } else {
        acc[key].seatNumber =
          `${acc[key].minIndex} - ${currentOrder.seatNumber}`;
        acc[key].maxIndex = currentOrder.seatNumber;
        acc[key].name += isLineBreakNeeded
          ? `\n${currentOrder.name}`
          : `, ${currentOrder.name}`;
      }

      return acc;
    }, {})
  );
}

/**
 * Method that strips away any union prefixes if existent.
 * @param value to strip
 */
export function stripUnionPrefix(value: string): string {
  const prefixes = Object.values(UNION_TYPE_PREFIXES);

  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) {
      return value.slice(prefix.length);
    }
  }

  return value;
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

export function mapSeatOrder(
  seatOrder: CalculationSeatOrder | undefined,
  isLineBreakNeeded: boolean
) {
  if (!seatOrder) {
    return [];
  }
  const formattedRatios = formatVisiblePrecision(
    seatOrder.map((order) => order.value)
  );
  const formattedSeatOrders = seatOrder.map((order, index) => {
    return {
      seatNumber: index + 1,
      name: order.groupName,
      ratio: formattedRatios[index],
    } as SeatOrder;
  });
  return mapToMergedSeatOrders(formattedSeatOrders, isLineBreakNeeded);
}
