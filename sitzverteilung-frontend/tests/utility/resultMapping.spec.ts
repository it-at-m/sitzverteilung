import { describe, expect, test } from "vitest";

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
    expect(firstGroup.seatsOrVotes).toBeGreaterThan(0);
    expect(firstGroup.proportion).toBeGreaterThan(0);
    expect(firstGroup.documentation).toBe("");
  });

  test("seats are mapped correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (!group1) {
      throw new Error("Testgroup 1 not found");
    }

    expect(group1["D'Hondt-seats"]).toBe(2);
    expect(group1["Hare/Niemeyer-seats"]).toBe(4);
    expect(group1["Sainte-Laguë/Schepers-seats"]).toBe(6);
  });

  test("validation is set correctly", () => {
    const result = mapCalculationResultToResultData(getTestCalculationResult());
    const group1 = result.find((r) => r.name === "Testgroup 1");

    if (!group1) {
      throw new Error("Testgroup 1 not found");
    }

    expect(group1["D'Hondt-validation"]).toBe(1);
    expect(group1["Hare/Niemeyer-validation"]).toBe(1);
    expect(group1["Sainte-Laguë/Schepers-validation"]).toBe(0);
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
