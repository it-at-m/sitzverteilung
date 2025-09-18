import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import type { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import type { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import type { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import type { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";

import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationValidation } from "../../src/types/calculation/internal/CalculationValidation";
import { exportForTesting } from "../../src/utility/calculator";

interface CalculationTestData {
  given: {
    committeeSize: number;
    groups: CalculationGroup[];
  };
  expected: CalculationMethodResult;
}

describe("D'Hondt calculation test", () => {
  test.each(
    loadJsonFiles<CalculationTestData>(
      join(__dirname, "../data/dHondt"),
      CalculationMethod.D_HONDT
    ).map(({ fileName, data }) => [fileName, data])
  )("%s", (fileName, data) => {
    const result = getComparableResult(
      exportForTesting.calculateDHondt(
        data.given.groups,
        data.given.committeeSize
      )
    );

    expect(result).toEqual(data.expected);
  });
});

describe("Hare/Niemeyer calculation tests", () => {
  test.each(
    loadJsonFiles<CalculationTestData>(
      join(__dirname, "../data/hareNiemeyer"),
      CalculationMethod.HARE_NIEMEYER
    ).map(({ fileName, data }) => [fileName, data])
  )("%s", (fileName, data) => {
    const result = getComparableResult(
      exportForTesting.calculateHareNiemeyer(
        data.given.groups,
        data.given.committeeSize
      )
    );

    expect(result).toEqual(data.expected);
  });
});

describe("Sainte Lague calculation tests", () => {
  test.each(
    loadJsonFiles<CalculationTestData>(
      join(__dirname, "../data/sainteLague"),
      CalculationMethod.SAINTE_LAGUE_SCHEPERS
    ).map(({ fileName, data }) => [fileName, data])
  )("%s", (fileName, data) => {
    const result = getComparableResult(
      exportForTesting.calculateSainteLagueSchepers(
        data.given.groups,
        data.given.committeeSize
      )
    );

    expect(result).toEqual(data.expected);
  });
});

describe("Method validity overrounding tests", () => {
  test("Test method validation", () => {
    // given
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        proportion: 3.56,
        seatsOrVotes: 0,
      },
      {
        name: "Test 2",
        proportion: 3.56,
        seatsOrVotes: 0,
      },
    ];
    const distribution: CalculationSeatDistribution = {
      "Test 1": 4,
      "Test 2": 5,
    };
    const expected: CalculationValidation = {
      "Test 1": true,
      "Test 2": false,
    };

    const validation = exportForTesting.calculateMethodValidity(
      calculationGroups,
      distribution
    );

    expect(validation).toEqual(expected);
  });

  test("Test method validation with undefined proportions", () => {
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        proportion: undefined,
        seatsOrVotes: 0,
      },
      {
        name: "Test 2",
        proportion: undefined,
        seatsOrVotes: 0,
      },
    ];
    const distribution: CalculationSeatDistribution = {
      "Test 1": 4,
      "Test 2": 5,
    };
    const expected: CalculationValidation = {};

    const validation = exportForTesting.calculateMethodValidity(
      calculationGroups,
      distribution
    );

    expect(validation).toEqual(expected);
  });
});

function getComparableResult(
  result: CalculationMethodResult
): CalculationMethodResult {
  const order = result.order.map((order: CalculationGroupRatio) => {
    return {
      groupName: order.groupName,
      value: Math.floor(order.value * 1000) / 1000,
    };
  });
  const stale: CalculationStale | undefined = result.stale
    ? { ...result.stale, ratio: Math.floor(result.stale.ratio * 1000) / 1000 }
    : undefined;

  return {
    ...result,
    stale,
    order,
  };
}

function loadJsonFiles<T>(
  dir: string,
  calculationMethod: CalculationMethod
): { fileName: string; calculationMethod?: CalculationMethod; data: T }[] {
  const files = readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return files.map((fileName) => {
    const filePath = join(dir, fileName);
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as T;
    return { fileName, data, calculationMethod };
  });
}
