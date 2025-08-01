import type { CalculationGroup } from "@/types/calculation/internal/CalculationGroup.ts";
import type { CalculationGroupRatio } from "@/types/calculation/internal/CalculationGroupRatio.ts";
import type { CalculationSeatDistribution } from "@/types/calculation/internal/CalculationSeatDistribution.ts";
import type { CalculationSeatOrder } from "@/types/calculation/internal/CalculationSeatOrder.ts";

function dHondt(calculationGroups: CalculationGroup[], committeeSize: number) {
  const seatDistribution: CalculationSeatDistribution = {};
  const seatOrder: CalculationSeatOrder = [];

  // initialize distributions with 0 seats for every group
  calculationGroups.forEach((group) => (seatDistribution[group.name] = 0));

  // calculate ratios using increasing divisors
  const ratios: CalculationGroupRatio[] = [];
  calculationGroups.forEach((group) => {
    for (let i = 1; i <= committeeSize; i++) {
      ratios.push({
        groupName: group.name,
        value: group.assignedSeats / i,
      });
    }
  });

  // Calculate relevant ratios and drop the others
  ratios.sort((a, b) => a.value - b.value);
  const topRatios = ratios.slice(0, committeeSize);

  // Calculate seat distribution and order
  topRatios.forEach((ratio) => {
    seatDistribution[ratio.groupName]++;
    seatOrder.push({
      groupName: ratio.groupName,
      value: Number(ratio.value.toFixed(2)),
    });
  });

  return {
    distribution: seatDistribution,
    order: seatOrder,
  };
}
