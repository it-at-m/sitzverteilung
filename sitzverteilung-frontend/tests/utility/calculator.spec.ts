import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import type { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import type { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import type { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import type { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";

import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
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
