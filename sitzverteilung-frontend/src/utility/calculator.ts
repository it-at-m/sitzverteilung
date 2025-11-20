import type { BaseData } from "@/types/basedata/BaseData.ts";
import type { GroupIndex } from "@/types/basedata/Union.ts";
import type {
  CalculationGroup,
  CalculationGroupName,
} from "@/types/calculation/CalculationGroup.ts";
import type { CalculationGroupRatio } from "@/types/calculation/internal/CalculationGroupRatio.ts";
import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationProportions } from "@/types/calculation/internal/CalculationProportions.ts";
import type { CalculationResult } from "@/types/calculation/internal/CalculationResult.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { CalculationStale } from "@/types/calculation/internal/CalculationStale.ts";
import type { CalculationValidation } from "@/types/calculation/internal/CalculationValidation.ts";

import { UNION_TYPE_PREFIXES, UnionType } from "@/types/basedata/Union.ts";
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
  const targetCommitteeSize = baseData.targetSize;
  if (targetCommitteeSize === undefined || targetCommitteeSize <= 0) {
    throw new Error("Invalid or missing target size. Must be positive.");
  }
  const calculationGroups = extractCalculationGroups(baseData);
  const seats = calculationGroups.reduce(
    (acc, group) => {
      acc[group.name] = group.seatsOrVotes;
      return acc;
    },
    {} as Record<CalculationGroupName, number>
  );
  const proportions = calculateProportions(
    calculationGroups,
    targetCommitteeSize
  );
  const calculationGroupsWithoutCommittees = extractCalculationGroups(
    baseData,
    false
  );

  const methods: Partial<Record<CalculationMethod, CalculationMethodResult>> =
    {};
  AVAILABLE_METHODS.forEach((method) => {
    methods[method] = calculateMethod(
      method,
      calculationGroups,
      calculationGroupsWithoutCommittees,
      proportions,
      targetCommitteeSize
    );
  });

  return {
    seats,
    proportions,
    methods,
  };
}

/**
 * Extracts CalculationGroups from BaseData relevant for further calculation.
 *
 * @param baseData
 * @param includeCommitteeUnions whether to include committee unions in the CalculationGroups or split members into standalone groups
 */
function extractCalculationGroups(
  baseData: BaseData,
  includeCommitteeUnions = true
): CalculationGroup[] {
  const groupIndexesInUnion = new Set<GroupIndex>();
  const unions = includeCommitteeUnions
    ? baseData.unions
    : baseData.unions.filter(
        (union) => union.unionType !== UnionType.COMMITTEE
      );
  const unionCalculationGroups: CalculationGroup[] = unions.map((union) => {
    return {
      name: `${UNION_TYPE_PREFIXES[union.unionType]}${union.name}`,
      seatsOrVotes: union.groups
        .map((groupIndex) => {
          if (groupIndex < 0 || groupIndex >= baseData.groups.length) {
            throw new Error(
              `Union "${union.name}" references invalid group index ${groupIndex}.`
            );
          }
          groupIndexesInUnion.add(groupIndex);
          return baseData.groups[groupIndex];
        })
        .reduce((sum, group) => sum + (group?.seatsOrVotes ?? 0), 0),
    };
  });
  const singleCalculationGroups: CalculationGroup[] = baseData.groups
    .filter((_, index) => !groupIndexesInUnion.has(index))
    .map((singleGroup) => {
      return {
        name: singleGroup.name,
        seatsOrVotes: singleGroup.seatsOrVotes,
      } as CalculationGroup;
    });
  const calculationGroups = [
    ...singleCalculationGroups,
    ...unionCalculationGroups,
  ];
  const names = new Set(calculationGroups.map((g) => g.name));
  if (names.size !== calculationGroups.length) {
    throw new Error(
      "Calculation group names must be unique across singles and unions."
    );
  }
  return calculationGroups;
}

/**
 * Wrapper method to calculate all data for a specific method.
 *
 * @param method the method to calculate
 * @param calculationGroups calculation input data
 * @param calculationGroupsWithoutCommittees calculation input data used to calculate validations dependent on committee unions
 * @param proportions pre-calculated proportions for the calculation groups
 * @param committeeSize target committee size
 */
function calculateMethod(
  method: CalculationMethod,
  calculationGroups: CalculationGroup[],
  calculationGroupsWithoutCommittees: CalculationGroup[],
  proportions: CalculationProportions,
  committeeSize: number
): CalculationMethodResult {
  if (calculationGroups.length === 0) {
    throw new Error("calculationGroups cannot be empty");
  }
  if (calculationGroups.some((group) => group.seatsOrVotes <= 0)) {
    throw new Error("All groups must have positive seatsOrVotes");
  }
  if (committeeSize <= 0) {
    throw new Error("committeeSize must be positive");
  }
  let result: CalculationMethodResult;
  let resultWithoutCommittees: CalculationMethodResult;
  switch (method) {
    case CalculationMethod.D_HONDT:
      result = calculateDHondt(calculationGroups, committeeSize);
      resultWithoutCommittees = calculateDHondt(
        calculationGroupsWithoutCommittees,
        committeeSize
      );
      break;
    case CalculationMethod.SAINTE_LAGUE_SCHEPERS:
      result = calculateSainteLagueSchepers(calculationGroups, committeeSize);
      resultWithoutCommittees = calculateSainteLagueSchepers(
        calculationGroupsWithoutCommittees,
        committeeSize
      );
      break;
    case CalculationMethod.HARE_NIEMEYER:
      result = calculateHareNiemeyer(calculationGroups, committeeSize);
      resultWithoutCommittees = calculateHareNiemeyer(
        calculationGroupsWithoutCommittees,
        committeeSize
      );
      break;
    default:
      throw new Error("CalculationMethod not implemented yet.");
  }

  result.validation = calculateMethodValidity(
    calculationGroups,
    proportions,
    result.distribution,
    resultWithoutCommittees.distribution,
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
  if (totalSeatsOrVotes <= 0) {
    throw new Error("totalSeatsOrVotes must be positive.");
  }
  const remainders: CalculationGroupRatio[] = [];
  calculationGroups.forEach((group) => {
    const exactQuota = (committeeSize * group.seatsOrVotes) / totalSeatsOrVotes;
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
  const seatsInOrder = committeeSize - (stale?.amountSeats ?? 0);
  const { order } = calculateDHondt(dHondtCalculationGroups, seatsInOrder);

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

    const affectedGroupNames = topRatios
      .filter((r) => r.value === ratioValue)
      .map((r) => r.groupName);
    for (const groupName of affectedGroupNames) {
      if (seatDistribution[groupName] !== undefined) {
        seatDistribution[groupName]--;
      }
    }
    if (seatOrder) {
      const firstOrder = seatOrder.findIndex((r) => r.value === ratioValue);
      seatOrder.splice(firstOrder, stale.amountSeats);
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
  if (calculationGroups.length === 0) {
    throw new Error("calculationGroups cannot be empty");
  }
  if (committeeSize <= 0) {
    throw new Error("committeeSize must be positive");
  }
  const totalSeatsOrVotes = calculationGroups.reduce(
    (partialSum, calculationGroup) =>
      partialSum + calculationGroup.seatsOrVotes,
    0
  );
  if (totalSeatsOrVotes <= 0) {
    throw new Error(
      "totalSeatsOrVotes must be positive to compute proportions"
    );
  }
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
 *
 * @param calculationGroups calculation data used to calculate the specific method
 * @param proportions pre-calculated proportions for the calculation groups
 * @param distribution seat distribution returned by the specific calculation method
 * @param distributionWithoutCommittees seat distribution returned by the specific calculation method when calculating without committee unions
 * @param stale optional stale to respect when calculating the over rounding
 */
function calculateMethodValidity(
  calculationGroups: CalculationGroup[],
  proportions: CalculationProportions,
  distribution: CalculationSeatDistribution,
  distributionWithoutCommittees: CalculationSeatDistribution,
  stale?: CalculationStale
): CalculationValidation {
  return calculationGroups.reduce(
    (validation: CalculationValidation, currentObj: CalculationGroup) => {
      const groupName = currentObj.name;
      const distributedSeats = distribution[groupName] ?? 0;
      const distributedSeatsWithoutCommittees =
        distributionWithoutCommittees[groupName] ?? 0;
      validation[groupName] = {
        overRounding: checkOverroundingForGroup(
          groupName,
          proportions,
          distributedSeats,
          stale
        ),
        lostSafeSeat: checkLostSafeSeatForGroup(
          distributedSeats,
          distributedSeatsWithoutCommittees
        ),
        committeeInvalid: [], // TODO will be done in a later PR
      };
      return validation;
    },
    {}
  );
}

/**
 * Checks whether overrounding happened during the calculation of a method.
 * This is the case, when the difference between distributed seats (plus pending seats by stale situations) and proportional seats is less than 1.
 *
 * @param groupName groupName to check
 * @param proportions proportions pre-calculated for given calculation groups
 * @param distributedSeats seats distributed to the specified group
 * @param stale optional stale to consider for checking
 */
function checkOverroundingForGroup(
  groupName: CalculationGroupName,
  proportions: CalculationProportions,
  distributedSeats: number,
  stale?: CalculationStale
): boolean {
  const staleSeats = stale?.groupNames.includes(groupName) ? 1 : 0;
  const seats = distributedSeats + staleSeats;
  const proportion = proportions[groupName];
  if (proportion === undefined) {
    throw new Error("Missing proportion, cannot check for overrounding.");
  }
  return Math.abs(proportion - seats) > 0.99;
}

/**
 * Checks whether the safe seat was lost to a committee union during the calculation of a method.
 * This is the case when at least one seat was distributed when calculated without committees, but no seat is distributed with them.
 *
 * @param distributedSeats
 * @param distributedSeatsWithoutCommittees
 */
function checkLostSafeSeatForGroup(
  distributedSeats: number,
  distributedSeatsWithoutCommittees: number
) {
  return distributedSeatsWithoutCommittees > 0 && distributedSeats === 0;
}

export const exportForTesting = {
  calculateDHondt,
  calculateHareNiemeyer,
  calculateSainteLagueSchepers,
  checkOverroundingForGroup,
  checkLostSafeSeatForGroup,
  calculateProportions,
  extractCalculationGroups,
};
