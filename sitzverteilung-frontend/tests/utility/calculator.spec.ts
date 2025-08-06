import { describe, expect, test } from "vitest";

import { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationSeatOrder } from "../../src/types/calculation/internal/CalculationSeatOrder";
import { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";
import { dHondt } from "../../src/utility/calculator";

interface CalculationTestData {
  given: {
    committeeSize: number;
    groups: CalculationGroup[];
  };
  expected: {
    distribution: CalculationSeatDistribution;
    order: CalculationSeatOrder;
    stale: CalculationStale;
  };
}

describe("Calculator tests", () => {
  test.each([
    [getDHondtTestDataNoStale1()],
    [getDHondtTestDataNoStale2()],
    [getDHondtTestDataStale()],
  ])("Calculation method tests", (calculationTestData) => {
    // given
    const data = calculationTestData;

    // when
    const result = dHondt(data.given.groups, data.given.committeeSize);
    const order = result.order.map((order: CalculationGroupRatio) => {
      return {
        groupName: order.groupName,
        value: Number(order.value.toFixed(3)),
      };
    });

    // then
    expect(result.distribution).toEqual(data.expected.distribution);
    expect(order).toEqual(data.expected.order);
    expect(result.stale).toEqual(data.expected.stale);
  });
});

// Data from https://www.bundeswahlleiterin.de/service/glossar/d/d-hondtsche-sitzverteilung.html
function getDHondtTestDataNoStale1(): CalculationTestData {
  return {
    given: {
      committeeSize: 8,
      groups: [
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
      ],
    },
    expected: {
      distribution: {
        "Partei A": 5,
        "Partei B": 3,
        "Partei C": 0,
      },
      order: [
        {
          groupName: "Partei A",
          value: 10_000.0,
        },
        {
          groupName: "Partei B",
          value: 6_000.0,
        },
        {
          groupName: "Partei A",
          value: 5_000.0,
        },
        {
          groupName: "Partei A",
          value: 3_333.333,
        },
        {
          groupName: "Partei B",
          value: 3_000.0,
        },
        {
          groupName: "Partei A",
          value: 2_500.0,
        },
        {
          groupName: "Partei A",
          value: 2_000.0,
        },
        {
          groupName: "Partei B",
          value: 2_000.0,
        },
      ],
      stale: undefined,
    },
  };
}

function getDHondtTestDataNoStale2(): CalculationTestData {
  return {
    given: {
      committeeSize: 22,
      groups: [
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
        },
      ],
    },
    expected: {
      distribution: {
        "Partei A": 7,
        "Partei B": 6,
        "Partei C": 6,
        "Partei D": 1,
        "Partei E": 1,
        "Partei F": 1,
        "Partei G": 0,
      },
      order: [
        {
          groupName: "Partei A",
          value: 24.0,
        },
        {
          groupName: "Partei B",
          value: 20.0,
        },
        {
          groupName: "Partei C",
          value: 19.0,
        },
        {
          groupName: "Partei A",
          value: 12.0,
        },
        {
          groupName: "Partei B",
          value: 10.0,
        },
        {
          groupName: "Partei C",
          value: 9.5,
        },
        {
          groupName: "Partei A",
          value: 8.0,
        },
        {
          groupName: "Partei B",
          value: 6.667,
        },
        {
          groupName: "Partei C",
          value: 6.333,
        },
        {
          groupName: "Partei A",
          value: 6.0,
        },
        {
          groupName: "Partei D",
          value: 6.0,
        },
        {
          groupName: "Partei B",
          value: 5.0,
        },
        {
          groupName: "Partei A",
          value: 4.8,
        },
        {
          groupName: "Partei C",
          value: 4.75,
        },
        {
          groupName: "Partei A",
          value: 4.0,
        },
        {
          groupName: "Partei B",
          value: 4.0,
        },
        {
          groupName: "Partei E",
          value: 4.0,
        },
        {
          groupName: "Partei F",
          value: 4.0,
        },
        {
          groupName: "Partei C",
          value: 3.8,
        },
        {
          groupName: "Partei A",
          value: 3.429,
        },
        {
          groupName: "Partei B",
          value: 3.333,
        },
        {
          groupName: "Partei C",
          value: 3.167,
        },
      ],
      stale: undefined,
    },
  };
}

function getDHondtTestDataStale(): CalculationTestData {
  return {
    given: {
      committeeSize: 7,
      groups: getDHondtTestDataNoStale1().given.groups,
    },
    expected: {
      distribution: {
        "Partei A": 4,
        "Partei B": 2,
        "Partei C": 0,
      },
      order: [
        {
          groupName: "Partei A",
          value: 10_000.0,
        },
        {
          groupName: "Partei B",
          value: 6_000.0,
        },
        {
          groupName: "Partei A",
          value: 5_000.0,
        },
        {
          groupName: "Partei A",
          value: 3_333.333,
        },
        {
          groupName: "Partei B",
          value: 3_000.0,
        },
        {
          groupName: "Partei A",
          value: 2_500.0,
        },
      ],
      stale: {
        groupNames: ["Partei A", "Partei B"],
        amountSeats: 1,
        ratio: 2_000.0,
      },
    },
  };
}
