import { BaseData } from "../src/types/BaseData";
import { UnionType } from "../src/types/Union";

export function getTestBaseData(): BaseData {
  return {
    name: "TestData 1",
    committeeSize: 60,
    groups: [
      {
        name: "Testgroup 1",
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
        unionType: UnionType.COMMITTEE,
        groups: ["Testgroup 1", "Testgroup 2"],
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
