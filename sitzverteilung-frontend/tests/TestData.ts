import { BaseData } from "../src/types/basedata/BaseData";
import { UnionType } from "../src/types/basedata/Union";
import { LimitConfiguration } from "../src/utility/validation";
import {CalculationResult} from "../src/types/calculation/internal/CalculationResult";
import {CalculationMethod} from "../src/types/calculation/CalculationMethod";

export function getTestBaseDataWithoutUnion(): BaseData {
  return {
    name: "TestData 1",
    committeeSize: 60,
    targetSize: 10,
    groups: [
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
    ],
    unions: [],
  };
}

export function getTestBaseDataWithUnion(): BaseData {
  return {
    name: "TestData 1",
    committeeSize: 60,
    targetSize: 10,
    groups: [
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
    ],
    unions: [
      {
        name: "Example fraction union",
        unionType: UnionType.FRACTION,
        groups: [0, 1],
      },
      {
        name: "Example committee union",
        unionType: UnionType.COMMITTEE,
        groups: [0, 1],
      },
    ],
  };
}

export function getTestBaseDataEmptyGroups(): BaseData {
  return {
    name: "TestData Empty Groups",
    committeeSize: 0,
    targetSize: 0,
    groups: [],
    unions: [],
  };
}

export function getTestBaseDataTooManyGroups(): BaseData {
  return {
    name: "TestData TooMany Groups",
    committeeSize: 1,
    targetSize: 0,
    groups: [
      {
        name: "Testgroup 1",
        seatsOrVotes: 1,
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 0,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataTooManySeats(): BaseData {
  return {
    name: "TestData TooMany Seats",
    committeeSize: 5,
    targetSize: 1,
    groups: [
      {
        name: "Testgroup 1",
        seatsOrVotes: 3,
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 3,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataUndefinedVoteMode(): BaseData {
  return {
    name: "TestData Undefined CommitteeSize",
    committeeSize: undefined,
    targetSize: 1,
    groups: [
      {
        name: "Testgroup 1",
        seatsOrVotes: 1,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataNotEnoughSeats(): BaseData {
  return {
    name: "TestData NotEnough Seats",
    committeeSize: 5,
    targetSize: 1,
    groups: [
      {
        name: "Testgroup 1",
        seatsOrVotes: 1,
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 3,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataInputLimit(): BaseData {
  return {
    name: generateUniqueString(LimitConfiguration.limitName),
    committeeSize: generateUniqueNumber(
      LimitConfiguration.limitCommitteeSize.toString().length
    ),
    targetSize: generateUniqueNumber(
      LimitConfiguration.limitCommitteeSize.toString().length
    ),
    groups: Array.from({ length: LimitConfiguration.limitGroups }, () => ({
      name: generateUniqueString(LimitConfiguration.limitName),
      seatsOrVotes: generateUniqueNumber(
        Math.max(
          LimitConfiguration.limitCommitteeSize.toString().length,
          LimitConfiguration.limitVotes.toString().length
        )
      ),
    })),
    // Smallest constellation is pair-wise unions
    unions: Array.from(
      { length: Math.floor(LimitConfiguration.limitGroups / 2) },
      () => ({
        name: generateUniqueString(LimitConfiguration.limitName),
        unionType: UnionType.FRACTION,
        groups: Array.from({ length: 2 }, () =>
          generateUniqueNumber(LimitConfiguration.limitGroups.toString().length)
        ),
      })
    ),
  };
}

export function getTestBaseDataInputTooLarge(): BaseData {
  return {
    name: generateUniqueString(999),
    committeeSize: generateUniqueNumber(3),
    targetSize: generateUniqueNumber(3),
    groups: Array.from({ length: 18 }, () => ({
      name: generateUniqueString(999),
    })),
    unions: [],
  };
}

export function getTestCalculationResult(): CalculationResult {
  return {
    proportions: {
      'Testgroup 1': 1,
      'Testgroup 2': 1.5,
    },
    methods: {
      [CalculationMethod.D_HONDT]: {
        distribution: {
          'Testgroup 1': 2,
          'Testgroup 2': 3,
        },
        stale: null,
        validation: {
          'Testgroup 1': { overRounding: false, lostSafeSeat: false },
          'Testgroup 2': { overRounding: false, lostSafeSeat: false },
        }
      },
      [CalculationMethod.HARE_NIEMEYER]: {
        distribution: {
          'Testgroup 1': 4,
          'Testgroup 2': 5,
        },
        stale: null,
        validation: {
          'Testgroup 1': { overRounding: false, lostSafeSeat: false },
          'Testgroup 2': { overRounding: false, lostSafeSeat: false },
        }
      },
      [CalculationMethod.SAINTE_LAGUE_SCHEPERS]: {
        distribution: {
          'Testgroup 1': 6,
          'Testgroup 2': 7,
        },
        stale: null,
        validation: {
          'Testgroup 1': { overRounding: true, lostSafeSeat: false },
          'Testgroup 2': { overRounding: false, lostSafeSeat: false },
        }
      }
    }
  }
}

function generateUniqueString(
  length: number,
  characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?"
): string {
  let result = "";
  let previousChar = null;

  while (result.length < length) {
    const randomChar = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );

    if (randomChar !== previousChar) {
      result += randomChar;
      previousChar = randomChar;
    }
  }

  return result;
}

function generateUniqueNumber(length: number): number {
  if (length === 0) return 0;
  const firstDigit = generateUniqueString(1, "123456789");
  const remainingDigits =
    length > 1 ? generateUniqueString(length - 1, "0123456789") : "";
  const numberString = firstDigit + remainingDigits;
  return Number(numberString);
}
