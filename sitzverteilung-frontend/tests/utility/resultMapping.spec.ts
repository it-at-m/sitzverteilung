import { describe, expect, test } from "vitest";

import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationSeatOrder } from "../../src/types/calculation/internal/CalculationSeatOrder";
import { MergedSeatOrder } from "../../src/types/calculation/ui/MergedSeatOrder";
import {
  mapCalculationResultToResultData,
  mapSeatOrder,
} from "../../src/utility/resultMapping";
import { getTestCalculationResult } from "../TestData";

describe("mapCalculationResultToResultData", () => {
  test("calculationResult is mapped correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (group1 === undefined) {
      throw new Error("Group1 is undefined");
    } else {
      const expectedGroup = {
        name: "Testgroup 1",
        seatsOrVotes: 12,
        proportion: "1,000",

        "D'Hondt-seats": 2,
        "Hare/Niemeyer-seats": 4,
        "Sainte-Laguë/Schepers-seats": 6,

        "D'Hondt-stale": false,
        "Hare/Niemeyer-stale": true,
        "Sainte-Laguë/Schepers-stale": false,

        "D'Hondt-validation": true,
        "Hare/Niemeyer-validation": false,
        "Sainte-Laguë/Schepers-validation": false,
      };
      expect(group1).toEqual(expectedGroup);
    }
  });

  test("handles invalid input correctly", () => {
    const invalidInput = {
      proportions: {},
      methods: {},
      seats: {},
    };

    const result = mapCalculationResultToResultData(invalidInput);
    expect(result.length).toBe(0);
  });
});

describe("mapToMergedSeatOrders", () => {
  test("seats are merged correctly", () => {
    const given: CalculationSeatOrder = [
      {
        groupName: "Z",
        seatsOrVotes: 2,
        value: 0.999,
      },
      {
        groupName: "A",
        seatsOrVotes: 2,
        value: 0.999,
      },
      {
        groupName: "B",
        seatsOrVotes: 2,
        value: 0.999,
      },
      {
        groupName: "C",
        seatsOrVotes: 3,
        value: 0.998,
      },
    ];

    const seats: CalculationSeatDistribution = {
      A: 10,
      B: 13,
      C: 5,
      Z: 10,
    };

    const result = mapSeatOrder(given, seats, true);

    const expected: MergedSeatOrder[] = [
      {
        seatNumber: "1 - 3",
        ratio: "0,999",
        name: "B\nA\nZ",
        minIndex: 1,
        maxIndex: 3,
      },
      {
        seatNumber: "4",
        ratio: "0,998",
        name: "C",
        minIndex: 4,
        maxIndex: 4,
      },
    ];

    expect(result).toEqual(expected);
  });

  test("seats are merged with comma when isLineBreakNeeded is false", () => {
    const given: CalculationSeatOrder = [
      { groupName: "A", seatsOrVotes: 2, value: 0.999 },
      { groupName: "B", seatsOrVotes: 2, value: 0.999 },
    ];
    const seats = {
      A: 12,
      B: 13,
    };

    const result = mapSeatOrder(given, seats, false);

    expect(result[0]?.name).toBe("B, A");
  });
});
