import { describe, expect, test } from "vitest";

import { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationSeatOrder } from "../../src/types/calculation/internal/CalculationSeatOrder";
import { dHondt } from "../../src/utility/calculator";

describe("Calculator tests", () => {
  test("dHondt 1 no stale", () => {
    // Data from https://www.bundeswahlleiterin.de/service/glossar/d/d-hondtsche-sitzverteilung.html
    // given
    const committeeSize = 8;
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
    const expectedDistribution: CalculationSeatDistribution = {
      "Partei A": 5,
      "Partei B": 3,
      "Partei C": 0,
    };
    const expectedOrder: CalculationSeatOrder = [
      {
        groupName: "Partei A",
        value: 10_000.000,
      },
      {
        groupName: "Partei B",
        value: 6_000.000,
      },
      {
        groupName: "Partei A",
        value: 5_000.000,
      },
      {
        groupName: "Partei A",
        value: 3_333.333,
      },
      {
        groupName: "Partei B",
        value: 3_000.000,
      },
      {
        groupName: "Partei A",
        value: 2_500.000,
      },
      {
        groupName: "Partei A",
        value: 2_000.000,
      },
      {
        groupName: "Partei B",
        value: 2_000.000,
      },
    ];

    // when
    const result = dHondt(groups, committeeSize);

    // then
    expect(result.distribution).toEqual(expectedDistribution);
    expect(result.order).toEqual(expectedOrder);
  });

  test("dHondt 2 no stale", () => {
      // given
      const committeeSize = 22;
      const groups: CalculationGroup[] = [
        {
          name: "Partei A",
          seatsOrVotes: 24,
        },
        {
          name: "Partei B",
          seatsOrVotes: 20,
        },
        {
          name: "Partei C",
          seatsOrVotes: 19,
        },
        {
          name: "Partei D",
          seatsOrVotes: 6,
        },
        {
          name: "Partei E",
          seatsOrVotes: 4,
        },
        {
          name: "Partei F",
          seatsOrVotes: 4,
        },
        {
          name: "Partei G",
          seatsOrVotes: 3,
        }
      ];
      const expectedDistribution: CalculationSeatDistribution = {
        "Partei A": 7,
        "Partei B": 6,
        "Partei C": 6,
        "Partei D": 1,
        "Partei E": 1,
        "Partei F": 1,
        "Partei G": 0,
      };
      const expectedOrder: CalculationSeatOrder = [
        {
          groupName: "Partei A",
          value: 24.000,
        },
        {
          groupName: "Partei B",
          value: 20.000,
        },
        {
          groupName: "Partei C",
          value: 19.000,
        },
        {
          groupName: "Partei A",
          value: 12.000,
        },
        {
          groupName: "Partei B",
          value: 10.000,
        },
        {
          groupName: "Partei C",
          value: 9.500,
        },
        {
          groupName: "Partei A",
          value: 8.000,
        },
        {
          groupName: "Partei B",
          value: 6.666,
        },
        {
          groupName: "Partei C",
          value: 6.333,
        },
        {
          groupName: "Partei A",
          value: 6.000,
        },
        {
          groupName: "Partei D",
          value: 6.000,
        },
        {
          groupName: "Partei B",
          value: 5.000,
        },
        {
          groupName: "Partei A",
          value: 4.800,
        },
        {
          groupName: "Partei C",
          value: 4.750,
        },
        {
          groupName: "Partei A",
          value: 4.000,
        },
        {
          groupName: "Partei B",
          value: 4.000,
        },
        {
          groupName: "Partei E",
          value: 4.000,
        },
        {
          groupName: "Partei F",
          value: 4.000,
        },
        {
          groupName: "Partei C",
          value: 3.800,
        },
        {
          groupName: "Partei A",
          value: 3.428,
        },
        {
          groupName: "Partei B",
          value: 3.333,
        },
        {
          groupName: "Partei C",
          value: 3.166,
        },
    ];

    // when
    const result = dHondt(groups, committeeSize);

    // then
    expect(result.distribution).toEqual(expectedDistribution);
    expect(result.order).toEqual(expectedOrder);
  })

  test("dHondt no stale", () => {
    // Data from https://www.bundeswahlleiterin.de/service/glossar/d/d-hondtsche-sitzverteilung.html
    // given
    const committeeSize = 7;
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
    const expectedDistribution: CalculationSeatDistribution = {
      "Partei A": 5,
      "Partei B": 3,
      "Partei C": 0,
    };
    const expectedOrder: CalculationSeatOrder = [
      {
        groupName: "Partei A",
        value: 10_000.000,
      },
      {
        groupName: "Partei B",
        value: 6_000.000,
      },
      {
        groupName: "Partei A",
        value: 5_000.000,
      },
      {
        groupName: "Partei A",
        value: 3_333.333,
      },
      {
        groupName: "Partei B",
        value: 3_000.000,
      },
      {
        groupName: "Partei A",
        value: 2_500.000,
      },
      {
        groupName: "Partei A",
        value: 2_000.000,
      },
      {
        groupName: "Partei B",
        value: 2_000.000,
      },
    ];

    // when
    const result = dHondt(groups, committeeSize);

    // then
    expect(result.distribution).toEqual(expectedDistribution);
    expect(result.order).toEqual(expectedOrder);
  });
});
