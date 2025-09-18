import type { BaseData } from "@/types/basedata/BaseData.ts";
import type { GroupIndex } from "@/types/basedata/Union.ts";
import type { CalculationGroup } from "@/types/calculation/internal/CalculationGroup.ts";
import type { CalculationGroupRatio } from "@/types/calculation/internal/CalculationGroupRatio.ts";
import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationProportions } from "@/types/calculation/internal/CalculationProportions.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { CalculationStale } from "@/types/calculation/internal/CalculationStale.ts";
import type { CalculationValidation } from "@/types/calculation/internal/CalculationValidation.ts";

import {
  AVAILABLE_METHODS,
  CalculationMethod,
} from "@/types/calculation/CalculationMethod.ts";

/**
 * Executes a complete calculation.
 *
 * @param baseData input data to use for calculation
 */
export function calculate(baseData: BaseData): CalculationResult {
  const committeeSize = baseData.targetSize;
  if (committeeSize === undefined) {
    throw new Error(
      "Cannot execute calculation because target size is missing."
    );
  }
  const calculationGroups = extractCalculationGroups(baseData);
  const proportions = calculateProportions(calculationGroups, committeeSize);

  const methods: Partial<Record<CalculationMethod, CalculationMethodResult>> =
    {};
  AVAILABLE_METHODS.forEach((method) => {
    methods[method] = calculateMethod(
      method,
      calculationGroups,
      proportions,
      committeeSize
    );
  });

  return {
    proportions,
    methods,
  };
}

/**
 * Extracts CalculationGroups from BaseData relevant for further calculation.
 *
 * @param baseData
 */
function extractCalculationGroups(baseData: BaseData): CalculationGroup[] {
  const groupIndexesInUnion = new Set<GroupIndex>();
  const unionCalculationGroups: CalculationGroup[] = baseData.unions.map(
    (union) => {
      return {
        name: union.name,
        seatsOrVotes: union.groups
          .map((groupIndex) => {
            groupIndexesInUnion.add(groupIndex);
            return baseData.groups[groupIndex];
          })
          .reduce((sum, group) => sum + (group?.seatsOrVotes ?? 0), 0),
      };
    }
  );
  const singleCalculationGroups: CalculationGroup[] = baseData.groups
    .filter((_, index) => !groupIndexesInUnion.has(index))
    .map((singleGroup) => {
      return {
        name: singleGroup.name,
        seatsOrVotes: singleGroup.seatsOrVotes,
      } as CalculationGroup;
    });
  return [...singleCalculationGroups, ...unionCalculationGroups];
}

/**
 * Wrapper method to calculate all data for a specific method.
 *
 * @param method the method to calculate
 * @param calculationGroups calculation data
 * @param proportions pre-calculated proportions for the calculation groups
 * @param committeeSize target committee size
 */
function calculateMethod(
  method: CalculationMethod,
  calculationGroups: CalculationGroup[],
  proportions: CalculationProportions,
  committeeSize: number
): CalculationMethodResult {
  if (calculationGroups.length === 0) {
    throw new Error("calculationGroups cannot be empty");
  }
  if (committeeSize <= 0) {
    throw new Error("committeeSize must be positive");
  }
  if (calculationGroups.some((group) => group.seatsOrVotes <= 0)) {
    throw new Error("All groups must have positive seatsOrVotes");
  }
  let result: CalculationMethodResult;
  switch (method) {
    case CalculationMethod.D_HONDT:
      result = calculateDHondt(calculationGroups, committeeSize);
      break;
    case CalculationMethod.SAINTE_LAGUE_SCHEPERS:
      result = calculateSainteLagueSchepers(calculationGroups, committeeSize);
      break;
    case CalculationMethod.HARE_NIEMEYER:
      result = calculateHareNiemeyer(calculationGroups, committeeSize);
      break;
  }

  result.validation = calculateMethodValidity(
    calculationGroups,
    proportions,
    result.distribution,
    result.stale
  );

  return result;
}

/**
 * D'Hondt calculation.
 *
 * @param calculationGroups calculation data
 * @param committeeSize target committee size
 */
function calculateDHondt(
  calculationGroups: CalculationGroup[],
  committeeSize: number
): CalculationMethodResult {
  const { distribution, order, ratios, topRatios } = calculateDivisorMethod(
    calculationGroups,
    committeeSize,
    (step) => step + 1 // D'Hondt divisors: 1, 2, 3, ...
  );

  // Check for stale
  const stale = handleStaleSituation(ratios, topRatios, distribution, order);

  return {
    distribution,
    order,
    stale,
  };
}

/**
 * Sainte-Lague/Schepers calculation.
 *
 * @param calculationGroups calculation data
 * @param committeeSize target committee size
 */
function calculateSainteLagueSchepers(
  calculationGroups: CalculationGroup[],
  committeeSize: number
): CalculationMethodResult {
  const { distribution, order, ratios, topRatios } = calculateDivisorMethod(
    calculationGroups,
    committeeSize,
    (step) => step * 2 + 1 // Sainte-Lague/Schepers divisors: 1, 3, 5, ...
  );

  // Check for stale
  const stale = handleStaleSituation(ratios, topRatios, distribution, order);

  return {
    distribution,
    order,
    stale,
  };
}

/**
 * Hare-Niemeyer calculation, seat order via D'Hondt.
 *
 * @param calculationGroups calculation data
 * @param committeeSize target committee size
 */
function calculateHareNiemeyer(
  calculationGroups: CalculationGroup[],
  committeeSize: number
): CalculationMethodResult {
  const seatDistribution: CalculationSeatDistribution = {};

  // Initialize distributions with 0 seats for every group
  calculationGroups.forEach((group) => (seatDistribution[group.name] = 0));

  // Calculate hare quotas and assign whole seats
  const totalSeatsOrVotes = calculationGroups.reduce(
    (sum, group) => sum + group.seatsOrVotes,
    0
  );
  const remainders: CalculationGroupRatio[] = [];
  calculationGroups.forEach((group) => {
    const exactQuota = (group.seatsOrVotes * committeeSize) / totalSeatsOrVotes;
    const seats = Math.floor(exactQuota);
    seatDistribution[group.name] = seats;
    remainders.push({
      groupName: group.name,
      value: exactQuota - seats,
    });
  });

  // Check remaining seats to assign
  const assignedSeats = Object.values(seatDistribution).reduce(
    (sum, seats) => sum + seats,
    0
  );
  const remainingSeats = committeeSize - assignedSeats;

  // Sort remainders descending
  remainders.sort((a, b) => b.value - a.value);

  // Assign remaining seats based on highest remainders
  const topRemainders = remainders.slice(0, remainingSeats);
  topRemainders.forEach((remainder) => {
    const groupName = remainder.groupName;
    if (seatDistribution[groupName] !== undefined) {
      seatDistribution[groupName]++;
    }
  });

  // Check for stale situation
  let stale: CalculationStale | undefined = undefined;
  if (remainingSeats > 0) {
    stale = handleStaleSituation(remainders, topRemainders, seatDistribution);
  }

  // Calculate D'Hondt seat order using Hare/Niemeyer distribution
  const dHondtCalculationGroups: CalculationGroup[] = Object.entries(
    seatDistribution
  ).map(([groupName, value]) => {
    return {
      name: groupName,
      seatsOrVotes: value,
    };
  });
  const { order } = calculateDHondt(dHondtCalculationGroups, committeeSize);

  return {
    distribution: seatDistribution,
    order,
    stale,
  };
}

/**
 * Generous method to calculate divisor based methods (e.g. D'Hondt, Sainte/Lague).
 *
 * @param calculationGroups calculation data
 * @param committeeSize size of the target committee
 * @param divisorFn function that calculates the increasing divisors
 */
function calculateDivisorMethod(
  calculationGroups: CalculationGroup[],
  committeeSize: number,
  divisorFn: (step: number) => number
): {
  distribution: CalculationSeatDistribution;
  order: CalculationSeatOrder;
  ratios: CalculationGroupRatio[];
  topRatios: CalculationGroupRatio[];
} {
  const seatDistribution: CalculationSeatDistribution = {};
  const seatOrder: CalculationSeatOrder = [];

  // Initialize with 0 seats
  calculationGroups.forEach((group) => {
    seatDistribution[group.name] = 0;
  });

  // Generate ratios using the divisor rule
  const ratios: CalculationGroupRatio[] = [];
  calculationGroups.forEach((group) => {
    for (let i = 0; i < committeeSize; i++) {
      ratios.push({
        groupName: group.name,
        value: group.seatsOrVotes / divisorFn(i),
      });
    }
  });

  // Sort ratios in descending order
  ratios.sort((a, b) => b.value - a.value);
  const topRatios = ratios.slice(0, committeeSize);

  // Allocate seats & build order
  topRatios.forEach((ratio) => {
    const groupName = ratio.groupName;
    if (seatDistribution[groupName] !== undefined) {
      seatDistribution[groupName]++;
    }
    seatOrder.push(ratio);
  });

  // Return raw results; stale check is done outside
  return {
    distribution: seatDistribution,
    order: seatOrder,
    ratios,
    topRatios,
  };
}

/**
 * Checks if a stale situation in the method calculation occured.
 *
 * @param sortedRatios all calculated ratios by the specific method
 * @param topRatios only the kept ratios by the specific method
 * @param seatDistribution calculated seat distribution
 * @param seatOrder calculated seat order
 */
function handleStaleSituation(
  sortedRatios: CalculationGroupRatio[],
  topRatios: CalculationGroupRatio[],
  seatDistribution: CalculationSeatDistribution,
  seatOrder?: CalculationSeatOrder
): CalculationStale | undefined {
  let stale: CalculationStale | undefined = undefined;

  const ratioValue = topRatios[topRatios.length - 1]?.value;
  if (ratioValue === undefined) return stale;

  const potentialStales = sortedRatios.filter((r) => r.value === ratioValue);
  const potentialStalesInTop = topRatios.filter((r) => r.value === ratioValue);
  const unresolvedSeats = potentialStales.length - potentialStalesInTop.length;

  if (unresolvedSeats > 0) {
    stale = {
      groupNames: Array.from(new Set(potentialStales.map((r) => r.groupName))),
      amountSeats: potentialStalesInTop.length,
      ratio: ratioValue,
    };

    let toRemove = unresolvedSeats;
    if (seatOrder) {
      for (let i = seatOrder.length - 1; i >= 0 && toRemove > 0; i--) {
        const order = seatOrder[i];
        if (order && order.value === ratioValue) {
          const groupName = order.groupName;
          if (seatDistribution[groupName] !== undefined) {
            seatDistribution[groupName]--;
          }
          seatOrder.splice(i, 1);
          toRemove--;
        }
      }
    } else {
      for (const item of [...topRatios].reverse()) {
        if (item.value === ratioValue && toRemove > 0) {
          const groupName = item.groupName;
          if (seatDistribution[groupName] !== undefined) {
            seatDistribution[groupName]--;
          }
          toRemove--;
        }
      }
    }
  }

  return stale;
}

/**
 * Calculates proportional seats for every calculation group.
 *
 * @param calculationGroups calculation data
 * @param committeeSize size of the target committee
 */
function calculateProportions(
  calculationGroups: CalculationGroup[],
  committeeSize: number
): CalculationProportions {
  const totalSeatsOrVotes = calculationGroups.reduce(
    (partialSum, calculationGroup) =>
      partialSum + calculationGroup.seatsOrVotes,
    0
  );
  const divisor = totalSeatsOrVotes / committeeSize;
  return calculationGroups.reduce(
    (obj: CalculationProportions, group: CalculationGroup) => {
      obj[group.name] = group.seatsOrVotes / divisor;
      return obj;
    },
    {}
  );
}

/**
 * Checks whether the calculation of a method is valid.
 * This is the case, when the difference between distributed seats (plus pending seats by stale situations) and proportional seats is less than 1.
 *
 * @param calculationGroups calculation data used to calculate the specific method
 * @param proportions pre-calculated proportions for the calculation groups
 * @param distribution seat distribution returned by the specific calculation method
 * @param stale optional stale to respect when calculating the over rounding
 */
function calculateMethodValidity(
  calculationGroups: CalculationGroup[],
  proportions: CalculationProportions,
  distribution: CalculationSeatDistribution,
  stale?: CalculationStale
): CalculationValidation {
  return calculationGroups.reduce(
    (obj: CalculationValidation, currentObj: CalculationGroup) => {
      const groupName = currentObj.name;
      const distributedSeats = distribution[groupName] ?? 0;
      const staleSeats = stale?.groupNames.includes(groupName) ? 1 : 0;
      const seats = distributedSeats + staleSeats;
      const proportion = proportions[groupName];
      if (proportion !== undefined) {
        obj[currentObj.name] = Math.abs(proportion - seats) <= 0.99;
      }
      return obj;
    },
    {}
  );
}

export const exportForTesting = {
  calculateDHondt,
  calculateHareNiemeyer,
  calculateSainteLagueSchepers,
  calculateMethodValidity,
  calculateProportions,
  extractCalculationGroups,
};
