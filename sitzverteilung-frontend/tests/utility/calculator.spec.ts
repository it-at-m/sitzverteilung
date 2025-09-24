import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import type { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import type { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import type { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import type { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";

import { BaseData } from "../../src/types/basedata/BaseData";
import { UnionType } from "../../src/types/basedata/Union";
import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
import { CalculationProportions } from "../../src/types/calculation/internal/CalculationProportions";
import { CalculationResult } from "../../src/types/calculation/internal/CalculationResult";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationValidation } from "../../src/types/calculation/internal/CalculationValidation";
import { calculate, exportForTesting } from "../../src/utility/calculator";
import {
  getTestBaseDataWithoutUnion,
  getTestBaseDataWithUnion,
} from "../TestData";

interface CalculationTestData {
  given: {
    committeeSize: number;
    groups: CalculationGroup[];
  };
  expected: CalculationMethodResult;
}

describe("Full calculation tests", () => {
  test("Full test with over rounding", () => {
    const baseData: BaseData = {
      name: "Test 1",
      targetSize: 13,
      committeeSize: 70,
      groups: [
        {
          name: "Group 1",
          seatsOrVotes: 20,
        },
        {
          name: "Group 2",
          seatsOrVotes: 8,
        },
        {
          name: "Group 3",
          seatsOrVotes: 8,
        },
        {
          name: "Group 4",
          seatsOrVotes: 10,
        },
        {
          name: "Group 5",
          seatsOrVotes: 10,
        },
        {
          name: "Group 6",
          seatsOrVotes: 3,
        },
        {
          name: "Group 7",
          seatsOrVotes: 2,
        },
        {
          name: "Group 8",
          seatsOrVotes: 2,
        },
        {
          name: "Group 9",
          seatsOrVotes: 2,
        },
        {
          name: "Group 10",
          seatsOrVotes: 2,
        },
        {
          name: "Group 11",
          seatsOrVotes: 2,
        },
        {
          name: "Group 12",
          seatsOrVotes: 1,
        },
      ],
      unions: [
        {
          name: "Union 1",
          groups: [1, 2],
          unionType: UnionType.COMMITTEE,
        },
      ],
    };
    const expected: CalculationResult = {
      proportions: {
        "Group 1": 3.714285714285714,
        "Group 4": 1.857142857142857,
        "Group 5": 1.857142857142857,
        "Group 6": 0.557142857142857,
        "Group 7": 0.3714285714285714,
        "Group 8": 0.3714285714285714,
        "Group 9": 0.3714285714285714,
        "Group 10": 0.3714285714285714,
        "Group 11": 0.3714285714285714,
        "Group 12": 0.1857142857142857,
        "Union 1": 2.971428571428571,
      },
      methods: {
        [CalculationMethod.D_HONDT]: {
          distribution: {
            "Group 1": 5,
            "Group 4": 2,
            "Group 5": 2,
            "Group 6": 0,
            "Group 7": 0,
            "Group 8": 0,
            "Group 9": 0,
            "Group 10": 0,
            "Group 11": 0,
            "Group 12": 0,
            "Union 1": 4,
          },
          order: [
            {
              groupName: "Group 1",
              value: 20,
            },
            {
              groupName: "Union 1",
              value: 16,
            },
            {
              groupName: "Group 1",
              value: 10,
            },
            {
              groupName: "Group 4",
              value: 10,
            },
            {
              groupName: "Group 5",
              value: 10,
            },
            {
              groupName: "Union 1",
              value: 8,
            },
            {
              groupName: "Group 1",
              value: 6.666666666666667,
            },
            {
              groupName: "Union 1",
              value: 5.333333333333333,
            },
            {
              groupName: "Group 1",
              value: 5,
            },
            {
              groupName: "Group 4",
              value: 5,
            },
            {
              groupName: "Group 5",
              value: 5,
            },
            {
              groupName: "Group 1",
              value: 4,
            },
            {
              groupName: "Union 1",
              value: 4,
            },
          ],
          validation: {
            "Group 1": false,
            "Group 4": true,
            "Group 5": true,
            "Group 6": true,
            "Group 7": true,
            "Group 8": true,
            "Group 9": true,
            "Group 10": true,
            "Group 11": true,
            "Group 12": true,
            "Union 1": false,
          },
        } as CalculationMethodResult,
        [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
          distribution: {
            "Group 1": 4,
            "Group 4": 2,
            "Group 5": 2,
            "Group 6": 1,
            "Group 7": 0,
            "Group 8": 0,
            "Group 9": 0,
            "Group 10": 0,
            "Group 11": 0,
            "Group 12": 0,
            "Union 1": 4,
          },
          order: [
            {
              groupName: "Group 1",
              value: 20,
            },
            {
              groupName: "Union 1",
              value: 16,
            },
            {
              groupName: "Group 4",
              value: 10,
            },
            {
              groupName: "Group 5",
              value: 10,
            },
            {
              groupName: "Group 1",
              value: 6.666666666666667,
            },
            {
              groupName: "Union 1",
              value: 5.333333333333333,
            },
            {
              groupName: "Group 1",
              value: 4,
            },
            {
              groupName: "Group 4",
              value: 3.3333333333333335,
            },
            {
              groupName: "Group 5",
              value: 3.3333333333333335,
            },
            {
              groupName: "Union 1",
              value: 3.2,
            },
            {
              groupName: "Group 6",
              value: 3,
            },
            {
              groupName: "Group 1",
              value: 2.857142857142857,
            },
            {
              groupName: "Union 1",
              value: 2.2857142857142856,
            },
          ],
          validation: {
            "Group 1": true,
            "Group 4": true,
            "Group 5": true,
            "Group 6": true,
            "Group 7": true,
            "Group 8": true,
            "Group 9": true,
            "Group 10": true,
            "Group 11": true,
            "Group 12": true,
            "Union 1": false,
          },
        } as CalculationMethodResult,
        [CalculationMethod.HARE_NIEMEYER]: {
          distribution: {
            "Group 1": 4,
            "Group 4": 2,
            "Group 5": 2,
            "Group 6": 1,
            "Group 7": 0,
            "Group 8": 0,
            "Group 9": 0,
            "Group 10": 0,
            "Group 11": 0,
            "Group 12": 0,
            "Union 1": 3,
          },
          order: [
            {
              groupName: "Group 1",
              value: 4,
            },
            {
              groupName: "Union 1",
              value: 3,
            },
            {
              groupName: "Group 1",
              value: 2,
            },
            {
              groupName: "Group 4",
              value: 2,
            },
            {
              groupName: "Group 5",
              value: 2,
            },
            {
              groupName: "Union 1",
              value: 1.5,
            },
            {
              groupName: "Group 1",
              value: 1.3333333333333333,
            },
            {
              groupName: "Group 1",
              value: 1.0,
            },
            {
              groupName: "Group 4",
              value: 1.0,
            },
            {
              groupName: "Group 5",
              value: 1.0,
            },
            {
              groupName: "Group 6",
              value: 1.0,
            },
            {
              groupName: "Union 1",
              value: 1.0,
            },
          ],
          stale: {
            amountSeats: 1,
            groupNames: [
              "Group 7",
              "Group 8",
              "Group 9",
              "Group 10",
              "Group 11",
            ],
            ratio: 0.37142857142857144,
          },
          validation: {
            "Group 1": true,
            "Group 4": true,
            "Group 5": true,
            "Group 6": true,
            "Group 7": true,
            "Group 8": true,
            "Group 9": true,
            "Group 10": true,
            "Group 11": true,
            "Group 12": true,
            "Union 1": true,
          },
        } as CalculationMethodResult,
      },
    };

    const calculationResult = calculate(baseData);

    expect(calculationResult).toEqual(expected);
  });
});

describe("D'Hondt calculation test", () => {
  test.each(
    loadJsonFiles<CalculationTestData>(
      join(__dirname, "../data/dHondt"),
      CalculationMethod.D_HONDT
    ).map(({ fileName, data }) => [fileName, data])
  )("%s", (_, data) => {
    const result = getComparableMethodResult(
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
  )("%s", (_, data) => {
    const result = getComparableMethodResult(
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
  )("%s", (_, data) => {
    const result = getComparableMethodResult(
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
        seatsOrVotes: 0,
      },
      {
        name: "Test 2",
        seatsOrVotes: 0,
      },
    ];
    const proportions: CalculationProportions = {
      "Test 1": 3.56,
      "Test 2": 3.56,
    };
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
      proportions,
      distribution
    );

    expect(validation).toEqual(expected);
  });

  test("Test method validation with stale situation", () => {
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        seatsOrVotes: 0,
      },
      {
        name: "Test 2",
        seatsOrVotes: 0,
      },
      {
        name: "Test 3",
        seatsOrVotes: 0,
      },
    ];
    const proportions: CalculationProportions = {
      "Test 1": 3.56,
      "Test 2": 3.56,
      "Test 3": 3.56,
    };
    const distribution: CalculationSeatDistribution = {
      "Test 1": 4,
      "Test 2": 4,
      "Test 3": 5,
    };
    const stale: CalculationStale = {
      groupNames: ["Test 2", "Test 3"],
      amountSeats: 1,
      ratio: 0.0,
    };
    const expected: CalculationValidation = {
      "Test 1": true,
      "Test 2": false,
      "Test 3": false,
    };

    const validation = exportForTesting.calculateMethodValidity(
      calculationGroups,
      proportions,
      distribution,
      stale
    );

    expect(validation).toEqual(expected);
  });

  test("Test method validation with undefined proportions", () => {
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        seatsOrVotes: 0,
      },
      {
        name: "Test 2",
        seatsOrVotes: 0,
      },
    ];
    const proportions: CalculationProportions = {};
    const distribution: CalculationSeatDistribution = {
      "Test 1": 4,
      "Test 2": 5,
    };
    const expected: CalculationValidation = {};

    const validation = exportForTesting.calculateMethodValidity(
      calculationGroups,
      proportions,
      distribution
    );

    expect(validation).toEqual(expected);
  });
});

describe("Proportional seats calculation tests", () => {
  test("totalSeatsOrVotes larger than committeeSize", () => {
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        seatsOrVotes: 14,
      },
      {
        name: "Test 2",
        seatsOrVotes: 23,
      },
      {
        name: "Test 3",
        seatsOrVotes: 7,
      },
    ];
    const committeeSize = 10;
    const expected = {
      "Test 1": 3.1818181818181817,
      "Test 2": 5.227272727272727,
      "Test 3": 1.5909090909090908,
    };

    const proportions = exportForTesting.calculateProportions(
      calculationGroups,
      committeeSize
    );

    expect(proportions).toEqual(expected);
  });
  test("totalSeatsOrVotes smaller than committeeSize", () => {
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        seatsOrVotes: 14,
      },
      {
        name: "Test 2",
        seatsOrVotes: 23,
      },
      {
        name: "Test 3",
        seatsOrVotes: 7,
      },
    ];
    const committeeSize = 100;
    const expected = {
      "Test 1": 31.818181818181817,
      "Test 2": 52.27272727272727,
      "Test 3": 15.909090909090908,
    };

    const proportions = exportForTesting.calculateProportions(
      calculationGroups,
      committeeSize
    );

    expect(proportions).toEqual(expected);
  });
});

describe("Extract calculation groups tests", () => {
  test("Extract calculation groups no unions", () => {
    const baseData = getTestBaseDataWithoutUnion();
    const expected: CalculationGroup[] = [
      {
        name: "Testgroup 1",
        seatsOrVotes: 10,
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 20,
      },
      {
        name: "Testgroup 3",
        seatsOrVotes: 30,
      },
    ];

    const calculationGroups =
      exportForTesting.extractCalculationGroups(baseData);

    expect(calculationGroups).toEqual(expected);
  });

  test("Extract calculation groups with unions", () => {
    const baseData = getTestBaseDataWithUnion();
    const expected: CalculationGroup[] = [
      {
        name: "Testgroup 3",
        seatsOrVotes: 30,
      },
      {
        name: "Example fraction union",
        seatsOrVotes: 30,
      },
      {
        name: "Example committee union",
        seatsOrVotes: 30,
      },
    ];

    const calculationGroups =
      exportForTesting.extractCalculationGroups(baseData);

    expect(calculationGroups).toEqual(expected);
  });
});

function getComparableMethodResult(
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
