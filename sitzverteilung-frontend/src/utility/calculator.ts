import type { CalculationGroup } from "@/types/calculation/internal/CalculationGroup.ts";
import type { CalculationGroupRatio } from "@/types/calculation/internal/CalculationGroupRatio.ts";
import type { CalculationMethodResult } from "@/types/calculation/internal/CalculationMethodResult.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";
import type { CalculationStale } from "@/types/calculation/internal/CalculationStale.ts";

import { CalculationMethod } from "@/types/calculation/CalculationMethod.ts";

function calculateMethod(
  method: CalculationMethod,
  calculationGroups: CalculationGroup[],
  committeeSize: number
): CalculationMethodResult | undefined {
  if (calculationGroups.length === 0) {
    throw new Error("calculationGroups cannot be empty");
  }
  if (committeeSize <= 0) {
    throw new Error("committeeSize must be positive");
  }
  if (calculationGroups.some((group) => group.seatsOrVotes <= 0)) {
    throw new Error("All groups must have positive seatsOrVotes");
  }
  switch (method) {
    case CalculationMethod.D_HONDT:
      return calculateDHondt(calculationGroups, committeeSize);
    case CalculationMethod.HARE_NIEMEYER:
      return calculateHareNiemeyer(calculationGroups, committeeSize);
    case CalculationMethod.SAINTE_LAGUE_SCHEPERS:
      throw new Error("Not implemented yet");
  }
}

function calculateDHondt(
  calculationGroups: CalculationGroup[],
  committeeSize: number
): CalculationMethodResult {
  const seatDistribution: CalculationSeatDistribution = {};
  const seatOrder: CalculationSeatOrder = [];

  // Initialize distributions with 0 seats for every group
  calculationGroups.forEach((group) => (seatDistribution[group.name] = 0));

  // Calculate ratios using increasing divisors
  const ratios: CalculationGroupRatio[] = [];
  calculationGroups.forEach((group) => {
    for (let i = 1; i <= committeeSize; i++) {
      ratios.push({
        groupName: group.name,
        value: group.seatsOrVotes / i,
      });
    }
  });

  // Sort ratios descending (to get assignment order)
  ratios.sort((a, b) => b.value - a.value);
  const topRatios = ratios.slice(0, committeeSize);

  // Calculate preliminary seat distribution and order
  topRatios.forEach((ratio) => {
    const groupName = ratio.groupName;
    if (seatDistribution[groupName] !== undefined) {
      seatDistribution[groupName]++;
    }
    seatOrder.push(ratio);
  });

  // Check for stale
  const stale = handleStaleSituation(
    ratios,
    topRatios,
    seatDistribution,
    seatOrder
  );

  return {
    distribution: seatDistribution,
    order: seatOrder,
    stale,
  };
}

// Hare-Niemeyer calculation, seat order via D'Hondt
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

export const exportForTesting = {
  calculateMethod,
};
