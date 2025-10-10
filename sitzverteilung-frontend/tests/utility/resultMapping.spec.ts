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
      expect(group1.name).toBeDefined();
      expect(group1.seatsOrVotes).toBe(12);
      expect(group1.proportion).toBeGreaterThan(0);
      expect(group1.documentation).toBe("");

      expect(group1["D'Hondt-seats"]).toBe(2);
      expect(group1["Hare/Niemeyer-seats"]).toBe(4);
      expect(group1["Sainte-Laguë/Schepers-seats"]).toBe(6);

      expect(group1["D'Hondt-stale"]).toBe(false);
      expect(group1["Hare/Niemeyer-stale"]).toBe(true);
      expect(group1["Sainte-Laguë/Schepers-stale"]).toBe(false);

      expect(group1["D'Hondt-validation"]).toBe(1);
      expect(group1["Hare/Niemeyer-validation"]).toBe(1);
      expect(group1["Sainte-Laguë/Schepers-validation"]).toBe(0);
    }
  });

  test("handles invalid input correctly", () => {
    const invalidInput = {
      proportions: {},
      methods: {},
    };

    const result = mapCalculationResultToResultData(invalidInput);
    expect(result.length).toBe(0);
  });
});
