import { describe, expect, test } from "vitest";

import { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationSeatOrder } from "../../src/types/calculation/internal/CalculationSeatOrder";
import { dHondt } from "../../src/utility/calculator";

describe("Calculator tests", () => {
  // Data from https://www.bundeswahlleiterin.de/service/glossar/d/d-hondtsche-sitzverteilung.html
  test("dHondt no stale", () => {
    // given
    const groups: CalculationGroup[] = [
      {
        name: "Partei A",
        seatsOrVotes: 10_000,
      },
      {
        name: "Partei B",
        seatsOrVotes: 6_000,
      },
      {
        name: "Partei C",
        seatsOrVotes: 1_500,
      },
    ];
    const committeeSize = 7;
    const expectedDistribution: CalculationSeatDistribution = {
      "Partei A": 5,
      "Partei B": 3,
      "Partei C": 0,
    };
    const expectedOrder: CalculationSeatOrder = [
      {
        groupName: "Partei A",
        value: 10_000,
      },
      {
        groupName: "Partei B",
        value: 6_000,
      },
      {
        groupName: "Partei A",
        value: 5_000,
      },
      {
        groupName: "Partei A",
        value: 3_333.33,
      },
      {
        groupName: "Partei B",
        value: 3_000,
      },
      {
        groupName: "Partei A",
        value: 2_500,
      },
      {
        groupName: "Partei A",
        value: 2_000,
      },
      {
        groupName: "Partei B",
        value: 2_000,
      },
    ];

    // when
    const result = dHondt(groups, committeeSize);

    // then
    expect(result.distribution).toEqual(expectedDistribution);
    expect(result.order).toEqual(expectedOrder);
  });
});
