import { BaseData } from "../src/types/basedata/BaseData";
import { UnionType } from "../src/types/basedata/Union";
import { LimitConfiguration } from "../src/utility/validation";

export function getTestBaseData(): BaseData {
  return {
    name: "TestData 1",
    committeeSize: 60,
    groups: [
      {
        name: "Testgroup 1 ä",
        committeeSeats: 10,
        votes: 100,
      },
      {
        name: "Testgroup 2",
        committeeSeats: 20,
        votes: 200,
      },
      {
        name: "Testgroup 3",
        committeeSeats: 30,
        votes: 50,
      },
    ],
    unions: [
      {
        name: "Example fraction union",
        unionType: UnionType.FRACTION,
        groups: [0, 1],
      },
    ],
  };
}

export function getTestBaseDataEmptyGroups(): BaseData {
  return {
    name: "TestData Empty Groups",
    committeeSize: 0,
    groups: [],
    unions: [],
  };
}

export function getTestBaseDataTooManyGroups(): BaseData {
  return {
    name: "TestData TooMany Groups",
    committeeSize: 1,
    groups: [
      {
        name: "Testgroup 1",
        committeeSeats: 1,
        votes: 100,
      },
      {
        name: "Testgroup 2",
        committeeSeats: 0,
        votes: 200,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataTooManySeats(): BaseData {
  return {
    name: "TestData TooMany Seats",
    committeeSize: 5,
    groups: [
      {
        name: "Testgroup 1",
        committeeSeats: 3,
        votes: 100,
      },
      {
        name: "Testgroup 2",
        committeeSeats: 3,
        votes: 200,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataUndefinedTooManySeats(): BaseData {
  return {
    name: "TestData Undefined CommitteeSize",
    committeeSize: undefined,
    groups: [
      {
        name: "Testgroup 1",
        committeeSeats: 1,
        votes: 100,
      },
    ],
    unions: [],
  };
}

export function getTestBaseDataNotEnoughSeats(): BaseData {
  return {
    name: "TestData NotEnough Seats",
    committeeSize: 5,
    groups: [
      {
        name: "Testgroup 1",
        committeeSeats: 1,
        votes: 100,
      },
      {
        name: "Testgroup 2",
        committeeSeats: 3,
        votes: 200,
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
    groups: Array.from({ length: LimitConfiguration.limitGroups }, () => ({
      name: generateUniqueString(LimitConfiguration.limitName),
      votes: generateUniqueNumber(
        LimitConfiguration.limitVotes.toString().length
      ),
      committeeSeats: generateUniqueNumber(
        LimitConfiguration.limitCommitteeSize.toString().length
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
    groups: Array.from({ length: 18 }, () => ({
      name: generateUniqueString(999),
      votes: generateUniqueNumber(9),
    })),
    unions: [],
  };
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
