import { describe, expect, test } from "vitest";

import { mapCalculationResultToResultData } from "../../src/utility/resultMapping";
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
        proportion: expect.any(Number),

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
