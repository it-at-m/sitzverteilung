import { describe, expect, test } from "vitest";

import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
import { mapCalculationResultToResultData } from "../../src/utility/resultMapping";
import { getTestCalculationResult } from "../TestData";

describe("mapCalculationResultToResultData", () => {
  test("is mapped correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());

    expect(result.length).toBe(
      Object.keys(getTestCalculationResult().proportions).length
    );
  });

  test("base fields are set correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const firstGroup = result[0];

    expect(firstGroup.name).toBeDefined();
    expect(firstGroup.seatsOrVotes).toBe(0);
    expect(firstGroup.proportion).toBeGreaterThan(0);
    expect(firstGroup.documentation).toBe("");
  });

  test("seats are mapped correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (group1 === undefined) {
      throw new Error("Group1 is undefined");
    } else {
      expect(group1["D'Hondt-seats"]).toBe(2);
      expect(group1["Hare/Niemeyer-seats"]).toBe(4);
      expect(group1["Sainte-Laguë/Schepers-seats"]).toBe(6);
    }
  });

  test("validation is set correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (group1 === undefined) {
      throw new Error("Group1 is undefined");
    } else {
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

  test("stale flags are mapped correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (group1 === undefined) {
      throw new Error("Group1 is undefined");
    } else {
      expect(group1["D'Hondt-stale"]).toBe(0);
      expect(group1["Hare/Niemeyer-stale"]).toBe(0);
      expect(group1["Sainte-Laguë/Schepers-stale"]).toBe(0);
    }
  });

  test("staleResults structure is populated", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (group1 === undefined) {
      throw new Error("Group1 is undefined");
    } else {
      expect(group1.staleResults).toBeDefined();
      expect(group1.staleResults[CalculationMethod.D_HONDT]).toEqual({
        groupNames: [],
        amountSeats: 0,
        ratio: 0,
      });
    }
  });
});
