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
    committeeSize: 2,
    groups: [
      {
        name: "Testgroup 1",
        seatsOrVotes: 1,
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 1,
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

export function getTestBaseDataUndefinedTooManySeats(): BaseData {
  return {
    name: "TestData Undefined CommitteeSize",
    committeeSize: undefined,
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

export function getTestBaseDataSeatsAreNull(): BaseData {
  return {
    name: "TestData Seats Are Null",
    committeeSize: 5,
    groups: [
      {
        name: "Testgroup 1",
        seatsOrVotes: 0,
      },
      {
        name: "Testgroup 2",
        seatsOrVotes: 0,
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
      seatsOrVotes: generateUniqueNumber(
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
