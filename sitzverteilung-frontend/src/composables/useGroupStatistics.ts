import type { Group } from "@/types/Group";
import type { Ref } from "vue";

import { computed } from "vue";

export const useGroupStatistics = (
  groups: Ref<Group[]>,
  limitGroups: Ref<number>,
  expectedSeats: Ref<number>
) => {
  // statistics
  const amountOfGroups = computed(() => groups.value.length);
  const totalSeats = computed(() => {
    return groups.value.reduce(
      (sum, group) => sum + (group.committeeSeats ?? 0),
      0
    );
  });
  const totalVotes = computed(() => {
    return groups.value.reduce((sum, group) => sum + (group.votes ?? 0), 0);
  });

  // validations
  const safeExpectedSeats = computed(() => expectedSeats.value ?? 0);
  const maximumGroups = computed(() =>
    Math.min(limitGroups.value, safeExpectedSeats.value)
  );
  const isTooManyGroups = computed(
    () => amountOfGroups.value > maximumGroups.value
  );
  const isSeatsTooHigh = computed(
    () => totalSeats.value > safeExpectedSeats.value
  );
  const isSeatsTooLow = computed(
    () => totalSeats.value < safeExpectedSeats.value
  );

  return {
    amountOfGroups,
    maximumGroups,
    isTooManyGroups,
    isSeatsTooHigh,
    isSeatsTooLow,
    totalSeats,
    totalVotes,
  };
};
