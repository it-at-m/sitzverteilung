import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
import { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import { exportForTesting } from "../../src/utility/calculator";

interface CalculationTestData {
  given: {
    committeeSize: number;
    groups: CalculationGroup[];
  };
  expected: CalculationMethodResult;
}

const jsonFiles = [
  ...loadJsonFiles(
    join(__dirname, "../data/dHondt"),
    CalculationMethod.D_HONDT
  ),
  ...loadJsonFiles(
    join(__dirname, "../data/hareNiemeyer"),
    CalculationMethod.HARE_NIEMEYER
  ),
] as {
  fileName: string;
  calculationMethod: CalculationMethod;
  data: CalculationTestData;
}[];

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
  return {
    ...result,
    order,
  };
}

function loadJsonFiles(dir: string, calculationMethod: CalculationMethod) {
  const files = readdirSync(dir);
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const filePath = join(dir, file);
      const content = readFileSync(filePath, "utf-8");
      return { fileName: file, data: JSON.parse(content), calculationMethod };
    });
}
