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
    [getDHondtTestDataNoStale5()],
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
      value: Math.floor(order.value * 1000) / 1000,
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
          value: 6.666,
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
          value: 6.166,
        },
        {
          groupName: "Partei B",
          value: 5.666,
        },
        {
          groupName: "Partei A",
          value: 5.285,
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
          value: 138.666,
        },
        {
          groupName: "Partei B",
          value: 111.666,
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

function getDHondtTestDataNoStale5(): CalculationTestData {
  return {
    given: {
      committeeSize: 252,
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
      ],
    },
    expected: {
      distribution: {
        "Partei A": 79,
        "Partei B": 66,
        "Partei C": 62,
        "Partei D": 19,
        "Partei E": 13,
        "Partei F": 13,
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
          value: 6.666,
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
        {
          groupName: "Partei A",
          value: 3.0,
        },
        {
          groupName: "Partei D",
          value: 3.0,
        },
        {
          groupName: "Partei B",
          value: 2.857,
        },
        {
          groupName: "Partei C",
          value: 2.714,
        },
        {
          groupName: "Partei A",
          value: 2.666,
        },
        {
          groupName: "Partei B",
          value: 2.5,
        },
        {
          groupName: "Partei A",
          value: 2.4,
        },
        {
          groupName: "Partei C",
          value: 2.375,
        },
        {
          groupName: "Partei B",
          value: 2.222,
        },
        {
          groupName: "Partei A",
          value: 2.181,
        },
        {
          groupName: "Partei C",
          value: 2.111,
        },
        {
          groupName: "Partei A",
          value: 2.0,
        },
        {
          groupName: "Partei B",
          value: 2.0,
        },
        {
          groupName: "Partei D",
          value: 2.0,
        },
        {
          groupName: "Partei E",
          value: 2.0,
        },
        {
          groupName: "Partei F",
          value: 2.0,
        },
        {
          groupName: "Partei C",
          value: 1.9,
        },
        {
          groupName: "Partei A",
          value: 1.846,
        },
        {
          groupName: "Partei B",
          value: 1.818,
        },
        {
          groupName: "Partei C",
          value: 1.727,
        },
        {
          groupName: "Partei A",
          value: 1.714,
        },
        {
          groupName: "Partei B",
          value: 1.666,
        },
        {
          groupName: "Partei A",
          value: 1.6,
        },
        {
          groupName: "Partei C",
          value: 1.583,
        },
        {
          groupName: "Partei B",
          value: 1.538,
        },
        {
          groupName: "Partei A",
          value: 1.5,
        },
        {
          groupName: "Partei D",
          value: 1.5,
        },
        {
          groupName: "Partei C",
          value: 1.461,
        },
        {
          groupName: "Partei B",
          value: 1.428,
        },
        {
          groupName: "Partei A",
          value: 1.411,
        },
        {
          groupName: "Partei C",
          value: 1.357,
        },
        {
          groupName: "Partei A",
          value: 1.333,
        },
        {
          groupName: "Partei B",
          value: 1.333,
        },
        {
          groupName: "Partei E",
          value: 1.333,
        },
        {
          groupName: "Partei F",
          value: 1.333,
        },
        {
          groupName: "Partei C",
          value: 1.266,
        },
        {
          groupName: "Partei A",
          value: 1.263,
        },
        {
          groupName: "Partei B",
          value: 1.25,
        },
        {
          groupName: "Partei A",
          value: 1.2,
        },
        {
          groupName: "Partei D",
          value: 1.2,
        },
        {
          groupName: "Partei C",
          value: 1.187,
        },
        {
          groupName: "Partei B",
          value: 1.176,
        },
        {
          groupName: "Partei A",
          value: 1.142,
        },
        {
          groupName: "Partei C",
          value: 1.117,
        },
        {
          groupName: "Partei B",
          value: 1.111,
        },
        {
          groupName: "Partei A",
          value: 1.09,
        },
        {
          groupName: "Partei C",
          value: 1.055,
        },
        {
          groupName: "Partei B",
          value: 1.052,
        },
        {
          groupName: "Partei A",
          value: 1.043,
        },
        {
          groupName: "Partei A",
          value: 1.0,
        },
        {
          groupName: "Partei B",
          value: 1.0,
        },
        {
          groupName: "Partei C",
          value: 1.0,
        },
        {
          groupName: "Partei D",
          value: 1.0,
        },
        {
          groupName: "Partei E",
          value: 1.0,
        },
        {
          groupName: "Partei F",
          value: 1.0,
        },
        {
          groupName: "Partei A",
          value: 0.96,
        },
        {
          groupName: "Partei B",
          value: 0.952,
        },
        {
          groupName: "Partei C",
          value: 0.95,
        },
        {
          groupName: "Partei A",
          value: 0.923,
        },
        {
          groupName: "Partei B",
          value: 0.909,
        },
        {
          groupName: "Partei C",
          value: 0.904,
        },
        {
          groupName: "Partei A",
          value: 0.888,
        },
        {
          groupName: "Partei B",
          value: 0.869,
        },
        {
          groupName: "Partei C",
          value: 0.863,
        },
        {
          groupName: "Partei A",
          value: 0.857,
        },
        {
          groupName: "Partei D",
          value: 0.857,
        },
        {
          groupName: "Partei B",
          value: 0.833,
        },
        {
          groupName: "Partei A",
          value: 0.827,
        },
        {
          groupName: "Partei C",
          value: 0.826,
        },
        {
          groupName: "Partei A",
          value: 0.8,
        },
        {
          groupName: "Partei B",
          value: 0.8,
        },
        {
          groupName: "Partei E",
          value: 0.8,
        },
        {
          groupName: "Partei F",
          value: 0.8,
        },
        {
          groupName: "Partei C",
          value: 0.791,
        },
        {
          groupName: "Partei A",
          value: 0.774,
        },
        {
          groupName: "Partei B",
          value: 0.769,
        },
        {
          groupName: "Partei C",
          value: 0.76,
        },
        {
          groupName: "Partei A",
          value: 0.75,
        },
        {
          groupName: "Partei D",
          value: 0.75,
        },
        {
          groupName: "Partei B",
          value: 0.74,
        },
        {
          groupName: "Partei C",
          value: 0.73,
        },
        {
          groupName: "Partei A",
          value: 0.727,
        },
        {
          groupName: "Partei B",
          value: 0.714,
        },
        {
          groupName: "Partei A",
          value: 0.705,
        },
        {
          groupName: "Partei C",
          value: 0.703,
        },
        {
          groupName: "Partei B",
          value: 0.689,
        },
        {
          groupName: "Partei A",
          value: 0.685,
        },
        {
          groupName: "Partei C",
          value: 0.678,
        },
        {
          groupName: "Partei A",
          value: 0.666,
        },
        {
          groupName: "Partei B",
          value: 0.666,
        },
        {
          groupName: "Partei D",
          value: 0.666,
        },
        {
          groupName: "Partei E",
          value: 0.666,
        },
        {
          groupName: "Partei F",
          value: 0.666,
        },
        {
          groupName: "Partei C",
          value: 0.655,
        },
        {
          groupName: "Partei A",
          value: 0.648,
        },
        {
          groupName: "Partei B",
          value: 0.645,
        },
        {
          groupName: "Partei C",
          value: 0.633,
        },
        {
          groupName: "Partei A",
          value: 0.631,
        },
        {
          groupName: "Partei B",
          value: 0.625,
        },
        {
          groupName: "Partei A",
          value: 0.615,
        },
        {
          groupName: "Partei C",
          value: 0.612,
        },
        {
          groupName: "Partei B",
          value: 0.606,
        },
        {
          groupName: "Partei A",
          value: 0.6,
        },
        {
          groupName: "Partei D",
          value: 0.6,
        },
        {
          groupName: "Partei C",
          value: 0.593,
        },
        {
          groupName: "Partei B",
          value: 0.588,
        },
        {
          groupName: "Partei A",
          value: 0.585,
        },
        {
          groupName: "Partei C",
          value: 0.575,
        },
        {
          groupName: "Partei A",
          value: 0.571,
        },
        {
          groupName: "Partei B",
          value: 0.571,
        },
        {
          groupName: "Partei E",
          value: 0.571,
        },
        {
          groupName: "Partei F",
          value: 0.571,
        },
        {
          groupName: "Partei C",
          value: 0.558,
        },
        {
          groupName: "Partei A",
          value: 0.558,
        },
        {
          groupName: "Partei B",
          value: 0.555,
        },
        {
          groupName: "Partei A",
          value: 0.545,
        },
        {
          groupName: "Partei D",
          value: 0.545,
        },
        {
          groupName: "Partei C",
          value: 0.542,
        },
        {
          groupName: "Partei B",
          value: 0.54,
        },
        {
          groupName: "Partei A",
          value: 0.533,
        },
        {
          groupName: "Partei C",
          value: 0.527,
        },
        {
          groupName: "Partei B",
          value: 0.526,
        },
        {
          groupName: "Partei A",
          value: 0.521,
        },
        {
          groupName: "Partei C",
          value: 0.513,
        },
        {
          groupName: "Partei B",
          value: 0.512,
        },
        {
          groupName: "Partei A",
          value: 0.51,
        },
        {
          groupName: "Partei A",
          value: 0.5,
        },
        {
          groupName: "Partei B",
          value: 0.5,
        },
        {
          groupName: "Partei C",
          value: 0.5,
        },
        {
          groupName: "Partei D",
          value: 0.5,
        },
        {
          groupName: "Partei E",
          value: 0.5,
        },
        {
          groupName: "Partei F",
          value: 0.5,
        },
        {
          groupName: "Partei A",
          value: 0.489,
        },
        {
          groupName: "Partei B",
          value: 0.487,
        },
        {
          groupName: "Partei C",
          value: 0.487,
        },
        {
          groupName: "Partei A",
          value: 0.48,
        },
        {
          groupName: "Partei B",
          value: 0.476,
        },
        {
          groupName: "Partei C",
          value: 0.475,
        },
        {
          groupName: "Partei A",
          value: 0.47,
        },
        {
          groupName: "Partei B",
          value: 0.465,
        },
        {
          groupName: "Partei C",
          value: 0.463,
        },
        {
          groupName: "Partei A",
          value: 0.461,
        },
        {
          groupName: "Partei D",
          value: 0.461,
        },
        {
          groupName: "Partei B",
          value: 0.454,
        },
        {
          groupName: "Partei A",
          value: 0.452,
        },
        {
          groupName: "Partei C",
          value: 0.452,
        },
        {
          groupName: "Partei A",
          value: 0.444,
        },
        {
          groupName: "Partei B",
          value: 0.444,
        },
        {
          groupName: "Partei E",
          value: 0.444,
        },
        {
          groupName: "Partei F",
          value: 0.444,
        },
        {
          groupName: "Partei C",
          value: 0.441,
        },
        {
          groupName: "Partei A",
          value: 0.436,
        },
        {
          groupName: "Partei B",
          value: 0.434,
        },
        {
          groupName: "Partei C",
          value: 0.431,
        },
        {
          groupName: "Partei A",
          value: 0.428,
        },
        {
          groupName: "Partei D",
          value: 0.428,
        },
        {
          groupName: "Partei B",
          value: 0.425,
        },
        {
          groupName: "Partei C",
          value: 0.422,
        },
        {
          groupName: "Partei A",
          value: 0.421,
        },
        {
          groupName: "Partei B",
          value: 0.416,
        },
        {
          groupName: "Partei A",
          value: 0.413,
        },
        {
          groupName: "Partei C",
          value: 0.413,
        },
        {
          groupName: "Partei B",
          value: 0.408,
        },
        {
          groupName: "Partei A",
          value: 0.406,
        },
        {
          groupName: "Partei C",
          value: 0.404,
        },
        {
          groupName: "Partei A",
          value: 0.4,
        },
        {
          groupName: "Partei B",
          value: 0.4,
        },
        {
          groupName: "Partei D",
          value: 0.4,
        },
        {
          groupName: "Partei E",
          value: 0.4,
        },
        {
          groupName: "Partei F",
          value: 0.4,
        },
        {
          groupName: "Partei C",
          value: 0.395,
        },
        {
          groupName: "Partei A",
          value: 0.393,
        },
        {
          groupName: "Partei B",
          value: 0.392,
        },
        {
          groupName: "Partei C",
          value: 0.387,
        },
        {
          groupName: "Partei A",
          value: 0.387,
        },
        {
          groupName: "Partei B",
          value: 0.384,
        },
        {
          groupName: "Partei A",
          value: 0.38,
        },
        {
          groupName: "Partei C",
          value: 0.38,
        },
        {
          groupName: "Partei B",
          value: 0.377,
        },
        {
          groupName: "Partei A",
          value: 0.375,
        },
        {
          groupName: "Partei D",
          value: 0.375,
        },
        {
          groupName: "Partei C",
          value: 0.372,
        },
        {
          groupName: "Partei B",
          value: 0.37,
        },
        {
          groupName: "Partei A",
          value: 0.369,
        },
        {
          groupName: "Partei C",
          value: 0.365,
        },
        {
          groupName: "Partei A",
          value: 0.363,
        },
        {
          groupName: "Partei B",
          value: 0.363,
        },
        {
          groupName: "Partei E",
          value: 0.363,
        },
        {
          groupName: "Partei F",
          value: 0.363,
        },
        {
          groupName: "Partei C",
          value: 0.358,
        },
        {
          groupName: "Partei A",
          value: 0.358,
        },
        {
          groupName: "Partei B",
          value: 0.357,
        },
        {
          groupName: "Partei A",
          value: 0.352,
        },
        {
          groupName: "Partei D",
          value: 0.352,
        },
        {
          groupName: "Partei C",
          value: 0.351,
        },
        {
          groupName: "Partei B",
          value: 0.35,
        },
        {
          groupName: "Partei A",
          value: 0.347,
        },
        {
          groupName: "Partei C",
          value: 0.345,
        },
        {
          groupName: "Partei B",
          value: 0.344,
        },
        {
          groupName: "Partei A",
          value: 0.342,
        },
        {
          groupName: "Partei C",
          value: 0.339,
        },
        {
          groupName: "Partei B",
          value: 0.338,
        },
        {
          groupName: "Partei A",
          value: 0.338,
        },
        {
          groupName: "Partei A",
          value: 0.333,
        },
        {
          groupName: "Partei B",
          value: 0.333,
        },
        {
          groupName: "Partei C",
          value: 0.333,
        },
        {
          groupName: "Partei D",
          value: 0.333,
        },
        {
          groupName: "Partei E",
          value: 0.333,
        },
        {
          groupName: "Partei F",
          value: 0.333,
        },
        {
          groupName: "Partei A",
          value: 0.328,
        },
        {
          groupName: "Partei B",
          value: 0.327,
        },
        {
          groupName: "Partei C",
          value: 0.327,
        },
        {
          groupName: "Partei A",
          value: 0.324,
        },
        {
          groupName: "Partei B",
          value: 0.322,
        },
        {
          groupName: "Partei C",
          value: 0.322,
        },
        {
          groupName: "Partei A",
          value: 0.32,
        },
        {
          groupName: "Partei B",
          value: 0.317,
        },
        {
          groupName: "Partei C",
          value: 0.316,
        },
        {
          groupName: "Partei A",
          value: 0.315,
        },
        {
          groupName: "Partei D",
          value: 0.315,
        },
        {
          groupName: "Partei B",
          value: 0.312,
        },
        {
          groupName: "Partei A",
          value: 0.311,
        },
        {
          groupName: "Partei C",
          value: 0.311,
        },
        {
          groupName: "Partei A",
          value: 0.307,
        },
        {
          groupName: "Partei B",
          value: 0.307,
        },
        {
          groupName: "Partei E",
          value: 0.307,
        },
        {
          groupName: "Partei F",
          value: 0.307,
        },
        {
          groupName: "Partei C",
          value: 0.306,
        },
        {
          groupName: "Partei A",
          value: 0.303,
        },
        {
          groupName: "Partei B",
          value: 0.303,
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
          value: 6.666,
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
