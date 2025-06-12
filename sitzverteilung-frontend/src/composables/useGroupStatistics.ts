import type { Group } from "@/types/Group.ts";
import type { Ref } from "vue";

import { computed } from "vue";

export const useGroupStatistics = (
  groups: Ref<Group[]>,
  expectedSeats: Ref<number>
) => {
  const amountOfGroups = computed(() => groups.value.length);
  const isTooManyGroups = computed(
    () => amountOfGroups.value > expectedSeats.value
  );
  const isSeatsTooHigh = computed(() => totalSeats.value > expectedSeats.value);
  const isSeatsTooLow = computed(() => totalSeats.value < expectedSeats.value);

  const totalSeats = computed(() => {
    return groups.value.reduce(
      (sum, group) => sum + (group.committeeSeats ? group.committeeSeats : 0),
      0
    );
  });

  const totalVotes = computed(() => {
    return groups.value.reduce((sum, group) => sum + (group.votes ?? 0), 0);
  });

  return {
    amountOfGroups,
    isTooManyGroups,
    isSeatsTooHigh,
    isSeatsTooLow,
    totalSeats,
    totalVotes,
  };
};
