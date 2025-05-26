import { BaseData } from "../src/types/BaseData";
import { UnionType } from "../src/types/Union";

export function getTestBaseData(): BaseData {
  return {
    name: "TestData 1",
    committeeSize: 10,
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
