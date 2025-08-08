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
  let stale: CalculationStale | undefined = undefined;

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
    seatDistribution[ratio.groupName]++;
    seatOrder.push(ratio);
  });

  // Check for stale situation
  const staleRatio = topRatios[committeeSize - 1].value;
  const potentialStales = ratios.filter((ratio) => ratio.value === staleRatio);
  const potentialStalesInTop = topRatios.filter(
    (ratio) => ratio.value === staleRatio
  );
  const unresolvedSeats = potentialStales.length - potentialStalesInTop.length;

  if (unresolvedSeats) {
    // Create stale information
    stale = {
      groupNames: [...new Set(potentialStales.map((ratio) => ratio.groupName))],
      amountSeats: potentialStalesInTop.length,
      ratio: staleRatio,
    };

    // Remove stale seats from seat distribution and order
    let toRemove = unresolvedSeats;
    for (let i = seatOrder.length - 1; i >= 0 && toRemove > 0; i--) {
      if (seatOrder[i].value === staleRatio) {
        seatDistribution[seatOrder[i].groupName]--;
        seatOrder.splice(i, 1);
        toRemove--;
      }
    }
  }

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
  const seatOrder: CalculationSeatOrder = [];
  let stale: CalculationStale | undefined = undefined;

  // Initialize distributions with 0 seats for every group
  calculationGroups.forEach((group) => (seatDistribution[group.name] = 0));

  // Calculate hare quotas and assign whole seats
  const totalSeatsOrVotes = calculationGroups.reduce(
    (sum, group) => sum + group.seatsOrVotes,
    0
  );
  const remainder: CalculationGroupRatio[] = [];
  calculationGroups.forEach((group) => {
    const exactQuota = (group.seatsOrVotes * committeeSize) / totalSeatsOrVotes;
    const seats = Math.floor(exactQuota);
    seatDistribution[group.name] = seats;
    for (let i = 0; i < seats; i++) {
      seatOrder.push({ groupName: group.name, value: exactQuota });
    }
    remainder.push({
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
  remainder.sort((a, b) => b.value - a.value);

  // Assign remaining seats based on highest remainders
  const topRemainders = remainder.slice(0, remainingSeats);
  topRemainders.forEach((remainder) => {
    seatDistribution[remainder.groupName]++;
    seatOrder.push({ groupName: remainder.groupName, value: remainder.value });
  });

  // Check for stale situation
  if (remainingSeats > 0) {
    const staleRemainder = topRemainders[topRemainders.length - 1]?.value;
    const potentialStales = remainder.filter(
      (quota) => quota.value === staleRemainder
    );
    const potentialStalesInTop = topRemainders.filter(
      (quota) => quota.value === staleRemainder
    );
    const unresolvedSeats =
      potentialStales.length - potentialStalesInTop.length;

    if (unresolvedSeats) {
      // Create stale information
      stale = {
        groupNames: [
          ...new Set(potentialStales.map((ratio) => ratio.groupName)),
        ],
        amountSeats: potentialStalesInTop.length,
        ratio: staleRemainder,
      };

      // Remove stale seats from seat distribution and order
      let toRemove = unresolvedSeats;
      for (let i = seatOrder.length - 1; i >= 0 && toRemove > 0; i--) {
        if (seatOrder[i].value === staleRemainder) {
          seatDistribution[seatOrder[i].groupName]--;
          toRemove--;
        }
      }
    }
  }

  return {
    distribution: seatDistribution,
    order: seatOrder,
    stale,
  };
}

export const exportForTesting = {
  calculateMethod,
};
