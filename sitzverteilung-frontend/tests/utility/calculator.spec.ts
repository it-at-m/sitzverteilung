import { describe, expect, test } from "vitest";

import { CalculationGroup } from "../../src/types/calculation/internal/CalculationGroup";
import { CalculationGroupRatio } from "../../src/types/calculation/internal/CalculationGroupRatio";
import { CalculationMethodResult } from "../../src/types/calculation/internal/CalculationMethodResult";
import { CalculationSeatDistribution } from "../../src/types/calculation/internal/CalculationSeatDistribution";
import { CalculationSeatOrder } from "../../src/types/calculation/internal/CalculationSeatOrder";
import { CalculationStale } from "../../src/types/calculation/internal/CalculationStale";
import { exportForTesting } from "../../src/utility/calculator";

interface CalculationTestData {
  given: {
    committeeSize: number;
    groups: CalculationGroup[];
  };
  expected: {
    distribution: CalculationSeatDistribution;
    order: CalculationSeatOrder;
    stale?: CalculationStale;
  };
}

describe("Calculator tests", () => {
  test.each([
    [getDHondtTestDataNoStale1()],
    [getDHondtTestDataNoStale2()],
    [getDHondtTestDataNoStale3()],
    [getDHondtTestDataNoStale4()],
  ])("D'Hondt test no stale", (calculationTestData) => {
    const data = calculationTestData;

    const result = getComparableResult(
      exportForTesting.calculateDHondt(
        data.given.groups,
        data.given.committeeSize
      )
    );

    expect(result).toEqual(data.expected);
  });

  test.each([
    [getDHondtTestDataStale1()],
    [getDHondtTestDataStale2()],
    [getDHondtTestDataStale3()],
  ])("D'Hondt test stale", (calculationTestData) => {
    const data = calculationTestData;

    const result = getComparableResult(
      exportForTesting.calculateDHondt(
        data.given.groups,
        data.given.committeeSize
      )
    );

    expect(result).toEqual(data.expected);
  });
});

function getComparableResult(
  result: CalculationMethodResult
): CalculationMethodResult {
  const order = result.order.map((order: CalculationGroupRatio) => {
    return {
      groupName: order.groupName,
      value: Number(order.value.toFixed(3)),
    };
  });
  return {
    ...result,
    order,
  };
}

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

// Data from an internal example
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

// Data from an internal example
function getDHondtTestDataNoStale3(): CalculationTestData {
  return {
    given: {
      committeeSize: 15,
      groups: [
        {
          name: "Partei A",
          seatsOrVotes: 37,
        },
        {
          name: "Partei B",
          seatsOrVotes: 34,
        },
        {
          name: "Partei C",
          seatsOrVotes: 9,
        },
      ],
    },
    expected: {
      distribution: {
        "Partei A": 7,
        "Partei B": 7,
        "Partei C": 1,
      },
      order: [
        {
          groupName: "Partei A",
          value: 37.0,
        },
        {
          groupName: "Partei B",
          value: 34.0,
        },
        {
          groupName: "Partei A",
          value: 18.5,
        },
        {
          groupName: "Partei B",
          value: 17.0,
        },
        {
          groupName: "Partei A",
          value: 12.333,
        },
        {
          groupName: "Partei B",
          value: 11.333,
        },
        {
          groupName: "Partei A",
          value: 9.25,
        },
        {
          groupName: "Partei C",
          value: 9.0,
        },
        {
          groupName: "Partei B",
          value: 8.5,
        },
        {
          groupName: "Partei A",
          value: 7.4,
        },
        {
          groupName: "Partei B",
          value: 6.8,
        },
        {
          groupName: "Partei A",
          value: 6.167,
        },
        {
          groupName: "Partei B",
          value: 5.667,
        },
        {
          groupName: "Partei A",
          value: 5.286,
        },
        {
          groupName: "Partei B",
          value: 4.857,
        },
      ],
      stale: undefined,
    },
  };
}

// Data from https://de.wikipedia.org/wiki/D%E2%80%99Hondt-Verfahren
function getDHondtTestDataNoStale4(): CalculationTestData {
  return {
    given: {
      committeeSize: 10,
      groups: [
        {
          name: "Partei A",
          seatsOrVotes: 416,
        },
        {
          name: "Partei B",
          seatsOrVotes: 335,
        },
        {
          name: "Partei C",
          seatsOrVotes: 160,
        },
        {
          name: "Partei D",
          seatsOrVotes: 89,
        },
      ],
    },
    expected: {
      distribution: {
        "Partei A": 4,
        "Partei B": 4,
        "Partei C": 1,
        "Partei D": 1,
      },
      order: [
        {
          groupName: "Partei A",
          value: 416.0,
        },
        {
          groupName: "Partei B",
          value: 335.0,
        },
        {
          groupName: "Partei A",
          value: 208.0,
        },
        {
          groupName: "Partei B",
          value: 167.5,
        },
        {
          groupName: "Partei C",
          value: 160.0,
        },
        {
          groupName: "Partei A",
          value: 138.667,
        },
        {
          groupName: "Partei B",
          value: 111.667,
        },
        {
          groupName: "Partei A",
          value: 104.0,
        },
        {
          groupName: "Partei D",
          value: 89.0,
        },
        {
          groupName: "Partei B",
          value: 83.75,
        },
      ],
      stale: undefined,
    },
  };
}

// Data from https://www.bundeswahlleiterin.de/service/glossar/d/d-hondtsche-sitzverteilung.html
function getDHondtTestDataStale1(): CalculationTestData {
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

// Data from an internal example
function getDHondtTestDataStale2(): CalculationTestData {
  return {
    given: {
      committeeSize: 14,
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
          seatsOrVotes: 4,
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
        {
          name: "Partei H",
          seatsOrVotes: 2,
        },
      ],
    },
    expected: {
      distribution: {
        "Partei A": 5,
        "Partei B": 4,
        "Partei C": 4,
        "Partei D": 0,
        "Partei E": 0,
        "Partei F": 0,
        "Partei G": 0,
        "Partei H": 0,
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
      ],
      stale: {
        groupNames: [
          "Partei A",
          "Partei B",
          "Partei D",
          "Partei E",
          "Partei F",
        ],
        amountSeats: 1,
        ratio: 4.0,
      },
    },
  };
}

// Data from an internal example
function getDHondtTestDataStale3(): CalculationTestData {
  return {
    given: {
      committeeSize: 7,
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
          seatsOrVotes: 8,
        },
        {
          name: "Partei E",
          seatsOrVotes: 4,
        },
        {
          name: "Partei F",
          seatsOrVotes: 3,
        },
        {
          name: "Partei G",
          seatsOrVotes: 2,
        },
      ],
    },
    expected: {
      distribution: {
        "Partei A": 2,
        "Partei B": 2,
        "Partei C": 2,
        "Partei D": 0,
        "Partei E": 0,
        "Partei F": 0,
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
      ],
      stale: {
        groupNames: ["Partei A", "Partei D"],
        amountSeats: 1,
        ratio: 8.0,
      },
    },
  };
}
