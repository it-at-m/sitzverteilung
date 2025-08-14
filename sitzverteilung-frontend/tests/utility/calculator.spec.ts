import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
import { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import { exportForTesting } from "../../src/utility/calculator";
import { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";

interface CalculationTestData {
  given: {
    committeeSize: number;
    groups: CalculationGroup[];
  };
  expected: CalculationMethodResult;
}

const jsonFiles = [
  ...loadJsonFiles<CalculationTestData>(
    join(__dirname, "../data/dHondt"),
    CalculationMethod.D_HONDT
  ),
  ...loadJsonFiles<CalculationTestData>(
    join(__dirname, "../data/hareNiemeyer"),
    CalculationMethod.HARE_NIEMEYER
  ),
  ...loadJsonFiles<CalculationTestData>(
    join(__dirname, "../data/sainteLague"),
    CalculationMethod.SAINTE_LAGUE_SCHEPERS
  ),
];

describe("Calculation tests", () => {
  test.each(
    jsonFiles.map(({ fileName, data, calculationMethod }) => [
      calculationMethod,
      fileName,
      data,
    ])
  )("%s calculation test: %s", (calculationMethod, fileName, data) => {
    const result = getComparableResult(
      exportForTesting.calculateMethod(
        calculationMethod,
        data.given.groups,
        data.given.committeeSize
      )
    );

    expect(result).toEqual(data.expected);
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
  let stale: CalculationStale = undefined;
  if(result.stale) {
    stale = {
      ...result.stale,
      ratio: Math.floor(result.stale.ratio * 1000) / 1000,
    }
  }

  return {
    ...result,
    stale,
    order,
  };
}

function loadJsonFiles<T>(
  dir: string,
  calculationMethod: CalculationMethod
): { fileName: string; calculationMethod: CalculationMethod; data: T }[] {
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
