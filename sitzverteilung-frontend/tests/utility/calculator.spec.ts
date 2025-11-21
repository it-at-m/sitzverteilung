import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import { describe, expect, test } from "vitest";

import type { CalculationGroup } from "../../src/types/calculation/CalculationGroup";
import type { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import type { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import type { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";

import { BaseData } from "../../src/types/basedata/BaseData";
import { UnionType } from "../../src/types/basedata/Union";
import { CalculationMethod } from "../../src/types/calculation/CalculationMethod";
import { CalculationProportions } from "../../src/types/calculation/internal/CalculationProportions";
import { CalculationResult } from "../../src/types/calculation/internal/CalculationResult";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { calculate, exportForTesting } from "../../src/utility/calculator";
import {
  getTestBaseDataWithNoOverlap,
  getTestBaseDataWithoutUnion,
  getTestBaseDataWithOverlapCommitteeFraction,
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
  test("Full test with over rounding in d'H", () => {
    const baseData: BaseData = {
      name: "Test overrounding d'H",
      targetSize: 14,
      committeeSize: 80,
      groups: [
        {
          name: "Group 1",
          seatsOrVotes: 23,
        },
        {
          name: "Group 2",
          seatsOrVotes: 23,
        },
        {
          name: "Group 3",
          seatsOrVotes: 17,
        },
        {
          name: "Group 4",
          seatsOrVotes: 4,
        },
        {
          name: "Group 5",
          seatsOrVotes: 4,
        },
        {
          name: "Group 6",
          seatsOrVotes: 4,
        },
        {
          name: "Group 7",
          seatsOrVotes: 3,
        },
        {
          name: "Group 8",
          seatsOrVotes: 1,
        },
        {
          name: "Group 9",
          seatsOrVotes: 1,
        },
      ],
      unions: [],
    };
    const expected: CalculationResult = {
      seats: {
        "Group 1": 23,
        "Group 2": 23,
        "Group 3": 17,
        "Group 4": 4,
        "Group 5": 4,
        "Group 6": 4,
        "Group 7": 3,
        "Group 8": 1,
        "Group 9": 1,
      },
      proportions: {
        "Group 1": 4.0249999999999995,
        "Group 2": 4.0249999999999995,
        "Group 3": 2.975,
        "Group 4": 0.7,
        "Group 5": 0.7,
        "Group 6": 0.7,
        "Group 7": 0.525,
        "Group 8": 0.175,
        "Group 9": 0.175,
      },
      methods: {
        [CalculationMethod.D_HONDT]: {
          distribution: {
            "Group 1": 5,
            "Group 2": 5,
            "Group 3": 4,
            "Group 4": 0,
            "Group 5": 0,
            "Group 6": 0,
            "Group 7": 0,
            "Group 8": 0,
            "Group 9": 0,
          },
          order: [
            {
              groupName: "Group 1",
              value: 23,
            },
            {
              groupName: "Group 2",
              value: 23,
            },
            {
              groupName: "Group 3",
              value: 17,
            },
            {
              groupName: "Group 1",
              value: 11.5,
            },
            {
              groupName: "Group 2",
              value: 11.5,
            },
            {
              groupName: "Group 3",
              value: 8.5,
            },
            {
              groupName: "Group 1",
              value: 7.666666666666667,
            },
            {
              groupName: "Group 2",
              value: 7.666666666666667,
            },
            {
              groupName: "Group 1",
              value: 5.75,
            },
            {
              groupName: "Group 2",
              value: 5.75,
            },
            {
              groupName: "Group 3",
              value: 5.666666666666667,
            },
            {
              groupName: "Group 1",
              value: 4.6,
            },
            {
              groupName: "Group 2",
              value: 4.6,
            },
            {
              groupName: "Group 3",
              value: 4.25,
            },
          ],
          validation: {
            "Group 1": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 2": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 3": {
              overRounding: true,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 4": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 5": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 6": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 7": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 8": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 9": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
          },
        } as CalculationMethodResult,
        [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
          distribution: {
            "Group 1": 4,
            "Group 2": 4,
            "Group 3": 3,
            "Group 4": 1,
            "Group 5": 1,
            "Group 6": 1,
            "Group 7": 0,
            "Group 8": 0,
            "Group 9": 0,
          },
          order: [
            {
              groupName: "Group 1",
              value: 23,
            },
            {
              groupName: "Group 2",
              value: 23,
            },
            {
              groupName: "Group 3",
              value: 17,
            },
            {
              groupName: "Group 1",
              value: 7.666666666666667,
            },
            {
              groupName: "Group 2",
              value: 7.666666666666667,
            },
            {
              groupName: "Group 3",
              value: 5.666666666666667,
            },
            {
              groupName: "Group 1",
              value: 4.6,
            },
            {
              groupName: "Group 2",
              value: 4.6,
            },
            {
              groupName: "Group 4",
              value: 4,
            },
            {
              groupName: "Group 5",
              value: 4,
            },
            {
              groupName: "Group 6",
              value: 4,
            },
            {
              groupName: "Group 3",
              value: 3.4,
            },
            {
              groupName: "Group 1",
              value: 3.2857142857142856,
            },
            {
              groupName: "Group 2",
              value: 3.2857142857142856,
            },
          ],
          validation: {
            "Group 1": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 2": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 3": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 4": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 5": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 6": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 7": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 8": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 9": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
          },
        } as CalculationMethodResult,
        [CalculationMethod.HARE_NIEMEYER]: {
          distribution: {
            "Group 1": 4,
            "Group 2": 4,
            "Group 3": 3,
            "Group 4": 1,
            "Group 5": 1,
            "Group 6": 1,
            "Group 7": 0,
            "Group 8": 0,
            "Group 9": 0,
          },
          order: [
            {
              groupName: "Group 1",
              value: 4,
            },
            {
              groupName: "Group 2",
              value: 4,
            },
            {
              groupName: "Group 3",
              value: 3,
            },
            {
              groupName: "Group 1",
              value: 2,
            },
            {
              groupName: "Group 2",
              value: 2,
            },
            {
              groupName: "Group 3",
              value: 1.5,
            },
            {
              groupName: "Group 1",
              value: 1.3333333333333333,
            },
            {
              groupName: "Group 2",
              value: 1.3333333333333333,
            },
            {
              groupName: "Group 1",
              value: 1,
            },
            {
              groupName: "Group 2",
              value: 1,
            },
            {
              groupName: "Group 3",
              value: 1,
            },
            {
              groupName: "Group 4",
              value: 1,
            },
            {
              groupName: "Group 5",
              value: 1,
            },
            {
              groupName: "Group 6",
              value: 1,
            },
          ],
          validation: {
            "Group 1": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 2": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 3": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 4": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 5": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 6": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 7": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 8": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 9": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
          },
        } as CalculationMethodResult,
      },
    };

    const calculationResult = calculate(baseData);

    expect(calculationResult).toEqual(expected);
  });
  test("Full test with lost seats and invalid committee", () => {
    const baseData: BaseData = {
      name: "Test lost seats and invalid committee",
      targetSize: 16,
      committeeSize: 80,
      groups: [
        {
          name: "Group 1",
          seatsOrVotes: 21,
        },
        {
          name: "Group 2",
          seatsOrVotes: 21,
        },
        {
          name: "Group 3",
          seatsOrVotes: 21,
        },
        {
          name: "Group 4",
          seatsOrVotes: 3,
        },
        {
          name: "Group 5",
          seatsOrVotes: 3,
        },
        {
          name: "Group 6",
          seatsOrVotes: 3,
        },
        {
          name: "Group 7",
          seatsOrVotes: 4,
        },
        {
          name: "Group 8",
          seatsOrVotes: 2,
        },
        {
          name: "Group 9",
          seatsOrVotes: 1,
        },
        {
          name: "Group 10",
          seatsOrVotes: 1,
        },
      ],
      unions: [
        {
          name: "Test",
          unionType: UnionType.COMMITTEE,
          groups: [3, 7, 8, 9],
        },
      ],
    };
    const expected: CalculationResult = {
      seats: {
        "Group 1": 21,
        "Group 2": 21,
        "Group 3": 21,
        "Group 5": 3,
        "Group 6": 3,
        "Group 7": 4,
        "AG: Test": 7,
      },
      proportions: {
        "Group 1": 4.2,
        "Group 2": 4.2,
        "Group 3": 4.2,
        "Group 5": 0.6,
        "Group 6": 0.6,
        "Group 7": 0.8,
        "AG: Test": 1.4,
      },
      methods: {
        [CalculationMethod.D_HONDT]: {
          distribution: {
            "Group 1": 5,
            "Group 2": 5,
            "Group 3": 5,
            "Group 5": 0,
            "Group 6": 0,
            "Group 7": 0,
            "AG: Test": 1,
          },
          order: [
            {
              groupName: "Group 1",
              value: 21,
            },
            {
              groupName: "Group 2",
              value: 21,
            },
            {
              groupName: "Group 3",
              value: 21,
            },
            {
              groupName: "Group 1",
              value: 10.5,
            },
            {
              groupName: "Group 2",
              value: 10.5,
            },
            {
              groupName: "Group 3",
              value: 10.5,
            },
            {
              groupName: "Group 1",
              value: 7,
            },
            {
              groupName: "Group 2",
              value: 7,
            },
            {
              groupName: "Group 3",
              value: 7,
            },
            {
              groupName: "AG: Test",
              value: 7,
            },
            {
              groupName: "Group 1",
              value: 5.25,
            },
            {
              groupName: "Group 2",
              value: 5.25,
            },
            {
              groupName: "Group 3",
              value: 5.25,
            },
            {
              groupName: "Group 1",
              value: 4.2,
            },
            {
              groupName: "Group 2",
              value: 4.2,
            },
            {
              groupName: "Group 3",
              value: 4.2,
            },
          ],
          validation: {
            "Group 1": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 2": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 3": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 5": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 6": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 7": {
              overRounding: false,
              lostSafeSeat: true,
              committeeInvalid: [],
            },
            "AG: Test": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
          },
        } as CalculationMethodResult,
        [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
          distribution: {
            "Group 1": 4,
            "Group 2": 4,
            "Group 3": 4,
            "Group 5": 1,
            "Group 6": 1,
            "Group 7": 1,
            "AG: Test": 1,
          },
          order: [
            {
              groupName: "Group 1",
              value: 21,
            },
            {
              groupName: "Group 2",
              value: 21,
            },
            {
              groupName: "Group 3",
              value: 21,
            },
            {
              groupName: "Group 1",
              value: 7,
            },
            {
              groupName: "Group 2",
              value: 7,
            },
            {
              groupName: "Group 3",
              value: 7,
            },
            {
              groupName: "AG: Test",
              value: 7,
            },
            {
              groupName: "Group 1",
              value: 4.2,
            },
            {
              groupName: "Group 2",
              value: 4.2,
            },
            {
              groupName: "Group 3",
              value: 4.2,
            },
            {
              groupName: "Group 7",
              value: 4,
            },
            {
              groupName: "Group 1",
              value: 3,
            },
            {
              groupName: "Group 2",
              value: 3,
            },
            {
              groupName: "Group 3",
              value: 3,
            },
            {
              groupName: "Group 5",
              value: 3,
            },
            {
              groupName: "Group 6",
              value: 3,
            },
          ],
          validation: {
            "Group 1": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 2": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 3": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 5": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 6": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 7": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "AG: Test": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: ["Group 4"],
            },
          },
        } as CalculationMethodResult,
        [CalculationMethod.HARE_NIEMEYER]: {
          distribution: {
            "Group 1": 4,
            "Group 2": 4,
            "Group 3": 4,
            "Group 5": 1,
            "Group 6": 1,
            "Group 7": 1,
            "AG: Test": 1,
          },
          order: [
            {
              groupName: "Group 1",
              value: 4,
            },
            {
              groupName: "Group 2",
              value: 4,
            },
            {
              groupName: "Group 3",
              value: 4,
            },
            {
              groupName: "Group 1",
              value: 2,
            },
            {
              groupName: "Group 2",
              value: 2,
            },
            {
              groupName: "Group 3",
              value: 2,
            },
            {
              groupName: "Group 1",
              value: 1.3333333333333333,
            },
            {
              groupName: "Group 2",
              value: 1.3333333333333333,
            },
            {
              groupName: "Group 3",
              value: 1.3333333333333333,
            },
            {
              groupName: "Group 1",
              value: 1,
            },
            {
              groupName: "Group 2",
              value: 1,
            },
            {
              groupName: "Group 3",
              value: 1,
            },
            {
              groupName: "Group 5",
              value: 1,
            },
            {
              groupName: "Group 6",
              value: 1,
            },
            {
              groupName: "Group 7",
              value: 1,
            },
            {
              groupName: "AG: Test",
              value: 1,
            },
          ],
          validation: {
            "Group 1": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 2": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 3": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 5": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 6": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "Group 7": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: [],
            },
            "AG: Test": {
              overRounding: false,
              lostSafeSeat: false,
              committeeInvalid: ["Group 4"],
            },
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
  test("Calculate overrounding negative", () => {
    // given
    const groupName = "Test 1";
    const distributedSeats = 4;
    const proportions: CalculationProportions = {
      "Test 1": 3.56,
      "Test 2": 3.56,
    };

    const result = exportForTesting.checkOverroundingForGroup(
      groupName,
      proportions,
      distributedSeats
    );

    expect(result).toBeFalsy();
  });

  test("Calculate overrounding positive", () => {
    // given
    const groupName = "Test 1";
    const distributedSeats = 5;
    const proportions: CalculationProportions = {
      "Test 1": 3.56,
      "Test 2": 3.56,
    };

    const result = exportForTesting.checkOverroundingForGroup(
      groupName,
      proportions,
      distributedSeats
    );

    expect(result).toBeTruthy();
  });

  test("Calculate overrounding with stale situation", () => {
    const groupName = "Test 2";
    const distributedSeats = 4;
    const proportions: CalculationProportions = {
      "Test 2": 3.56,
    };

    const stale: CalculationStale = {
      groupNames: ["Test 2", "Test 3"],
      amountSeats: 1,
      ratio: 0.0,
    };

    const result = exportForTesting.checkOverroundingForGroup(
      groupName,
      proportions,
      distributedSeats,
      stale
    );

    expect(result).toBeTruthy();
  });
});

describe("Method validity lost safe seat tests", () => {
  test("Check lost safe seat when seat without committee", () => {
    const distributedSeats = 0;
    const seatsWithoutCommittee = 2;

    const result = exportForTesting.checkLostSafeSeatForGroup(
      distributedSeats,
      seatsWithoutCommittee
    );

    expect(result).toBeTruthy();
  });
  test("Check lost safe seat when no seat without committee", () => {
    const distributedSeats = 0;
    const seatsWithoutCommittee = 0;

    const result = exportForTesting.checkLostSafeSeatForGroup(
      distributedSeats,
      seatsWithoutCommittee
    );

    expect(result).toBeFalsy();
  });
  test("Check lost safe seat when lost only some seats", () => {
    const distributedSeats = 1;
    const seatsWithoutCommittee = 2;

    const result = exportForTesting.checkLostSafeSeatForGroup(
      distributedSeats,
      seatsWithoutCommittee
    );

    expect(result).toBeFalsy();
  });
});

describe("Method validity committee invalid tests", () => {
  test("Check committee invalid when no committee is checked", () => {
    const seatDistributionWithoutCommittee: CalculationSeatDistribution = {
      "Group 1": 0,
      "Group 2": 1,
    };
    const partiesInCommittee = [];
    const expected = [];

    const result = exportForTesting.checkCommitteeInvalid(
      partiesInCommittee,
      seatDistributionWithoutCommittee
    );

    expect(result).toEqual(expected);
  });

  test("Check committee invalid when seats overlap", () => {
    const seatDistributionWithoutCommittee: CalculationSeatDistribution = {
      "Group 1": 0,
      "Group 2": 1,
    };
    const partiesInCommittee = ["Group 1", "Group 2"];
    const expected = ["Group 2"];

    const result = exportForTesting.checkCommitteeInvalid(
      partiesInCommittee,
      seatDistributionWithoutCommittee
    );

    expect(result).toEqual(expected);
  });

  test("Check committee invalid when seats do not overlap", () => {
    const seatDistributionWithoutCommittee: CalculationSeatDistribution = {
      "Group 1": 0,
      "Group 2": 1,
      "Group 3": 0,
    };
    const partiesInCommittee = ["Group 1", "Group 3"];
    const expected = [];

    const result = exportForTesting.checkCommitteeInvalid(
      partiesInCommittee,
      seatDistributionWithoutCommittee
    );

    expect(result).toEqual(expected);
  });
});

describe("Proportional seats calculation tests", () => {
  test("totalSeatsOrVotes larger than committeeSize", () => {
    const calculationGroups: CalculationGroup[] = [
      {
        name: "Test 1",
        seatsOrVotes: 14,
        partiesInCommittee: [],
      },
      {
        name: "Test 2",
        seatsOrVotes: 23,
        partiesInCommittee: [],
      },
      {
        name: "Test 3",
        seatsOrVotes: 7,
        partiesInCommittee: [],
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
        partiesInCommittee: [],
      },
      {
        name: "Test 2",
        seatsOrVotes: 23,
        partiesInCommittee: [],
      },
      {
        name: "Test 3",
        seatsOrVotes: 7,
        partiesInCommittee: [],
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
        partiesInCommittee: [],
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 20,
        partiesInCommittee: [],
      },
      {
        name: "Testgroup 3",
        seatsOrVotes: 30,
        partiesInCommittee: [],
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
        partiesInCommittee: [],
      },
      {
        name: "FG: Example fraction union",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "AG: Example committee union",
        seatsOrVotes: 30,
        partiesInCommittee: ["Testgroup 1", "Testgroup 2"],
      },
    ];

    const calculationGroups =
      exportForTesting.extractCalculationGroups(baseData);

    expect(calculationGroups).toEqual(expected);
  });

  test("Extract calculation groups no include committees full overlap", () => {
    const baseData = getTestBaseDataWithUnion();
    const expected: CalculationGroup[] = [
      {
        name: "Testgroup 3",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "FG: Example fraction union",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
    ];

    const calculationGroups = exportForTesting.extractCalculationGroups(
      baseData,
      false
    );

    expect(calculationGroups).toEqual(expected);
  });

  test("Extract calculation groups no include committees with partial overlap", () => {
    const baseData = getTestBaseDataWithOverlapCommitteeFraction();
    const expected: CalculationGroup[] = [
      {
        name: "Testgroup 1",
        seatsOrVotes: 10,
        partiesInCommittee: [],
      },
      {
        name: "Testgroup 4",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "Testgroup 5",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "FG: Fraction 1",
        seatsOrVotes: 50,
        partiesInCommittee: [],
      },
    ];

    const calculationGroups = exportForTesting.extractCalculationGroups(
      baseData,
      false
    );

    expect(calculationGroups).toEqual(expected);
  });

  test("Extract calculation groups no include committees with no overlap", () => {
    const baseData = getTestBaseDataWithNoOverlap();
    const expected: CalculationGroup[] = [
      {
        name: "Testgroup 3",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "Testgroup 4",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "Testgroup 5",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
      {
        name: "FG: Fraction 1",
        seatsOrVotes: 30,
        partiesInCommittee: [],
      },
    ];

    const calculationGroups = exportForTesting.extractCalculationGroups(
      baseData,
      false
    );

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
